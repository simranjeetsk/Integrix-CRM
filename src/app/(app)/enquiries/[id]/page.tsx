import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnquiryById } from "@/lib/data/enquiries";
import { listQuotationsForEnquiry } from "@/lib/data/quotations";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [enquiry, quotations] = await Promise.all([
    getEnquiryById(id).catch(() => null),
    listQuotationsForEnquiry(id),
  ]);

  if (!enquiry) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {enquiry.clients?.company_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {enquiry.source ? `Source: ${enquiry.source} · ` : ""}
            Status: <span className="capitalize">{enquiry.status.replace("_", " ")}</span>
          </p>
        </div>
        <Link
          href={`/enquiries/${id}/quote/new`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Generate quotation
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-700">Requirement</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
          {enquiry.requirement_summary ?? "No summary provided."}
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Quotations</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Generated</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Total cost to company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    No quotations yet.
                  </td>
                </tr>
              )}
              {quotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link
                      href={`/quotations/${quotation.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {new Date(quotation.generated_at).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-4 py-2 capitalize text-slate-600">
                    {quotation.status}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    ₹{quotation.total_cost_to_company.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
