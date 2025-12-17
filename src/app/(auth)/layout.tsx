export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-8 text-foreground">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}









