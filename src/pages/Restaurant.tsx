import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  Share2,
  Heart,
  Info,
  Leaf,
  ShoppingBag,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { MOCK_RESTAURANTS, MOCK_MENU_ITEMS } from "@/lib/constants";

export default function RestaurantPage() {
  const { slug } = useParams();
  const { items, addItem, updateQuantity, itemCount, total } = useCart();
  const [liked, setLiked] = useState(false);

  // Find restaurant by slug
  const restaurant = MOCK_RESTAURANTS.find((r) => r.slug === slug);

  if (!restaurant) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold mb-2">Restaurant Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The restaurant you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/restaurants">Browse Restaurants</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Get menu items for this restaurant
  const menuItems = MOCK_MENU_ITEMS.filter(
    (item) => item.restaurant_id === restaurant.id
  );

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((i) => i.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: (typeof MOCK_MENU_ITEMS)[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discounted_price || item.price,
      image_url: item.image_url,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      is_veg: item.is_veg,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <Layout>
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-foreground/20 z-10"></div>
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {restaurant.is_veg_only && (
                  <Badge className="bg-success text-success-foreground">
                    <Leaf className="w-3 h-3 mr-1" />
                    Pure Veg
                  </Badge>
                )}
                {restaurant.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-background mb-2">
                {restaurant.name}
              </h1>
              <p className="text-background/80 mb-4">
                {restaurant.cuisine_type.join(", ")}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-background/90">
                <div className="flex items-center gap-1">
                  <div className="rating-stars">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                  </div>
                  <span>({restaurant.total_reviews}+ ratings)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.address}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-full border transition-colors ${
                  liked
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${liked ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-2 rounded-full border border-border hover:border-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>
                Min order: ₹{restaurant.min_order_amount || 0} | Delivery: ₹
                {restaurant.delivery_fee || 40}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="all">All Items</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended">
            <div className="grid gap-4">
              {menuItems
                .filter((item) => item.is_bestseller)
                .map((item, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    onAdd={() => handleAddToCart(item)}
                    onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                    index={index}
                  />
                ))}
              {menuItems.filter((item) => item.is_bestseller).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No recommended items available
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid gap-4">
              {menuItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => handleAddToCart(item)}
                  onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                  index={index}
                />
              ))}
              {menuItems.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No menu items available
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <Link to="/cart">
            <Button className="w-full h-14 text-lg shadow-lg shadow-primary/30">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {itemCount} items | ₹{total.toFixed(0)}
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </motion.div>
      )}
    </Layout>
  );
}

interface MenuItemCardProps {
  item: (typeof MOCK_MENU_ITEMS)[0];
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (quantity: number) => void;
  index: number;
}

function MenuItemCard({
  item,
  quantity,
  onAdd,
  onUpdateQuantity,
  index,
}: MenuItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-all hover:shadow-md bg-card"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
              item.is_veg ? "border-success" : "border-accent"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                item.is_veg ? "bg-success" : "bg-accent"
              }`}
            ></div>
          </div>
          {item.is_bestseller && (
            <Badge variant="secondary" className="text-xs">
              ⭐ Bestseller
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            ₹{item.discounted_price || item.price}
          </span>
          {item.discounted_price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{item.price}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        {quantity === 0 ? (
          <Button
            size="sm"
            onClick={onAdd}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            ADD
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-2 py-1">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              className="p-1 hover:bg-primary-foreground/10 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium w-6 text-center">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="p-1 hover:bg-primary-foreground/10 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
