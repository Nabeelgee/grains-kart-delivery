import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Truck, Shield, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PartnerCTA() {
  return (
    <section className="py-16 md:py-24 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium mb-6">
              Why Choose GRAINSKART
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Quality Grains, Trusted by Thousands
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We source directly from trusted farmers and mills to bring you the freshest,
              highest-quality grains at competitive prices. Experience the difference with GRAINSKART.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/products">Shop Now</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 gap-4"
          >
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description: "Pure, unprocessed grains sourced directly from farms",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Quick and reliable delivery to your doorstep",
              },
              {
                icon: Shield,
                title: "Quality Assured",
                description: "Every product is tested for quality and freshness",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-background/5 backdrop-blur"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}