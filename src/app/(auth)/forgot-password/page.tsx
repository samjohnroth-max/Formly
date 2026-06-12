"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0F4C8F]">Formly</h1>
          <p className="mt-2 text-sm text-gray-500">Reset your password</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, we sent a reset link. It expires in 1 hour.
              </p>
              <Link href="/login" className="text-sm text-[#0F4C8F] font-semibold hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] focus:border-transparent transition-shadow"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#0F4C8F] hover:bg-[#0D3F7A] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#0F4C8F] font-semibold hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
