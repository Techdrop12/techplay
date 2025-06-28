// ✅ /src/app/[locale]/admin/generate-blog/page.js (génération article IA démo)
import GenerateBlogPost from '@/components/GenerateBlogPost';

export default function AdminGenerateBlogPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Générer des articles IA</h1>
      <GenerateBlogPost />
    </div>
  );
}
