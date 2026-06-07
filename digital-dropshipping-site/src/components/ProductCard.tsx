import React, { useState } from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  category?: string;
  deliveryDays?: number;
  onAddToCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  imageUrl,
  category,
  deliveryDays,
  onAddToCart,
}) => {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    onAddToCart(id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">

      {/* Gradient border glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'linear-gradient(135deg, rgba(110,231,249,0.08), rgba(96,165,250,0.06), rgba(167,139,250,0.08))', padding: 1 }}
      />

      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white/[0.06] to-white/[0.02]" style={{ height: '180px' }}>
        {!imgError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        {category && (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
            {category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-white/95">{title}</h2>

        {deliveryDays && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/55">
            <svg className="h-3.5 w-3.5 text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {deliveryDays}-day delivery
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/8">
          {/* Price */}
          <div>
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-lg font-extrabold text-transparent">
              ${price.toFixed(2)}
            </span>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
              added
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                : 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-white/15 text-white hover:from-cyan-500/30 hover:to-violet-500/30 hover:border-white/25'
            }`}
          >
            {added ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;