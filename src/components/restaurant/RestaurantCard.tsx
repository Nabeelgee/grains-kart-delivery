import { motion } from "framer-motion";
import { Star, Clock, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    cuisine_type: string[];
    rating: number;
    total_reviews: number;
    delivery_time_min: number;
    delivery_time_max: number;
    price_range: number;
    is_veg_only: boolean;
    is_featured: boolean;
    image_url: string;
    address: string;
  };
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  const priceRangeDisplay = "₹".repeat(restaurant.price_range);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/restaurant/${restaurant.slug}`}>
        <Card className="overflow-hidden card-hover border-0 shadow-md hover:shadow-xl bg-card">
          <div className="relative aspect-[16/10] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent z-10"></div>
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {restaurant.is_featured && (
              <Badge className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            {restaurant.is_veg_only && (
              <div className="absolute top-3 right-3 z-20 w-6 h-6 bg-success rounded flex items-center justify-center">
                <Leaf className="w-4 h-4 text-success-foreground" />
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <div className="flex items-center gap-2">
                <div className="rating-stars">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-background/80">
                  ({restaurant.total_reviews}+ ratings)
                </span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 truncate">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground mb-2 truncate">
              {restaurant.cuisine_type.join(", ")}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                </span>
              </div>
              <span className="text-muted-foreground">{priceRangeDisplay}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
