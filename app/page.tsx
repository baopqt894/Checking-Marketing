// app/login/page.tsx

"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard", 
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account with Google</p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="20"
                  height="20"
                  className="mr-2"
                >
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.1 0 5.9 1.1 8 2.9l6-6C33.8 3.2 29.2 1 24 1 14.6 1 6.7 6.8 3.2 15h7.4c2-4.1 6.3-7 11.4-7z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.1 24.6c0-1.6-.1-2.8-.4-4H24v7.6h12.4c-.5 2.7-2.1 5-4.4 6.6l7 5.4c4-3.7 6.1-9.2 6.1-15.6z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.6 28.9c-.5-1.5-.8-3.2-.8-4.9s.3-3.4.8-4.9l-7.4-5.7C2.4 16.3 1 20 1 24s1.4 7.7 3.7 10.6l7.3-5.7z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 47c5.2 0 9.8-1.7 13.1-4.7l-7-5.4c-2 1.3-4.6 2.1-7.1 2.1-5.1 0-9.4-2.9-11.4-7h-7.4C6.7 41.2 14.6 47 24 47z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="hidden md:block bg-gray-100">
        <Image
          src="/placeholder.svg"
          alt="Login Illustration"
          width={600}
          height={800}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
