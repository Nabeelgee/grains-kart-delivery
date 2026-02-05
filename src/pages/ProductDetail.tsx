 import { useState, useEffect } from "react";
 import { useParams, Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import {
   ArrowLeft,
   Plus,
   Minus,
   ShoppingBag,
   Check,
   Loader2,
 } from "lucide-react";
 import { Layout } from "@/components/layout/Layout";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Card, CardContent } from "@/components/ui/card";
 import { useCart } from "@/contexts/CartContext";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import type { Database } from "@/integrations/supabase/types";
 
 type Product = Database["public"]["Tables"]["menu_items"]["Row"];
 
 export default function ProductDetailPage() {
   const { id } = useParams();
   const { items, addItem, updateQuantity, itemCount, total } = useCart();
   const [product, setProduct] = useState<Product | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchProduct();
   }, [id]);
 
   const fetchProduct = async () => {
     if (!id) return;
     
     const { data, error } = await supabase
       .from("menu_items")
       .select("*")
       .eq("id", id)
       .maybeSingle();
 
     if (data) {
       setProduct(data);
     }
     setLoading(false);
   };
 
   const cartItem = items.find((i) => i.id === product?.id);
   const quantity = cartItem?.quantity || 0;
 
   const handleAddToCart = () => {
     if (!product) return;
     addItem({
       id: product.id,
       name: product.name,
       price: product.discounted_price || product.price,
       image_url: product.image_url,
       restaurant_id: product.restaurant_id,
       restaurant_name: "GRAINSKART",
       is_veg: product.is_veg ?? true,
     });
     toast.success(`${product.name} added to cart`);
   };
 
   if (loading) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-16 text-center">
           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
           <p className="text-muted-foreground">Loading product...</p>
         </div>
       </Layout>
     );
   }
 
   if (!product) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-16 text-center">
           <div className="text-6xl mb-4">🌾</div>
           <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
           <p className="text-muted-foreground mb-6">
             The product you're looking for doesn't exist.
           </p>
           <Button asChild>
             <Link to="/products">Browse Products</Link>
           </Button>
         </div>
       </Layout>
     );
   }
 
   const discountPercentage = product.discounted_price
     ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
     : 0;
 
   // Parse benefits from the benefits array
   const benefits = (product as any).benefits || [];
 
   // Parse description into points if it contains bullet points or newlines
   const descriptionPoints = product.description
     ? product.description.split(/[•\n]/).filter((point) => point.trim())
     : [];
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8">
         <Link
           to="/products"
           className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           Back to Products
         </Link>
 
         <div className="grid lg:grid-cols-2 gap-8">
           {/* Product Image */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
           >
             <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
               <img
                 src={product.image_url || "/placeholder.svg"}
                 alt={product.name}
                 className="w-full h-full object-cover"
               />
               {discountPercentage > 0 && (
                 <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-lg px-3 py-1">
                   {discountPercentage}% OFF
                 </Badge>
               )}
             </div>
           </motion.div>
 
           {/* Product Details */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-6"
           >
             <div>
               {product.is_bestseller && (
                 <Badge className="mb-2 bg-warning text-warning-foreground">
                   ⭐ Bestseller
                 </Badge>
               )}
               <h1 className="text-3xl md:text-4xl font-bold mb-4">
                 {product.name}
               </h1>
               <div className="flex items-center gap-3 mb-4">
                 <span className="text-3xl font-bold text-primary">
                   ₹{product.discounted_price || product.price}
                 </span>
                 {product.discounted_price && (
                   <span className="text-xl text-muted-foreground line-through">
                     ₹{product.price}
                   </span>
                 )}
               </div>
             </div>
 
             {/* Description Points */}
             {descriptionPoints.length > 0 && (
               <Card>
                 <CardContent className="p-4">
                   <h3 className="font-semibold mb-3">Product Details</h3>
                   <ul className="space-y-2">
                     {descriptionPoints.map((point, index) => (
                       <li key={index} className="flex items-start gap-2">
                         <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                         <span className="text-muted-foreground">{point.trim()}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             )}
 
             {/* Benefits */}
             {benefits.length > 0 && (
               <Card>
                 <CardContent className="p-4">
                   <h3 className="font-semibold mb-3">Benefits</h3>
                   <ul className="space-y-2">
                     {benefits.map((benefit: string, index: number) => (
                       <li key={index} className="flex items-start gap-2">
                         <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center mt-1 flex-shrink-0">
                           <Check className="w-3 h-3 text-success" />
                         </div>
                         <span className="text-muted-foreground">{benefit}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             )}
 
             {/* Add to Cart */}
             <div className="flex items-center gap-4">
               {quantity === 0 ? (
                 <Button
                   size="lg"
                   onClick={handleAddToCart}
                   className="flex-1 h-14 text-lg"
                 >
                   <Plus className="w-5 h-5 mr-2" />
                   Add to Cart
                 </Button>
               ) : (
                 <div className="flex items-center gap-4 flex-1">
                   <div className="flex items-center gap-3 bg-secondary rounded-lg px-4 py-2">
                     <button
                       onClick={() => updateQuantity(product.id, quantity - 1)}
                       className="p-2 hover:bg-background rounded"
                     >
                       <Minus className="w-5 h-5" />
                     </button>
                     <span className="font-bold text-xl w-8 text-center">
                       {quantity}
                     </span>
                     <button
                       onClick={() => updateQuantity(product.id, quantity + 1)}
                       className="p-2 hover:bg-background rounded"
                     >
                       <Plus className="w-5 h-5" />
                     </button>
                   </div>
                   <Button asChild size="lg" className="flex-1 h-14">
                     <Link to="/cart">
                       <ShoppingBag className="w-5 h-5 mr-2" />
                       Go to Cart
                     </Link>
                   </Button>
                 </div>
               )}
             </div>
           </motion.div>
         </div>
       </div>
 
       {/* Floating Cart Button */}
       {itemCount > 0 && (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50"
         >
           <Link to="/cart">
             <Button className="w-full h-14 text-lg shadow-lg shadow-primary/30">
               <ShoppingBag className="w-5 h-5 mr-2" />
               {itemCount} items | ₹{total.toFixed(0)}
               <span className="ml-2">→</span>
             </Button>
           </Link>
         </motion.div>
       )}
     </Layout>
   );
 }