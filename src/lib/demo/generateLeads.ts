import type { PrismaClient } from "@prisma/client";

const FIRST = [
  "James","Maria","Robert","Jennifer","Michael","Jessica","David","Sarah","Thomas","Lisa",
  "Daniel","Ashley","Christopher","Amanda","Matthew","Emily","Andrew","Stephanie","Joshua",
  "Christina","Kevin","Rachel","Ryan","Lauren","Brandon","Megan","Tyler","Brittany","Justin","Samantha",
];
const LAST = [
  "Johnson","Smith","Williams","Jones","Brown","Davis","Miller","Wilson","Moore","Taylor",
  "Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson",
  "Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","Hernandez","King",
];
const PHONES = () => {
  const area = ["214","469","972","682","817","945"][rnd(6)];
  return `(${area}) ${rnd3()}-${rnd4()}`;
};
const rnd = (n: number) => Math.floor(Math.random() * n);
const rnd3 = () => String(rnd(900) + 100);
const rnd4 = () => String(rnd(9000) + 1000);
const pick = <T>(arr: T[]) => arr[rnd(arr.length)];

interface TXLoc {
  city: string;
  zip: string;
  lat: number;
  lng: number;
  streets: string[];
  outOfArea?: boolean;
}

const TX_LOCS: TXLoc[] = [
  { city: "Dallas",      zip: "75201", lat: 32.785, lng: -96.800, streets: ["Oak Lawn Ave","Commerce St","Main St","Elm St"] },
  { city: "Dallas",      zip: "75214", lat: 32.823, lng: -96.755, streets: ["Gaston Ave","Abrams Rd","Peak St","Ross Ave"] },
  { city: "Plano",       zip: "75023", lat: 33.019, lng: -96.700, streets: ["Spring Creek Pkwy","Preston Rd","Independence Pkwy"] },
  { city: "Plano",       zip: "75075", lat: 32.985, lng: -96.716, streets: ["Avenue K","15th St","Park Blvd","Jupiter Rd"] },
  { city: "Irving",      zip: "75038", lat: 32.813, lng: -96.952, streets: ["Belt Line Rd","Story Rd","MacArthur Blvd"] },
  { city: "Garland",     zip: "75040", lat: 32.912, lng: -96.638, streets: ["Miller Rd","Garland Ave","Glenbrook Dr"] },
  { city: "Frisco",      zip: "75034", lat: 33.150, lng: -96.823, streets: ["Main St","Eldorado Pkwy","Preston Rd"] },
  { city: "Carrollton",  zip: "75006", lat: 32.953, lng: -96.890, streets: ["Beltline Rd","Marsh Ln","Trinity Mills Rd"] },
  { city: "McKinney",    zip: "75069", lat: 33.200, lng: -96.615, streets: ["Louisiana St","Eldorado Pkwy","Hunt St"] },
  { city: "Richardson",  zip: "75080", lat: 32.948, lng: -96.730, streets: ["Belt Line Rd","Campbell Rd","Arapaho Rd"] },
  { city: "Grand Prairie",zip: "75050",lat: 32.745, lng: -96.998, streets: ["Belt Line Rd","Pioneer Pkwy","Arkansas Ln"] },
  { city: "Mesquite",    zip: "75149", lat: 32.762, lng: -96.598, streets: ["Town East Blvd","Galloway Ave","Military Pkwy"] },
  { city: "Lewisville",  zip: "75067", lat: 33.046, lng: -96.994, streets: ["Round Grove Rd","Main St","Valley Ridge Blvd"] },
  { city: "Allen",       zip: "75013", lat: 33.103, lng: -96.670, streets: ["Exchange Pkwy","Main St","McDermott Dr"] },
  // Out-of-area: > 35 miles from Dallas
  { city: "Fort Worth",  zip: "76101", lat: 32.725, lng: -97.321, streets: ["University Dr","Hulen St","Camp Bowie Blvd"], outOfArea: true },
  { city: "Denton",      zip: "76201", lat: 33.215, lng: -97.133, streets: ["Loop 288","Hickory St","Fort Worth Dr"], outOfArea: true },
  { city: "Waxahachie",  zip: "75165", lat: 32.389, lng: -96.846, streets: ["Highway 287","College St","Marvin Ave"], outOfArea: true },
];

