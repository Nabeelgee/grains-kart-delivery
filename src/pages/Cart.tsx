import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Tag,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  X,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = "cod" | "upi" | "card";

const UPI_NUMBER = "6379658082";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    restaurantId,
    restaurantName,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleApplyPromo = async () => {
    // Check promo code in database
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !promo) {
      toast.error("Invalid promo code");
      return;
    }

    // Check minimum order amount
    if (promo.min_order_amount && subtotal < promo.min_order_amount) {
      toast.error(`Minimum order amount is ₹${promo.min_order_amount}`);
      return;
    }

    // Check usage limit
    if (promo.usage_limit && promo.used_count && promo.used_count >= promo.usage_limit) {
      toast.error("This promo code has expired");
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === "percentage") {
      discountAmount = subtotal * (promo.discount_value / 100);
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    setDiscount(discountAmount);
    setPromoApplied(true);
    toast.success(`Promo code applied! You saved ₹${discountAmount.toFixed(0)}`);
  };

  // Validate if a string is a valid UUID
  const isValidUUID = (str: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  const DEFAULT_STORE_ID = "a0000000-0000-0000-0000-000000000001";

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!deliveryCity.trim()) {
      toast.error("Please enter your city");
      return;
    }

    if (!deliveryPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setLoading(true);

    try {
      const finalTotal = total - discount;

      // Use default store ID if restaurantId is not a valid UUID
      const validRestaurantId = restaurantId && isValidUUID(restaurantId) ? restaurantId : DEFAULT_STORE_ID;

      // Generate order number
      const orderNumber = `GK${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          restaurant_id: validRestaurantId,
          order_number: orderNumber,
          status: "placed",
          payment_method: paymentMethod,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          discount: discount,
          total: finalTotal,
          delivery_address: deliveryAddress,
          delivery_city: deliveryCity,
          delivery_phone: deliveryPhone,
          notes: notes || null,
          promo_code: promoApplied ? promoCode.toUpperCase() : null,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order error:", orderError);
        throw orderError;
      }

      // Create order items - set menu_item_id to null if not a valid UUID
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: isValidUUID(item.id) ? item.id : null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items error:", itemsError);
        throw itemsError;
      }

      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/order-success?order=${orderNumber}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some delicious food to get started
            </p>
            <Button asChild size="lg">
              <Link to="/restaurants">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Restaurants
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Order from {restaurantName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-3 h-3 border rounded flex items-center justify-center ${
                            item.is_veg ? "border-success" : "border-accent"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_veg ? "bg-success" : "bg-accent"
                            }`}
                          ></div>
                        </div>
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold w-16 text-right">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special instructions?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label
                      htmlFor="cod"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Banknote className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when your order arrives
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label
                      htmlFor="upi"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">GPay (UPI)</p>
                        <p className="text-sm text-muted-foreground">
                          Pay via Google Pay to <span className="font-mono font-bold text-primary">{UPI_NUMBER}</span>
                        </p>
                      </div>
                    </Label>
                    {paymentMethod === "upi" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQR(true)}
                        className="ml-auto shrink-0"
                      >
                        Show QR
                      </Button>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* GPay QR Code Modal */}
            {showQR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm" onClick={() => setShowQR(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowQR(false)}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold text-center mb-2">Pay via GPay</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Scan this QR code or pay to the number below
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_NUMBER}@ybl&pn=GRAINSKART&am=${(total - discount).toFixed(0)}&cu=INR`}
                      alt="GPay QR Code"
                      className="w-48 h-48 rounded-lg border border-border"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">UPI Number</p>
                    <p className="text-2xl font-mono font-bold text-primary">{UPI_NUMBER}</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Amount: <span className="font-bold text-foreground">₹{(total - discount).toFixed(0)}</span>
                    </p>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setShowQR(false)}>
                    Done
                  </Button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Apply Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode}
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bill Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bill Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Total</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>To Pay</span>
                    <span>₹{finalTotal.toFixed(0)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                className="w-full h-14 text-lg"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  "Placing Order..."
                ) : (
                  <>
                    Place Order • ₹{finalTotal.toFixed(0)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}