import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center"
            >
              <span className="text-2xl md:text-3xl font-extrabold text-gradient">
                GRAINSKART
              </span>
            </motion.div>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10 bg-secondary/50 border-0 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/products">Products</Link>
            </Button>
            {user ? (
              <>
                {role === "admin" && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </Button>
                )}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/cart"
              className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10 bg-secondary/50"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-t border-border"
        >
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/products"
              className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="flex items-center gap-2 w-full p-3 rounded-lg bg-primary text-primary-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}