type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="mb-8 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
