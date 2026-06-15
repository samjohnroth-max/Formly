"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormlyLogo } from "@/components/brand/FormlyLogo";

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    signIn("credentials", {
      email: "demo@formly.io",
      password: "FormlyDemo2026",
      redirect: false,
    }).then((result) => {
      if (result?.error || !result?.ok) {
        setError("Demo account is not available right now. Please try again in a moment.");
        return;
      }
      // replace instead of push so back button skips /demo and returns to wherever they came from
      router.replace("/dashboard");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <FormlyLogo size="lg" variant="white" />
        </div>

        {error ? (
          <>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link href="/" className="text-sm text-gray-400 underline hover:text-white">
              Back to home
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-blue-400 mb-3" />
            <p className="text-sm text-gray-400">Loading demo account…</p>
          </>
        )}
      </div>
    </main>
  );
}
