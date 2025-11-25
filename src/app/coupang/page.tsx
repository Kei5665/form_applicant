import Image from 'next/image';
import CoupangApplicationForm from '@/app/components/coupang-form/CoupangApplicationForm';

export default function CoupangPage() {
  return (
    <div className="relative min-h-screen">
      <Image
        src="/images/coupang_bg.webp"
        alt="Background"
        fill
        className="object-cover"
        quality={85}
        priority
      />
      <div className="relative z-10">
        <CoupangApplicationForm />
      </div>
    </div>
  );
}
