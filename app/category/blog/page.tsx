import { permanentRedirect } from 'next/navigation';

export default function BlogCategoryPage() {
  // Redirect to main blog page since we don't have category filtering yet
  permanentRedirect('/blog');
}
