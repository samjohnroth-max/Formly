export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string }
  | { type: "tip"; text: string }
  | { type: "warn"; text: string };

export interface Article {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  content: Block[];
}

export interface Category {
  slug: string;
  label: string;
  icon: string; // lucide icon name
}

export const CATEGORIES: Category[] = [
  { slug: "getting-started",     label: "Getting Started",       icon: "Rocket" },
  { slug: "connecting-accounts", label: "Connecting Accounts",   icon: "Link2" },
  { slug: "campaigns",           label: "Campaigns",             icon: "Megaphone" },
  { slug: "leads-routing",       label: "Leads & Routing",       icon: "Users" },
  { slug: "email-templates",     label: "Follow-ups",            icon: "Mail" },
  { slug: "servicetitan",        label: "ServiceTitan",          icon: "Briefcase" },
  { slug: "capi-meta",           label: "CAPI & Meta",           icon: "Zap" },
  { slug: "troubleshooting",     label: "Troubleshooting",       icon: "Wrench" },
];

export const ARTICLES: Article[] = [
  // ─── Getting Started ────────────────────────────────────────────
  {
    slug: "setup-formly-10-minutes",
    title: "How to set up Formly in 10 minutes",
    description: "A step-by-step walkthrough: sign up, connect Meta, connect ServiceTitan, create a campaign, and test your first lead.",
    categorySlug: "getting-started",
    content: [
      { type: "p", text: "Formly connects your Meta Instant Forms directly to ServiceTitan. Follow these five steps to go live." },
      { type: "h2", text: "Step 1 — Create your account" },
      { type: "ol", items: [
        "Go to formly.app and click Get started.",
        "Enter your name, work email, and password.",
        "You will land directly on your dashboard — no email verification required to get started.",
      ]},
      { type: "h2", text: "Step 2 — Connect your Meta Business account" },
      { type: "ol", items: [
        "In the sidebar click Connections.",
        "Click Add Client, enter your client's business name.",
        "Click Connect Meta inside the client card. You will be redirected to Meta's OAuth consent screen.",
        "Approve the permissions — Formly needs access to your ad account and form leads.",
        "You will be redirected back and the connection will show as Active.",
      ]},
      { type: "note", text: "You need to be an admin on the Meta Business Manager account to complete the OAuth flow." },
      { type: "h2", text: "Step 3 — Connect ServiceTitan" },
      { type: "ol", items: [
        "Still on the Connections page, click Add ST Tenant inside your client card.",
        "Enter your ServiceTitan Tenant ID, Client ID, Client Secret, and App Key.",
        "Click Test — a green OK confirms the credentials are valid.",
      ]},
      { type: "h2", text: "Step 4 — Create a campaign" },
      { type: "ol", items: [
        "Click Campaigns in the sidebar, then New Campaign.",
        "Step 1: Pick your Meta ad account and the Instant Form you want to route.",
        "Step 2: Choose a destination type (Booking, Lead, or Follow-up) and select your ST tenant.",
        "Step 3: Map your form fields to ServiceTitan fields (full_name → customer.name, phone_number → customer.phone, etc.).",
        "Step 4: Optionally attach a follow-up email.",
        "Click Create Campaign. The campaign goes live immediately.",
      ]},
      { type: "h2", text: "Step 5 — Test with a live lead" },
      { type: "p", text: "Submit a test lead through your Meta Instant Form (you can do this from Meta Ads Manager > Forms Library > Preview). Within a few seconds the lead should appear on your Leads page with a SUCCESS status and the matching job or lead record in ServiceTitan." },
      { type: "tip", text: "If the lead shows FAILED, click on the lead row for a detailed error trace. The most common issue is a missing address field required for BOOKING destination types." },
    ],
  },
  {
    slug: "what-is-formly",
    title: "What is Formly and how does it work",
    description: "An overview of the Meta → Formly → ServiceTitan flow and what happens at each step.",
    categorySlug: "getting-started",
    content: [
      { type: "p", text: "Formly is a real-time bridge between Meta Instant Forms and ServiceTitan. When a homeowner fills out your Meta ad form, Formly receives the submission via Meta's webhook within seconds and automatically creates the corresponding record in ServiceTitan — no manual copy-pasting, no Zapier delays." },
      { type: "h2", text: "The three-step flow" },
      { type: "ol", items: [
        "Lead submits — A prospect fills out your Meta Instant Form on Facebook or Instagram.",
        "Formly routes — Formly receives the webhook, parses the form fields, geocodes the address, looks up any existing customer in ServiceTitan, and creates a booking, lead, or follow-up task.",
        "ST receives — The record appears in ServiceTitan within 3 seconds on average. Formly also fires a CAPI Lead event back to Meta for conversion tracking.",
      ]},
      { type: "h2", text: "Key concepts" },
      { type: "ul", items: [
        "Campaign — Links one Meta form to one ServiceTitan tenant. You can have many campaigns.",
        "Destination type — Booking (creates a job), Lead (creates a lead record), or Follow-up (matches existing customer).",
        "CAPI — Conversions API. Formly sends your booking and revenue data back to Meta so it can optimize your ad targeting.",
        "Service area — A radius around your business location. Formly flags leads that fall outside it.",
      ]},
      { type: "h2", text: "What Formly does NOT do" },
      { type: "ul", items: [
        "Formly does not modify your Meta ads or ad spend.",
        "Formly does not replace your CRM — it writes into ServiceTitan.",
        "Formly does not store sensitive payment data.",
      ]},
    ],
  },
  {
    slug: "system-requirements",
    title: "System requirements and supported platforms",
    description: "What you need before getting started with Formly.",
    categorySlug: "getting-started",
    content: [
      { type: "h2", text: "Meta requirements" },
      { type: "ul", items: [
        "A Meta Business Manager account with admin access.",
        "At least one active Instant Form attached to a Facebook or Instagram ad.",
        "The Leads access permission on your ad account.",
      ]},
      { type: "h2", text: "ServiceTitan requirements" },
      { type: "ul", items: [
        "An active ServiceTitan subscription.",
        "API credentials: Tenant ID, Client ID, Client Secret, and App Key. Your ST account manager can provide these.",
        "The Formly app must be authorized in your ST API settings.",
      ]},
      { type: "h2", text: "Browser support" },
      { type: "p", text: "The Formly dashboard works in Chrome, Firefox, Safari, and Edge. Mobile browsers are supported for viewing leads and the dashboard but the campaign wizard is desktop-optimized." },
      { type: "note", text: "Formly does not require any code changes to your website or landing pages. Everything runs through Meta and ServiceTitan's APIs." },
    ],
  },

  // ─── Connecting Accounts ────────────────────────────────────────
  {
    slug: "connect-meta",
    title: "How to connect your Meta Business account",
    description: "Step-by-step guide to linking your Meta ad account to Formly via OAuth.",
    categorySlug: "connecting-accounts",
    content: [
      { type: "p", text: "Formly uses Meta's official OAuth flow to connect to your Business Manager. You never share your password with Formly." },
      { type: "h2", text: "Before you start" },
      { type: "ul", items: [
        "You must be an Admin on the Meta Business Manager account.",
        "The ad account must have at least one Instant Form.",
        "Pop-ups must be allowed in your browser for the OAuth window.",
      ]},
      { type: "h2", text: "Connection steps" },
      { type: "ol", items: [
        "Go to Connections in the sidebar.",
        "Click Add Client and enter the client name.",
        "Inside the client card, click Connect Meta.",
        "A Meta login window opens. Log in with the Facebook account that has Business Manager admin access.",
        "Review and approve the permissions. Formly requests: leads_retrieval, ads_read, pages_read_engagement.",
        "After approval, you'll be redirected back to Formly. The connection will show as Active.",
      ]},
      { type: "h2", text: "Reconnecting an expired token" },
      { type: "p", text: "Meta access tokens expire after 60 days. When a connection shows as Disconnected or Expired, click Reconnect next to it and re-authorize. Your existing campaigns and lead history are preserved." },
      { type: "warn", text: "If you lose access to the Facebook account used for the connection, you will need to disconnect and reconnect using a new admin account." },
    ],
  },
  {
    slug: "connect-servicetitan",
    title: "How to connect ServiceTitan",
    description: "How to get your ServiceTitan API credentials and connect them to Formly.",
    categorySlug: "connecting-accounts",
    content: [
      { type: "h2", text: "Getting your credentials" },
      { type: "p", text: "ServiceTitan uses an OAuth 2.0 client credentials flow. You need four values:" },
      { type: "ul", items: [
        "Tenant ID — your unique ST account identifier (numeric).",
        "Client ID — from your ST API integration settings.",
        "Client Secret — generated when you create the integration.",
        "App Key — the application key assigned to the Formly integration.",
      ]},
      { type: "p", text: "Contact your ServiceTitan account manager or go to Settings > Integrations > API Application Access in ServiceTitan to generate these." },
      { type: "h2", text: "Adding the connection in Formly" },
      { type: "ol", items: [
        "Go to Connections in the sidebar.",
        "Inside a client card, click Add ST Tenant (or create a client first).",
        "Enter all four credential fields.",
        "Click Test. A green OK message confirms the credentials are valid.",
        "Click Save. The tenant appears in the client card.",
      ]},
      { type: "note", text: "Formly encrypts your credentials at rest using AES-256. They are never stored in plain text." },
    ],
  },
  {
    slug: "meta-connection-disconnected",
    title: "Why is my Meta connection showing as disconnected",
    description: "Common reasons your Meta connection goes stale and how to fix it.",
    categorySlug: "connecting-accounts",
    content: [
      { type: "h2", text: "Common reasons" },
      { type: "ul", items: [
        "The access token expired (tokens last 60 days by default).",
        "The Meta user who authorized the connection lost admin access to the Business Manager.",
        "Meta revoked the token due to a password change or suspicious activity.",
        "The Formly app was removed from the Business Manager's connected apps.",
      ]},
      { type: "h2", text: "How to fix it" },
      { type: "ol", items: [
        "Go to Connections and find the disconnected Meta account.",
        "Click Reconnect.",
        "Complete the OAuth flow with a valid Business Manager admin account.",
        "Your existing campaigns will automatically resume routing leads.",
      ]},
      { type: "tip", text: "Set a calendar reminder every 45 days to check your connection status. Formly will also show a warning banner on the dashboard when a connection goes stale." },
    ],
  },
  {
    slug: "agency-multiple-clients",
    title: "How to connect multiple client accounts (Agency guide)",
    description: "How agencies manage multiple clients, each with their own Meta and ServiceTitan connections.",
    categorySlug: "connecting-accounts",
    content: [
      { type: "p", text: "Formly is built for agencies. You can manage any number of clients from a single Formly account, each isolated from the others." },
      { type: "h2", text: "The client model" },
      { type: "p", text: "Each client gets their own card on the Connections page. A client card holds one or more Meta connections and one or more ServiceTitan tenants. Campaigns connect a Meta form from one client to an ST tenant from the same client." },
      { type: "h2", text: "Adding a new client" },
      { type: "ol", items: [
        "Go to Connections and click Add Client.",
        "Enter the client's business name.",
        "Click Connect Meta inside the card to link their Meta account.",
        "Click Add ST Tenant to add their ServiceTitan credentials.",
        "Create campaigns for this client.",
      ]},
      { type: "note", text: "Billing is per Formly account, not per client. You can add unlimited clients on any plan." },
    ],
  },

  // ─── Campaigns ──────────────────────────────────────────────────
  {
    slug: "create-first-campaign",
    title: "Creating your first campaign",
    description: "Walk through the 4-step campaign wizard from start to live routing.",
    categorySlug: "campaigns",
    content: [
      { type: "p", text: "A campaign is the core routing rule in Formly. It says: when someone fills out this Meta form, create this type of record in ServiceTitan." },
      { type: "h2", text: "Step 1: Choose your Meta form" },
      { type: "p", text: "Select which Meta ad account and which Instant Form to listen to. Give your campaign a clear name — it will appear on all lead records." },
      { type: "h2", text: "Step 2: Configure the destination" },
      { type: "p", text: "Choose your ServiceTitan tenant and the destination type: Booking, Lead, or Follow-up. For Booking, you'll also select a job type and business unit." },
      { type: "h2", text: "Step 3: Map form fields" },
      { type: "p", text: "Tell Formly which Meta form question maps to which ServiceTitan field. Common mappings: full_name → customer.name, phone_number → customer.phone, street_address → location.street." },
      { type: "h2", text: "Step 4: Follow-up (optional)" },
      { type: "p", text: "Attach a follow-up email if you want to automatically send a confirmation to the lead. This is optional." },
      { type: "tip", text: "After creating the campaign, submit a test lead through Meta Ads Manager to confirm routing works before going live with real ad spend." },
    ],
  },
  {
    slug: "destination-types",
    title: "Understanding destination types: Booking vs Lead vs Follow-up",
    description: "What each destination type does in ServiceTitan and when to use each.",
    categorySlug: "campaigns",
    content: [
      { type: "h2", text: "Booking" },
      { type: "p", text: "Creates a job record in ServiceTitan. Requires: job type, business unit. The customer and location records are created or matched automatically. Use this when you want leads to go directly to dispatch." },
      { type: "note", text: "Booking destination requires a street address. Formly will use the address fields from the form or fall back to geocoding from zip code. Without an address the booking may fail." },
      { type: "h2", text: "Lead" },
      { type: "p", text: "Creates a lead record in ServiceTitan. Use this when you want your CSR team to review and convert leads manually. No job is created automatically." },
      { type: "h2", text: "Follow-up" },
      { type: "p", text: "Looks up an existing customer by phone or email. If found, adds a follow-up task to their account. If not found, falls back to creating a Lead record. Use this for repeat-customer campaigns or re-engagement flows." },
    ],
  },
  {
    slug: "field-mapping",
    title: "How to map form fields to ServiceTitan",
    description: "Understanding field mapping: which Meta form fields map to which ServiceTitan fields and how transforms work.",
    categorySlug: "campaigns",
    content: [
      { type: "h2", text: "What is field mapping" },
      { type: "p", text: "Meta Instant Forms use custom question names (like phone_number or what_service_do_you_need). ServiceTitan has its own field structure. Field mapping tells Formly how to translate one to the other." },
      { type: "h2", text: "Available ServiceTitan fields" },
      { type: "ul", items: [
        "customer.name — Full name",
        "customer.firstName — First name only",
        "customer.lastName — Last name only",
        "customer.phone — Phone number",
        "customer.email — Email address",
        "location.street — Street address",
        "location.city — City",
        "location.state — State (2-letter code)",
        "location.zip — Zip code",
        "job.notes — Free-text notes on the job",
        "job.tag — Campaign tag for reporting",
      ]},
      { type: "h2", text: "Smart defaults" },
      { type: "p", text: "Formly automatically detects common field names (full_name, phone_number, email, zip_code, street_address) and pre-fills the mapping. You can override any auto-mapped field." },
      { type: "tip", text: "Map as many address fields as possible. A complete address improves geocoding accuracy and enables the Booking destination type." },
    ],
  },
  {
    slug: "email-sequences-per-campaign",
    title: "Setting up follow-up sequences per campaign",
    description: "How to configure automated follow-up emails that send after a lead arrives.",
    categorySlug: "campaigns",
    content: [
      { type: "p", text: "Each campaign supports a 5-step email sequence. Steps trigger based on timing or lead status events." },
      { type: "h2", text: "Trigger types" },
      { type: "ul", items: [
        "Immediately on lead — Sent as soon as the lead routes successfully.",
        "2 hours if not booked — Sent 2 hours after the lead if no booking has been confirmed.",
        "24 hours if not booked — Sent 24 hours after the lead if still unbooked.",
        "On booking confirmed — Sent when a job is created in ServiceTitan.",
        "7 days after job complete — Sent one week after the job closes.",
      ]},
      { type: "h2", text: "Setting up a step" },
      { type: "ol", items: [
        "Go to Campaigns and click the gear icon on any campaign.",
        "Under Follow-up sequence, toggle the steps you want to enable.",
        "Select a follow-up for each enabled step.",
        "Click Save sequence.",
      ]},
      { type: "note", text: "Steps only send if a follow-up is assigned and the toggle is enabled. Steps without a follow-up are silently skipped." },
    ],
  },

  // ─── Leads & Routing ────────────────────────────────────────────
  {
    slug: "how-lead-routing-works",
    title: "How lead routing works",
    description: "What happens inside Formly between a form submission and a ServiceTitan record, step by step.",
    categorySlug: "leads-routing",
    content: [
      { type: "p", text: "When a lead submits your Meta Instant Form, Formly processes it through a queue of sequential steps:" },
      { type: "ol", items: [
        "Webhook received — Meta sends the form data to Formly within seconds of submission.",
        "Campaign identified — Formly matches the form ID to an active campaign.",
        "Lead record created — A Lead row is created in Formly with PROCESSING status.",
        "Fields parsed — Form answers are mapped to customer, location, and job fields.",
        "Geocoding — If an address is present it's geocoded to lat/lng for the map.",
        "Customer lookup — Formly searches ServiceTitan for an existing customer by phone/email.",
        "Location lookup/create — The service location is found or created in ST.",
        "Record created — A booking, lead, or task is created in ServiceTitan.",
        "CAPI event fired — A Lead event is sent to the Meta Conversions API.",
        "Email sent — If a sequence step is configured, the confirmation email is sent.",
        "Status updated — The lead status updates to SUCCESS.",
      ]},
      { type: "h2", text: "Timing" },
      { type: "p", text: "The full flow completes in under 5 seconds on average. The limiting factor is typically the ServiceTitan API response time." },
    ],
  },
  {
    slug: "lead-failed-to-route",
    title: "What happens when a lead fails to route",
    description: "How to diagnose and retry failed leads.",
    categorySlug: "leads-routing",
    content: [
      { type: "h2", text: "Failure states" },
      { type: "ul", items: [
        "FAILED — The routing attempt failed and will not be retried automatically.",
        "RETRY — A transient error occurred (network timeout, ST rate limit). Formly will retry up to 3 times with exponential backoff.",
      ]},
      { type: "h2", text: "Diagnosing a failure" },
      { type: "ol", items: [
        "Go to Leads and click the failed lead.",
        "The lead detail page shows a timeline of every step attempted.",
        "The error message on the failed step explains what went wrong.",
      ]},
      { type: "h2", text: "Common failure causes" },
      { type: "ul", items: [
        "Missing address — BOOKING destination requires a street address.",
        "Invalid ST credentials — The ServiceTitan connection expired or the credentials changed.",
        "Duplicate metaLeadId — Meta sent the same lead twice (this is normal; Formly deduplicates).",
        "ST API rate limit — ServiceTitan temporarily throttled requests. Formly retries automatically.",
      ]},
    ],
  },
  {
    slug: "export-leads-csv",
    title: "How to export leads as CSV",
    description: "Download your lead list as a CSV for reporting or import into other tools.",
    categorySlug: "leads-routing",
    content: [
      { type: "ol", items: [
        "Go to Leads in the sidebar.",
        "Optionally filter by status or service area using the filter tabs.",
        "Click the Export CSV button in the top-right corner.",
        "The file downloads immediately. It contains all leads matching the current filter (up to 10,000 rows).",
      ]},
      { type: "h2", text: "CSV columns" },
      { type: "ul", items: [
        "Lead ID, Name, Email, Phone",
        "Campaign name, Destination type",
        "Routing status, Routing error",
        "ST Job ID, ST Lead ID",
        "Created at (UTC)",
      ]},
    ],
  },
  {
    slug: "lead-statuses",
    title: "Understanding lead statuses",
    description: "What each lead status means and what action (if any) is required.",
    categorySlug: "leads-routing",
    content: [
      { type: "ul", items: [
        "PENDING — Lead received, waiting to be picked up by the routing worker.",
        "PROCESSING — Routing is actively in progress.",
        "SUCCESS — Lead was successfully routed to ServiceTitan.",
        "RETRY — A transient error occurred. Formly will retry automatically.",
        "FAILED — Routing failed after all retry attempts. Manual review required.",
      ]},
      { type: "note", text: "A SUCCESS status means the ST API accepted the request. It does not guarantee the record is visible in ST — allow a few seconds for ST's internal processing." },
    ],
  },

  // ─── ServiceTitan ───────────────────────────────────────────────
  {
    slug: "how-formly-creates-jobs",
    title: "How Formly creates jobs in ServiceTitan",
    description: "The exact sequence of API calls Formly makes to create a booking in ServiceTitan.",
    categorySlug: "servicetitan",
    content: [
      { type: "p", text: "For BOOKING destination campaigns, Formly makes several ST API calls in sequence:" },
      { type: "ol", items: [
        "Customer lookup — Search for existing customer by phone or email.",
        "Customer create — If no match, create a new customer record.",
        "Location lookup — Search for an existing service location by address.",
        "Location create — If no match, create a new location linked to the customer.",
        "Job create — Create the job with the configured job type, business unit, and priority.",
        "Tags applied — Campaign tag is applied to the job for reporting.",
      ]},
      { type: "h2", text: "What about the address?" },
      { type: "p", text: "ServiceTitan requires a complete service location to create a booking. Formly collects the address from the form fields mapped to location.street, location.city, location.state, and location.zip. If any are missing, geocoding from zip code provides a fallback lat/lng but a full address is preferred." },
    ],
  },
  {
    slug: "campaign-tagging-revenue",
    title: "ServiceTitan campaign tagging and revenue reporting",
    description: "How Formly tags jobs in ServiceTitan and surfaces revenue data back in the dashboard.",
    categorySlug: "servicetitan",
    content: [
      { type: "h2", text: "Campaign tagging" },
      { type: "p", text: "When you configure a campaign, you can set a campaign tag (e.g., 'Meta-HVAC-Summer'). Formly applies this tag to every job created by that campaign. This lets you filter and report on Meta-sourced revenue inside ServiceTitan." },
      { type: "h2", text: "Revenue pull-back" },
      { type: "p", text: "Formly periodically polls ServiceTitan for job status updates. When a job is marked as Complete and has an invoice value, Formly records the revenue and fires a Purchase event to the Meta Conversions API. This closes the attribution loop from ad click to closed revenue." },
      { type: "tip", text: "For revenue pull-back to work accurately, your ServiceTitan jobs must be marked as Complete with an invoice amount. Formly cannot report revenue for jobs that have no invoice." },
    ],
  },
  {
    slug: "address-required-booking",
    title: "Why leads need an address for ServiceTitan bookings",
    description: "Why address fields are required for BOOKING destinations and how to handle missing addresses.",
    categorySlug: "servicetitan",
    content: [
      { type: "p", text: "ServiceTitan requires a service location to create a job. A service location requires at minimum a zip code, and ideally a full street address." },
      { type: "h2", text: "What Formly does with incomplete addresses" },
      { type: "ul", items: [
        "Full address present — Formly creates a precise service location.",
        "Zip code only — Formly geocodes the zip to lat/lng and creates a location with city/state/zip but no street.",
        "No address fields at all — The booking will fail with 'Missing location data'.",
      ]},
      { type: "h2", text: "Best practice" },
      { type: "p", text: "Add an address question to your Meta Instant Form and map it to location.street. Even a zip-code question mapped to location.zip dramatically improves booking success rates." },
    ],
  },

  // ─── Follow-ups ─────────────────────────────────────────────────
  {
    slug: "build-email-template",
    title: "Building your first follow-up email",
    description: "How to use the visual block editor to create professional follow-up emails.",
    categorySlug: "email-templates",
    content: [
      { type: "ol", items: [
        "Go to Follow-ups in the sidebar.",
        "Click New template.",
        "Choose a layout (Minimal, Bold, Friendly, Professional, Modern) or start from scratch.",
        "Use the block editor on the left to add and reorder content blocks: headers, text, buttons, images, dividers.",
        "Customize fonts, colors, padding, and button styles.",
        "Click Preview to see the rendered HTML in an iframe.",
        "Click Send test email to receive a test at your account email.",
        "Save the template.",
      ]},
      { type: "h2", text: "Block types" },
      { type: "ul", items: [
        "Header — H1, H2, or H3 heading text.",
        "Text — Paragraph body copy.",
        "Button — CTA button with URL, background color, and border radius.",
        "Image — Full-width or fixed-width image from URL.",
        "Divider — Horizontal rule for visual separation.",
      ]},
    ],
  },
  {
    slug: "brand-settings",
    title: "Setting up your brand settings",
    description: "How to configure your logo, colors, and fonts so all follow-up emails reflect your brand automatically.",
    categorySlug: "email-templates",
    content: [
      { type: "p", text: "Brand settings let you define your visual identity once and apply it across all follow-up emails with one click." },
      { type: "h2", text: "Configuring brand settings" },
      { type: "ol", items: [
        "Go to Settings > Brand settings.",
        "Upload your logo URL.",
        "Set your primary color (used for buttons and headings).",
        "Choose your font family.",
        "Set a footer text (company name, address, unsubscribe info).",
        "Click Save. A live preview updates as you type.",
      ]},
      { type: "h2", text: "Applying brand to a follow-up" },
      { type: "p", text: "On the Follow-ups list, click Apply brand next to any follow-up. Formly re-renders it with your brand colors and font. You can also click Apply brand inside the editor." },
    ],
  },
  {
    slug: "send-test-email",
    title: "How to send a test email",
    description: "Send a preview of any follow-up to your inbox before using it in a campaign.",
    categorySlug: "email-templates",
    content: [
      { type: "ol", items: [
        "Open any follow-up in the editor (Follow-ups > Edit).",
        "Click the Send test email button in the top-right of the editor.",
        "Formly renders the follow-up with placeholder values and sends it to your account email address.",
        "Check your inbox within 1–2 minutes.",
      ]},
      { type: "note", text: "Test emails are sent from noreply@formly.app. Make sure this domain is not blocked by your email provider." },
    ],
  },
  {
    slug: "merge-tags",
    title: "Understanding merge tags",
    description: "How to use {{merge_tags}} to personalize follow-up emails with lead data.",
    categorySlug: "email-templates",
    content: [
      { type: "p", text: "Merge tags are placeholders that Formly replaces with actual lead data when sending an email." },
      { type: "h2", text: "Available merge tags" },
      { type: "ul", items: [
        "{{brand_company_name}} — Your company name from brand settings.",
        "{{brand_primary_color}} — Your primary brand color.",
        "{{brand_logo_url}} — Your logo URL.",
        "{{brand_font}} — Your brand font family.",
      ]},
      { type: "note", text: "Lead-specific merge tags (customer name, address) will be added in a future release. Currently merge tags are limited to brand variables." },
    ],
  },

  // ─── CAPI & Meta ────────────────────────────────────────────────
  {
    slug: "what-is-capi",
    title: "What is the Conversions API and why does it matter",
    description: "Why CAPI improves your Meta ad performance and how Formly uses it.",
    categorySlug: "capi-meta",
    content: [
      { type: "p", text: "The Meta Conversions API (CAPI) lets you send conversion events — like a lead form submission or a closed job — directly from your server to Meta, bypassing browser-side tracking limitations like ad blockers and iOS privacy restrictions." },
      { type: "h2", text: "Why it matters" },
      { type: "ul", items: [
        "Better attribution — Meta sees more conversions, so it knows which ads are actually driving results.",
        "Lower CPL — With better signal, Meta's algorithm optimizes more effectively and reduces cost per lead.",
        "Revenue-based optimization — When you send job revenue back to Meta, it can optimize for high-value customers, not just any leads.",
      ]},
      { type: "h2", text: "What Formly sends" },
      { type: "ul", items: [
        "Lead event — Fired immediately when a lead routes successfully.",
        "Schedule event — Fired when a booking is created in ServiceTitan.",
        "Purchase event — Fired when a job is marked Complete with an invoice value.",
      ]},
    ],
  },
  {
    slug: "revenue-signals-meta",
    title: "How Formly sends revenue signals back to Meta",
    description: "The end-to-end flow from closed job in ServiceTitan to Purchase event in Meta.",
    categorySlug: "capi-meta",
    content: [
      { type: "ol", items: [
        "Lead comes in from Meta → Formly creates a job in ServiceTitan.",
        "Job is completed and invoiced in ServiceTitan.",
        "Formly polls ST periodically for status updates on tracked jobs.",
        "When a job transitions to Complete with an invoice amount, Formly records the revenue.",
        "A Purchase CAPI event is fired to Meta with the invoice value as the event value.",
        "Meta attributes the revenue to the original ad and uses it to optimize future campaigns.",
      ]},
      { type: "tip", text: "The more Purchase events Meta receives, the better it can optimize your campaigns for revenue rather than just form fills. Aim for at least 30 events per month for meaningful optimization." },
    ],
  },
  {
    slug: "capi-signal-strength",
    title: "Understanding your CAPI signal strength",
    description: "What the signal strength indicator means and how to improve it.",
    categorySlug: "capi-meta",
    content: [
      { type: "h2", text: "Signal strength tiers" },
      { type: "ul", items: [
        "Poor (0 events) — No CAPI events have been sent. Check that CAPI is enabled on your campaigns.",
        "Building (1–10 events in 30 days) — Signal is flowing. Meta is learning.",
        "Strong (11–30 events) — Good signal quality. Optimization is effective.",
        "Excellent (31+ events) — Maximum optimization. Meta's algorithm has strong data to work with.",
      ]},
      { type: "h2", text: "How to improve your signal" },
      { type: "ul", items: [
        "Ensure CAPI is enabled on all active campaigns.",
        "Map email and phone fields so Meta can match events to users.",
        "Make sure your ST jobs are being marked Complete with invoice amounts so Purchase events fire.",
        "Increase lead volume — more leads means more events.",
      ]},
    ],
  },

  // ─── Troubleshooting ────────────────────────────────────────────
  {
    slug: "lead-missing-from-servicetitan",
    title: "Lead came in but didn't appear in ServiceTitan",
    description: "Step-by-step checklist for diagnosing a lead that Formly received but ServiceTitan didn't get.",
    categorySlug: "troubleshooting",
    content: [
      { type: "h2", text: "Check the lead status in Formly" },
      { type: "ol", items: [
        "Go to Leads. Find the lead by name or phone.",
        "Click the lead to open the detail page.",
        "Check the Routing Status. If it says SUCCESS, the ST API accepted it — check ServiceTitan directly.",
        "If it says FAILED, read the error message on the failed step.",
      ]},
      { type: "h2", text: "Common causes when status is SUCCESS but ST has no record" },
      { type: "ul", items: [
        "ServiceTitan may take 10–30 seconds to display newly created records.",
        "The record may have been created under a different customer due to a phone number mismatch.",
        "A tag or business unit filter in your ST view may be hiding the record.",
      ]},
      { type: "h2", text: "Common causes when status is FAILED" },
      { type: "ul", items: [
        "Missing address — BOOKING destination requires a location. Check field mappings.",
        "Expired ST credentials — Reconnect the ServiceTitan tenant.",
        "Duplicate lead — Meta occasionally resends webhooks. Formly deduplicates by metaLeadId, so the second delivery is silently ignored.",
      ]},
    ],
  },
  {
    slug: "meta-webhook-not-receiving",
    title: "My Meta webhook isn't receiving leads",
    description: "Diagnose why Formly isn't receiving leads from your Meta Instant Form.",
    categorySlug: "troubleshooting",
    content: [
      { type: "h2", text: "Verify the webhook is subscribed" },
      { type: "ul", items: [
        "Go to Connections and check your Meta connection is Active (not Expired or Disconnected).",
        "If Disconnected, click Reconnect and re-authorize.",
      ]},
      { type: "h2", text: "Verify the form is attached to the right campaign" },
      { type: "ul", items: [
        "Go to Campaigns and confirm the campaign's Meta Form matches the form you're testing.",
        "Meta form IDs can change if you duplicate a form — confirm the ID hasn't changed.",
      ]},
      { type: "h2", text: "Test with a direct form submission" },
      { type: "p", text: "In Meta Ads Manager, go to Forms Library, find your form, and click Preview. Submit a test lead. Check the Formly Leads page within 30 seconds." },
      { type: "note", text: "Meta webhooks are sometimes delayed up to 5 minutes under high load. If your test lead doesn't appear immediately, wait a few minutes before assuming there's a problem." },
    ],
  },
  {
    slug: "password-reset-not-arriving",
    title: "Password reset email not arriving",
    description: "What to do if you don't receive the password reset email.",
    categorySlug: "troubleshooting",
    content: [
      { type: "ol", items: [
        "Check your spam or junk folder. Emails come from noreply@formly.app.",
        "Wait 5 minutes — transactional emails occasionally queue during high-sending periods.",
        "Make sure you entered the correct email address. The reset email only goes to the exact address on your account.",
        "Try again — go to /forgot-password and re-submit.",
        "If you still don't receive it, contact support.",
      ]},
    ],
  },
  {
    slug: "test-meta-form-connection",
    title: "How to test your Meta Instant Form connection",
    description: "How to verify end-to-end that a form submission reaches ServiceTitan correctly.",
    categorySlug: "troubleshooting",
    content: [
      { type: "ol", items: [
        "In Meta Ads Manager, go to Instant Forms (or Forms Library).",
        "Find the form attached to your Formly campaign.",
        "Click the three-dot menu and select Preview form.",
        "Fill out all fields with realistic test data (use a real phone number format).",
        "Submit the form.",
        "In Formly, go to Leads. The test lead should appear within 30 seconds.",
        "Check the routing status. If SUCCESS, verify the record appeared in ServiceTitan.",
        "If FAILED, click the lead to see the error detail.",
      ]},
      { type: "tip", text: "Use a test lead with a complete address (street, city, state, zip) so you can verify the full BOOKING flow end-to-end." },
    ],
  },
  // ─── Campaigns ──────────────────────────────────────────────────
  {
    slug: "campaign-performance-report",
    title: "Understanding your campaign performance report",
    description: "How to read the campaign table, what ROAS means, how to enter ad spend, and how to export your data.",
    categorySlug: "campaigns",
    content: [
      { type: "p", text: "The Campaign Performance section on your dashboard gives you a complete picture of how each Meta campaign is performing — from lead volume to revenue to ad spend efficiency." },
      { type: "h2", text: "The summary cards" },
      { type: "p", text: "Four cards appear above the table summarizing the entire selected period: Total Leads, Total Revenue, Total Ad Spend, and Blended ROAS. These give you an at-a-glance read before diving into per-campaign detail." },
      { type: "h2", text: "The campaign table" },
      { type: "p", text: "Each row in the table represents one active campaign. Columns include:" },
      { type: "ul", items: [
        "Campaign — the Meta campaign name, with a 7-day lead trend sparkline showing recent momentum.",
        "Leads — total leads received in the selected period.",
        "Booked — leads that resulted in a ServiceTitan job or booking.",
        "Booking Rate — percentage of leads that converted to bookings. Green ≥ 50%, amber 25–49%, red < 25%.",
        "Revenue — total invoiced revenue from jobs booked via this campaign.",
        "Avg Job — average revenue per booked job.",
        "Ad Spend — your Meta ad spend for this campaign during the period. Click to edit.",
        "ROAS — Return on Ad Spend (Revenue ÷ Ad Spend). Green ≥ 3x, amber 1–2.9x, red < 1x.",
        "CAPI Events — number of conversion signals fired to Meta (Lead, Schedule, Purchase).",
        "Status — whether the campaign is Active or Paused.",
      ]},
      { type: "note", text: "The Totals row at the bottom of the table shows the sum across all campaigns, with a blended ROAS calculated from total revenue and total ad spend." },
      { type: "h2", text: "What is ROAS?" },
      { type: "p", text: "ROAS (Return on Ad Spend) tells you how much revenue you generated for every dollar spent on Meta ads. A 3x ROAS means every $1 in ad spend produced $3 in booked revenue." },
      { type: "ul", items: [
        "ROAS ≥ 3x — strong. Your campaigns are generating significant revenue relative to spend.",
        "ROAS 1–2.9x — moderate. You're profitable but there may be room to optimize targeting or improve booking rate.",
        "ROAS < 1x — below break-even. The campaign may need creative refresh, targeting adjustments, or landing page work.",
        "No ROAS shown (—) — you haven't entered ad spend for this period yet.",
      ]},
      { type: "tip", text: "ROAS improves as more jobs close and Formly sends more Purchase CAPI events to Meta, helping Meta optimize for high-value leads automatically." },
      { type: "h2", text: "Entering ad spend" },
      { type: "p", text: "Formly doesn't automatically sync ad spend from Meta — you enter it manually so your ROAS calculation is accurate." },
      { type: "ol", items: [
        "In the Ad Spend column, click on any campaign row.",
        "Type the total spend amount for the selected period (e.g. 2450.00).",
        "Press Enter or click away — the value saves automatically.",
        "A checkmark appears briefly to confirm the save.",
        "The ROAS column updates immediately with the new calculation.",
      ]},
      { type: "note", text: "Ad spend is stored per calendar month. When you enter spend for 'Last 30 days', it saves to the current month's record. To track spend across multiple months separately, use the date filter to view each month individually." },
      { type: "h2", text: "Using the date filter" },
      { type: "p", text: "The date filter at the top of the dashboard controls which time period the campaign table shows. All metrics — leads, bookings, revenue, CAPI events — reflect the selected period." },
      { type: "ul", items: [
        "Today — shows today's leads only. Useful for monitoring a campaign launch.",
        "Last 7 / 30 / 90 days — rolling windows. Most useful for ongoing performance tracking.",
        "This year — year-to-date totals. Good for quarterly reviews.",
        "All time — every lead since you connected Formly.",
        "Custom range — pick any From/To date range. The selected range appears as a pill you can clear.",
      ]},
      { type: "h2", text: "Exporting your report" },
      { type: "p", text: "Click Export report above the campaign table to download a CSV file. The export includes:" },
      { type: "ul", items: [
        "A campaign summary section with all columns (leads, booked, booking rate, revenue, ad spend, ROAS, CAPI events).",
        "A daily lead breakdown section showing how many leads each campaign received per day during the selected period.",
        "The file is named formly-campaign-report-[start]-[end].csv for easy filing.",
      ]},
      { type: "tip", text: "Run exports at the end of each month with the 'This month' filter for a clean record. Use 'Custom range' to pull quarterly reports for client presentations." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return ARTICLES.filter((a) => a.categorySlug === categorySlug);
}
