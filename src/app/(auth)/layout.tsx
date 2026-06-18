export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-auth-shell flex min-h-dvh flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
        Plataforma segura para gestão de Terapia ABA
      </footer>
    </div>
  );
}
