import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="p-4 sm:p-8">
      {/* Back link + header */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0" />
        ))}
      </div>

      {/* Tab content */}
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
