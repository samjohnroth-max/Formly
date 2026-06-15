import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { generateDemoLeads } from "../src/lib/demo/generateLeads";

const db = new PrismaClient();

const DEMO_EMAIL = "demo@formly.io";
const DEMO_PASSWORD = "FormlyDemo2026";

const DEFAULT_TEMPLATES = [
  {
    name: "Lead Confirmation",
    subject: "We received your request, {{first_name}}!",
    body: `Hi {{first_name}},\n\nThanks for reaching out to {{company_name}}! We've received your request and our team will be in touch shortly.\n\nBest regards,\nThe {{company_name}} Team`,
  },
  {
    name: "Booking Confirmed",
    subject: "Your appointment is confirmed, {{first_name}}!",
    body: `Hi {{first_name}},\n\nGreat news — your appointment is confirmed!\n\nJob Number: {{job_number}}\nService: {{service_interest}}\n\nSee you soon!\nThe {{company_name}} Team`,
  },
  {
    name: "24hr Follow-Up",
    subject: "Still thinking it over, {{first_name}}?",
    body: `Hi {{first_name}},\n\nWe noticed you recently reached out and wanted to follow up.\n\nOur team is ready to help — give us a call or reply to this email.\n\nBest,\nThe {{company_name}} Team`,
  },
];

async function seedDevAccount() {
  const account = await db.account.upsert({
    where: { email: "dev@formly.app" },
    update: {},
    create: { email: "dev@formly.app", name: "Formly Dev", plan: "STARTER" },
  });

  for (const template of DEFAULT_TEMPLATES) {
    await db.emailTemplate.upsert({
      where: { accountId_name: { accountId: account.id, name: template.name } },
      update: { subject: template.subject, body: template.body },
      create: { accountId: account.id, name: template.name, subject: template.subject, body: template.body, isDefault: true },
    });
    console.log(`Seeded template: ${template.name}`);
  }
}

