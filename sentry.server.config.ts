// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env, isProduction } from "./lib/env";

const tracesSampleRate = isProduction ? 0.1 : 1;
const sendDefaultPii = env.SENTRY_SEND_DEFAULT_PII === true;

Sentry.init({
  dsn: env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Use full sampling outside production and a reduced rate in production.
  tracesSampleRate,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information) only via explicit opt-in.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii,
});
