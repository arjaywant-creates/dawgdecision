import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  defaults: "2026-05-30",
  person_profiles: "identified_only",
  capture_exceptions: {
    capture_unhandled_errors: true, // Catches React/JS crashes
    capture_unhandled_rejections: true, // Catches failed Promises/API calls
  },
});
