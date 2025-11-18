
import { redirect } from 'next/navigation';

export const metadata = {
  title: "Redirecting to Website Auditor | CDM Suite",
};

export default function WebsiteAuditorRedirect() {
  // Redirect to the main auditor page
  redirect('/auditor');
}
