import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Some password-recovery flows (or misconfigured redirect URLs) may land users on `/`
 * with recovery tokens in the hash/querystring.
 * This helper forwards them to the dedicated reset password screen.
 */
export function AuthHashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const hash = location.hash || "";
    const search = location.search || "";
    const qs = new URLSearchParams(search);

    const hasRecoveryHash =
      hash.includes("access_token=") ||
      hash.includes("refresh_token=") ||
      hash.includes("error=") ||
      hash.includes("error_code=");

    const type = qs.get("type");
    const hasRecoveryQuery =
      qs.has("code") ||
      qs.has("token_hash") ||
      qs.has("token") ||
      qs.has("tokenHash") ||
      type === "recovery";

    if (!hasRecoveryHash && !hasRecoveryQuery) return;

    navigate(`/auth/reset-password${search}${hash}`, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
}
