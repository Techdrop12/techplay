export default function CommandeLoading() {
  return (
    <div className="container-app mx-auto max-w-4xl px-4 py-12">
      <div className="loading-stagger flex flex-col gap-6">
        <div className="skeleton mb-2 h-10 w-64 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
        <div className="mt-8 flex justify-end">
          <div className="skeleton h-12 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
