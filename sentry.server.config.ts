// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const tracesSampleRate = isProduction ? 0.1 : 1;
const sendDefaultPii = process.env.SENTRY_SEND_DEFAULT_PII === "true";

Sentry.init({
  dsn: "https://e22512056ecaaefd7be04b6f1c0aea47@o4510591502319616.ingest.us.sentry.io/4511178353606656",

  // Define how likely traces are sampled. Use full sampling outside production and a reduced rate in production.
  tracesSampleRate,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information) only via explicit opt-in.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii,
});
