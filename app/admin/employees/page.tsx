
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-helpers';
import EmployeesClient from './employees-client';

export const metadata = {
  title: 'Employee Management | CDM Suite Admin',
  description: 'Manage employees, roles, and permissions',
};

export default async function EmployeesPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard');
  }

  return <EmployeesClient />;
}
