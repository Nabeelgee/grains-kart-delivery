import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MOCK_RESTAURANTS, MOCK_CATEGORIES } from "@/lib/constants";

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Delivery Time", value: "delivery_time" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    vegOnly: boolean;
    sortBy: string;
    categories: string[];
  }>({
    vegOnly: false,
    sortBy: "relevance",
    categories: searchParams.get("category")
      ? [searchParams.get("category")!]
      : [],
  });

  const filteredRestaurants = MOCK_RESTAURANTS.filter((restaurant) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !restaurant.name.toLowerCase().includes(query) &&
        !restaurant.cuisine_type.some((c) => c.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Veg only filter
    if (selectedFilters.vegOnly && !restaurant.is_veg_only) {
      return false;
    }

    // Category filter
    if (selectedFilters.categories.length > 0) {
      const restaurantCategories = restaurant.cuisine_type.map((c) =>
        c.toLowerCase().replace(" ", "-")
      );
      if (
        !selectedFilters.categories.some(
          (cat) =>
            restaurantCategories.includes(cat) ||
            restaurant.cuisine_type.some((c) =>
              c.toLowerCase().includes(cat.replace("-", " "))
            )
        )
      ) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (selectedFilters.sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "delivery_time":
        return a.delivery_time_min - b.delivery_time_min;
      case "price_low":
        return a.price_range - b.price_range;
      case "price_high":
        return b.price_range - a.price_range;
      default:
        return 0;
    }
  });

  const toggleCategory = (slug: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      vegOnly: false,
      sortBy: "relevance",
      categories: [],
    });
    setSearchQuery("");
    setSearchParams({});
  };

  const activeFilterCount =
    (selectedFilters.vegOnly ? 1 : 0) +
    selectedFilters.categories.length +
    (selectedFilters.sortBy !== "relevance" ? 1 : 0);

  return (
    <Layout>
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Restaurants Near You
            </h1>
            <p className="text-muted-foreground">
              {filteredRestaurants.length} restaurants delivering to your location
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for restaurants or cuisines..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Sort By */}
                  <div>
                    <h3 className="font-medium mb-3">Sort By</h3>
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              sortBy: option.value,
                            }))
                          }
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedFilters.sortBy === option.value
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Veg Only */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="veg-only"
                        checked={selectedFilters.vegOnly}
                        onCheckedChange={(checked) =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            vegOnly: checked as boolean,
                          }))
                        }
                      />
                      <Label htmlFor="veg-only" className="font-medium">
                        Pure Veg Only
                      </Label>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_CATEGORIES.map((category) => (
                        <Badge
                          key={category.id}
                          variant={
                            selectedFilters.categories.includes(category.slug)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleCategory(category.slug)}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant={selectedFilters.vegOnly ? "default" : "outline"}
              onClick={() =>
                setSelectedFilters((prev) => ({
                  ...prev,
                  vegOnly: !prev.vegOnly,
                }))
              }
            >
              🥬 Pure Veg
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedFilters.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat.replace("-", " ")}
                <button onClick={() => toggleCategory(cat)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedFilters.vegOnly && (
              <Badge variant="secondary" className="gap-1">
                Pure Veg
                <button
                  onClick={() =>
                    setSelectedFilters((prev) => ({ ...prev, vegOnly: false }))
                  }
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Restaurant Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
