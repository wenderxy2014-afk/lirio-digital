/**
 * Returns the public app origin to be used in auth email redirects.
 *
 * In Lovable, users can trigger actions both from the public preview domain
 * (*.lovable.app) and from the editor domain (*.lovableproject.com).
 * Password recovery links must point to the public preview/published domain.
 */
export function getPublicOrigin(): string {
  if (typeof window === "undefined") return "";

  const { origin, hostname } = window.location;

  // When running inside the editor domain, derive the public preview host.
  // Example:
  //   bb6480... .lovableproject.com  ->  id-preview--bb6480... .lovable.app
  if (hostname.endsWith(".lovableproject.com")) {
    const subdomain = hostname.replace(/\.lovableproject\.com$/i, "");
    return `https://id-preview--${subdomain}.lovable.app`;
  }

  return origin;
}
