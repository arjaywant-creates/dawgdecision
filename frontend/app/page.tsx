import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">
        Dashboard
      </h1>

      <p className="mb-8 text-default-500">
        Welcome to DawgDecision.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Financial Plans"
          value="0"
        />

        <StatCard
          title="Comparisons"
          value="0"
        />

        <StatCard
          title="Goals"
          value="0"
        />
      </div>
    </div>
  );
}
