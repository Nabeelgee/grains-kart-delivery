 import { useState, useEffect } from "react";
 import { Plus, Edit, Trash2, Loader2, Check, X } from "lucide-react";
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
 
 export function ProductsManager() {
   const [products, setProducts] = useState<Product[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
       benefits: ((product as any).benefits || []).join("\n"),
     });
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
       // For new products, we need a restaurant_id - use a default store
       const { data: store } = await supabase
         .from("restaurants")
         .select("id")
         .limit(1)
         .maybeSingle();
 
       if (!store) {
         toast.error("Please create a store first");
         return;
       }
 
       const { error } = await supabase.from("menu_items").insert({
         ...productData,
         restaurant_id: store.id,
       });
 
       if (error) {
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
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle>Products Management</CardTitle>
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
           <DialogTrigger asChild>
             <Button onClick={handleCreate}>
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
               <div className="grid grid-cols-2 gap-4">
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
 
               <div className="grid grid-cols-2 gap-4">
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
 
               <div className="space-y-2">
                 <Label>Image URL</Label>
                 <Input
                   value={formData.image_url}
                   onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                   placeholder="https://..."
                 />
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
                 <Button onClick={handleSubmit}>
                   {editingProduct ? "Update" : "Create"} Product
                 </Button>
               </div>
             </div>
           </DialogContent>
         </Dialog>
       </CardHeader>
       <CardContent>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Product</TableHead>
               <TableHead>Price</TableHead>
               <TableHead>Bestseller</TableHead>
               <TableHead>Available</TableHead>
               <TableHead>Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {products.map((product) => (
               <TableRow key={product.id}>
                 <TableCell>
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
                 </TableCell>
                 <TableCell>
                   <div className="flex items-center gap-2">
                     <span>₹{product.discounted_price || product.price}</span>
                     {product.discounted_price && (
                       <span className="text-sm text-muted-foreground line-through">
                         ₹{product.price}
                       </span>
                     )}
                   </div>
                 </TableCell>
                 <TableCell>
                   {product.is_bestseller && <Badge>⭐ Bestseller</Badge>}
                 </TableCell>
                 <TableCell>
                   <Switch
                     checked={product.is_available ?? true}
                     onCheckedChange={(c) => toggleAvailability(product.id, c)}
                   />
                 </TableCell>
                 <TableCell>
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
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
         {products.length === 0 && (
           <p className="text-center text-muted-foreground py-8">
             No products yet. Click "Add Product" to create one.
           </p>
         )}
       </CardContent>
     </Card>
   );
 }