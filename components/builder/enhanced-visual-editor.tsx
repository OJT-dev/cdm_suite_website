
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Wand2,
  Layout,
  Palette,
  Search,
  Settings,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavigationEditor } from "./navigation-editor";
import { GlobalStylesPanel } from "./global-styles-panel";
import { SeoPanel } from "./seo-panel";
import { ContentContextMenu } from "./content-context-menu";

interface EnhancedVisualEditorProps {
  project: any;
}

export function EnhancedVisualEditor({ project }: EnhancedVisualEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<any[]>(project.pages || []);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [siteConfig, setSiteConfig] = useState<any>(project.siteConfig || {});
  const [previewMode, setPreviewMode] = useState(false);
  const [aiRegenerating, setAiRegenerating] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("page");

  // Content context menu state
  const [selectedText, setSelectedText] = useState("");
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeTextArea, setActiveTextArea] = useState<HTMLTextAreaElement | null>(null);

  const selectedPage = pages[selectedPageIndex];

  // Handle text selection for context menu
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setSelectedText(text);
          setContextMenuPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10,
          });
        }
      } else {
        setContextMenuPosition(null);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/builder/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          pages,
          siteConfig,
        }),
      });

      if (!response.ok) throw new Error("Save failed");

      toast.success("Changes saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/builder/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      if (!response.ok) throw new Error("Publish failed");

      toast.success("Website published successfully!");
      window.open(`https://${project.subdomain}.cdmsuite.com`, "_blank");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish website");
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: string, value: string) => {
    const updatedPages = [...pages];
    updatedPages[selectedPageIndex].hero = {
      ...updatedPages[selectedPageIndex].hero,
      [field]: value,
    };
    setPages(updatedPages);
  };

  const updateSection = (sectionIndex: number, field: string, value: any) => {
    const updatedPages = [...pages];
    updatedPages[selectedPageIndex].sections[sectionIndex] = {
      ...updatedPages[selectedPageIndex].sections[sectionIndex],
      [field]: value,
    };
    setPages(updatedPages);
  };

  const addSection = () => {
    const updatedPages = [...pages];
    updatedPages[selectedPageIndex].sections.push({
      type: "content",
      title: "New Section",
      content: "Add your content here...",
      items: [],
    });
    setPages(updatedPages);
  };

  const deleteSection = (sectionIndex: number) => {
    const updatedPages = [...pages];
    updatedPages[selectedPageIndex].sections.splice(sectionIndex, 1);
    setPages(updatedPages);
    setSelectedSectionIndex(null);
  };

  const addPage = () => {
    const newPage = {
      slug: `page-${pages.length + 1}`,
      title: `New Page ${pages.length + 1}`,
      navLabel: `New Page ${pages.length + 1}`,
      hero: {
        headline: "Page Headline",
        subheadline: "Page subheadline",
        cta: "Get Started",
      },
      sections: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
      },
    };
    setPages([...pages, newPage]);
    setSelectedPageIndex(pages.length);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length === 1) {
      toast.error("Cannot delete the last page");
      return;
    }
    const updatedPages = pages.filter((_, i) => i !== pageIndex);
    setPages(updatedPages);
    setSelectedPageIndex(Math.max(0, pageIndex - 1));
  };

  const aiRegenerateSection = async (sectionIndex: number) => {
    setAiRegenerating(true);
    try {
      const section = selectedPage.sections[sectionIndex];
      const response = await fetch("/api/builder/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          pageSlug: selectedPage.slug,
          sectionType: section.type,
          currentContent: section,
        }),
      });

      if (!response.ok) throw new Error("Regeneration failed");

      const data = await response.json();
      updateSection(sectionIndex, "content", data.content);
      updateSection(sectionIndex, "title", data.title);
      if (data.items) {
        updateSection(sectionIndex, "items", data.items);
      }

      toast.success("Section regenerated with AI!");
    } catch (error) {
      console.error("AI regeneration error:", error);
      toast.error("Failed to regenerate section");
    } finally {
      setAiRegenerating(false);
    }
  };

  const handleContentReplace = (newText: string) => {
    if (!activeTextArea) return;

    const start = activeTextArea.selectionStart;
    const end = activeTextArea.selectionEnd;
    const currentValue = activeTextArea.value;

    const newValue =
      currentValue.substring(0, start) + newText + currentValue.substring(end);

    // Update the appropriate field based on which textarea is active
    // This is a simplified version - you'd need to track which field the textarea belongs to
    activeTextArea.value = newValue;
    setContextMenuPosition(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/builder">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projects
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="font-semibold text-lg">{project.name}</h2>
            <p className="text-xs text-muted-foreground">
              {project.subdomain}.cdmsuite.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={project.status === "active" ? "default" : "secondary"}>
            {project.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={saving}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Page Navigator */}
        {!previewMode && (
          <div className="w-64 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Pages</h3>
                <Button size="sm" variant="ghost" onClick={addPage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {pages.map((page, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between group ${
                      selectedPageIndex === index
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedPageIndex(index);
                      setSelectedSectionIndex(null);
                    }}
                  >
                    <span className="text-sm font-medium">{page.title}</span>
                    {pages.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedPage && (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Sections</h3>
                <div className="space-y-1">
                  <div
                    className={`p-2 rounded-lg cursor-pointer text-sm ${
                      selectedSectionIndex === null
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedSectionIndex(null)}
                  >
                    Hero Section
                  </div>
                  {selectedPage.sections?.map((section: any, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg cursor-pointer text-sm flex items-center justify-between group ${
                        selectedSectionIndex === index
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedSectionIndex(index)}
                    >
                      <span>{section.title || `Section ${index + 1}`}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(index);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={addSection}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Panel */}
        <div className="flex-1 overflow-y-auto">
          {previewMode ? (
            <WebsitePreview pages={pages} siteConfig={siteConfig} />
          ) : (
            <div className="max-w-4xl mx-auto p-8">
              {selectedPage && (
                <>
                  {/* Hero Section Editor */}
                  {selectedSectionIndex === null && (
                    <Card className="p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Hero Section
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Headline</Label>
                          <Input
                            value={selectedPage.hero?.headline || ""}
                            onChange={(e) => updateHero("headline", e.target.value)}
                            className="text-lg font-bold"
                          />
                        </div>
                        <div>
                          <Label>Subheadline</Label>
                          <Textarea
                            value={selectedPage.hero?.subheadline || ""}
                            onChange={(e) => updateHero("subheadline", e.target.value)}
                            rows={3}
                            onFocus={(e) => setActiveTextArea(e.currentTarget)}
                          />
                        </div>
                        <div>
                          <Label>Call-to-Action Button Text</Label>
                          <Input
                            value={selectedPage.hero?.cta || ""}
                            onChange={(e) => updateHero("cta", e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Section Editor */}
                  {selectedSectionIndex !== null &&
                    selectedPage.sections?.[selectedSectionIndex] && (
                      <Card className="p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Edit Section</h3>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aiRegenerateSection(selectedSectionIndex)}
                              disabled={aiRegenerating}
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              {aiRegenerating ? "Regenerating..." : "AI Regenerate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSection(selectedSectionIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label>Section Type</Label>
                            <Select
                              value={
                                selectedPage.sections[selectedSectionIndex].type ||
                                "content"
                              }
                              onValueChange={(value) =>
                                updateSection(selectedSectionIndex, "type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="content">Content</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="features">Features</SelectItem>
                                <SelectItem value="benefits">Benefits</SelectItem>
                                <SelectItem value="testimonials">
                                  Testimonials
                                </SelectItem>
                                <SelectItem value="cta">Call to Action</SelectItem>
                                <SelectItem value="about">About</SelectItem>
                                <SelectItem value="portfolio">Portfolio</SelectItem>
                                <SelectItem value="team">Team</SelectItem>
                                <SelectItem value="pricing">Pricing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Section Title</Label>
                            <Input
                              value={
                                selectedPage.sections[selectedSectionIndex].title || ""
                              }
                              onChange={(e) =>
                                updateSection(
                                  selectedSectionIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label>Content</Label>
                            <Textarea
                              value={
                                selectedPage.sections[selectedSectionIndex].content ||
                                ""
                              }
                              onChange={(e) =>
                                updateSection(
                                  selectedSectionIndex,
                                  "content",
                                  e.target.value
                                )
                              }
                              rows={6}
                              onFocus={(e) => setActiveTextArea(e.currentTarget)}
                            />
                          </div>

                          {/* Items Editor */}
                          {selectedPage.sections[selectedSectionIndex].items &&
                            selectedPage.sections[selectedSectionIndex].items.length >
                              0 && (
                              <div>
                                <Label className="mb-2 block">Items</Label>
                                <div className="space-y-3">
                                  {selectedPage.sections[
                                    selectedSectionIndex
                                  ].items.map((item: any, itemIndex: number) => (
                                    <Card key={itemIndex} className="p-4 bg-gray-50">
                                      <div className="space-y-2">
                                        <Input
                                          placeholder="Item title"
                                          value={item.title || ""}
                                          onChange={(e) => {
                                            const updatedItems = [
                                              ...selectedPage.sections[
                                                selectedSectionIndex
                                              ].items,
                                            ];
                                            updatedItems[itemIndex].title =
                                              e.target.value;
                                            updateSection(
                                              selectedSectionIndex,
                                              "items",
                                              updatedItems
                                            );
                                          }}
                                        />
                                        <Textarea
                                          placeholder="Item description"
                                          value={item.description || ""}
                                          onChange={(e) => {
                                            const updatedItems = [
                                              ...selectedPage.sections[
                                                selectedSectionIndex
                                              ].items,
                                            ];
                                            updatedItems[itemIndex].description =
                                              e.target.value;
                                            updateSection(
                                              selectedSectionIndex,
                                              "items",
                                              updatedItems
                                            );
                                          }}
                                          rows={2}
                                          onFocus={(e) =>
                                            setActiveTextArea(e.currentTarget)
                                          }
                                        />
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </Card>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Settings & Tools */}
        {!previewMode && (
          <div className="w-96 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="page" title="Page Settings">
                    <FileText className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="nav" title="Navigation">
                    <Layout className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="styles" title="Styles">
                    <Palette className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="seo" title="SEO">
                    <Search className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="page" className="space-y-4 mt-4">
                  {selectedPage && (
                    <>
                      <div>
                        <Label>Page Title</Label>
                        <Input
                          value={selectedPage.title || ""}
                          onChange={(e) => {
                            const updatedPages = [...pages];
                            updatedPages[selectedPageIndex].title = e.target.value;
                            setPages(updatedPages);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Page Slug</Label>
                        <Input
                          value={selectedPage.slug || ""}
                          onChange={(e) => {
                            const updatedPages = [...pages];
                            updatedPages[selectedPageIndex].slug = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-");
                            setPages(updatedPages);
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          URL: /{selectedPage.slug}
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="nav" className="mt-4">
                  <NavigationEditor
                    projectId={project.id}
                    pages={pages}
                    onUpdate={(config) => {
                      // Apply navigation config to pages
                      const updatedPages = [...pages];
                      config.pageOrder.forEach((slug: string, index: number) => {
                        const pageIndex = updatedPages.findIndex(
                          (p) => p.slug === slug
                        );
                        if (pageIndex !== -1) {
                          updatedPages[pageIndex].navLabel =
                            config.navLabels?.[slug] || updatedPages[pageIndex].title;
                          updatedPages[pageIndex].icon = config.icons?.[slug];
                          updatedPages[pageIndex].hidden =
                            config.hiddenPages?.includes(slug);
                          updatedPages[pageIndex].isDropdownParent =
                            config.dropdownParents?.includes(slug);
                        }
                      });
                      setPages(updatedPages);
                    }}
                  />
                </TabsContent>

                <TabsContent value="styles" className="mt-4">
                  <GlobalStylesPanel
                    projectId={project.id}
                    initialStyles={project.globalStyles || null}
                    onUpdate={(styles) => {
                      // Update global styles in project
                      setSiteConfig({ ...siteConfig, globalStyles: styles });
                    }}
                  />
                </TabsContent>

                <TabsContent value="seo" className="mt-4">
                  {selectedPage && (
                    <SeoPanel
                      projectId={project.id}
                      pageSlug={selectedPage.slug}
                      pageTitle={selectedPage.title}
                      initialSeo={selectedPage.seo}
                      onUpdate={(seoData) => {
                        const updatedPages = [...pages];
                        updatedPages[selectedPageIndex].seo = seoData;
                        setPages(updatedPages);
                      }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Content Context Menu */}
      {contextMenuPosition && selectedText && (
        <ContentContextMenu
          selectedText={selectedText}
          position={contextMenuPosition}
          onClose={() => {
            setContextMenuPosition(null);
            setSelectedText("");
          }}
          onReplace={handleContentReplace}
        />
      )}
    </div>
  );
}

function WebsitePreview({ pages, siteConfig }: any) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentPage = pages[currentPageIndex];

  return (
    <div className="bg-white">
      {/* Preview Navigation */}
      <div className="border-b bg-gray-50 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">{siteConfig.siteName}</h1>
          <nav className="flex gap-6">
            {pages.map((page: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                className={`text-sm font-medium ${
                  currentPageIndex === index
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {page.navLabel || page.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Preview Content */}
      {currentPage && (
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="py-20 px-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <h1 className="text-5xl font-bold mb-6">
              {currentPage.hero?.headline}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {currentPage.hero?.subheadline}
            </p>
            <Button size="lg">{currentPage.hero?.cta}</Button>
          </div>

          {/* Sections */}
          {currentPage.sections?.map((section: any, index: number) => (
            <div key={index} className="py-16 px-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  {section.title}
                </h2>
                <div className="prose max-w-none mb-8">
                  <p>{section.content}</p>
                </div>
                {section.items && section.items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {section.items.map((item: any, itemIndex: number) => (
                      <Card key={itemIndex} className="p-6">
                        <h3 className="font-semibold text-lg mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
