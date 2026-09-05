'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CartDrawer } from '@/components/cart-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgePercent, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ResellerApplyPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reseller', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) {
          router.replace('/reseller');
        } else if (res.status === 409 || res.status === 403) {
          setAlreadyApplied(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleApply = async () => {
    const res = await fetch('/api/reseller/apply', { method: 'POST' });
    if (res.ok) {
      setSubmitted(true);
      toast.success('Application submitted!');
    } else if (res.status === 409) {
      setAlreadyApplied(true);
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-xl">
          <CardContent className="space-y-6 p-8 text-center">
            {submitted || alreadyApplied ? (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pitch-100 text-pitch-700 dark:bg-pitch-900/40 dark:text-pitch-500">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">
                  {submitted ? 'Application submitted' : 'Application already received'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {submitted
                    ? 'You will be able to access your reseller dashboard once an admin approves your application.'
                    : 'Your application is under review. You will be able to access your reseller dashboard after approval.'}
                </p>
                <Button asChild variant="glow">
                  <Link href="/">Back to home</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <BadgePercent className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Become a Reseller</h1>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral link and earn commission on every order your
                  referrals place. Applications are reviewed and approved by our team.
                </p>
                <Button size="lg" variant="glow" className="w-full" onClick={handleApply}>
                  Apply now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}