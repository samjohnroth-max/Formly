import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Authentication error</h1>
        <p className="text-sm text-gray-500 mb-6">
          Something went wrong. The link may have expired or already been used.
        </p>
        <Link
          href="/login"
          className="inline-block py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
