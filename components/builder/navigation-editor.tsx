
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Eye, EyeOff, GripVertical, ChevronRight, ChevronDown, 
  Sparkles, Save, RotateCcw 
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { IconPicker } from "./icon-picker";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavigationEditorProps {
  projectId: string;
  pages: any[];
  onUpdate: (navigationConfig: any) => void;
}

interface NavItem {
  slug: string;
  title: string;
  navLabel: string;
  icon?: string;
  hidden: boolean;
  isDropdownParent?: boolean;
  children?: NavItem[];
}

function SortableNavItem({ 
  item, 
  onToggleVisibility, 
  onLabelChange, 
  onIconSelect,
  onToggleDropdown,
  isChild = false 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(item.navLabel);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const IconComponent = item.icon 
    ? (LucideIcons as any)[item.icon] 
    : null;

  const handleLabelSave = () => {
    onLabelChange(item.slug, tempLabel);
    setIsEditing(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group ${isChild ? "ml-8" : ""}`}
      >
        <Card className={`p-3 mb-2 ${item.hidden ? "opacity-50" : ""}`}>
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Icon */}
            <button
              onClick={() => setIconPickerOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
              title="Change icon"
            >
              {IconComponent ? (
                <IconComponent className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Label */}
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLabelSave();
                      if (e.key === "Escape") {
                        setTempLabel(item.navLabel);
                        setIsEditing(false);
                      }
                    }}
                    autoFocus
                    className="h-8"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-left hover:text-primary transition-colors"
                >
                  <p className="font-medium">{item.navLabel}</p>
                  <p className="text-xs text-muted-foreground">/{item.slug}</p>
                </button>
              )}
            </div>

            {/* Dropdown Toggle */}
            {!isChild && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleDropdown(item.slug)}
                title={item.isDropdownParent ? "Remove from dropdown" : "Make dropdown parent"}
              >
                {item.isDropdownParent ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4 opacity-30" />
                )}
              </Button>
            )}

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={!item.hidden}
                onCheckedChange={(checked) => onToggleVisibility(item.slug, !checked)}
              />
              {item.hidden ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </Card>
      </div>

      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(iconName) => onIconSelect(item.slug, iconName)}
        currentIcon={item.icon}
      />
    </>
  );
}

export function NavigationEditor({ projectId, pages, onUpdate }: NavigationEditorProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize nav items from pages
  useEffect(() => {
    const items: NavItem[] = pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel || page.title,
      icon: page.icon,
      hidden: page.hidden || false,
      isDropdownParent: page.isDropdownParent || false,
      children: [],
    }));
    setNavItems(items);
  }, [pages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNavItems((items) => {
        const oldIndex = items.findIndex((item) => item.slug === active.id);
        const newIndex = items.findIndex((item) => item.slug === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  };

  const handleToggleVisibility = (slug: string, hidden: boolean) => {
    setNavItems((items) =>
      items.map((item) =>
        item.slug === slug ? { ...item, hidden } : item
      )
    );
    setHasChanges(true);
  };

  const handleLabelChange = (slug: string, newLabel: string) => {
    setNavItems((items) =>
      items.map((item) =>
        item.slug === slug ? { ...item, navLabel: newLabel } : item
      )
    );
    setHasChanges(true);
  };

  const handleIconSelect = (slug: string, iconName: string) => {
    setNavItems((items) =>
      items.map((item) =>
        item.slug === slug ? { ...item, icon: iconName } : item
      )
    );
    setHasChanges(true);
  };

  const handleToggleDropdown = (slug: string) => {
    setNavItems((items) =>
      items.map((item) =>
        item.slug === slug 
          ? { ...item, isDropdownParent: !item.isDropdownParent } 
          : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const navigationConfig = {
        pageOrder: navItems.map((item) => item.slug),
        hiddenPages: navItems.filter((item) => item.hidden).map((item) => item.slug),
        icons: navItems.reduce((acc: any, item) => {
          if (item.icon) acc[item.slug] = item.icon;
          return acc;
        }, {}),
        navLabels: navItems.reduce((acc: any, item) => {
          acc[item.slug] = item.navLabel;
          return acc;
        }, {}),
        dropdownParents: navItems.filter((item) => item.isDropdownParent).map((item) => item.slug),
      };

      const response = await fetch("/api/builder/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, navigationConfig }),
      });

      if (!response.ok) throw new Error("Failed to save navigation");

      toast.success("Navigation updated successfully!");
      setHasChanges(false);
      onUpdate(navigationConfig);
    } catch (error) {
      console.error("Save navigation error:", error);
      toast.error("Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const items: NavItem[] = pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      navLabel: page.navLabel || page.title,
      icon: page.icon,
      hidden: page.hidden || false,
      isDropdownParent: page.isDropdownParent || false,
      children: [],
    }));
    setNavItems(items);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Navigation Manager</h3>
          <p className="text-sm text-muted-foreground">
            Drag to reorder, click labels to edit, toggle visibility
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={navItems.map((item) => item.slug)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <SortableNavItem
                key={item.slug}
                item={item}
                onToggleVisibility={handleToggleVisibility}
                onLabelChange={handleLabelChange}
                onIconSelect={handleIconSelect}
                onToggleDropdown={handleToggleDropdown}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
