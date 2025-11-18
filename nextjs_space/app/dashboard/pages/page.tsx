
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Edit, Eye, Trash2, Copy } from 'lucide-react';

export default async function PagesPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const pages = await prisma.customPage.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Page Builder</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage custom pages with the simplified visual editor
          </p>
        </div>
        <Link href="/dashboard/pages/new" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom page with the visual page builder.
            </p>
            <Link href="/dashboard/pages/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page: any) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="mt-1">
                      /{page.slug}
                    </CardDescription>
                  </div>
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {page.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/pages/edit/${page.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  {page.status === 'published' && (
                    <Link href={`/${page.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Learn how to use the simplified page builder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Create a New Page</h4>
            <p className="text-sm text-muted-foreground">
              Click "New Page" to create a custom page. Set the title and URL slug.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Add Sections</h4>
            <p className="text-sm text-muted-foreground">
              Choose from pre-built sections like Hero, Features, CTA, and more. Click the "+ Add Section" buttons.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Customize Content</h4>
            <p className="text-sm text-muted-foreground">
              Each section has a simple form editor. Fill in the text, images, and links for your content.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">4. Preview & Publish</h4>
            <p className="text-sm text-muted-foreground">
              Use the Preview tab to see how your page looks, then click "Save & Publish" to make it live.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
