import { Suspense } from 'react';
import ForumClient from './ForumClient'; // Ensure this path and filename are correct
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton for the forum page
function ForumPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 bg-card rounded-xl p-5 shadow-md border border-secondary/10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-64 mb-1" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>
      <div className="flex gap-6">
        <div className="w-72 shrink-0">
          <Skeleton className="h-[calc(100vh-200px)] w-full rounded-xl" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-11 w-full mb-6 rounded-md" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<ForumPageLoadingSkeleton />}>
      <ForumClient />
    </Suspense>
  );
}
