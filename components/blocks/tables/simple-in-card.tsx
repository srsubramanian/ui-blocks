// Simple data table wrapped in a card. The card owns the title, description,
// and primary action; the table sits flush against the card's edges with its
// own striped header row.

type Row = {
  name: string;
  title: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  status: "Active" | "Invited" | "Inactive";
};

const ROWS: Row[] = [
  { name: "Amelia Park",   title: "Designer",      email: "amelia@example.com",  role: "Owner",  status: "Active"   },
  { name: "Theo Nguyen",   title: "Engineer",      email: "theo@example.com",    role: "Admin",  status: "Active"   },
  { name: "Priya Shah",    title: "PM",            email: "priya@example.com",   role: "Member", status: "Invited"  },
  { name: "Marcus Webb",   title: "Sales lead",    email: "marcus@example.com",  role: "Member", status: "Inactive" },
];

const STATUS_STYLE: Record<Row["status"], string> = {
  Active:   "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
  Invited:  "bg-amber-300/10 text-amber-200 ring-amber-300/30",
  Inactive: "bg-ink-400/10 text-ink-300 ring-white/10",
};

export default function SimpleInCard() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-100">Team members</h3>
          <p className="mt-0.5 text-xs text-ink-400">
            People with access to this workspace.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset] transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-3.5"
            aria-hidden
          >
            <path d="M10 4a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 0110 4z" />
          </svg>
          Invite member
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">Name</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Email</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Role</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-5 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ROWS.map((row) => (
              <tr key={row.email} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-3">
                  <div className="font-medium text-ink-100">{row.name}</div>
                  <div className="text-xs text-ink-400">{row.title}</div>
                </td>
                <td className="px-5 py-3 text-ink-300">{row.email}</td>
                <td className="px-5 py-3 text-ink-300">{row.role}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLE[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
                  >
                    Edit
                    <span className="sr-only">, {row.name}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-5 py-3 text-xs text-ink-400">
        <span>Showing {ROWS.length} of {ROWS.length}</span>
        <a
          href="#"
          className="font-medium text-ink-200 transition hover:text-white"
        >
          View all →
        </a>
      </div>
    </div>
  );
}
