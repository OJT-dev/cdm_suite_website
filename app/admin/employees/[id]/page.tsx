
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import EmployeeForm from '../employee-form';

export const metadata = {
  title: 'Edit Employee | CDM Suite Admin',
  description: 'Update employee information and permissions',
};

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard');
  }

  return <EmployeeForm mode="edit" employeeId={params.id} />;
}
