import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MOCK_CATEGORIES } from "@/lib/constants";
const categoryImages: Record<string, string> = {
  pizza: "🍕",
  burgers: "🍔",
  biryani: "🍚",
  chinese: "🥡",
  desserts: "🍰",
  "south-indian": "🥘",
  "north-indian": "🍛",
  healthy: "🥗"
};
export function CategoriesSection() {
  return <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            
            <p className="text-muted-foreground mt-1">Browse by category</p>
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
          {MOCK_CATEGORIES.map((category, index) => <motion.div key={category.id} initial={{
          opacity: 0,
          scale: 0.8
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.4,
          delay: index * 0.05
        }}>
              <Link to={`/restaurants?category=${category.slug}`} className="group flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center text-3xl md:text-4xl mb-2 group-hover:bg-primary/10 transition-colors group-hover:scale-110 transform duration-300">
                  {categoryImages[category.slug] || "🍽️"}
                </div>
                <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {category.name}
                </span>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </section>;
}