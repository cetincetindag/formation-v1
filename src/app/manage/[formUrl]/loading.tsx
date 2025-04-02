import { Loader2 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-md">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-64" />
          </div>
          <div className="mt-6 rounded-md border">
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-24" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
