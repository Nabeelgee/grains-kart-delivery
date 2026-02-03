import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Mock orders data
const mockOrders = [
  {
    id: "1",
    order_number: "GK20260203001",
    restaurant_name: "Royal Biryani House",
    status: "delivered",
    total: 548,
    items: ["Hyderabadi Chicken Biryani x2", "Raita x1"],
    created_at: "2026-02-02T18:30:00Z",
    delivered_at: "2026-02-02T19:15:00Z",
  },
  {
    id: "2",
    order_number: "GK20260203002",
    restaurant_name: "Pizza Paradise",
    status: "out_for_delivery",
    total: 698,
    items: ["Margherita Pizza x1", "Pepperoni Pizza x1", "Garlic Bread x1"],
    created_at: "2026-02-03T12:00:00Z",
    estimated_delivery: "2026-02-03T12:45:00Z",
  },
  {
    id: "3",
    order_number: "GK20260201001",
    restaurant_name: "Green Leaf Cafe",
    status: "cancelled",
    total: 320,
    items: ["Greek Salad x1", "Smoothie Bowl x1"],
    created_at: "2026-02-01T10:00:00Z",
  },
];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-primary text-primary-foreground", icon: Package },
  preparing: { label: "Preparing", color: "bg-primary text-primary-foreground", icon: Package },
  out_for_delivery: { label: "On the way", color: "bg-success text-success-foreground", icon: Package },
  delivered: { label: "Delivered", color: "bg-success text-success-foreground", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground", icon: XCircle },
};

export default function OrdersPage() {
  const { user } = useAuth();

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground mb-8">
            Track and manage your orders
          </p>
        </motion.div>

        {mockOrders.length > 0 ? (
          <div className="space-y-4">
            {mockOrders.map((order, index) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

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
                            <h3 className="font-semibold">{order.restaurant_name}</h3>
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
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {order.items.join(", ")}
                        </p>
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
                            <Button variant="ghost" size="sm">
                              Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
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
