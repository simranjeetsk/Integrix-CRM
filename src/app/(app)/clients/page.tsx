import Link from "next/link";
import { listClients } from "@/lib/data/clients";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New client
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Address</th>
              <th className="px-4 py-2 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {client.company_name}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {client.address ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-600 capitalize">
                  {client.stage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
