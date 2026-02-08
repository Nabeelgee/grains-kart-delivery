import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active ?? true,
      sort_order: category.sort_order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          image_url: form.image_url || null,
          is_active: form.is_active,
          sort_order: form.sort_order,
        })
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update category");
        console.error(error);
      } else {
        toast.success("Category updated");
        setDialogOpen(false);
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        sort_order: form.sort_order,
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("A category with this slug already exists");
        } else {
          toast.error("Failed to create category");
        }
        console.error(error);
      } else {
        toast.success("Category created");
        setDialogOpen(false);
        fetchCategories();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete category. It may have products assigned.");
      console.error(error);
    } else {
      toast.success("Category deleted");
      fetchCategories();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update category");
    } else {
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Categories ({categories.length})</h3>
          <p className="text-sm text-muted-foreground">Manage product categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Rice, Wheat, Pulses"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., rice, wheat, pulses"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of this category"
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No categories yet. Add your first category.
              </p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-mono text-sm">
                          {category.sort_order}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {category.image_url && (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.slug}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={category.is_active ?? true}
                            onCheckedChange={() =>
                              toggleActive(category.id, category.is_active ?? true)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"?
                                    Products assigned to this category won't be deleted
                                    but will become uncategorized.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {category.image_url && (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.is_active ?? true}
                          onCheckedChange={() =>
                            toggleActive(category.id, category.is_active ?? true)
                          }
                        />
                        <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
