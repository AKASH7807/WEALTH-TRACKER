import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-28 mt-2.5" />
              <Skeleton className="h-3 w-16 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Shortcuts Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      {/* Budget & Expense Analytics Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-8 w-32 rounded-xl" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-5 flex justify-center">
                <Skeleton className="h-[180px] w-[180px] rounded-full" />
              </div>
              <div className="md:col-span-7 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounts Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-dashed border-2 rounded-2xl min-h-[160px] flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>

          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 pb-2">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-7 w-32 mt-3" />
              <div className="flex justify-between pt-3 mt-3 border-t">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
