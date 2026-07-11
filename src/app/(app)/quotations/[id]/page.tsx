import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuotationById } from "@/lib/data/quotations";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotation = await getQuotationById(id).catch(() => null);

  if (!quotation) {
    notFound();
  }

  const client = quotation.enquiries?.clients;
  const rateCard = quotation.rate_cards;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Quotation for {client?.company_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {rateCard?.zone} — {rateCard?.skill_category} · Generated{" "}
            {new Date(quotation.generated_at).toLocaleString("en-IN")} ·{" "}
            <span className="capitalize">{quotation.status}</span>
          </p>
        </div>
        <div className="flex gap-3">
          {quotation.pdf_path && (
            <a
              href={`/api/quotations/${quotation.id}/pdf`}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download PDF
            </a>
          )}
          <Link
            href={`/enquiries/${quotation.enquiry_id}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back to enquiry
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Nos</th>
              <th className="px-4 py-2 font-medium">Cost / employee</th>
              <th className="px-4 py-2 font-medium">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotation.quotation_lines.map((line) => (
              <tr key={line.id}>
                <td className="px-4 py-2 font-medium text-slate-900">
                  {line.role}
                </td>
                <td className="px-4 py-2 text-slate-600">{line.nos}</td>
                <td className="px-4 py-2 text-slate-600">
                  ₹{line.cost_per_no.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  ₹{line.line_total.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="divide-y divide-slate-100 border-t border-slate-200 bg-slate-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-medium text-slate-700">
                Total manpower cost
              </td>
              <td className="px-4 py-2 font-medium text-slate-900">
                ₹{quotation.total_manpower_cost.toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-medium text-slate-700">
                GST ({quotation.gst_pct}%)
              </td>
              <td className="px-4 py-2 font-medium text-slate-900">
                ₹
                {(
                  quotation.total_cost_to_company -
                  quotation.total_manpower_cost
                ).toLocaleString("en-IN")}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-semibold text-slate-900">
                Total cost to company
              </td>
              <td className="px-4 py-2 font-semibold text-slate-900">
                ₹{quotation.total_cost_to_company.toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
