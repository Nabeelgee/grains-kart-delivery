 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
 import { Layout } from "@/components/layout/Layout";
 import { ProductCard } from "@/components/product/ProductCard";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Label } from "@/components/ui/label";
 import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetTrigger,
 } from "@/components/ui/sheet";
 import { supabase } from "@/integrations/supabase/client";
 import type { Database } from "@/integrations/supabase/types";
 
 type Product = Database["public"]["Tables"]["menu_items"]["Row"];
 type Category = Database["public"]["Tables"]["categories"]["Row"];
 
 const sortOptions = [
   { label: "Relevance", value: "relevance" },
   { label: "Price: Low to High", value: "price_low" },
   { label: "Price: High to Low", value: "price_high" },
   { label: "Newest First", value: "newest" },
 ];
 
 export default function ProductsPage() {
   const [products, setProducts] = useState<Product[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedFilters, setSelectedFilters] = useState<{
     sortBy: string;
     categories: string[];
   }>({
     sortBy: "relevance",
     categories: [],
   });
 
   useEffect(() => {
     fetchData();
   }, []);
 
   const fetchData = async () => {
     const [productsRes, categoriesRes] = await Promise.all([
       supabase.from("menu_items").select("*").eq("is_available", true),
       supabase.from("categories").select("*").eq("is_active", true),
     ]);
 
     if (productsRes.data) setProducts(productsRes.data);
     if (categoriesRes.data) setCategories(categoriesRes.data);
     setLoading(false);
   };
 
   const filteredProducts = products
     .filter((product) => {
       if (searchQuery) {
         const query = searchQuery.toLowerCase();
         if (
           !product.name.toLowerCase().includes(query) &&
           !product.description?.toLowerCase().includes(query)
         ) {
           return false;
         }
       }
 
       if (selectedFilters.categories.length > 0) {
         if (!product.category_id || !selectedFilters.categories.includes(product.category_id)) {
           return false;
         }
       }
 
       return true;
     })
     .sort((a, b) => {
       switch (selectedFilters.sortBy) {
         case "price_low":
           return (a.discounted_price || a.price) - (b.discounted_price || b.price);
         case "price_high":
           return (b.discounted_price || b.price) - (a.discounted_price || a.price);
         case "newest":
           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
         default:
           return 0;
       }
     });
 
   const toggleCategory = (id: string) => {
     setSelectedFilters((prev) => ({
       ...prev,
       categories: prev.categories.includes(id)
         ? prev.categories.filter((c) => c !== id)
         : [...prev.categories, id],
     }));
   };
 
   const clearFilters = () => {
     setSelectedFilters({
       sortBy: "relevance",
       categories: [],
     });
     setSearchQuery("");
   };
 
   const activeFilterCount =
     selectedFilters.categories.length +
     (selectedFilters.sortBy !== "relevance" ? 1 : 0);
 
   if (loading) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-16 text-center">
           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
           <p className="text-muted-foreground">Loading products...</p>
         </div>
       </Layout>
     );
   }
 
   return (
     <Layout>
       <div className="bg-secondary/30 py-8">
         <div className="container mx-auto px-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-2xl"
           >
             <h1 className="text-3xl md:text-4xl font-bold mb-2">
               Our Products
             </h1>
             <p className="text-muted-foreground">
               {filteredProducts.length} products available
             </p>
           </motion.div>
         </div>
       </div>
 
       <div className="container mx-auto px-4 py-6">
         {/* Search and Filters Bar */}
         <div className="flex flex-col md:flex-row gap-4 mb-6">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search for products..."
               className="pl-10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
 
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="outline" className="relative">
                 <SlidersHorizontal className="w-4 h-4 mr-2" />
                 Filters
                 {activeFilterCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                     {activeFilterCount}
                   </span>
                 )}
               </Button>
             </SheetTrigger>
             <SheetContent>
               <SheetHeader>
                 <SheetTitle>Filters</SheetTitle>
               </SheetHeader>
               <div className="mt-6 space-y-6">
                 {/* Sort By */}
                 <div>
                   <h3 className="font-medium mb-3">Sort By</h3>
                   <div className="space-y-2">
                     {sortOptions.map((option) => (
                       <button
                         key={option.value}
                         onClick={() =>
                           setSelectedFilters((prev) => ({
                             ...prev,
                             sortBy: option.value,
                           }))
                         }
                         className={`w-full text-left p-3 rounded-lg transition-colors ${
                           selectedFilters.sortBy === option.value
                             ? "bg-primary/10 text-primary"
                             : "hover:bg-secondary"
                         }`}
                       >
                         {option.label}
                       </button>
                     ))}
                   </div>
                 </div>
 
                 {/* Categories */}
                 {categories.length > 0 && (
                   <div>
                     <h3 className="font-medium mb-3">Categories</h3>
                     <div className="space-y-2">
                       {categories.map((category) => (
                         <div key={category.id} className="flex items-center space-x-2">
                           <Checkbox
                             id={category.id}
                             checked={selectedFilters.categories.includes(category.id)}
                             onCheckedChange={() => toggleCategory(category.id)}
                           />
                           <Label htmlFor={category.id}>{category.name}</Label>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
 
                 {/* Clear Filters */}
                 {activeFilterCount > 0 && (
                   <Button
                     variant="ghost"
                     onClick={clearFilters}
                     className="w-full"
                   >
                     Clear All Filters
                   </Button>
                 )}
               </div>
             </SheetContent>
           </Sheet>
         </div>
 
         {/* Active Filters */}
         {activeFilterCount > 0 && (
           <div className="flex flex-wrap gap-2 mb-6">
             {selectedFilters.categories.map((catId) => {
               const cat = categories.find((c) => c.id === catId);
               return cat ? (
                 <Badge key={catId} variant="secondary" className="gap-1">
                   {cat.name}
                   <button onClick={() => toggleCategory(catId)}>
                     <X className="w-3 h-3" />
                   </button>
                 </Badge>
               ) : null;
             })}
             <button
               onClick={clearFilters}
               className="text-sm text-primary hover:underline"
             >
               Clear all
             </button>
           </div>
         )}
 
         {/* Product Grid */}
         {filteredProducts.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredProducts.map((product, index) => (
               <ProductCard
                 key={product.id}
                 product={product}
                 index={index}
               />
             ))}
           </div>
         ) : (
           <div className="text-center py-16">
             <div className="text-6xl mb-4">🔍</div>
             <h3 className="text-xl font-semibold mb-2">No products found</h3>
             <p className="text-muted-foreground mb-4">
               Try adjusting your filters or search query
             </p>
             <Button onClick={clearFilters}>Clear Filters</Button>
           </div>
         )}
       </div>
     </Layout>
   );
 }