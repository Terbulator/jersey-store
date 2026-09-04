import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { ArrowLeft } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const MEASUREMENTS: string[][] = [
  ['Chest (inches)', '38', '40', '42', '45', '48'],
  ['Shoulder (inches)', '16', '17', '18', '19', '20'],
  ['Length (inches)', '26', '27', '28', '29', '30'],
];

export default function SizeChartPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container py-8">
        <ButtonLink />
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">Size Chart</h1>
          <p className="mt-2 text-muted-foreground">Standard fit measurements. Sizes run true to fit.</p>

          <div className="mt-8 overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 text-left">
                  <th className="p-4 font-semibold">Size</th>
                  {SIZES.map((s) => (
                    <th key={s} className="p-4 text-center font-semibold">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEASUREMENTS.map(([label, ...values]) => (
                  <tr key={label} className="border-t">
                    <td className="p-4 font-medium">{label}</td>
                    {values.map((v, i) => (
                      <td key={i} className="p-4 text-center">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">Five sleeve jerseys:</span> length stays the same, but shoulder and chest are 2 inches extra for a looser fit.</p>
            <p className="mt-2"><span className="font-semibold text-foreground">Not sure?</span> When in doubt, size up — jerseys are best worn slightly relaxed.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ButtonLink() {
  return (
    <Link href="/products" className="mb-6 -ml-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Back to jerseys
    </Link>
  );
}