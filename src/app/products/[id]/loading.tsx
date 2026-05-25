import { AppLogo } from "@/components/AppLogo";

export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <header className="sticky top-0 z-30 bg-[#f9f9f9]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-4 sm:px-8">
          <div className="h-5 w-24 rounded-full bg-[#e4e9ea]" />
          <AppLogo compact />
        </div>
      </header>

      <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="rounded-lg bg-[#f2f4f4] p-6 shadow-[0_20px_60px_rgba(45,52,53,0.04)] lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <Skeleton className="mt-6 h-12 w-[min(560px,80vw)] rounded-lg" />
              <Skeleton className="mt-5 h-5 w-[min(720px,82vw)] rounded-full" />
              <Skeleton className="mt-3 h-5 w-[min(520px,72vw)] rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[520px] lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white px-4 py-3 shadow-[0_12px_35px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15"
                >
                  <Skeleton className="h-3 w-14 rounded-full" />
                  <Skeleton className="mt-3 h-7 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="mt-3 h-5 w-48 rounded-full" />
          </div>
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>

        <section className="mt-6 overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[120px_1fr_120px_120px] gap-5 border-b border-[#edf0f1] px-5 py-5 last:border-b-0">
              <Skeleton className="h-8 w-16 rounded-full" />
              <div>
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="mt-3 h-4 w-[min(360px,48vw)] rounded-full" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#e4e9ea] ${className}`} />;
}
