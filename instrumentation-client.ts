import posthog from "posthog-js";

// Page views, including the docs' client-side navigation, and clicks. The key is the
// project's public one: it can only send events. Off in development.
if (process.env.NODE_ENV === "production") {
  posthog.init("phc_wGNpVBrF3qoGgKUekRZ7hWCZAJUDkPtjbdGR9oBp9tSa", {
    api_host: "https://us.i.posthog.com",
    defaults: "2025-05-24",
  });
}
