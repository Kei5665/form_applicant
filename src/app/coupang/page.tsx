import Image from 'next/image';
import ApplicationForm from '@/app/components/ApplicationForm';

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
        <ApplicationForm
          preset="coupang"
          variant="B"
          peopleImageSrc="/images/coupang_banner.webp"
          peopleImageAlt="クーパン求⼈特設フォーム"
          showPeopleImage
        />
      </div>
    </div>
  );
}
