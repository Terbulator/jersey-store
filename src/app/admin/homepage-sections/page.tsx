import { redirect } from 'next/navigation';

// Consolidated into the theme editor (Website → Home), which edits the same
// homepage_sections table with a draft/publish workflow.
export default function AdminHomepageSectionsPage() {
  redirect('/admin/theme-editor');
}
