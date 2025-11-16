
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { NewPageForm } from '@/components/page-builder/new-page-form';

export default async function NewPagePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Page</h1>
        <p className="text-muted-foreground">
          Start building a new custom page
        </p>
      </div>

      <NewPageForm />
    </div>
  );
}
