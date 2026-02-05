 import { useEffect, useState } from "react";
 import { Link, useSearchParams } from "react-router-dom";
 import { motion } from "framer-motion";
 import { CheckCircle, Package, ArrowRight } from "lucide-react";
 import { Layout } from "@/components/layout/Layout";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 
 export default function OrderSuccessPage() {
   const [searchParams] = useSearchParams();
   const orderId = searchParams.get("order");
   const [showConfetti, setShowConfetti] = useState(true);
 
   useEffect(() => {
     const timer = setTimeout(() => setShowConfetti(false), 3000);
     return () => clearTimeout(timer);
   }, []);
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-16">
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-lg mx-auto text-center"
         >
           {/* Success Icon */}
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
             className="w-24 h-24 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center"
           >
             <CheckCircle className="w-12 h-12 text-success" />
           </motion.div>
 
           {/* Thank You Message */}
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="text-3xl md:text-4xl font-bold mb-4"
           >
             Thank You! 🎉
           </motion.h1>
 
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="text-lg text-muted-foreground mb-8"
           >
             Your order has been placed successfully. We'll start preparing it right away!
           </motion.p>
 
           {/* Order Info Card */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
           >
             <Card className="mb-8">
               <CardContent className="p-6">
                 <div className="flex items-center justify-center gap-4 mb-4">
                   <Package className="w-8 h-8 text-primary" />
                   <div className="text-left">
                     <p className="text-sm text-muted-foreground">Order Number</p>
                     <p className="font-bold text-lg">{orderId || "Processing..."}</p>
                   </div>
                 </div>
                 <p className="text-sm text-muted-foreground">
                   You will receive order updates via notification. Track your order status in the Orders page.
                 </p>
               </CardContent>
             </Card>
           </motion.div>
 
           {/* Action Buttons */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="flex flex-col sm:flex-row gap-4 justify-center"
           >
             <Button asChild size="lg" className="gap-2">
               <Link to="/orders">
                 Track Order
                 <ArrowRight className="w-4 h-4" />
               </Link>
             </Button>
             <Button asChild variant="outline" size="lg">
               <Link to="/products">
                 Continue Shopping
               </Link>
             </Button>
           </motion.div>
         </motion.div>
 
         {/* Confetti Effect */}
         {showConfetti && (
           <div className="fixed inset-0 pointer-events-none overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-3 h-3 rounded-full"
                 style={{
                   left: `${Math.random() * 100}%`,
                   backgroundColor: ["#FF6B35", "#22C55E", "#F59E0B", "#3B82F6"][
                     Math.floor(Math.random() * 4)
                   ],
                 }}
                 initial={{ y: -20, opacity: 1 }}
                 animate={{
                   y: window.innerHeight + 20,
                   opacity: 0,
                   rotate: Math.random() * 360,
                 }}
                 transition={{
                   duration: 2 + Math.random() * 2,
                   delay: Math.random() * 0.5,
                   ease: "easeOut",
                 }}
               />
             ))}
           </div>
         )}
       </div>
     </Layout>
   );
 }