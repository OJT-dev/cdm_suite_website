
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Eye, Heart, ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function WebsiteGalleryClient({ websites: initialWebsites }: { websites: any[] }) {
  const [websites, setWebsites] = useState(initialWebsites);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(websites.map(w => w.category)))];

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.title.toLowerCase().includes(search.toLowerCase()) ||
                          website.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || website.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Website Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore stunning websites built with CDM Suite AI Website Builder
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No websites found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website) => (
              <Card key={website.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative aspect-video bg-muted">
                  {website.thumbnail && (
                    <Image
                      src={website.thumbnail}
                      alt={website.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{website.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {website.category}
                        {website.industry && ` • ${website.industry}`}
                      </p>
                    </div>
                    {website.isFeatured && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {website.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {website.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {website.likes}
                      </span>
                    </div>
                  </div>

                  {website.liveUrl && (
                    <a
                      href={website.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Live Site
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
