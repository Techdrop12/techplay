'use client'

import { cn } from '@/lib/utils'

export default function ProductSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn(
        'group relative rounded-3xl p-px bg-gradient-to-br from-gray-200/70 via-transparent to-transparent dark:from-zinc-800/60',
        className
      )}
      aria-hidden="true"
    >
      <div className="rounded-[inherit] overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800">
        {/* Image */}
        <div className="relative w-full aspect-[4/3]">
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-zinc-800" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="h-4 w-3/4 rounded-md animate-pulse bg-gray-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 rounded-md animate-pulse bg-gray-200 dark:bg-zinc-800" />
            <div className="h-3 w-16 rounded-md animate-pulse bg-gray-200 dark:bg-zinc-800" />
          </div>

          {/* Free shipping / badges placeholder */}
          <div className="h-4 w-40 rounded-md animate-pulse bg-gray-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
