import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Budget Progress Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-12 mt-1 ml-auto" />
        </CardContent>
      </Card>

      {/* Overview Skeleton (2 cards side by side) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Skeleton className="h-[260px] w-[260px] rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Account Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Add Account placeholder */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full pt-5 space-y-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>

        {/* Account card placeholders */}
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
            <div className="px-6 pb-4 flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-14" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
