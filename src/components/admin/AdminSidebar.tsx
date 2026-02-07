import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileBarChart,
  Tag,
  Settings,
  LogOut,
  FolderOpen,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
  { icon: Package, label: "Products", value: "products" },
  { icon: FolderOpen, label: "Categories", value: "categories" },
  { icon: ShoppingBag, label: "Orders", value: "orders" },
  { icon: Users, label: "Users", value: "users" },
  { icon: FileBarChart, label: "Reports", value: "reports" },
  { icon: Tag, label: "Promo Codes", value: "promos" },
  { icon: Settings, label: "Settings", value: "settings" },
];
 
 export function AdminSidebar({
   activeTab,
   setActiveTab,
   onSignOut,
   sidebarOpen,
   setSidebarOpen,
 }: AdminSidebarProps) {
   return (
     <>
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
             onClick={onSignOut}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </button>
         </div>
       </aside>
     </>
   );
 }