
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import EmployeeForm from '../employee-form';

export const metadata = {
  title: 'Add New Employee | CDM Suite Admin',
  description: 'Create a new employee account',
};

export default async function NewEmployeePage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard');
  }

  return <EmployeeForm mode="create" />;
}
