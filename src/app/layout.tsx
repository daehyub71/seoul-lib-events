import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울도서관 행사 탐색",
  description:
    "서울도서관에서 열린 행사·강연·전시와 야외 독서공간 운영 일정을 지도·달력·목록으로 탐색합니다.",
  openGraph: {
    title: "서울도서관 행사 탐색",
    description:
      "서울도서관 행사·강연·전시 1,414건 아카이브 — 지도·층별 안내·달력으로 탐색",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
