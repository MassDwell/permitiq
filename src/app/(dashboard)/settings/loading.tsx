import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
