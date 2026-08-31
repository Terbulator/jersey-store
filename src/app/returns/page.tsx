import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const steps = [
  'Request a return within 7 days of delivery.',
  'Package the jersey in its original condition with tags.',
  'Generate a return label from your account or contact us.',
  'Ship it back — we refund you within 3–5 business days of arrival.',
];

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="container py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/help">
            <ArrowLeft className="mr-1 h-4 w-4" /> Help Center
          </Link>
        </Button>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Returns & Refunds</h1>
          </div>
          <p className="mt-4 text-muted-foreground">
            We want you to love your jersey. If something isn&apos;t right, returns are easy.
          </p>
          <ol className="mt-8 space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-lg border p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            For any issues, our support team is happy to help at{' '}
            <Link href="/contact" className="font-medium text-primary hover:underline">Contact Us</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
