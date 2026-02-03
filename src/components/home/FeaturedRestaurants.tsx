import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { MOCK_RESTAURANTS } from "@/lib/constants";

export function FeaturedRestaurants() {
  const featuredRestaurants = MOCK_RESTAURANTS.filter((r) => r.is_featured).slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold"
            >
              Top Picks For You
            </motion.h2>
            <p className="text-muted-foreground mt-1">Curated restaurants just for you</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/restaurants">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredRestaurants.map((restaurant, index) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/restaurants">
              View All Restaurants
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
