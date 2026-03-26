export function UserDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-24 bg-[#e1ded1] rounded-none animate-pulse" />
        <div className="h-6 w-48 bg-[#e1ded1] rounded-none animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 bg-[#f4f4f0] border border-[#c4c6cf] rounded-none animate-pulse shadow-sm" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-[#f4f4f0] border border-[#c4c6cf] rounded-none animate-pulse shadow-sm" />
        <div className="h-64 bg-[#f4f4f0] border border-[#c4c6cf] rounded-none animate-pulse shadow-sm" />
      </div>
    </div>
  );
}
