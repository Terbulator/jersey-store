import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const types = [
  {
    name: 'Essential',
    desc: 'Required for the site to work — keeping you logged in and holding your cart.',
  },
  {
    name: 'Analytics',
    desc: 'Help us understand how visitors use the store so we can improve it.',
  },
  {
    name: 'Preferences',
    desc: 'Remember your choices like theme and saved jerseys.',
  },
];

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Jersey Store uses cookies and similar technologies to keep the store secure, remember
          your preferences, and understand usage. Here&apos;s what we use:
        </p>
        <div className="mt-8 space-y-3">
          {types.map((t) => (
            <div key={t.name} className="rounded-lg border p-5">
              <h2 className="font-semibold">{t.name} cookies</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          You can control cookies through your browser settings at any time.
        </p>
      </main>
      <Footer />
    </>
  );
}
