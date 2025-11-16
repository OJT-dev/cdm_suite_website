
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { PageEditorClient } from '@/components/page-builder/page-editor-client';

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const page = await prisma.customPage.findUnique({
    where: { id: params.id },
  });

  if (!page) {
    redirect('/dashboard/pages');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Page</h1>
        <p className="text-muted-foreground">
          Use the simplified editor to customize your page
        </p>
      </div>

      <PageEditorClient page={page} />
    </div>
  );
}
