import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { organisation } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with Mpinger Groups about engineering, growing media, machinery or enterprise AI.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#e5e5e5] text-[#141414]">
      <header className="fixed left-0 right-0 top-0 z-40 h-20 border-b border-neutral-900/10 bg-white/10 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12 lg:px-16 xl:px-20">
          <Link href="/" className="flex items-center gap-2.5 font-mono text-lg font-semibold tracking-tight text-[#141414] transition-colors hover:text-[#e2551c] md:gap-3 md:text-xl">
            <span>Mpinger</span>
            <span className="rounded-md border border-[#e2551c]/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">Groups</span>
          </Link>

          <nav className="hidden items-center gap-9 lg:gap-10 md:flex">
            {[
              ["Group", "group"],
              ["Kokosflora", "kokosflora"],
              ["Engineering", "engineering"],
              ["AI", "technology"],
            ].map(([label, id]) => (
              <Link
                key={id}
                href={`/#${id}`}
                className="text-xs font-medium uppercase tracking-widest text-[#141414]/50 transition-all duration-300 hover:text-[#e2551c] hover:opacity-100"
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            aria-current="page"
            className="rounded-full bg-[#e2551c] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-[0_10px_28px_-10px_#e2551c99] transition-all duration-300 hover:scale-[1.05] hover:brightness-110 active:scale-[0.97]"
          >
            Contact
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-36 md:px-12 md:pt-44 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:px-16 xl:px-20">
        <section className="flex flex-col justify-between">
          <div>
            <p className="mb-7 font-mono text-xs uppercase tracking-[0.2em] text-[#e2551c]">Let&apos;s make it precise</p>
            <h1 className="max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-[#141414] sm:text-6xl lg:text-[5.2rem]">Bring us the hard part.</h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[#44474d]">Whether it is a component that needs to hold tolerance, a substrate that needs to travel well, or an AI system that needs to work in the real world, start with the brief.</p>
          </div>

          <div className="mt-20 border-t border-neutral-900/10 pt-7 lg:mt-32">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#44474d]">Direct line</p>
            <div className="space-y-4 text-sm text-[#141414]">
              <a className="flex items-center gap-3 transition-colors hover:text-[#e2551c]" href={`mailto:${organisation.email}`}><Mail className="h-4 w-4 text-[#e2551c]" />{organisation.email}<ArrowUpRight className="ml-auto h-4 w-4" /></a>
              <a className="flex items-center gap-3 transition-colors hover:text-[#e2551c]" href={`tel:${organisation.telephone.replace(/\s/g, "")}`}><Phone className="h-4 w-4 text-[#e2551c]" />{organisation.telephone}<ArrowUpRight className="ml-auto h-4 w-4" /></a>
              <span className="flex items-start gap-3 text-[#44474d]"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e2551c]" />{organisation.streetAddress}, {organisation.postalCode} {organisation.addressLocality}</span>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-900/20 pt-7 lg:pt-9" aria-labelledby="form-heading">
          <div className="mb-10 flex items-baseline justify-between gap-6"><h2 id="form-heading" className="text-2xl font-medium tracking-tight text-[#141414] sm:text-3xl">Tell us what&apos;s next.</h2><span className="font-mono text-xs text-[#44474d]">All fields marked * required</span></div>
          <ContactForm />
        </section>
      </div>

      <footer className="flex flex-col gap-5 border-t border-neutral-900/10 px-6 py-7 text-xs text-[#44474d] sm:flex-row sm:items-center sm:justify-between md:px-12 lg:px-16 xl:px-20"><span>© {new Date().getFullYear()} Mpinger Groups</span><div className="flex gap-5"><Link className="transition-colors hover:text-[#e2551c]" href="/impressum">Impressum</Link><Link className="transition-colors hover:text-[#e2551c]" href="/datenschutz">Datenschutz</Link></div></footer>
    </main>
  );
}
