
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";

interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

// Popular icon names for common pages
const POPULAR_ICONS = [
  "Home", "Phone", "Mail", "User", "Users", "Briefcase", "ShoppingCart",
  "Heart", "Star", "Settings", "Menu", "Search", "Calendar", "Clock",
  "MapPin", "MessageSquare", "Image", "Video", "Music", "FileText",
  "Folder", "Download", "Upload", "Share2", "Link", "ExternalLink",
  "ChevronRight", "ChevronDown", "Plus", "Minus", "X", "Check",
  "Info", "AlertCircle", "HelpCircle", "Zap", "TrendingUp", "Award"
];

export function IconPicker({ open, onClose, onSelect, currentIcon }: IconPickerProps) {
  const [search, setSearch] = useState("");

  // Get all available Lucide icons
  const allIcons = useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (key) => 
        key !== "default" && 
        key !== "createLucideIcon" &&
        typeof (LucideIcons as any)[key] === "function"
    );
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) {
      return POPULAR_ICONS;
    }
    return allIcons.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allIcons]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Icon Grid */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-8 gap-2 p-1">
              {filteredIcons.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={`p-3 rounded-lg hover:bg-accent transition-colors flex flex-col items-center gap-1 group ${
                      currentIcon === iconName ? "bg-accent ring-2 ring-primary" : ""
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {search ? `${filteredIcons.length} icons found` : "Popular icons"}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
