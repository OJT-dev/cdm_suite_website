
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag, Check, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ShopifyIntegrationClientProps {
  project: any;
}

export function ShopifyIntegrationClient({ project }: ShopifyIntegrationClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [formData, setFormData] = useState({
    shopifyDomain: "",
    accessToken: "",
  });

  useEffect(() => {
    // Check existing connection
    const checkConnection = async () => {
      try {
        const response = await fetch(`/api/builder/shopify?projectId=${project.id}`);
        if (response.ok) {
          const data = await response.json();
          setConnected(data.connected);
          setShopifyData(data);
          if (data.domain) {
            setFormData((prev) => ({ ...prev, shopifyDomain: data.domain }));
          }
        }
      } catch (error) {
        console.error("Error checking Shopify connection:", error);
      }
    };

    checkConnection();
  }, [project.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/builder/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          shopifyDomain: formData.shopifyDomain,
          accessToken: formData.accessToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect Shopify");
      }

      toast.success("Shopify connected successfully!");
      setConnected(true);
      router.refresh();
    } catch (error) {
      console.error("Error connecting Shopify:", error);
      toast.error("Failed to connect Shopify. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Shopify?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/builder/shopify", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Shopify");
      }

      toast.success("Shopify disconnected successfully");
      setConnected(false);
      setFormData({ shopifyDomain: "", accessToken: "" });
      router.refresh();
    } catch (error) {
      console.error("Error disconnecting Shopify:", error);
      toast.error("Failed to disconnect Shopify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/projects/${project.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shopify Integration</h1>
        <p className="text-gray-600 mt-1">
          Connect your Shopify store to enable real e-commerce functionality
        </p>
      </div>

      {/* Status Card */}
      {connected ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900">Shopify Connected</CardTitle>
                  <CardDescription className="text-green-700">
                    Your store is linked: {shopifyData?.domain}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisconnect} disabled={loading}>
                Disconnect
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Connect Your Shopify Store</CardTitle>
                <CardDescription className="text-blue-700">
                  Link your Shopify account to enable product management and checkout
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Store Connection</CardTitle>
            <CardDescription>
              Enter your Shopify store credentials to enable integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopifyDomain">Shopify Store Domain</Label>
                <Input
                  id="shopifyDomain"
                  placeholder="your-store.myshopify.com"
                  value={formData.shopifyDomain}
                  onChange={(e) =>
                    setFormData({ ...formData, shopifyDomain: e.target.value })
                  }
                  required
                  disabled={connected}
                />
                <p className="text-xs text-muted-foreground">
                  Your Shopify store URL (e.g., mystore.myshopify.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="shpat_..."
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  required
                  disabled={connected}
                />
                <p className="text-xs text-muted-foreground">
                  Your Shopify Admin API access token
                </p>
              </div>

              {!connected && (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connecting..." : "Connect Shopify"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get Your Credentials</CardTitle>
            <CardDescription>
              Follow these steps to connect your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Log into Shopify Admin</p>
                  <p className="text-muted-foreground">
                    Go to your Shopify admin dashboard
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Create Custom App</p>
                  <p className="text-muted-foreground">
                    Settings → Apps and sales channels → Develop apps
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Configure API Scopes</p>
                  <p className="text-muted-foreground">
                    Enable: read_products, write_products, read_orders
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Install App & Get Token</p>
                  <p className="text-muted-foreground">
                    Install the app and copy the Admin API access token
                  </p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <a
                href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Shopify Documentation
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>What You Get with Shopify Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Product Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically sync products from your Shopify store
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Secure Checkout</h4>
                <p className="text-sm text-muted-foreground">
                  Use Shopify's secure checkout process for transactions
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Inventory Management</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time inventory updates and order management
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
