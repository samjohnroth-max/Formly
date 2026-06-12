import Link from "next/link";
import {
  Zap, BarChart2, Mail, Map, Users, ArrowRight,
  CheckCircle, ChevronRight, Link2, Megaphone, Clock,
} from "lucide-react";
import { DotGrid } from "@/components/ui/DotGrid";
import { FlowGraphic } from "@/components/ui/FlowGraphic";
import { FormlyLogo } from "@/components/brand/FormlyLogo";
import { FormlyPattern } from "@/components/brand/FormlyPattern";

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <FormlyLogo size="sm" variant="white" />
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-400 sm:flex">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-950 pt-32 pb-24">
      {/* Dot grid pattern */}
      <DotGrid dotColor="#ffffff" dotOpacity={0.03} spacing={24} radius={1.5} />
      {/* Formly mark pattern overlay */}
      <FormlyPattern color="#ffffff" opacity={0.03} spacing={48} />

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[800px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Brand wordmark */}
        <div className="flex justify-center mb-8">
          <FormlyLogo size="xl" variant="white" />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
          <Zap className="size-3" />
          Meta Instant Forms → ServiceTitan · Real-time
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Meta leads routed to<br />
          <span className="text-blue-400">ServiceTitan in seconds.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
          Formly connects your Meta Instant Forms directly to ServiceTitan —
          creating bookings, firing CAPI signals, and sending branded follow-up
          emails automatically. No Zapier. No manual entry. No missed leads.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Start free trial <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-gray-700 px-8 py-3.5 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* Flow graphic */}
        <div className="mt-10 flex justify-center">
          <FlowGraphic />
        </div>

        {/* Mini feature list */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          {["No credit card required", "14-day free trial", "Setup in under 10 minutes", "CAPI-compliant"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="size-3.5 text-blue-500/70" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="relative mx-auto mt-16 max-w-5xl px-6">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-gray-800/50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-gray-500">formly-production.up.railway.app/dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-0 divide-x divide-white/5">
            {/* Fake sidebar */}
            <div className="col-span-1 border-r border-white/5 bg-gray-900 p-4 space-y-1">
              <div className="mb-4 text-sm font-bold text-white">Formly</div>
              {["Dashboard", "Connections", "Campaigns", "Leads", "Templates", "Settings"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${i === 0 ? "bg-white/10 text-white" : "text-gray-500"}`}>
                  <div className="h-3 w-3 rounded-sm bg-current opacity-50" />
                  {item}
                </div>
              ))}
            </div>
            {/* Fake dashboard content */}
            <div className="col-span-3 p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total leads", value: "1,284" },
                  { label: "Bookings created", value: "847" },
                  { label: "Booking rate", value: "65.9%" },
                  { label: "Revenue tracked", value: "$184,200" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-white/5 p-3">
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                    <p className="mt-0.5 text-base font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="mb-2 text-[10px] font-medium text-gray-400">Recent leads</p>
                <div className="space-y-1.5">
                  {[
                    { name: "Sarah Johnson", service: "HVAC Tune-Up", status: "Booked", time: "2m ago" },
                    { name: "Mike Chen", service: "Plumbing Repair", status: "Routing…", time: "5m ago" },
                    { name: "Laura Davis", service: "Roof Inspection", status: "Booked", time: "11m ago" },
                  ].map((lead) => (
                    <div key={lead.name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{lead.name}</span>
                      <span className="text-[10px] text-gray-500">{lead.service}</span>
                      <span className={`text-[10px] font-medium ${lead.status === "Booked" ? "text-green-400" : "text-yellow-400"}`}>{lead.status}</span>
                      <span className="text-[10px] text-gray-600">{lead.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Link2 className="size-5" />,
      title: "Connect your accounts",
      description:
        "Link your Meta Business account and ServiceTitan tenant to Formly with OAuth. Takes about 2 minutes per connection.",
    },
    {
      number: "02",
      icon: <Megaphone className="size-5" />,
      title: "Map your form fields",
      description:
        "Tell Formly which Meta form fields map to which ServiceTitan fields. No code required — pick from dropdowns.",
    },
    {
      number: "03",
      icon: <Zap className="size-5" />,
      title: "Leads route automatically",
      description:
        "When someone fills out your Meta Instant Form, Formly creates the booking in ServiceTitan in under 3 seconds.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Up and running in under 10 minutes
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute top-8 left-1/6 right-1/6 hidden h-px bg-gray-200 sm:block" style={{ left: "16.67%", right: "16.67%" }} />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-blue-600">
                {step.icon}
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {step.number.slice(1)}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    {
      icon: <Zap className="size-5 text-blue-600" />,
      title: "Real-time lead routing",
      description:
        "Every Meta Instant Form submission is captured by webhook and routed to ServiceTitan as a booking, lead, or follow-up task — in under 3 seconds.",
    },
    {
      icon: <BarChart2 className="size-5 text-purple-600" />,
      title: "CAPI revenue signals",
      description:
        "Booking values and invoice amounts are automatically sent back to Meta CAPI so your campaigns optimize for actual revenue, not just clicks.",
    },
    {
      icon: <Mail className="size-5 text-green-600" />,
      title: "Automated email sequences",
      description:
        "Send branded follow-up emails at the right moment — immediately, 2 hours later, on booking confirmed, or 7 days after job completion.",
    },
    {
      icon: <Map className="size-5 text-amber-600" />,
      title: "Lead map & dashboard",
      description:
        "See every lead plotted on a live map with routing status, contact info, and the full journey from form submission to booked job.",
    },
    {
      icon: <Users className="size-5 text-red-500" />,
      title: "Agency multi-client",
      description:
        "Manage multiple clients from one Formly account. Each client has their own Meta and ServiceTitan connections, campaigns, and analytics.",
    },
    {
      icon: <Clock className="size-5 text-teal-600" />,
      title: "Field mapping, no code",
      description:
        "Map any Meta form field to any ServiceTitan field with a simple dropdown UI. Transformations, custom values, and smart defaults included.",
    },
  ];

  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">Features</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Everything between Meta and ServiceTitan
          </h2>
          <p className="mt-3 text-gray-500">
            Formly handles the infrastructure so you can focus on running campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                {f.icon}
              </div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social proof strip ────────────────────────────────────────────────────────

function ProofStrip() {
  return (
    <section className="border-y border-gray-200 bg-white py-12">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Built for home service companies
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-gray-400">
          {["HVAC", "Roofing", "Plumbing", "Electrical", "Pest Control", "Landscaping", "Flooring"].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      description: "One location, one CRM. Everything to start routing leads automatically.",
      features: [
        "1 Meta ad account",
        "1 CRM connection (ServiceTitan)",
        "Up to 500 leads / month",
        "Email auto-reply",
        "CAPI revenue loop",
        "Lead dashboard",
        "14-day free trial",
      ],
      cta: "Start free trial",
      href: "/signup",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$129",
      period: "per month",
      description: "Scale across ad accounts with full automation and branded emails.",
      features: [
        "Unlimited Meta ad accounts",
        "3 CRM connections",
        "Unlimited leads",
        "Custom email templates + sequences",
        "Full revenue map & analytics",
        "Brand email builder",
        "14-day free trial",
      ],
      cta: "Start free trial",
      href: "/signup",
      highlight: true,
    },
    {
      name: "Agency",
      price: "$299",
      period: "per month",
      description: "Manage every client from one workspace with full white-label control.",
      features: [
        "Unlimited everything",
        "Multi-client dashboard",
        "White-label emails",
        "Priority support",
        "Onboarding call",
        "14-day free trial",
      ],
      cta: "Start free trial",
      href: "/signup",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="bg-gray-950 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Simple, transparent pricing</h2>
          <p className="mt-3 text-gray-400">14-day free trial on all plans. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 ${
                plan.highlight
                  ? "border-2 border-blue-500 bg-gray-900"
                  : "border border-white/10 bg-gray-900"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                </div>
              )}
              <p className="text-sm font-semibold text-gray-300">{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-500">/{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "border border-white/20 text-gray-300 hover:border-white/40 hover:text-white"
                }`}
              >
                {plan.cta} <ChevronRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="bg-blue-600 py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Stop losing leads to manual entry.
        </h2>
        <p className="mt-3 text-blue-100">
          Formly routes Meta leads to ServiceTitan automatically — so your team
          can focus on answering the phone, not copying data.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Get started free <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <FormlyLogo size="sm" variant="white" />
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-300 transition-colors">Sign up</Link>
            <a href="mailto:support@formly.app" className="hover:text-gray-300 transition-colors">support@formly.app</a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Formly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}
