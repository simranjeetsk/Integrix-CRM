import { createClientAction } from "@/app/(app)/clients/actions";

export default function NewClientPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">New client</h1>
      <form action={createClientAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-slate-700"
          >
            Company name
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-slate-700"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create client
        </button>
      </form>
    </div>
  );
}