async function seedDemoAccount() {
  console.log("\nSeeding demo account…");

  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const account = await db.account.upsert({
    where: { email: DEMO_EMAIL },
    create: { name: "Apex Home Services (Demo)", email: DEMO_EMAIL, plan: "PRO", status: "ACTIVE" },
    update: {},
  });

  await db.user.upsert({
    where: { email: DEMO_EMAIL },
    create: { email: DEMO_EMAIL, name: "Demo User", password: passwordHash, role: "OWNER", accountId: account.id },
    update: { accountId: account.id },
  });

  const existingBrand = await db.brandSettings.findFirst({ where: { accountId: account.id, clientId: null } });
  if (!existingBrand) {
    await db.brandSettings.create({
      data: {
        accountId: account.id,
        clientId: null,
        companyName: "Apex Home Services",
        primaryColor: "#0F4C8F",
        secondaryColor: "#EEF4FF",
        logoUrl: "",
        fontFamily: "Inter",
        footerText: "Apex Home Services · Dallas, TX · (214) 555-0100",
      },
    });
  }

  await db.serviceArea.upsert({
    where: { accountId: account.id },
    create: { accountId: account.id, address: "1400 Commerce St, Dallas, TX 75201", lat: 32.7767, lng: -96.7970, radiusMiles: 35 },
    update: {},
  });

  // ── Email templates (stable) ──────────────────────────────────────────────

  const tpl1 = await db.emailTemplate.upsert({
    where: { accountId_name: { accountId: account.id, name: "Booking Confirmation" } },
    create: {
      accountId: account.id,
      name: "Booking Confirmation",
      subject: "Your appointment with Apex Home Services is confirmed ✓",
      body: "Hi {{first_name}},\n\nWe've received your request and will contact you within 2 hours to confirm your appointment window.\n\nApex Home Services · (214) 555-0100",
      blocks: JSON.stringify([
        { type: "header", content: "You're all set!" },
        { type: "text", content: "Our team will contact you within 2 hours to confirm your appointment." },
        { type: "button", content: "Call Us Now", url: "tel:2145550100", bgColor: "#0F4C8F" },
      ]),
    },
    update: {},
  });

  const tpl2 = await db.emailTemplate.upsert({
    where: { accountId_name: { accountId: account.id, name: "2-Hour Follow-up" } },
    create: {
      accountId: account.id,
      name: "2-Hour Follow-up",
      subject: "Still looking for a trusted home service provider?",
      body: "Hi there,\n\nWe noticed you requested information about our services a couple of hours ago. Our technicians are available today — give us a call!\n\nApex Home Services · (214) 555-0100",
      blocks: JSON.stringify([
        { type: "header", content: "We're still here for you." },
        { type: "text", content: "Our licensed technicians are available today — we'd love to earn your business." },
        { type: "button", content: "Schedule Now", url: "tel:2145550100", bgColor: "#1a5fad" },
      ]),
    },
    update: {},
  });

  const tpl3 = await db.emailTemplate.upsert({
    where: { accountId_name: { accountId: account.id, name: "Job Complete Review Request" } },
    create: {
      accountId: account.id,
      name: "Job Complete Review Request",
      subject: "How was your recent service from Apex Home Services?",
      body: "Hi {{first_name}},\n\nThank you for choosing Apex! We hope your recent service exceeded expectations. A Google review would mean the world to our team.\n\nApex Home Services Team",
      blocks: JSON.stringify([
        { type: "header", content: "Thank you for your business!" },
        { type: "text", content: "If you have 60 seconds, a Google review would mean the world to our team." },
        { type: "button", content: "Leave a Review", url: "https://g.page/r/demo", bgColor: "#0F4C8F" },
      ]),
    },
    update: {},
  });

  // ── Wipe existing demo-specific data for a clean reset ────────────────────
  console.log("Wiping existing demo data…");

  const existingLeads = await db.lead.findMany({ where: { accountId: account.id }, select: { id: true } });
  if (existingLeads.length > 0) {
    const leadIds = existingLeads.map((l) => l.id);
    await db.cAPIEvent.deleteMany({ where: { leadId: { in: leadIds } } });
    await db.lead.deleteMany({ where: { accountId: account.id } });
  }
  await db.monthlyAdSpend.deleteMany({ where: { campaign: { accountId: account.id } } });
  await db.fieldMapping.deleteMany({ where: { campaign: { accountId: account.id } } });
  await db.campaign.deleteMany({ where: { accountId: account.id } });
  await db.sTConnection.deleteMany({ where: { accountId: account.id } });
  await db.metaConnection.deleteMany({ where: { accountId: account.id } });
  await db.client.deleteMany({ where: { accountId: account.id } });

  // ── Create 3 clients ──────────────────────────────────────────────────────
  console.log("Creating clients and connections…");

  const hvacClient = await db.client.create({ data: { accountId: account.id, name: "Apex HVAC" } });
  const plumbingClient = await db.client.create({ data: { accountId: account.id, name: "Summit Plumbing" } });
  const roofingClient = await db.client.create({ data: { accountId: account.id, name: "Ridgeline Roofing" } });

  // ── Create 3 Meta connections (one per client) ────────────────────────────
  const hvacMeta = await db.metaConnection.create({
    data: {
      accountId: account.id,
      groupId: hvacClient.id,
      metaAccountId: "act_apex_hvac_2026",
      metaAccountName: "Apex HVAC",
      accessToken: "demo_access_token_not_real",
      pixelId: "987654321012345",
      datasetId: "demo_dataset_hvac",
      status: "ACTIVE",
    },
  });

  const plumbingMeta = await db.metaConnection.create({
    data: {
      accountId: account.id,
      groupId: plumbingClient.id,
      metaAccountId: "act_summit_plumbing_2026",
      metaAccountName: "Summit Plumbing",
      accessToken: "demo_access_token_not_real",
      pixelId: "987654321012346",
      datasetId: "demo_dataset_plumbing",
      status: "ACTIVE",
    },
  });

  const roofingMeta = await db.metaConnection.create({
    data: {
      accountId: account.id,
      groupId: roofingClient.id,
      metaAccountId: "act_ridgeline_roofing_2026",
      metaAccountName: "Ridgeline Roofing",
      accessToken: "demo_access_token_not_real",
      pixelId: "987654321012347",
      datasetId: "demo_dataset_roofing",
      status: "ACTIVE",
    },
  });

  // ── Create 3 ST connections (one per client) ──────────────────────────────
  const hvacST = await db.sTConnection.create({
    data: {
      accountId: account.id,
      groupId: hvacClient.id,
      tenantId: "demo_tenant_hvac",
      tenantName: "Apex HVAC",
      clientId: "demo_client_id_hvac",
      clientSecret: "demo_client_secret",
      appKey: "demo_app_key",
      status: "ACTIVE",
    },
  });

  const plumbingST = await db.sTConnection.create({
    data: {
      accountId: account.id,
      groupId: plumbingClient.id,
      tenantId: "demo_tenant_plumbing",
      tenantName: "Summit Plumbing",
      clientId: "demo_client_id_plumbing",
      clientSecret: "demo_client_secret",
      appKey: "demo_app_key",
      status: "ACTIVE",
    },
  });

  const roofingST = await db.sTConnection.create({
    data: {
      accountId: account.id,
      groupId: roofingClient.id,
      tenantId: "demo_tenant_roofing",
      tenantName: "Ridgeline Roofing",
      clientId: "demo_client_id_roofing",
      clientSecret: "demo_client_secret",
      appKey: "demo_app_key",
      status: "ACTIVE",
    },
  });

  // ── Create 3 campaigns ────────────────────────────────────────────────────
  console.log("Creating campaigns…");

  const hvac = await db.campaign.create({
    data: {
      accountId: account.id,
      metaConnectionId: hvacMeta.id,
      stConnectionId: hvacST.id,
      name: "Apex HVAC",
      metaFormId: "demo_form_hvac_2026",
      metaFormName: "Apex HVAC — Summer Deals 2026",
      metaAdAccountId: hvacMeta.metaAccountId,
      destinationType: "BOOKING",
      jobType: "HVAC Maintenance",
      businessUnit: "Residential HVAC",
      priority: "Normal",
      campaignTag: "meta-hvac-summer-2026",
      capiEnabled: true,
      emailTemplateId: tpl1.id,
      status: "ACTIVE",
      fieldMappings: {
        create: [
          { metaField: "full_name",       stField: "customer.name" },
          { metaField: "phone_number",    stField: "customer.phone" },
          { metaField: "email",           stField: "customer.email" },
          { metaField: "street_address",  stField: "location.street" },
          { metaField: "zip_code",        stField: "location.zip" },
          { metaField: "city",            stField: "location.city" },
          { metaField: "state",           stField: "location.state" },
          { metaField: "service_interest", stField: "job.notes" },
        ],
      },
    },
  });

  const plumbing = await db.campaign.create({
    data: {
      accountId: account.id,
      metaConnectionId: plumbingMeta.id,
      stConnectionId: plumbingST.id,
      name: "Summit Plumbing",
      metaFormId: "demo_form_plumbing_2026",
      metaFormName: "Summit Plumbing — Emergency Response Form",
      metaAdAccountId: plumbingMeta.metaAccountId,
      destinationType: "LEAD",
      campaignTag: "meta-plumbing-emergency-2026",
      capiEnabled: true,
      emailTemplateId: tpl2.id,
      status: "ACTIVE",
      fieldMappings: {
        create: [
          { metaField: "full_name",       stField: "customer.name" },
          { metaField: "phone_number",    stField: "customer.phone" },
          { metaField: "email",           stField: "customer.email" },
          { metaField: "zip_code",        stField: "location.zip" },
          { metaField: "service_interest", stField: "job.notes" },
        ],
      },
    },
  });

  const roofing = await db.campaign.create({
    data: {
      accountId: account.id,
      metaConnectionId: roofingMeta.id,
      stConnectionId: roofingST.id,
      name: "Ridgeline Roofing",
      metaFormId: "demo_form_roofing_2026",
      metaFormName: "Ridgeline Roofing — Free Estimate Form",
      metaAdAccountId: roofingMeta.metaAccountId,
      destinationType: "FOLLOWUP",
      followupDays: 3,
      campaignTag: "meta-roofing-estimate-2026",
      capiEnabled: true,
      emailTemplateId: tpl3.id,
      status: "ACTIVE",
      fieldMappings: {
        create: [
          { metaField: "full_name",      stField: "customer.name" },
          { metaField: "phone_number",   stField: "customer.phone" },
          { metaField: "email",          stField: "customer.email" },
          { metaField: "street_address", stField: "location.street" },
          { metaField: "zip_code",       stField: "location.zip" },
        ],
      },
    },
  });

  // ── Ad spend ──────────────────────────────────────────────────────────────
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  await db.monthlyAdSpend.create({ data: { campaignId: hvac.id,     month: currentMonth, spend: 2400 } });
  await db.monthlyAdSpend.create({ data: { campaignId: plumbing.id, month: currentMonth, spend: 800  } });
  await db.monthlyAdSpend.create({ data: { campaignId: roofing.id,  month: currentMonth, spend: 1200 } });

  // ── Generate leads ────────────────────────────────────────────────────────
  console.log("Generating 47 demo leads…");
  await generateDemoLeads(db, account.id, hvac.id, plumbing.id, roofing.id);

  console.log("\n✓ Demo account seeded:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Clients:  Apex HVAC · Summit Plumbing · Ridgeline Roofing`);
}

async function main() {
  await seedDevAccount();
  await seedDemoAccount();
}

main()
  .catch((err) => { console.error("Seed failed:", err); process.exit(1); })
  .finally(() => db.$disconnect());
