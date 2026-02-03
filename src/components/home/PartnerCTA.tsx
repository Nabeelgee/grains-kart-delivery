import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Store, TrendingUp, Clock } from "lucide-react";
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
              Become a Partner
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Grow Your Business with GRAINSKART
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of restaurant partners and reach millions of hungry customers. 
              Boost your sales and grow your business with our powerful platform.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/auth?mode=signup&role=vendor">
                Register Your Restaurant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
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
                icon: Store,
                title: "Easy Onboarding",
                description: "Get started in minutes with our simple registration process",
              },
              {
                icon: TrendingUp,
                title: "Increase Sales",
                description: "Reach millions of new customers and grow your revenue",
              },
              {
                icon: Clock,
                title: "Real-time Analytics",
                description: "Track orders, revenue, and performance in real-time",
              },
            ].map((item, index) => (
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
