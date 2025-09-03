import ApplicationForm from '@/app/components/ApplicationForm';

export default function CoupangPage() {
  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/images/bgb.png')" }}>
      <ApplicationForm
        peopleImageSrc="/images/1754984488274.png"
        variant="B"
        formOrigin="coupang"
        headerLogoSrc="/images/ride_logo.svg"
        headerUpperText="クーパン求人特設フォーム"
        headerLowerText="RIDE JOB × Coupang"
        containerClassName="pb-8"
      />
    </div>
  );
}
