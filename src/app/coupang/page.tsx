import ApplicationForm from '@/app/components/ApplicationForm';

export default function CoupangPage() {
  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/images/coupang_bg.png')" }}>
      <ApplicationForm
        preset="coupang"
        variant="B"
        peopleImageSrc="/images/coupang_banner.png"
        peopleImageAlt="クーパン求⼈特設フォーム"
        showPeopleImage
      />
    </div>
  );
}
