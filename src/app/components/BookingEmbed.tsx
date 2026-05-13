'use client';

type BookingEmbedProps = {
  slug: string;
  height?: number;
  className?: string;
};

export default function BookingEmbed({
  slug,
  height = 1600,
  className = '',
}: BookingEmbedProps) {
  const src = `https://eeasy-internal.vercel.app/book/${slug}`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ${className}`}
    >
      <iframe
        src={src}
        title="面談予約フォーム"
        loading="lazy"
        className="block w-full"
        style={{ height: `${height}px`, border: 'none' }}
        allow="clipboard-write"
      />
    </div>
  );
}
