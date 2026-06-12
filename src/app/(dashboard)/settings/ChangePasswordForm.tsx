"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] focus:border-transparent transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] focus:border-transparent transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] focus:border-transparent transition-shadow"
        />
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-5 bg-[#0F4C8F] hover:bg-[#0D3F7A] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
