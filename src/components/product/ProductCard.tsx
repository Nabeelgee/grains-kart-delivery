 import { Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Plus, Star, Check } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { useCart } from "@/contexts/CartContext";
 import { toast } from "sonner";
 import type { Database } from "@/integrations/supabase/types";
 
 type Product = Database["public"]["Tables"]["menu_items"]["Row"];
 
 interface ProductCardProps {
   product: Product;
   index: number;
 }
 
 export function ProductCard({ product, index }: ProductCardProps) {
   const { addItem, items } = useCart();
   
   const isInCart = items.some(item => item.id === product.id);
   
   const handleAddToCart = (e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
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
 
   const discountPercentage = product.discounted_price
     ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
     : 0;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ delay: index * 0.05 }}
     >
       <Link to={`/product/${product.id}`}>
         <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg card-hover">
           <div className="relative aspect-square overflow-hidden bg-secondary">
             <img
               src={product.image_url || "/placeholder.svg"}
               alt={product.name}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
             />
             {discountPercentage > 0 && (
               <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                 {discountPercentage}% OFF
               </Badge>
             )}
             {product.is_bestseller && (
               <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground">
                 ⭐ Bestseller
               </Badge>
             )}
           </div>
           <div className="p-4">
             <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
               {product.name}
             </h3>
             <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
               {product.description}
             </p>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-lg">
                   ₹{product.discounted_price || product.price}
                 </span>
                 {product.discounted_price && (
                   <span className="text-sm text-muted-foreground line-through">
                     ₹{product.price}
                   </span>
                 )}
               </div>
               <Button
                 size="sm"
                 onClick={handleAddToCart}
                 variant={isInCart ? "secondary" : "default"}
                 className="gap-1"
               >
                 {isInCart ? (
                   <>
                     <Check className="w-4 h-4" />
                     Added
                   </>
                 ) : (
                   <>
                     <Plus className="w-4 h-4" />
                     Add
                   </>
                 )}
               </Button>
             </div>
           </div>
         </div>
       </Link>
     </motion.div>
   );
 }