const IN_AREA_LOCS = TX_LOCS.filter((l) => !l.outOfArea);
const OUT_LOCS = TX_LOCS.filter((l) => l.outOfArea);

const HVAC_INTERESTS = ["AC tune-up","HVAC repair","Heating inspection","Air quality evaluation","Furnace repair","AC installation"];
const PLUMB_INTERESTS = ["Plumbing repair","Leak detection","Water heater install","Drain cleaning","Pipe replacement"];
const ROOF_INTERESTS  = ["Roof inspection","Storm damage","Gutter cleaning","Shingle replacement","Free roof estimate"];

interface Campaign {
  id: string;
  destinationType: "BOOKING" | "LEAD" | "FOLLOWUP";
  count: number;
  interests: string[];
  successCount: number;
  pendingCount: number;
}

function makeDate(now: Date, daysAgo: number, hoursAgo = 0): Date {
  return new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 3600000);
}

function randomEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com","yahoo.com","outlook.com","icloud.com","hotmail.com"];
  const styles = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()[0]}`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${rnd(999)}`,
  ];
  return `${pick(styles)}@${pick(domains)}`;
}

export async function generateDemoLeads(
  db: PrismaClient,
  accountId: string,
  hvacId: string,
  plumbingId: string,
  roofingId: string
): Promise<void> {
  // Wipe existing demo leads (CAPI events cascade via onDelete in practice, but we'll handle manually)
  const existingLeads = await db.lead.findMany({ where: { accountId }, select: { id: true } });
  if (existingLeads.length > 0) {
    await db.cAPIEvent.deleteMany({ where: { leadId: { in: existingLeads.map((l) => l.id) } } });
    await db.lead.deleteMany({ where: { accountId } });
  }

  const now = new Date();

  const campaigns: Campaign[] = [
    { id: hvacId,     destinationType: "BOOKING",  count: 25, interests: HVAC_INTERESTS,  successCount: 22, pendingCount: 2 },
    { id: plumbingId, destinationType: "LEAD",     count: 14, interests: PLUMB_INTERESTS, successCount: 12, pendingCount: 2 },
    { id: roofingId,  destinationType: "FOLLOWUP", count: 8,  interests: ROOF_INTERESTS,  successCount: 6,  pendingCount: 1 },
  ];

  for (const campaign of campaigns) {
    const failedCount = campaign.count - campaign.successCount - campaign.pendingCount;

    for (let i = 0; i < campaign.count; i++) {
      const firstName = pick(FIRST);
      const lastName = pick(LAST);
      const isOutOfArea = i < 2 && campaign.id === hvacId; // first 2 HVAC leads out-of-area
      const loc = isOutOfArea ? pick(OUT_LOCS) : pick(IN_AREA_LOCS);
      const streetNum = rnd(9800) + 100;
      const street = `${streetNum} ${pick(loc.streets)}`;

      let routingStatus: "SUCCESS" | "PENDING" | "FAILED";
      if (i < campaign.successCount) {
        routingStatus = "SUCCESS";
      } else if (i < campaign.successCount + campaign.pendingCount) {
        routingStatus = "PENDING";
      } else {
        routingStatus = "FAILED";
      }

      const daysAgo = rnd(30);
      const hoursAgo = rnd(23);
      const createdAt = makeDate(now, daysAgo, hoursAgo);

      const metaLeadId = `meta_demo_${campaign.id.slice(-6)}_${i}_${Date.now()}_${rnd(9999)}`;
      const serviceInterest = pick(campaign.interests);

      const isBooking = campaign.destinationType === "BOOKING";
      const bookingValue = (isBooking && routingStatus === "SUCCESS") ? (rnd(4300) + 200) : null;
      const invoiceValue = (bookingValue && daysAgo > 3) ? (bookingValue * (0.9 + Math.random() * 0.2)) : null;

      const stJobId = (routingStatus === "SUCCESS" && isBooking) ? `ST-${rnd(90000) + 10000}` : null;
      const stLeadId = (routingStatus === "SUCCESS" && campaign.destinationType === "LEAD") ? `LEAD-${rnd(90000) + 10000}` : null;
      const stCustomerId = routingStatus === "SUCCESS" ? `CUST-${rnd(90000) + 10000}` : null;
      const routingError = routingStatus === "FAILED" ? pick(["ServiceTitan API timeout", "Missing address field — location.street not mapped", "Duplicate lead — already routed"]) : null;

      const formData = {
        full_name: `${firstName} ${lastName}`,
        phone_number: PHONES(),
        email: randomEmail(firstName, lastName),
        zip_code: loc.zip,
        street_address: street,
        city: loc.city,
        state: "TX",
        service_interest: serviceInterest,
        best_time: pick(["Morning (8am-12pm)","Afternoon (12pm-5pm)","Evening (5pm-8pm)","Anytime"]),
        home_ownership: pick(["Own","Rent"]),
      };

      const lead = await db.lead.create({
        data: {
          accountId,
          campaignId: campaign.id,
          metaLeadId,
          metaAdId: `ad_demo_${rnd(999999)}`,
          metaAdSetId: `adset_demo_${rnd(999999)}`,
          rawData: formData,
          formData,
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone_number,
          zip: loc.zip,
          city: loc.city,
          state: "TX",
          street,
          lat: loc.lat + (Math.random() - 0.5) * 0.05,
          lng: loc.lng + (Math.random() - 0.5) * 0.05,
          serviceInterest,
          routingStatus,
          routingError,
          routingAttempts: routingStatus === "FAILED" ? 3 : routingStatus === "SUCCESS" ? 1 : 0,
          stJobId,
          stLeadId,
          stCustomerId,
          stMatchedCustomer: routingStatus === "SUCCESS" && Math.random() > 0.6,
          addressComplete: true,
          bookingValue,
          invoiceValue: invoiceValue ? Math.round(invoiceValue) : null,
          emailStatus: routingStatus === "SUCCESS" ? "SENT" : "PENDING",
          emailSentAt: routingStatus === "SUCCESS" ? new Date(createdAt.getTime() + 60000) : null,
          capiStatus: routingStatus === "SUCCESS" ? "SENT" : "PENDING",
          capiEventId: routingStatus === "SUCCESS" ? `formly_lead_${metaLeadId}` : null,
          createdAt,
          updatedAt: createdAt,
        },
      });

      if (routingStatus === "SUCCESS") {
        await db.cAPIEvent.create({
          data: {
            leadId: lead.id,
            eventName: "Lead",
            eventTime: createdAt,
            status: "SENT",
            metaEventId: `ftrace_${lead.id.slice(-10)}`,
            metaAdId: `ad_demo_${rnd(999999)}`,
            sentAt: new Date(createdAt.getTime() + 5000),
            createdAt,
          },
        });

        if (invoiceValue && invoiceValue > 0) {
          await db.cAPIEvent.create({
            data: {
              leadId: lead.id,
              eventName: "Purchase",
              eventTime: new Date(createdAt.getTime() + 2 * 24 * 3600000),
              value: Math.round(invoiceValue),
              currency: "USD",
              status: "SENT",
              metaEventId: `ftrace_rev_${lead.id.slice(-10)}`,
              metaAdId: `ad_demo_${rnd(999999)}`,
              sentAt: new Date(createdAt.getTime() + 2 * 24 * 3600000 + 5000),
              createdAt,
            },
          });
        }
      }
    }
  }
}
