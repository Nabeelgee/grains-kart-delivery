import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, TrendingUp, DollarSign, Package, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { ReportsManager } from "@/components/admin/ReportsManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (role && role !== "admin") {
      navigate("/");
    }
  }, [user, role, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from("orders").select("total, status"),
      supabase.from("menu_items").select("id"),
    ]);

    if (ordersRes.data) {
      const totalRevenue = ordersRes.data.reduce((acc, o) => acc + (o.total || 0), 0);
      const pendingOrders = ordersRes.data.filter(
        (o) => o.status === "placed" || o.status === "confirmed"
      ).length;
      setStats({
        totalRevenue,
        totalOrders: ordersRes.data.length,
        totalProducts: productsRes.data?.length || 0,
        pendingOrders,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent stats={stats} />;
      case "products":
        return <ProductsManager />;
      case "orders":
        return <OrdersManager />;
      case "reports":
        return <ReportsManager />;
      case "promos":
        return <PromosContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={handleSignOut}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

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

function DashboardContent({
  stats,
}: {
  stats: { totalRevenue: number; totalOrders: number; totalProducts: number; pendingOrders: number };
}) {
  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, trend: "" },
    { label: "Products", value: stats.totalProducts.toString(), icon: Package, trend: "" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: TrendingUp, trend: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PromosContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promo Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Promo codes management coming soon...</p>
      </CardContent>
    </Card>
  );
}

function SettingsContent() {
  const [upiNumber, setUpiNumber] = useState("6379658082");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">UPI Payment Number</label>
          <p className="text-2xl font-mono font-bold text-primary">{upiNumber}</p>
          <p className="text-sm text-muted-foreground">
            Customers will see this UPI number for payments
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
