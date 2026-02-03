import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Tag,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  { icon: Users, label: "Users", value: "users" },
  { icon: Store, label: "Vendors", value: "vendors" },
  { icon: ShoppingBag, label: "Orders", value: "orders" },
  { icon: Tag, label: "Promo Codes", value: "promos" },
  { icon: Image, label: "Banners", value: "banners" },
  { icon: Settings, label: "Settings", value: "settings" },
];

const mockStats = [
  { label: "Total Revenue", value: "₹2,45,680", icon: DollarSign, trend: "+12%" },
  { label: "Total Orders", value: "1,234", icon: Package, trend: "+8%" },
  { label: "Active Users", value: "5,678", icon: Users, trend: "+15%" },
  { label: "Active Vendors", value: "142", icon: Store, trend: "+5%" },
];

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "user", status: "active", orders: 12 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user", status: "active", orders: 8 },
  { id: "3", name: "Mike Wilson", email: "mike@example.com", role: "vendor", status: "active", orders: 0 },
  { id: "4", name: "Sarah Johnson", email: "sarah@example.com", role: "user", status: "blocked", orders: 3 },
];

const mockVendors = [
  { id: "1", name: "Royal Biryani House", owner: "Ahmed Khan", status: "approved", orders: 450, rating: 4.5 },
  { id: "2", name: "Pizza Paradise", owner: "Maria Garcia", status: "approved", orders: 380, rating: 4.6 },
  { id: "3", name: "Dragon Wok", owner: "Li Wei", status: "pending", orders: 0, rating: 0 },
  { id: "4", name: "Cafe Express", owner: "Tom Brown", status: "blocked", orders: 120, rating: 3.8 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    // For demo, we'll allow access but in production should check role
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
      case "users":
        return <UsersContent />;
      case "vendors":
        return <VendorsContent />;
      case "orders":
        return <OrdersContent />;
      case "promos":
        return <PromosContent />;
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
          <p className="text-sm text-muted-foreground">Admin Panel</p>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Badge>Admin</Badge>
            </div>
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
                <div className="flex items-center gap-1 mt-2 text-sm text-success">
                  <TrendingUp className="w-4 h-4" />
                  {stat.trend} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "GK001", customer: "John D.", restaurant: "Royal Biryani", amount: 548, status: "delivered" },
                { id: "GK002", customer: "Jane S.", restaurant: "Pizza Paradise", amount: 698, status: "preparing" },
                { id: "GK003", customer: "Mike W.", restaurant: "Dragon Wok", amount: 420, status: "pending" },
              ].map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.restaurant}</TableCell>
                  <TableCell>₹{order.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "preparing"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>{user.orders}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function VendorsContent() {
  const handleApprove = (id: string) => {
    toast.success("Vendor approved successfully");
  };

  const handleBlock = (id: string) => {
    toast.success("Vendor blocked successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendors Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.name}</TableCell>
                <TableCell>{vendor.owner}</TableCell>
                <TableCell>{vendor.orders}</TableCell>
                <TableCell>{vendor.rating > 0 ? vendor.rating : "-"}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      vendor.status === "approved"
                        ? "bg-success"
                        : vendor.status === "pending"
                        ? "bg-warning"
                        : "bg-destructive"
                    }
                  >
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {vendor.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-success"
                        onClick={() => handleApprove(vendor.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {vendor.status !== "blocked" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleBlock(vendor.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: "GK20260203001", customer: "John Doe", restaurant: "Royal Biryani", amount: 548, payment: "COD", status: "delivered" },
              { id: "GK20260203002", customer: "Jane Smith", restaurant: "Pizza Paradise", amount: 698, payment: "UPI", status: "out_for_delivery" },
              { id: "GK20260203003", customer: "Mike Wilson", restaurant: "Dragon Wok", amount: 420, payment: "Card", status: "preparing" },
              { id: "GK20260201001", customer: "Sarah Johnson", restaurant: "Green Leaf", amount: 320, payment: "COD", status: "cancelled" },
            ].map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.restaurant}</TableCell>
                <TableCell>₹{order.amount}</TableCell>
                <TableCell>{order.payment}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === "delivered"
                        ? "bg-success"
                        : order.status === "cancelled"
                        ? "bg-destructive"
                        : "bg-primary"
                    }
                  >
                    {order.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PromosContent() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Promo Codes</CardTitle>
        <Button>Add New</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { code: "FIRST50", discount: "50%", min: "₹200", usage: "124/500", validUntil: "Mar 31, 2026", active: true },
              { code: "GRAINS20", discount: "20%", min: "₹100", usage: "256/∞", validUntil: "Feb 28, 2026", active: true },
              { code: "WELCOME100", discount: "₹100", min: "₹300", usage: "50/100", validUntil: "Jan 31, 2026", active: false },
            ].map((promo) => (
              <TableRow key={promo.code}>
                <TableCell className="font-medium font-mono">{promo.code}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>{promo.min}</TableCell>
                <TableCell>{promo.usage}</TableCell>
                <TableCell>{promo.validUntil}</TableCell>
                <TableCell>
                  <Badge variant={promo.active ? "default" : "secondary"}>
                    {promo.active ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
