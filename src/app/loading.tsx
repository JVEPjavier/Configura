export default function Loading() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-8 w-32 rounded bg-secondary" />
        <div className="h-12 w-2/3 rounded bg-secondary" />
        <div className="h-52 rounded-2xl bg-secondary" />
      </div>
    </main>
  );
}
