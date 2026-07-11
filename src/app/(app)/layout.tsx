import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link href="/" className="font-semibold text-slate-900">
              Integrix CRM
            </Link>
            <Link href="/clients" className="hover:text-slate-900">
              Clients
            </Link>
            <Link href="/enquiries" className="hover:text-slate-900">
              Enquiries
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            {user?.email && <span>{user.email}</span>}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
