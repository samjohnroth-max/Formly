import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0F4C8F]">Formly</h1>
          <p className="mt-2 text-sm text-gray-500">Set a new password</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
