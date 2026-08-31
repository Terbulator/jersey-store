import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const sections = [
  {
    title: 'Orders & payment',
    body: 'By placing an order you agree to pay for the products at the prices shown at checkout. All prices are in Indian Rupees (INR) and include applicable taxes.',
  },
  {
    title: 'Products',
    body: 'Product images are for illustration. While we aim for accuracy, actual colors and details may vary slightly. All jerseys are high-quality licensed replicas.',
  },
  {
    title: 'Shipping & returns',
    body: 'Shipping times are estimates. Return policies are outlined on our Returns page and may vary for customized items.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the maximum extent permitted by law, Jersey Store is not liable for indirect or consequential damages arising from the use of this store.',
  },
  {
    title: 'Changes to terms',
    body: 'We may update these terms from time to time. Continued use of the store constitutes acceptance of the updated terms.',
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
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
