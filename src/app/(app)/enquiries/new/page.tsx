import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { createEnquiryAction } from "@/app/(app)/enquiries/actions";

export default async function NewEnquiryPage() {
  const clients = await listClients();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">New enquiry</h1>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          You need a client before you can log an enquiry.{" "}
          <Link href="/clients/new" className="underline">
            Create one first
          </Link>
          .
        </p>
      ) : (
        <form action={createEnquiryAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-slate-700"
            >
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              required
              defaultValue=""
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-slate-700"
            >
              Source
            </label>
            <input
              id="source"
              name="source"
              placeholder="e.g. referral, website, phone"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="requirementSummary"
              className="block text-sm font-medium text-slate-700"
            >
              Requirement summary
            </label>
            <textarea
              id="requirementSummary"
              name="requirementSummary"
              rows={4}
              placeholder="e.g. 4 security guards, 1 supervisor, Zone I"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create enquiry
          </button>
        </form>
      )}
    </div>
  );
}
