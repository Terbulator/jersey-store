import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const sections = [
  {
    title: 'Information we collect',
    body: 'We collect information you provide directly, such as your name, email address, shipping address and order details, when you make a purchase or create an account.',
  },
  {
    title: 'How we use your information',
    body: 'We use your information to process orders, arrange delivery, provide customer support, send order updates, and improve our store experience. We never sell your personal data.',
  },
  {
    title: 'Payment security',
    body: 'Payments are processed securely by Stripe. We do not store your full card number or CVV on our servers.',
  },
  {
    title: 'Cookies',
    body: 'We use cookies to keep you logged in, remember your cart, and understand how you use our site. You can manage cookies in your browser settings.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions, reach out via our Contact page and we will respond within 7 days.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>
        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
