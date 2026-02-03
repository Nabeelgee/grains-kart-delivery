import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
  { icon: UtensilsCrossed, label: "Menu Items", value: "menu" },
  { icon: ShoppingBag, label: "Orders", value: "orders" },
  { icon: DollarSign, label: "Earnings", value: "earnings" },
  { icon: Settings, label: "Settings", value: "settings" },
];

const mockStats = [
  { label: "Today's Revenue", value: "₹12,450", icon: DollarSign, trend: "+18%" },
  { label: "Today's Orders", value: "24", icon: ShoppingBag, trend: "+12%" },
  { label: "Pending Orders", value: "3", icon: Clock, trend: "" },
  { label: "Menu Items", value: "45", icon: UtensilsCrossed, trend: "" },
];

const mockMenuItems = [
  { id: "1", name: "Hyderabadi Chicken Biryani", price: 299, discounted: 249, available: true, bestseller: true },
  { id: "2", name: "Mutton Biryani Special", price: 399, discounted: null, available: true, bestseller: true },
  { id: "3", name: "Veg Biryani", price: 199, discounted: 179, available: true, bestseller: false },
  { id: "4", name: "Chicken Dum Biryani", price: 279, discounted: null, available: false, bestseller: false },
];

const mockOrders = [
  { id: "GK001", customer: "John Doe", items: "Chicken Biryani x2, Raita x1", total: 548, status: "pending", time: "5 min ago" },
  { id: "GK002", customer: "Jane Smith", items: "Mutton Biryani x1", total: 399, status: "preparing", time: "15 min ago" },
  { id: "GK003", customer: "Mike Wilson", items: "Veg Biryani x3", total: 537, status: "out_for_delivery", time: "25 min ago" },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "menu":
        return <MenuContent />;
      case "orders":
        return <OrdersContent />;
      case "earnings":
        return <EarningsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-gradient">GRAINSKART</h1>
          <p className="text-sm text-muted-foreground">Vendor Panel</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setActiveTab(item.value);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            <Badge className="bg-success">Restaurant Open</Badge>
          </div>
        </header>

        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-success">
                    <TrendingUp className="w-4 h-4" />
                    {stat.trend} from yesterday
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{order.id}</span>
                    <Badge
                      className={
                        order.status === "pending"
                          ? "bg-warning"
                          : order.status === "preparing"
                          ? "bg-primary"
                          : "bg-success"
                      }
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.items}</p>
                  <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <div className="flex gap-2 mt-2">
                    {order.status === "pending" && (
                      <>
                        <Button size="sm" variant="ghost" className="text-success">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {order.status === "preparing" && (
                      <Button size="sm">Mark Ready</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MenuContent() {
  const handleToggleAvailability = (id: string, available: boolean) => {
    toast.success(`Item ${available ? "enabled" : "disabled"}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Items</CardTitle>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discounted</TableHead>
              <TableHead>Bestseller</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMenuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>₹{item.price}</TableCell>
                <TableCell>
                  {item.discounted ? `₹${item.discounted}` : "-"}
                </TableCell>
                <TableCell>
                  {item.bestseller && <Badge>⭐ Bestseller</Badge>}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.available}
                    onCheckedChange={(checked) =>
                      handleToggleAvailability(item.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function OrdersContent() {
  const handleAccept = (id: string) => {
    toast.success("Order accepted");
  };

  const handleReject = (id: string) => {
    toast.success("Order rejected");
  };

  const handleUpdateStatus = (id: string, status: string) => {
    toast.success(`Order marked as ${status}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            ...mockOrders,
            { id: "GK004", customer: "Sarah Johnson", items: "Chicken Biryani x1, Veg Biryani x1", total: 428, status: "delivered", time: "1 hour ago" },
          ].map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{order.id}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{order.customer}</span>
                </div>
                <p className="text-sm text-muted-foreground">{order.items}</p>
                <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
              </div>
              <div className="text-right">
                <p className="font-bold mb-2">₹{order.total}</p>
                <Badge
                  className={
                    order.status === "pending"
                      ? "bg-warning"
                      : order.status === "preparing"
                      ? "bg-primary"
                      : order.status === "out_for_delivery"
                      ? "bg-success/80"
                      : "bg-success"
                  }
                >
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EarningsContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-3xl font-bold mt-1">₹12,450</p>
            <p className="text-sm text-success mt-2">24 orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-3xl font-bold mt-1">₹78,320</p>
            <p className="text-sm text-success mt-2">156 orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-3xl font-bold mt-1">₹2,45,680</p>
            <p className="text-sm text-success mt-2">612 orders</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "GK001", date: "Feb 3, 2026", items: 3, amount: 548, commission: 54.8, net: 493.2 },
                { id: "GK002", date: "Feb 3, 2026", items: 1, amount: 399, commission: 39.9, net: 359.1 },
                { id: "GK003", date: "Feb 3, 2026", items: 3, amount: 537, commission: 53.7, net: 483.3 },
              ].map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.items}</TableCell>
                  <TableCell>₹{tx.amount}</TableCell>
                  <TableCell className="text-destructive">-₹{tx.commission}</TableCell>
                  <TableCell className="font-semibold text-success">₹{tx.net}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
