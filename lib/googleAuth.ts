// lib/googleAuth.ts
const API_SCOPE = [
  "https://www.googleapis.com/auth/admob.readonly",
  "https://www.googleapis.com/auth/admob.report",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    response_type: "code",
    access_type: "offline",
    scope: API_SCOPE.join(" "),
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getAccounts(accessToken: string) {
  const res = await fetch('https://admob.googleapis.com/v1/accounts', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data.account || []; 
}
