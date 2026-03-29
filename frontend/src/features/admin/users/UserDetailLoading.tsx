export function UserDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[120px] bg-white border border-slate-100 ring-1 ring-slate-900/5 rounded-2xl animate-pulse shadow-sm" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white border border-slate-100 ring-1 ring-slate-900/5 rounded-2xl animate-pulse shadow-sm" />
        <div className="h-64 bg-white border border-slate-100 ring-1 ring-slate-900/5 rounded-2xl animate-pulse shadow-sm" />
      </div>
    </div>
  );
}
