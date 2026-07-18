import { Suspense } from "react";
import App from "@/components/App";

// useSearchParams를 쓰는 클라이언트 트리는 Suspense로 감싸야 정적 빌드가 가능 (Next 16)
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24 text-slate-400">
          불러오는 중…
        </div>
      }
    >
      <App />
    </Suspense>
  );
}
