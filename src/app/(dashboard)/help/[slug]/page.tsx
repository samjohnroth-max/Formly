import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getArticle, CATEGORIES, type Block } from "@/lib/help-content";
import { cn } from "@/lib/utils";

export const dynamic = "force-static";

export function generateStaticParams() {
  const { ARTICLES } = require("@/lib/help-content");
  return ARTICLES.map((a: { slug: string }) => ({ slug: a.slug }));
}

function renderBlock(block: Block, idx: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={idx} className="mt-8 mb-3 text-base font-semibold text-gray-900 dark:text-[#F0F4FF]">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={idx} className="mt-6 mb-2 text-sm font-semibold text-gray-900 dark:text-[#F0F4FF]">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={idx} className="text-sm leading-relaxed text-gray-600 dark:text-[#8B90A0] mb-4">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="mb-4 space-y-1.5 pl-5">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-gray-600 dark:text-[#8B90A0] list-disc">
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="mb-4 space-y-1.5 pl-5">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-gray-600 dark:text-[#8B90A0] list-decimal">
              {item}
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <div key={idx} className="mb-4 rounded-lg bg-blue-50 dark:bg-[#3B7DD8]/10 border border-blue-200 dark:border-[#3B7DD8]/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-[#3B7DD8] mb-1">Note</p>
          <p className="text-sm text-blue-800 dark:text-[#8B90A0]">{block.text}</p>
        </div>
      );
    case "tip":
      return (
        <div key={idx} className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Tip</p>
          <p className="text-sm text-emerald-800 dark:text-[#8B90A0]">{block.text}</p>
        </div>
      );
    case "warn":
      return (
        <div key={idx} className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Warning</p>
          <p className="text-sm text-amber-800 dark:text-[#8B90A0]">{block.text}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const category = CATEGORIES.find((c) => c.slug === article.categorySlug);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#8B90A0] mb-6">
        <Link href="/help" className="hover:text-[#0F4C8F] dark:hover:text-[#3B7DD8] flex items-center gap-1">
          <ChevronLeft className="size-3" />
          Help Center
        </Link>
        {category && (
          <>
            <span>/</span>
            <span>{category.label}</span>
          </>
        )}
      </div>

      {/* Article header */}
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-[#2A2D3E]">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-[#F0F4FF] mb-2">{article.title}</h1>
        <p className="text-sm text-gray-500 dark:text-[#8B90A0]">{article.description}</p>
      </div>

      {/* Article content */}
      <div>{article.content.map((block, idx) => renderBlock(block, idx))}</div>

      {/* Footer CTA */}
      <div className="mt-12 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-gray-50 dark:bg-[#1A1D27] px-5 py-4 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF] mb-1">Still have questions?</p>
        <p className="text-xs text-gray-500 dark:text-[#8B90A0] mb-3">
          Our team typically responds within 24 hours.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0F4C8F] dark:bg-[#3B7DD8] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
