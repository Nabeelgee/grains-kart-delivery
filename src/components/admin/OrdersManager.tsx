import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp, Image, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Payment</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Screenshot</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status || "placed");
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="p-3 font-medium font-mono text-sm">
                        {order.order_number}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{order.delivery_phone}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {order.delivery_address}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 font-medium">₹{order.total}</td>
                      <td className="p-3">
                        <Badge variant="outline">{order.payment_method.toUpperCase()}</Badge>
                      </td>
                      <td className="p-3">
                        {(order as any).payment_screenshot_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScreenshotModal((order as any).payment_screenshot_url)}
                          >
                            <Image className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">No screenshot</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Update
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
                                <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`} />
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status || "placed");
              const isExpanded = expandedOrder === order.id;
              return (
                <div
                  key={order.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  {/* Order Summary Row */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">{order.order_number}</span>
                        <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">₹{order.total}</span>
                        <span>{order.payment_method.toUpperCase()}</span>
                        <span>
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 bg-secondary/10 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Customer</p>
                        <p className="text-sm font-medium">{order.delivery_phone}</p>
                        <p className="text-xs text-muted-foreground">{order.delivery_address}, {order.delivery_city}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                          <p className="text-sm font-medium">₹{order.subtotal}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Delivery Fee</p>
                          <p className="text-sm font-medium">₹{order.delivery_fee || 0}</p>
                        </div>
                        {order.discount && order.discount > 0 ? (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Discount</p>
                            <p className="text-sm font-medium text-success">-₹{order.discount}</p>
                          </div>
                        ) : null}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="text-sm font-bold">₹{order.total}</p>
                        </div>
                      </div>

                      {order.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {/* Payment Screenshot */}
                      {(order as any).payment_screenshot_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Payment Screenshot</p>
                          <button
                            onClick={() => setScreenshotModal((order as any).payment_screenshot_url)}
                            className="rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={(order as any).payment_screenshot_url}
                              alt="Payment screenshot"
                              className="w-full max-h-40 object-contain bg-secondary/30"
                            />
                          </button>
                        </div>
                      )}

                      {/* Update Status */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            Update Status
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          {statusOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => updateStatus(order.id, option.value)}
                              className={order.status === option.value ? "bg-secondary" : ""}
                            >
                              <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`} />
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div
            className="relative bg-card rounded-2xl p-2 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setScreenshotModal(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-card/80 hover:bg-secondary shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={screenshotModal}
              alt="Payment screenshot"
              className="w-full rounded-xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
