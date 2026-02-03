import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold">GRAINSKART</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your favorite food & grocery delivery app. Fresh flavors delivered fast to your doorstep.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <nav className="space-y-2">
              <Link
                to="/restaurants"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Browse Restaurants
              </Link>
              <Link
                to="/about"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/partner"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Partner With Us
              </Link>
              <Link
                to="/careers"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Careers
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Support</h4>
            <nav className="space-y-2">
              <Link
                to="/help"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Help Center
              </Link>
              <Link
                to="/faq"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                FAQs
              </Link>
              <Link
                to="/terms"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="block text-muted-foreground hover:text-background transition-colors"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <a
                href="mailto:support@grainskart.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-background transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@grainskart.com
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-3 text-muted-foreground hover:text-background transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 12345 67890
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Food Street, Koramangala, Bangalore - 560034</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GRAINSKART. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
