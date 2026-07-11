import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Integrix CRM</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
