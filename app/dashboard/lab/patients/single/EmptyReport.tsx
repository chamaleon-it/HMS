import Link from "next/link";

export function EmptyReport({
  title = "No purchases yet",
  description = "This patient hasn't purchased any items.",
  ctaHref = "/dashboard/pharmacy/customers",
  ctaText = "Back to customers",
}: {
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaText?: string;
}) {
  return (
    <div className="">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-8 text-center">
        {/* subtle illustration */}
        <div className="mx-auto mb-6 w-28 h-28 flex items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-pink-100">
          {/* shopping bag / empty icon */}
          <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1.5 9h-11L5 11z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href={ctaHref} className="inline-flex items-center rounded-md border border-transparent bg-linear-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95">
            {ctaText}
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100"
            aria-label="Refresh"
            title="Refresh"
          >
            Refresh
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">This view shows purchases for the selected patient.</p>
      </div>
    </div>
  );
}
