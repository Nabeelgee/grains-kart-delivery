import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["menu_items"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const DEFAULT_STORE_ID = "a0000000-0000-0000-0000-000000000001";

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discounted_price: "",
    category_id: "",
    image_url: "",
    is_available: true,
    is_bestseller: false,
    benefits: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("menu_items").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      discounted_price: product.discounted_price?.toString() || "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_available: product.is_available ?? true,
      is_bestseller: product.is_bestseller ?? false,
      benefits: (product.benefits || []).join("\n"),
    });
    setImagePreview(product.image_url || null);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      discounted_price: "",
      category_id: "",
      image_url: "",
      is_available: true,
      is_bestseller: false,
      benefits: "",
    });
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Name and price are required");
      return;
    }

    const benefitsArray = formData.benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      is_available: formData.is_available,
      is_bestseller: formData.is_bestseller,
      benefits: benefitsArray,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("menu_items")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }
      toast.success("Product updated successfully");
    } else {
      const { error } = await supabase.from("menu_items").insert({
        ...productData,
        restaurant_id: DEFAULT_STORE_ID,
      });

      if (error) {
        console.error("Insert error:", error);
        toast.error("Failed to create product");
        return;
      }
      toast.success("Product created successfully");
    }

    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      return;
    }

    toast.success("Product deleted");
    fetchData();
  };

  const toggleAvailability = async (id: string, available: boolean) => {
    await supabase.from("menu_items").update({ is_available: available }).eq("id", id);
    fetchData();
    toast.success(`Product ${available ? "enabled" : "disabled"}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>Products Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (use new lines for bullet points)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description&#10;Each line becomes a bullet point"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discounted Price</Label>
                  <Input
                    type="number"
                    value={formData.discounted_price}
                    onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex-1 w-full">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Or paste image URL"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image or paste a URL
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Benefits (one per line)</Label>
                <Textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Rich in fiber&#10;100% organic&#10;No preservatives"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(c) => setFormData({ ...formData, is_available: c })}
                  />
                  <Label>Available</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_bestseller}
                    onCheckedChange={(c) => setFormData({ ...formData, is_bestseller: c })}
                  />
                  <Label>Bestseller</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {editingProduct ? "Update" : "Create"} Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Bestseller</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Available</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>₹{product.discounted_price || product.price}</span>
                      {product.discounted_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {product.is_bestseller && <Badge>⭐ Bestseller</Badge>}
                  </td>
                  <td className="p-3">
                    <Switch
                      checked={product.is_available ?? true}
                      onCheckedChange={(c) => toggleAvailability(product.id, c)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {products.map((product) => (
            <div key={product.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">₹{product.discounted_price || product.price}</span>
                    {product.discounted_price && (
                      <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {product.is_bestseller && <Badge className="text-xs">⭐ Best</Badge>}
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={product.is_available ?? true}
                        onCheckedChange={(c) => toggleAvailability(product.id, c)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {product.is_available ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No products yet. Click "Add Product" to create one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
