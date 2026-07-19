const fallbackUrl = "https://fixmind-ai.vercel.app";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return fallbackUrl;

  try {
    return new URL(configured).origin;
  } catch {
    return fallbackUrl;
  }
}
