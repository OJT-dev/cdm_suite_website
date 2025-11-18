'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function PageList() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/page-builder/pages');
      const data = await response.json();
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await fetch(`/api/page-builder/pages/${id}`, {
        method: 'DELETE',
      });
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      const response = await fetch(`/api/page-builder/pages/${page.id}`);
      const { page: originalPage } = await response.json();

      const duplicateResponse = await fetch('/api/page-builder/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${originalPage.title} (Copy)`,
          slug: `${originalPage.slug}-copy-${Date.now()}`,
          description: originalPage.description,
          content: originalPage.content,
          settings: originalPage.settings,
          metaTitle: originalPage.metaTitle,
          metaDescription: originalPage.metaDescription,
        }),
      });

      if (duplicateResponse.ok) {
        toast.success('Page duplicated successfully');
        fetchPages();
      }
    } catch (error) {
      toast.error('Failed to duplicate page');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your custom pages
          </p>
        </div>
        <Link href="/dashboard/pages/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No pages yet. Create your first page!
          </p>
          <Link href="/dashboard/pages/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-sm">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.status === 'published'
                          ? 'default'
                          : page.status === 'draft'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{page.views}</TableCell>
                  <TableCell>
                    {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/pages/edit/${page.id}`)
                          }
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {page.status === 'published' && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/p/${page.slug}`, '_blank')
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(page)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(page.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
