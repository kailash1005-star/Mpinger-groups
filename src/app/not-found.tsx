import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  // A 404 should never accumulate index equity.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#050505] px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#8ab4ff]">
        Error 404
      </p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight text-[#f4f4f5] sm:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-[#c7c9ce]">
        The link may be out of date, or the page may have moved. Everything
        about the group lives on the main page.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-[#8ab4ff] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#050505] transition-transform duration-300 hover:scale-105"
      >
        Back to Mpinger Groups
      </Link>
    </main>
  );
}
