import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Upload, Camera, Loader2, ImageIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Check if screenshot already uploaded
  useEffect(() => {
    if (!orderNumber) return;
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("payment_screenshot_url")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (data?.payment_screenshot_url) {
        setScreenshotUrl(data.payment_screenshot_url);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderNumber || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${orderNumber}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-screenshots")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update order with screenshot URL
      const { error: updateError } = await supabase
        .from("orders")
        .update({ payment_screenshot_url: publicUrl })
        .eq("order_number", orderNumber);

      if (updateError) throw updateError;

      setScreenshotUrl(publicUrl);
      toast.success("Payment screenshot uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-success" />
          </motion.div>

          {/* Thank You Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Thank You! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Your order has been placed successfully. We'll start preparing it right away!
          </motion.p>

          {/* Order Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Package className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-bold text-lg">{orderNumber || "Processing..."}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will receive order updates via notification. Track your order status in the Orders page.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Screenshot Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3 justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Upload Payment Screenshot</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  If you paid via GPay, please upload the payment screenshot for verification.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadScreenshot}
                />

                {screenshotUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="w-full max-h-64 object-contain bg-secondary/30"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-center text-sm text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>Screenshot uploaded successfully</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Replace Screenshot
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Tap to upload payment screenshot
                        </span>
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/orders">
                Track Order
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#FF6B35", "#22C55E", "#F59E0B", "#3B82F6"][
                    Math.floor(Math.random() * 4)
                  ],
                }}
                initial={{ y: -20, opacity: 1 }}
                animate={{
                  y: window.innerHeight + 20,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
