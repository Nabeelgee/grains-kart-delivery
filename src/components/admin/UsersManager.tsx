import { useState, useEffect } from "react";
import { Loader2, Shield, ShieldCheck, Search, Users, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  role: string;
  role_id: string;
}

export function UsersManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch profiles and roles separately, then merge
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);

    if (profilesRes.error) {
      console.error("Error fetching profiles:", profilesRes.error);
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];

    const merged: UserWithRole[] = profiles.map((profile) => {
      const userRole = roles.find((r) => r.user_id === profile.user_id);
      return {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        created_at: profile.created_at,
        role: userRole?.role || "user",
        role_id: userRole?.id || "",
      };
    });

    setUsers(merged);
    setLoading(false);
  };

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    // Check if role exists
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let error;
    if (existingRole) {
      const result = await supabase
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", userId);
      error = result.error;
    } else {
      const result = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      error = result.error;
    }

    if (error) {
      toast.error("Failed to promote user");
      console.error(error);
    } else {
      toast.success(`${userName || "User"} promoted to admin`);
      fetchUsers();
    }
  };

  const handleDemoteToUser = async (userId: string, userName: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: "user" })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to change role");
      console.error(error);
    } else {
      toast.success(`${userName || "User"} changed to regular user`);
      fetchUsers();
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.city?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    vendors: users.filter((u) => u.role === "vendor").length,
    customers: users.filter((u) => u.role === "user").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-6 h-6 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold">{stats.admins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold">{stats.vendors}</p>
            <p className="text-xs text-muted-foreground">Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold">{stats.customers}</p>
            <p className="text-xs text-muted-foreground">Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.full_name || "No Name"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.city ? (
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {user.city}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "destructive"
                            : user.role === "vendor"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === "user" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ShieldCheck className="w-4 h-4 mr-1" />
                              Make Admin
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to make{" "}
                                <strong>{user.full_name || user.email}</strong> an
                                admin? They will have full access to the admin panel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handlePromoteToAdmin(
                                    user.user_id,
                                    user.full_name || "User"
                                  )
                                }
                              >
                                Promote
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : user.role === "admin" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Shield className="w-4 h-4 mr-1" />
                              Demote
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove admin access from{" "}
                                <strong>{user.full_name || user.email}</strong>?
                                They will become a regular customer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDemoteToUser(
                                    user.user_id,
                                    user.full_name || "User"
                                  )
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Admin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Badge variant="outline">Vendor</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
