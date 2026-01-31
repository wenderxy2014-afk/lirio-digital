/**
 * Returns the public app origin to be used in auth email redirects.
 *
 * In Lovable, users can trigger actions both from the public preview domain
 * (*.lovable.app) and from the editor domain (*.lovableproject.com).
 * Password recovery links must point to the public preview/published domain.
 */
export function getPublicOrigin(): string {
  if (typeof window === "undefined") return "";

  // Custom domain (primary) override.
  // This guarantees password recovery links never point to the editor/preview domains.
  const CUSTOM_PUBLIC_ORIGIN = "https://www.liriobh.com";

  const { origin, hostname } = window.location;

  // When running inside the editor domain, derive the public preview host.
  // Example:
  //   bb6480... .lovableproject.com  ->  id-preview--bb6480... .lovable.app
  if (hostname.endsWith(".lovableproject.com")) {
    return CUSTOM_PUBLIC_ORIGIN;
  }

  // When running on the preview domain, also prefer the custom domain.
  if (hostname.endsWith(".lovable.app")) {
    return CUSTOM_PUBLIC_ORIGIN;
  }

  return origin;
}
