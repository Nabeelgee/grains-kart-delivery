 import { useState, useEffect } from "react";
 import { Loader2, ChevronDown } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import type { Database } from "@/integrations/supabase/types";
 
 type Order = Database["public"]["Tables"]["orders"]["Row"];
 type OrderStatus = Database["public"]["Enums"]["order_status"];
 
 const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
   { value: "placed", label: "Placed", color: "bg-warning" },
   { value: "confirmed", label: "Confirmed", color: "bg-primary" },
   { value: "dispatched", label: "Dispatched", color: "bg-primary" },
   { value: "shipped", label: "Shipped", color: "bg-primary" },
   { value: "out_for_delivery", label: "Out for Delivery", color: "bg-success/80" },
   { value: "delivered", label: "Delivered", color: "bg-success" },
   { value: "cancelled", label: "Cancelled", color: "bg-destructive" },
 ];
 
 export function OrdersManager() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     fetchOrders();
   }, []);
 
   const fetchOrders = async () => {
     const { data, error } = await supabase
       .from("orders")
       .select("*")
       .order("created_at", { ascending: false });
 
     if (data) setOrders(data);
     setLoading(false);
   };
 
   const updateStatus = async (orderId: string, status: OrderStatus) => {
     const { error } = await supabase
       .from("orders")
       .update({ status })
       .eq("id", orderId);
 
     if (error) {
       toast.error("Failed to update order status");
       return;
     }
 
     toast.success(`Order status updated to ${status.replace("_", " ")}`);
     fetchOrders();
   };
 
   const getStatusConfig = (status: string) => {
     return statusOptions.find((s) => s.value === status) || statusOptions[0];
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
       <CardHeader>
         <CardTitle>Orders Management</CardTitle>
       </CardHeader>
       <CardContent>
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Order ID</TableHead>
               <TableHead>Customer</TableHead>
               <TableHead>Amount</TableHead>
               <TableHead>Payment</TableHead>
               <TableHead>Status</TableHead>
               <TableHead>Date</TableHead>
               <TableHead>Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {orders.map((order) => {
               const statusConfig = getStatusConfig(order.status || "placed");
               return (
                 <TableRow key={order.id}>
                   <TableCell className="font-medium font-mono">
                     {order.order_number}
                   </TableCell>
                   <TableCell>
                     <div>
                       <p className="font-medium">{order.delivery_phone}</p>
                       <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                         {order.delivery_address}
                       </p>
                     </div>
                   </TableCell>
                   <TableCell>₹{order.total}</TableCell>
                   <TableCell>
                     <Badge variant="outline">{order.payment_method.toUpperCase()}</Badge>
                   </TableCell>
                   <TableCell>
                     <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                   </TableCell>
                   <TableCell className="text-sm text-muted-foreground">
                     {new Date(order.created_at).toLocaleDateString("en-IN", {
                       day: "numeric",
                       month: "short",
                       year: "numeric",
                     })}
                   </TableCell>
                   <TableCell>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button size="sm" variant="outline">
                           Update Status
                           <ChevronDown className="w-4 h-4 ml-1" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         {statusOptions.map((option) => (
                           <DropdownMenuItem
                             key={option.value}
                             onClick={() => updateStatus(order.id, option.value)}
                             className={order.status === option.value ? "bg-secondary" : ""}
                           >
                             <span
                               className={`w-2 h-2 rounded-full mr-2 ${option.color}`}
                             />
                             {option.label}
                           </DropdownMenuItem>
                         ))}
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                 </TableRow>
               );
             })}
           </TableBody>
         </Table>
         {orders.length === 0 && (
           <p className="text-center text-muted-foreground py-8">No orders yet.</p>
         )}
       </CardContent>
     </Card>
   );
 }