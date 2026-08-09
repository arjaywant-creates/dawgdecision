import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-6">
      <h2 className="mb-8 text-2xl font-bold text-red-700">
        DawgDecision
      </h2>

      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="font-medium text-red-700"
        >
          Dashboard
        </Link>

        <Link
          href="/compare"
          className="font-medium"
        >
          Compare Scenarios
        </Link>

        <Link
          href="/plan"
          className="font-medium"
        >
          Plan
        </Link>
      </nav>
    </aside>
  );
}