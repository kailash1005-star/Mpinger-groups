import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { organisation } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum und Anbieterkennzeichnung der mpinger GmbH gemäß § 5 DDG.",
  robots: { index: true, follow: true },
  // The root layout declares canonical "/" and Next inherits it into every
  // child route — which told search engines this page was a duplicate of the
  // homepage. Each route must state its own.
  alternates: { canonical: "/impressum" },
};

/**
 * Impressum / provider identification (§ 5 DDG).
 *
 * Content mirrors the Impressum published by the same legal entity at
 * mpinger-engineering.com. Kept in German deliberately: § 5 DDG is a German
 * statutory disclosure and is conventionally served in German regardless of
 * the language of the surrounding site.
 */
export default function ImpressumPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-28 md:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Mpinger Groups
      </Link>

      <h1 className="mt-10 text-4xl font-medium tracking-tight text-neutral-900">
        Impressum
      </h1>
      <p className="mt-3 text-sm text-neutral-500">
        Angaben gemäß § 5 DDG
      </p>

      <section className="mt-12 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Anbieter
        </h2>
        <p className="font-medium text-neutral-900">{organisation.legalName}</p>
        <p>{organisation.streetAddress}</p>
        <p>
          {organisation.postalCode} {organisation.addressLocality}
        </p>
        <p>Deutschland</p>
      </section>

      <section className="mt-10 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Vertreten durch
        </h2>
        <p>Geschäftsführer: {organisation.managingDirector}</p>
      </section>

      <section className="mt-10 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Kontakt
        </h2>
        <p>
          Telefon:{" "}
          <a className="underline" href={`tel:${organisation.telephone.replace(/\s/g, "")}`}>
            {organisation.telephone}
          </a>
        </p>
        <p>
          E-Mail:{" "}
          <a className="underline" href={`mailto:${organisation.email}`}>
            {organisation.email}
          </a>
        </p>
      </section>

      <section className="mt-10 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Registereintrag
        </h2>
        <p>Registergericht: {organisation.registerCourt}</p>
        {organisation.registerNumber ? (
          <p>Registernummer: {organisation.registerNumber}</p>
        ) : (
          // Rendered visibly rather than silently omitted: § 5 DDG requires the
          // register number, and a missing one is exactly what an Abmahnung
          // targets. Fill in `registerNumber` in src/lib/site.ts to replace this.
          <p className="rounded border-2 border-dashed border-amber-500/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Registernummer: <strong>HRB — noch zu ergänzen</strong> (nicht in der
            Quell-Impressum enthalten; gemäß § 5 DDG erforderlich)
          </p>
        )}
      </section>

      <section className="mt-10 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Umsatzsteuer-Identifikationsnummer
        </h2>
        <p>Gemäß § 27a Umsatzsteuergesetz: {organisation.vatId}</p>
      </section>

      <section className="mt-10 space-y-1.5 text-base leading-relaxed text-neutral-700">
        {/* The sister sites cite § 55 Abs. 2 RStV, which was superseded by the
            Medienstaatsvertrag in Nov 2020 (as § 5 TMG was superseded by § 5 DDG
            in May 2024). Current references are used here. */}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p>{organisation.managingDirector}</p>
        <p>{organisation.streetAddress}</p>
        <p>
          {organisation.postalCode} {organisation.addressLocality}
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Streitschlichtung
        </h2>
        <p>
          Unser Angebot richtet sich ausschließlich an Unternehmer im Sinne des
          § 14 BGB. Eine Teilnahme an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle findet daher nicht statt.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Haftung für Inhalte
        </h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder
          nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          von entsprechenden Rechtsverletzungen werden wir diese Inhalte
          umgehend entfernen.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Haftung für Links
        </h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
          Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte
          waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
          ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links
          umgehend entfernen.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          Urheberrecht
        </h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
          wurden, werden die Urheberrechte Dritter beachtet. Sollten Sie dennoch
          auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
          wir derartige Inhalte umgehend entfernen.
        </p>
      </section>
    </main>
  );
}
