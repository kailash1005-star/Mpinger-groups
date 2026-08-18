import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the `middleware` file convention to `proxy` (the old name is
// deprecated). The import path from next-intl stays `next-intl/middleware` —
// that's the package's export name, unrelated to Next's file convention. The
// file must export the handler as the default export or a function named
// `proxy`; createMiddleware returns the handler, so a default export is used.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
