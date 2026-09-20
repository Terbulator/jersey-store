export function ReviewSection() {
  const reviews = [
    { name: 'Arjun M.', product: 'Brazil 2026 Player', rating: 5, text: 'Product quality exceeded expectations. Fit is perfect.' },
    { name: 'Priya S.', product: 'India Cricket Master', rating: 5, text: 'The print quality is outstanding. Highly recommend.' },
    { name: 'Rahul K.', product: 'Real Madrid Master Edition', rating: 4, text: 'Great jersey. Shipping was fast. Will buy again.' },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs tracking-widest uppercase text-blood-red mb-2">WHAT THE COMMUNITY SAYS</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-charcoal">4.9</span>
            <span className="text-blood-red">★</span>
          </div>
          <p className="text-sm text-chrome">LOVED BY HEADERR CUSTOMERS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.name} className="p-6 border border-charcoal/10">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-blood-red' : 'text-chrome'}>★</span>
                ))}
              </div>
              <p className="text-sm text-charcoal/80 italic mb-4">{review.text}</p>
              <div className="text-xs text-chrome">
                <p className="font-medium text-charcoal">{review.name}</p>
                <p>{review.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}