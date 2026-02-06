import { useState, useEffect } from "react";
import { Download, Loader2, Calendar, TrendingUp, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, startOfMonth, endOfDay } from "date-fns";

type ReportPeriod = "daily" | "weekly" | "monthly";

interface OrderReport {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  delivery_city: string;
}

interface ReportStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export function ReportsManager() {
  const [period, setPeriod] = useState<ReportPeriod>("daily");
  const [orders, setOrders] = useState<OrderReport[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = subDays(now, 1);
        break;
      case "weekly":
        startDate = startOfWeek(now);
        break;
      case "monthly":
        startDate = startOfMonth(now);
        break;
      default:
        startDate = subDays(now, 1);
    }

    return {
      start: startDate.toISOString(),
      end: endOfDay(now).toISOString(),
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    const { start, end } = getDateRange();

    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, total, status, payment_method, created_at, delivery_city")
      .gte("created_at", start)
      .lte("created_at", end)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    const ordersData = data || [];
    setOrders(ordersData);

    // Calculate stats
    const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = ordersData.filter(
      (o) => o.status === "placed" || o.status === "confirmed"
    ).length;
    const deliveredOrders = ordersData.filter((o) => o.status === "delivered").length;

    setStats({
      totalOrders: ordersData.length,
      totalRevenue,
      avgOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
      pendingOrders,
      deliveredOrders,
    });

    setLoading(false);
  };

  const downloadCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Order Number", "Date", "Amount", "Status", "Payment Method", "City"];
    const rows = orders.map((o) => [
      o.order_number,
      format(new Date(o.created_at), "dd/MM/yyyy HH:mm"),
      `₹${o.total}`,
      o.status,
      o.payment_method.toUpperCase(),
      o.delivery_city,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Create a simple printable HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GRAINSKART - ${period.charAt(0).toUpperCase() + period.slice(1)} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #16a34a; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #16a34a; color: white; }
          .footer { margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>GRAINSKART - ${period.charAt(0).toUpperCase() + period.slice(1)} Report</h1>
        <p>Generated on: ${format(new Date(), "dd MMMM yyyy, HH:mm")}</p>
        
        <div class="stats">
          <div class="stat-card">
            <strong>Total Orders</strong><br/>
            ${stats.totalOrders}
          </div>
          <div class="stat-card">
            <strong>Total Revenue</strong><br/>
            ₹${stats.totalRevenue.toLocaleString()}
          </div>
          <div class="stat-card">
            <strong>Avg Order Value</strong><br/>
            ₹${stats.avgOrderValue.toFixed(2)}
          </div>
          <div class="stat-card">
            <strong>Delivered</strong><br/>
            ${stats.deliveredOrders}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (o) => `
              <tr>
                <td>${o.order_number}</td>
                <td>${format(new Date(o.created_at), "dd/MM/yyyy HH:mm")}</td>
                <td>₹${o.total}</td>
                <td>${o.status}</td>
                <td>${o.payment_method.toUpperCase()}</td>
                <td>${o.delivery_city}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This report is auto-generated by GRAINSKART Admin Panel</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: Package,
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Avg Order Value",
      value: `₹${stats.avgOrderValue.toFixed(0)}`,
      icon: TrendingUp,
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders.toString(),
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV} disabled={orders.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={downloadPDF} disabled={orders.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <TabsContent value={period} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No orders found for this period
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>City</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.order_number}</TableCell>
                            <TableCell>
                              {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="font-medium">₹{order.total}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="uppercase">{order.payment_method}</TableCell>
                            <TableCell>{order.delivery_city}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
