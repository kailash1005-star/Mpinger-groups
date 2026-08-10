"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, Mail } from "lucide-react";
import { organisation } from "@/lib/site";

// Web3Forms access keys are designed to be public, so this is safe to inline in
// the client bundle. It is read from the environment rather than hardcoded so
// the key can be rotated, or a staging key used, without a code change.
//
// NEXT_PUBLIC_* values are substituted at build time, and this page is
// statically prerendered — so setting the variable in Vercel requires a
// redeploy to take effect.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

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
  return (
    <div className="space-y-6">
      <p className="text-base leading-7 text-[#44474d]">
        Our enquiry form is being set up. Email us directly and we&apos;ll come
        straight back to you.
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
            Your name <span aria-hidden="true">*</span>
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
            Work email <span aria-hidden="true">*</span>
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
          <span className="contact-label">Company</span>
          <input
            className="contact-input"
            type="text"
            name="company"
            autoComplete="organization"
          />
        </label>
        <label className="block">
          <span className="contact-label">What can we help with?</span>
          <select className="contact-input" name="interest" defaultValue="">
            <option value="" disabled>
              Select a focus
            </option>
            <option value="Precision components">Precision components</option>
            <option value="Growing media">Growing media</option>
            <option value="Construction machinery">Construction machinery</option>
            <option value="Enterprise AI">Enterprise AI</option>
            <option value="Something else">Something else</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="contact-label">
          Your message <span aria-hidden="true">*</span>
        </span>
        <textarea
          className="contact-input min-h-36 resize-y"
          name="message"
          required
          placeholder="Tell us what you are building, sourcing or solving."
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
          By sending this message, you agree that we may use your details to
          respond to your enquiry. See our{" "}
          <a
            className="underline underline-offset-2 transition-colors hover:text-[#e2551c]"
            href="/datenschutz"
          >
            Datenschutzerkl&auml;rung
          </a>
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
            "Send enquiry"
          )}
          {state !== "sending" && (
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </button>
      </div>

      <div aria-live="polite" role="status">
        {state === "success" && (
          <p className="flex items-center gap-2 text-sm text-[#2e7d4f]">
            <Check className="h-4 w-4" /> Message received. We&apos;ll be in
            touch soon.
          </p>
        )}
        {state === "error" && (
          <p className="text-sm text-[#b14b22]">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
