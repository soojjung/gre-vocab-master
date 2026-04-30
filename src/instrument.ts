import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";
import * as Sentry from "@sentry/capacitor";
import {
  init as sentryReactInit,
  reactRouterV7BrowserTracingIntegration,
  replayIntegration,
} from "@sentry/react";

Sentry.init(
  {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,

    sendDefaultPii: true,

    integrations: [
      reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.supabase\.co/,
      /^https:\/\/gre-vocab-master\.vercel\.app/,
    ],

    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  },
  sentryReactInit
);
