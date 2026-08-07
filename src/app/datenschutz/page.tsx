import type { Metadata } from "next";
import Link from "next/link";
import { organisation } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung der mpinger GmbH gemäß Art. 13 DSGVO.",
  robots: { index: true, follow: true },
};

/**
 * Datenschutzerklärung (Art. 13 GDPR).
 *
 * Mirrors the policy published by the same legal entity at
 * mpinger-engineering.com. The factual claims below hold true for this site as
 * built: no cookies are set, no analytics/tracking runs, and fonts are
 * self-hosted at build time by Next.js so no visitor request reaches a
 * third-party origin at runtime.
 */
export default function DatenschutzPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-28 md:px-10">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Mpinger Groups
      </Link>

      <h1 className="mt-10 text-4xl font-medium tracking-tight text-neutral-900">
        Datenschutzerklärung
      </h1>

      <section className="mt-12 space-y-1.5 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          1. Verantwortlicher
        </h2>
        <p className="font-medium text-neutral-900">{organisation.legalName}</p>
        <p>{organisation.streetAddress}</p>
        <p>
          {organisation.postalCode} {organisation.addressLocality}, Deutschland
        </p>
        <p>Vertreten durch: {organisation.managingDirector}</p>
        <p>
          E-Mail:{" "}
          <a className="underline" href={`mailto:${organisation.email}`}>
            {organisation.email}
          </a>{" "}
          · Telefon:{" "}
          <a className="underline" href={`tel:${organisation.telephone.replace(/\s/g, "")}`}>
            {organisation.telephone}
          </a>
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          2. Server-Logfiles
        </h2>
        <p>
          Beim Aufruf dieser Website werden automatisch Informationen
          gespeichert, die Ihr Browser an uns übermittelt. Dies sind
          insbesondere:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>IP-Adresse des zugreifenden Geräts</li>
          <li>Datum und Uhrzeit der Anfrage</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>übertragene Datenmenge</li>
          <li>Referrer-URL</li>
          <li>verwendeter Browser und Betriebssystem</li>
        </ul>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
          Interesse liegt in der technischen Bereitstellung sowie in der
          Sicherheit und Stabilität der Website. Diese Daten werden nach
          spätestens 30 Tagen gelöscht.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          3. Cookies und Tracking
        </h2>
        <p>
          Diese Website setzt keine Cookies und verwendet keine Analyse-,
          Tracking- oder Werbe-Technologien. Es findet kein Profiling und keine
          automatisierte Entscheidungsfindung statt. Ein Cookie-Consent-Banner
          ist daher nicht erforderlich.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        {/* This section replaces the sister sites' "ausschließlich von unseren
            eigenen Servern" wording. That claim is not accurate for this
            deployment: the site is served by a hosting provider acting as a
            processor, and — because that provider is US-based — the transfer
            has to be named and given a legal basis under Art. 44 ff. GDPR.
            Stating "own servers" would have been a factual misstatement in the
            one document that must not contain any. */}
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          4. Hosting und Auftragsverarbeitung
        </h2>
        <p>
          Diese Website wird bei der Vercel Inc., USA, gehostet. Der Anbieter
          verarbeitet in unserem Auftrag ausschließlich die technisch
          erforderlichen Verbindungsdaten, die unter Ziffer 2 (Server-Logfiles)
          beschrieben sind, um die Website auszuliefern und deren Sicherheit zu
          gewährleisten.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Verarbeitung
          erfolgt auf Grundlage eines Vertrags über die Auftragsverarbeitung
          gemäß Art. 28 DSGVO. Soweit dabei personenbezogene Daten in die USA
          übermittelt werden, wird diese Übermittlung auf die
          Standardvertragsklauseln der Europäischen Kommission bzw. auf die
          Zertifizierung des Anbieters nach dem EU-US Data Privacy Framework
          gestützt (Art. 44 ff. DSGVO).
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          5. Externe Inhalte, Schriftarten und Medien
        </h2>
        <p>
          Diese Website lädt zur Laufzeit keine Inhalte von Drittanbietern nach.
          Die verwendeten Schriftarten werden nicht von Google-Servern abgerufen,
          sondern bereits beim Erstellen der Website lokal eingebunden und
          gemeinsam mit der Website ausgeliefert. Es wird daher keine Verbindung
          zu Google hergestellt und Ihre IP-Adresse wird nicht an Google
          übermittelt. Auch alle Bilder, Logos und Videos werden von der unter
          Ziffer 4 genannten Infrastruktur ausgeliefert.
        </p>
        <p>
          Diese Website bindet keine Karten, Social-Media-Plugins, Werbenetzwerke
          oder eingebetteten Videodienste ein. Die Verweise auf die Websites
          unserer Unternehmensbereiche sind ausschließlich einfache Links: Eine
          Datenübermittlung an die dort genannten Anbieter findet erst statt,
          wenn Sie einen solchen Link aktiv anklicken. Für die Verarbeitung Ihrer
          Daten auf den verlinkten Seiten gelten deren eigene
          Datenschutzerklärungen.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          6. Kontaktaufnahme
        </h2>
        <p>
          Über das Kontaktformular können Sie uns eine Anfrage senden. Die
          Übermittlung erfolgt über den Dienst Web3Forms. Ihre Angaben werden
          zur Bearbeitung der Anfrage gespeichert.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern die Anfrage der
          Vorbereitung oder Erfüllung eines Vertrages dient, im Übrigen Art. 6
          Abs. 1 lit. f DSGVO. Eine Weitergabe dieser Daten erfolgt nicht ohne
          Ihre Einwilligung. Die Daten werden gelöscht, sobald die Anfrage
          abschließend bearbeitet ist und keine gesetzlichen
          Aufbewahrungspflichten (regelmäßig 6 bis 10 Jahre) entgegenstehen.
          Web3Forms verarbeitet die übermittelten Formulardaten als technischer
          Dienstleister.
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          7. Ihre Rechte
        </h2>
        <p>Sie haben das Recht auf:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung dieser Rechte genügt eine Nachricht an{" "}
          <a className="underline" href={`mailto:${organisation.email}`}>
            {organisation.email}
          </a>
          .
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          8. Beschwerderecht
        </h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die für
          uns zuständige Behörde ist:
        </p>
        <p>
          {organisation.dataProtectionAuthority.name}
          <br />
          {organisation.dataProtectionAuthority.address}
        </p>
      </section>

      <section className="mt-10 space-y-3 text-base leading-relaxed text-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-900">
          9. SSL- bzw. TLS-Verschlüsselung
        </h2>
        <p>
          Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw.
          TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
          daran, dass die Adresszeile des Browsers von „http://“ auf „https://“
          wechselt.
        </p>
      </section>
    </main>
  );
}
