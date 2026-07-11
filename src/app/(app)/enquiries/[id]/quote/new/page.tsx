import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnquiryById } from "@/lib/data/enquiries";
import { listActiveRateCards } from "@/lib/data/rate-cards";
import { generateQuotationAction } from "@/app/actions/quotations";

export default async function NewQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [enquiry, rateCards] = await Promise.all([
    getEnquiryById(id).catch(() => null),
    listActiveRateCards(),
  ]);

  if (!enquiry) {
    notFound();
  }

  if (rateCards.length === 0) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold text-slate-900">
          No active rate cards
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Load at least one rate card version before generating a quotation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">
        Generate quotation
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {enquiry.clients?.company_name}
      </p>

      <form action={generateQuotationAction} className="mt-6 space-y-4">
        <input type="hidden" name="enquiryId" value={id} />

        <div>
          <label
            htmlFor="rateCardId"
            className="block text-sm font-medium text-slate-700"
          >
            Zone / skill category
          </label>
          <select
            id="rateCardId"
            name="rateCardId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>
              Select a rate card
            </option>
            {rateCards.map((rateCard) => (
              <option key={rateCard.id} value={rateCard.id}>
                {rateCard.zone} — {rateCard.skill_category} (Basic ₹
                {rateCard.basic.toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <input
            id="role"
            name="role"
            required
            placeholder="e.g. Security Guard"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nos" className="block text-sm font-medium text-slate-700">
              Number of positions
            </label>
            <input
              id="nos"
              name="nos"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={1}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="targetTakeHome"
              className="block text-sm font-medium text-slate-700"
            >
              Target take-home (₹/month)
            </label>
            <input
              id="targetTakeHome"
              name="targetTakeHome"
              type="number"
              min={1}
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gstPct" className="block text-sm font-medium text-slate-700">
              GST %
            </label>
            <input
              id="gstPct"
              name="gstPct"
              type="number"
              min={0}
              max={100}
              step="0.01"
              required
              defaultValue={18}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="serviceChargePctOverride"
              className="block text-sm font-medium text-slate-700"
            >
              Service charge % (optional override)
            </label>
            <input
              id="serviceChargePctOverride"
              name="serviceChargePctOverride"
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="Rate card default"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Generate quotation
          </button>
          <Link
            href={`/enquiries/${id}`}
            className="text-sm text-slate-500 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
