"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { organisation } from "@/lib/site";

// Web3Forms access keys are designed to be public, so this is safe to inline in
// the client bundle. It is read from the environment rather than hardcoded so
// the key can be rotated, or a staging key used, without a code change.
//
// NEXT_PUBLIC_* values are substituted at build time, and this page is
// statically prerendered — so setting the variable in Vercel requires a
// redeploy to take effect.
//
// The literal is the default rather than the only option: with no variable set
// in Vercel the env read yields undefined, and a bare `?? ""` would ship the
// fallback below in place of a working form on every deploy until someone
// remembers to add it. Setting the variable still overrides this, so rotating
// the key or pointing a preview at a staging inbox needs no code change.
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
  "ead061de-346f-4cd4-a55a-aa878ae22cfd";

type FormState = "idle" | "sending" | "success" | "error";

const SUBMIT_BUTTON_CLASS =
  "group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#e2551c] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_-14px_#e2551c] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70";

/**
 * Shown when no Web3Forms key is configured.
 *
 * The alternative — rendering the form anyway and failing on submit — costs the
 * visitor the whole message they just typed and tells them nothing useful. An
 * enquiry from this page is a sales lead, so the fallback has to be a route
 * that actually reaches someone, not an apology.
 */
function DirectContactFallback() {
  const t = useTranslations("form");
  return (
    <div className="space-y-6">
      <p className="text-base leading-7 text-[#44474d]">
        {t("fallback")}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <a
          href={`mailto:${organisation.email}?subject=${encodeURIComponent(
            "Enquiry via mpinger.de"
          )}`}
          className={SUBMIT_BUTTON_CLASS}
        >
          <Mail className="h-4 w-4" />
          {organisation.email}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          className="text-sm text-[#141414] transition-colors hover:text-[#e2551c]"
          href={`tel:${organisation.telephone.replace(/\s/g, "")}`}
        >
          {organisation.telephone}
        </a>
      </div>
    </div>
  );
}

export function ContactForm() {
  const t = useTranslations("form");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setState("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", ACCESS_KEY);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "The message could not be sent.");
      }

      form.reset();
      setState("success");
    } catch (error) {
      setState("error");
      // Never surface a raw upstream string on its own — always leave the
      // visitor with a way through.
      setErrorMessage(
        `${
          error instanceof Error && error.message
            ? error.message
            : "The message could not be sent."
        } Please email ${organisation.email} instead.`
      );
    }
  }

  if (!ACCESS_KEY) return <DirectContactFallback />;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="grid gap-7 sm:grid-cols-2">
        <label className="block">
          <span className="contact-label">
            {t("name")} <span aria-hidden="true">*</span>
          </span>
          <input
            className="contact-input"
            type="text"
            name="name"
            autoComplete="name"
            required
          />
        </label>
        <label className="block">
          <span className="contact-label">
            {t("email")} <span aria-hidden="true">*</span>
          </span>
          <input
            className="contact-input"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
        </label>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <label className="block">
          <span className="contact-label">{t("company")}</span>
          <input
            className="contact-input"
            type="text"
            name="company"
            autoComplete="organization"
          />
        </label>
        <label className="block">
          <span className="contact-label">{t("interest")}</span>
          <select className="contact-input" name="interest" defaultValue="">
            <option value="" disabled>
              {t("selectFocus")}
            </option>
            <option value="Precision components">{t("precision")}</option>
            <option value="Growing media">{t("growingMedia")}</option>
            <option value="Construction machinery">{t("machinery")}</option>
            <option value="Enterprise AI">{t("enterpriseAi")}</option>
            <option value="Something else">{t("somethingElse")}</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="contact-label">
          {t("yourMessage")} <span aria-hidden="true">*</span>
        </span>
        <textarea
          className="contact-input min-h-36 resize-y"
          name="message"
          required
          placeholder={t("message")}
        />
      </label>

      <input
        type="hidden"
        name="subject"
        value="New enquiry from Mpinger Groups"
      />
      <input type="hidden" name="from_name" value="Mpinger Groups website" />

      <div className="flex flex-col gap-5 border-t border-neutral-900/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-[#44474d]">
           {t("privacy")} {" "}
           <Link
            className="underline underline-offset-2 transition-colors hover:text-[#e2551c]"
             href="/datenschutz"
          >
             {t("privacyLink")}
           </Link>
          .
        </p>
        <button
          type="submit"
          disabled={state === "sending"}
          className={SUBMIT_BUTTON_CLASS}
        >
          {state === "sending" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
             t("send")
          )}
          {state !== "sending" && (
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </button>
      </div>

      <div aria-live="polite" role="status">
        {state === "success" && (
          <p className="flex items-center gap-2 text-sm text-[#2e7d4f]">
             <Check className="h-4 w-4" /> {t("success")}
          </p>
        )}
        {state === "error" && (
          <p className="text-sm text-[#b14b22]">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
