// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const API_SCOPE = [
  "https://www.googleapis.com/auth/admob.readonly",
  "https://www.googleapis.com/auth/admob.report",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: API_SCOPE.join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
          
          await fetch(`${apiUrl}/tokens/save-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              email: profile.email
            }),
          });

          console.log("Gửi token thành công");
        } catch (error) {
          console.error("Gửi token thất bại:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions);

export { handler as GET, handler as POST };
