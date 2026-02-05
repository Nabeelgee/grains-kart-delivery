import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const categoryEmojis: Record<string, string> = {
  rice: "🍚",
  wheat: "🌾",
  pulses: "🫘",
  millets: "🌿",
  spices: "🌶️",
  oils: "🫒",
  flour: "🥖",
  organic: "🌱",
  grains: "🌾",
};

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data) setCategories(data);
    setLoading(false);
  };

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center mb-8"
        >
          Shop by Category
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${category.id}`}
                className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-center group"
              >
                <div className="text-4xl mb-3">
                  {categoryEmojis[category.slug] || "🌾"}
                </div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}