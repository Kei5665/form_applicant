import ApplicationForm from '@/app/components/ApplicationForm';

export default function CoupangPage() {
  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/images/coupang_bg.png')" }}>
      <ApplicationForm
        peopleImageSrc="/images/coupang_banner.png"
        variant="B"
        formOrigin="coupang"
        headerLogoSrc="/images/ride_logo.svg"
        headerUpperText="クーパン求人特設フォーム"
        headerLowerText="RIDE JOB × Coupang"
        containerClassName="pb-8 overflow-hidden"
        loadingLogoSrc="/images/ride_logo.svg"
        footerLogoSrc="/images/coupang_footer.png"
        showBottomImage={false}
        showHeader={false}
      />
    </div>
  );
}
