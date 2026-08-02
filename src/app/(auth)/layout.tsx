export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Asociație de Locatari
        </h1>
        {children}
      </div>
    </div>
  );
}
