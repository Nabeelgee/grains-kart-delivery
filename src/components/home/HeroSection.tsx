import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-pattern py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              🌾 Premium Quality Grains
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
          >
            Premium Grains{" "}
            <span className="text-gradient">Delivered</span> Fresh to You
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Shop the finest quality rice, wheat, pulses, and more. Farm-fresh grains delivered to your doorstep with guaranteed quality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Button asChild size="lg" className="h-12 px-8 shadow-lg shadow-primary/20 flex-1">
              <a href="/products">
                Shop Now
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <a href="#categories">
                Browse Categories
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              100% Natural
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Fast Delivery
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-warning rounded-full"></span>
              Best Prices
            </span>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
    </section>
  );
}
