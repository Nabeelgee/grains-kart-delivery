import { motion } from "framer-motion";
import { Truck, Clock, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Get your food delivered in 30 minutes or less",
  },
  {
    icon: Clock,
    title: "24/7 Service",
    description: "Order anytime, we're always open for you",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Multiple payment options with secure checkout",
  },
  {
    icon: Headphones,
    title: "Live Support",
    description: "24/7 customer support for any queries",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold"
          >
            Why Choose GRAINSKART?
          </motion.h2>
          <p className="text-muted-foreground mt-2">
            We make food ordering simple and delightful
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
