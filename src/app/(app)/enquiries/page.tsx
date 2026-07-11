import Link from "next/link";
import { listEnquiries } from "@/lib/data/enquiries";

export default async function EnquiriesPage() {
  const enquiries = await listEnquiries();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Enquiries</h1>
        <Link
          href="/enquiries/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New enquiry
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium">Requirement</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No enquiries yet.
                </td>
              </tr>
            )}
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link
                    href={`/enquiries/${enquiry.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {enquiry.clients?.company_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {enquiry.requirement_summary ?? "—"}
                </td>
                <td className="px-4 py-2 text-slate-600 capitalize">
                  {enquiry.status.replace("_", " ")}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {new Date(enquiry.received_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
