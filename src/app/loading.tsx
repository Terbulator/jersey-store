import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function RootLoading() {
  return (
    <>
      <Navbar />
      <main className="container py-16 space-y-8">
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-square rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded-md" />
              <div className="skeleton h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
