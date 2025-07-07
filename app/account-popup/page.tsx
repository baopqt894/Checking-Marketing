"use client"

import { useEffect } from "react"
import { signIn, useSession } from "next-auth/react"

export default function AccountPopupPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: "/account-popup" })
    }

    if (status === "authenticated" && session?.user) {
      window.opener?.postMessage(
        {
          type: "ADD_GOOGLE_ACCOUNT",
          payload: {
            name: session.user.name,
            email: session.user.email,
          },
        },
        window.origin
      )

      setTimeout(() => {
        window.close()
      }, 500)
    }
  }, [status, session])

  return <p className="p-4 text-center text-muted-foreground">Authenticating...</p>
}
