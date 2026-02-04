import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Loader2, Truck, ChefHat, ClipboardCheck } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  restaurants?: { name: string } | null;
};

type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType; step: number }
> = {
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock, step: 1 },
  confirmed: { label: "Confirmed", color: "bg-primary text-primary-foreground", icon: ClipboardCheck, step: 2 },
  preparing: { label: "Preparing", color: "bg-primary text-primary-foreground", icon: ChefHat, step: 3 },
  out_for_delivery: { label: "On the way", color: "bg-success text-success-foreground", icon: Truck, step: 4 },
  delivered: { label: "Delivered", color: "bg-success text-success-foreground", icon: CheckCircle, step: 5 },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground", icon: XCircle, step: 0 },
};

function OrderTracker({ status }: { status: string }) {
  const currentStep = statusConfig[status]?.step || 0;
  
  if (status === "cancelled" || status === "delivered") {
    return null;
  }

  const steps = [
    { label: "Confirmed", step: 2 },
    { label: "Preparing", step: 3 },
    { label: "On the way", step: 4 },
    { label: "Delivered", step: 5 },
  ];

  return (
    <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
      <p className="text-sm font-medium mb-3">Order Progress</p>
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <div key={s.step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  currentStep >= s.step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep >= s.step ? "✓" : index + 1}
              </div>
              <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-1 mx-1 rounded transition-all ${
                  currentStep > s.step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch orders
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurants (name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (!error && data) {
      setOrderItems((prev) => ({ ...prev, [orderId]: data }));
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-2">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to see your order history
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-8">
            Track and manage your orders in real-time
          </p>
        </motion.div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status || "pending"];
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;
              const items = orderItems[order.id] || [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {order.restaurants?.name || "Restaurant"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.order_number}
                            </p>
                          </div>
                        </div>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <OrderTracker status={order.status || "pending"} />

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold">₹{order.total}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleOrderDetails(order.id)}
                            >
                              Details
                              <ChevronRight
                                className={`w-4 h-4 ml-1 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border"
                          >
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium mb-2">Items</p>
                                {items.length > 0 ? (
                                  <ul className="space-y-1">
                                    {items.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex justify-between text-sm"
                                      >
                                        <span>
                                          {item.name} × {item.quantity}
                                        </span>
                                        <span>₹{item.total}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Loading items...
                                  </p>
                                )}
                              </div>

                              <div className="pt-2 border-t border-border space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span>₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Delivery Fee</span>
                                  <span>₹{order.delivery_fee || 0}</span>
                                </div>
                                {order.discount && order.discount > 0 && (
                                  <div className="flex justify-between text-success">
                                    <span>Discount</span>
                                    <span>-₹{order.discount}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold pt-1">
                                  <span>Total</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-border text-sm">
                                <p className="font-medium mb-1">Delivery Address</p>
                                <p className="text-muted-foreground">
                                  {order.delivery_address}, {order.delivery_city}
                                </p>
                                <p className="text-muted-foreground">
                                  Phone: {order.delivery_phone}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start ordering to see your order history
            </p>
            <Button asChild>
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}