"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Rocket, Link2, Megaphone, Users, Mail, Briefcase, Zap, Wrench,
  Search, MessageSquarePlus, ChevronRight, Clock,
} from "lucide-react";
import { CATEGORIES, ARTICLES } from "@/lib/help-content";
import { ContactSupportModal } from "@/components/help/ContactSupportModal";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket, Link2, Megaphone, Users, Mail, Briefcase, Zap, Wrench,
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  RESOLVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets ?? []))
      .finally(() => setTicketsLoading(false));
  }, [showModal]);

  const q = query.toLowerCase();
  const filtered = q
    ? ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    : null;

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Help Center</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">
            Search guides and articles, or contact support.
          </p>
        </div>

        {/* Search + CTA */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-[#8B90A0]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full rounded-lg border border-gray-300 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-[#F0F4FF] placeholder-gray-400 dark:placeholder-[#8B90A0] focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] dark:focus:ring-[#3B7DD8]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0F4C8F] dark:bg-[#3B7DD8] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 shrink-0"
          >
            <MessageSquarePlus className="size-4" />
            Contact support
          </button>
        </div>

        {/* Search results */}
        {filtered && (
          <div className="mb-8">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-[#8B90A0]">
                No articles found for &quot;{query}&quot;. Try different keywords or contact support.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0] mb-3">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </p>
                {filtered.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/help/${a.slug}`}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3 hover:border-[#0F4C8F] dark:hover:border-[#3B7DD8] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{a.title}</p>
                      <p className="text-xs text-gray-500 dark:text-[#8B90A0] mt-0.5">{a.description}</p>
                    </div>
                    <ChevronRight className="size-4 text-gray-400 dark:text-[#8B90A0] shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category grid */}
        {!filtered && (
          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] ?? Rocket;
              const articles = ARTICLES.filter((a) => a.categorySlug === cat.slug);
              return (
                <section key={cat.slug}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-[#3B7DD8]/10">
                      <Icon className="size-4 text-[#0F4C8F] dark:text-[#3B7DD8]" />
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF]">{cat.label}</h2>
                    <span className="text-xs text-gray-400 dark:text-[#8B90A0]">
                      {articles.length} article{articles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {articles.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/help/${a.slug}`}
                        className="group flex items-start justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3 hover:border-[#0F4C8F] dark:hover:border-[#3B7DD8] transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF] group-hover:text-[#0F4C8F] dark:group-hover:text-[#3B7DD8] transition-colors">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#8B90A0] mt-0.5 line-clamp-2">
                            {a.description}
                          </p>
                        </div>
                        <ChevronRight className="size-4 text-gray-400 dark:text-[#8B90A0] shrink-0 mt-0.5 group-hover:text-[#0F4C8F] dark:group-hover:text-[#3B7DD8]" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Support ticket history */}
        <div className="mt-12 border-t border-gray-200 dark:border-[#2A2D3E] pt-8">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] mb-4">Your support tickets</h2>
          {ticketsLoading ? (
            <p className="text-sm text-gray-400 dark:text-[#8B90A0]">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-[#8B90A0]">No tickets yet.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF] truncate">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 dark:text-[#8B90A0]">{t.category}</span>
                      <span className="text-gray-300 dark:text-[#2A2D3E]">·</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8B90A0]">
                        <Clock className="size-3" />
                        {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <span className={cn("shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLOR[t.status] ?? STATUS_COLOR.OPEN)}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && <ContactSupportModal onClose={() => setShowModal(false)} />}

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 dark:border-[#2A2D3E] pt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-[#8B90A0]">© {new Date().getFullYear()} Formly</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-[#8B90A0]">
          <Link href="/terms" className="hover:text-gray-600 dark:hover:text-[#F0F4FF] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-[#F0F4FF] transition-colors">Privacy</Link>
          <a href="mailto:support@formly.app" className="hover:text-gray-600 dark:hover:text-[#F0F4FF] transition-colors">support@formly.app</a>
        </div>
      </div>
    </>
  );
}
