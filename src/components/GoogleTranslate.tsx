"use client";

import { useEffect } from "react";

type TranslateElementConstructor = new (
  options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
  elementId: string
) => unknown;

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: TranslateElementConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const ELEMENT_ID = "google_translate_element";

export default function GoogleTranslate() {
  useEffect(() => {
    const initialize = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      const element = document.getElementById(ELEMENT_ID);

      if (!TranslateElement || !element || element.childElementCount > 0) return;

      new TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "de,en,fr,es",
          autoDisplay: false,
        },
        ELEMENT_ID
      );
    };

    window.googleTranslateElementInit = initialize;
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="google-translate-control" aria-label="Choose language">
      <span className="sr-only">Language</span>
      <div id={ELEMENT_ID} />
    </div>
  );
}
