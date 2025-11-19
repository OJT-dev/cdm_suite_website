
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, ExternalLink, Edit, Eye, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PreviewClientProps {
  project: any;
}

export function PreviewClient({ project }: PreviewClientProps) {
  const { name, subdomain, pages, siteConfig } = project;
  const [selectedPage, setSelectedPage] = useState("home");

  // Check if this is an ecommerce site
  const isEcommerce = pages?.some((p: any) => 
    p.slug === "shop" || p.slug === "products" || p.slug === "store"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/projects">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
              <div>
                <h1 className="font-bold text-lg">{name}</h1>
                {subdomain && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600">
                      {subdomain}.cdmsuite.com
                    </span>
                    {isEcommerce && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        E-commerce
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEcommerce && (
                <Button asChild variant="outline">
                  <Link href={`/dashboard/projects/${project.id}/shopify`}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Connect Shopify
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={`/builder/editor/${project.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              {subdomain && (
                <Button asChild>
                  <Link href={`/site/${subdomain}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live Site
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Website Preview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Browser Chrome */}
          <div className="bg-gray-100 border-b px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
                https://{subdomain}.cdmsuite.com
              </div>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="bg-gray-50 border-b px-4 py-2 flex gap-2 overflow-x-auto">
            {pages?.map((page: any) => (
              <button
                key={page.slug}
                onClick={() => setSelectedPage(page.slug)}
                className={`px-4 py-2 rounded-t text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedPage === page.slug
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>

          {/* Website Content */}
          <div className="bg-white" style={{ minHeight: "600px" }}>
            <iframe
              src={`/site/${subdomain}?page=${selectedPage}`}
              className="w-full"
              style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
              title="Website Preview"
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="font-bold mb-2">📄 Pages Created</h3>
            <p className="text-3xl font-bold text-blue-600">{pages?.length || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              Full multi-page website with navigation
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-2">🎨 Design Template</h3>
            <p className="text-lg font-semibold">{project.template || "Custom"}</p>
            <p className="text-sm text-gray-600 mt-2">
              Professional design optimized for your industry
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-2">🚀 Status</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-semibold text-green-600">Live & Ready</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your website is published and accessible
            </p>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="p-6 mt-6">
          <h3 className="font-bold text-lg mb-4">Next Steps</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Customize Your Content</h4>
                <p className="text-sm text-gray-600">
                  Edit pages, update images, and personalize the content
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Connect Your Domain</h4>
                <p className="text-sm text-gray-600">
                  Link your custom domain for a professional presence
                </p>
              </div>
            </div>
            {isEcommerce && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Connect Shopify Store</h4>
                  <p className="text-sm text-gray-600">
                    Link your Shopify account to enable real e-commerce
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">{isEcommerce ? "4" : "3"}</span>
              </div>
              <div>
                <h4 className="font-semibold">Share & Promote</h4>
                <p className="text-sm text-gray-600">
                  Share your new website and start attracting visitors
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
