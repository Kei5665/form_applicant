export default function CoupangLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`body { background-image: none !important; background-color: #f97316 !important; }`}</style>
      {children}
    </>
  );
}
