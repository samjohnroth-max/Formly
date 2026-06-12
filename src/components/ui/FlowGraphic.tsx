interface FlowGraphicProps {
  className?: string;
}

export function FlowGraphic({ className = "" }: FlowGraphicProps) {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      {/* Meta node */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
          <svg viewBox="0 0 24 24" className="size-5 fill-blue-400" aria-hidden>
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.086 14.432c-.594-.065-1.12-.327-1.506-.747l-.48 1.745H7.27l1.922-6.955h1.518l-.198.717c.41-.553 1.018-.847 1.72-.847 1.354 0 2.223 1.072 2.223 2.671 0 1.854-1.156 3.416-2.541 3.416zm4.786-.07h-1.62l1.923-6.956h1.62l-1.923 6.956zm-.282-7.867a.95.95 0 0 1-.951-.95c0-.524.427-.95.951-.95.524 0 .95.426.95.95a.95.95 0 0 1-.95.95zm-4.323 6.08c.632 0 1.096-.761 1.096-1.803 0-.698-.313-1.096-.855-1.096-.633 0-1.097.76-1.097 1.802 0 .698.314 1.097.856 1.097z" />
          </svg>
        </div>
        <span className="text-[10px] font-medium text-gray-400 dark:text-[#8B90A0]">Meta</span>
      </div>

      {/* Connector */}
      <div className="flex items-center gap-1 px-2">
        <div className="h-px w-8 bg-gradient-to-r from-blue-500/50 to-[#0F4C8F]/50 dark:from-blue-400/40 dark:to-[#3B7DD8]/40" />
        <svg viewBox="0 0 6 6" className="size-1.5 fill-[#0F4C8F]/60 dark:fill-[#3B7DD8]/60" aria-hidden>
          <path d="M0 0l6 3-6 3z" />
        </svg>
      </div>

      {/* Formly node */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#0F4C8F]/20 border border-[#0F4C8F]/40 dark:bg-[#3B7DD8]/10 dark:border-[#3B7DD8]/30">
          <span className="text-xs font-bold text-[#0F4C8F] dark:text-[#3B7DD8]">F</span>
        </div>
        <span className="text-[10px] font-medium text-gray-400 dark:text-[#8B90A0]">Formly</span>
      </div>

      {/* Connector */}
      <div className="flex items-center gap-1 px-2">
        <div className="h-px w-8 bg-gradient-to-r from-[#0F4C8F]/50 to-orange-500/50 dark:from-[#3B7DD8]/40 dark:to-orange-400/40" />
        <svg viewBox="0 0 6 6" className="size-1.5 fill-orange-500/60 dark:fill-orange-400/60" aria-hidden>
          <path d="M0 0l6 3-6 3z" />
        </svg>
      </div>

      {/* ServiceTitan node */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/30">
          <span className="text-xs font-bold text-orange-400">ST</span>
        </div>
        <span className="text-[10px] font-medium text-gray-400 dark:text-[#8B90A0]">ServiceTitan</span>
      </div>
    </div>
  );
}
