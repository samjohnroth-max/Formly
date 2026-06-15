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
  { city: "Dallas",       zip: "75201", lat: 32.785, lng: -96.800, streets: ["Oak Lawn Ave","Commerce St","Main St","Elm St"] },
  { city: "Dallas",       zip: "75214", lat: 32.823, lng: -96.755, streets: ["Gaston Ave","Abrams Rd","Peak St","Ross Ave"] },
  { city: "Plano",        zip: "75023", lat: 33.019, lng: -96.700, streets: ["Spring Creek Pkwy","Preston Rd","Independence Pkwy"] },
  { city: "Plano",        zip: "75075", lat: 32.985, lng: -96.716, streets: ["Avenue K","15th St","Park Blvd","Jupiter Rd"] },
  { city: "Irving",       zip: "75038", lat: 32.813, lng: -96.952, streets: ["Belt Line Rd","Story Rd","MacArthur Blvd"] },
  { city: "Garland",      zip: "75040", lat: 32.912, lng: -96.638, streets: ["Miller Rd","Garland Ave","Glenbrook Dr"] },
  { city: "Frisco",       zip: "75034", lat: 33.150, lng: -96.823, streets: ["Main St","Eldorado Pkwy","Preston Rd"] },
  { city: "Carrollton",   zip: "75006", lat: 32.953, lng: -96.890, streets: ["Beltline Rd","Marsh Ln","Trinity Mills Rd"] },
  { city: "McKinney",     zip: "75069", lat: 33.200, lng: -96.615, streets: ["Louisiana St","Eldorado Pkwy","Hunt St"] },
  { city: "Richardson",   zip: "75080", lat: 32.948, lng: -96.730, streets: ["Belt Line Rd","Campbell Rd","Arapaho Rd"] },
  { city: "Grand Prairie", zip: "75050", lat: 32.745, lng: -96.998, streets: ["Belt Line Rd","Pioneer Pkwy","Arkansas Ln"] },
  { city: "Mesquite",     zip: "75149", lat: 32.762, lng: -96.598, streets: ["Town East Blvd","Galloway Ave","Military Pkwy"] },
  { city: "Lewisville",   zip: "75067", lat: 33.046, lng: -96.994, streets: ["Round Grove Rd","Main St","Valley Ridge Blvd"] },
  { city: "Allen",        zip: "75013", lat: 33.103, lng: -96.670, streets: ["Exchange Pkwy","Main St","McDermott Dr"] },
  // Out-of-area: > 35 miles from Dallas center
  { city: "Fort Worth",   zip: "76101", lat: 32.725, lng: -97.321, streets: ["University Dr","Hulen St","Camp Bowie Blvd"], outOfArea: true },
  { city: "Denton",       zip: "76201", lat: 33.215, lng: -97.133, streets: ["Loop 288","Hickory St","Fort Worth Dr"], outOfArea: true },
  { city: "Waxahachie",   zip: "75165", lat: 32.389, lng: -96.846, streets: ["Highway 287","College St","Marvin Ave"], outOfArea: true },
];

const IN_AREA_LOCS = TX_LOCS.filter((l) => !l.outOfArea);
const OUT_LOCS = TX_LOCS.filter((l) => l.outOfArea);

const HVAC_INTERESTS   = ["AC tune-up","HVAC repair","Heating inspection","Air quality evaluation","Furnace repair","AC installation"];
const PLUMB_INTERESTS  = ["Plumbing repair","Leak detection","Water heater install","Drain cleaning","Pipe replacement"];
const ROOF_INTERESTS   = ["Roof inspection","Storm damage","Gutter cleaning","Shingle replacement","Free roof estimate"];

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

// Invoice values summing to exact revenue targets
// HVAC: 14 sold = $31,200  |  Plumbing: 7 sold = $8,400  |  Roofing: 3 sold = $12,600
const HVAC_SOLD_VALUES     = [2100, 2200, 2400, 2400, 1900, 2600, 2200, 1800, 2400, 2100, 2100, 2300, 2200, 2500];
const PLUMBING_SOLD_VALUES = [1200, 1100, 1300, 1200, 1200, 1100, 1300];
const ROOFING_SOLD_VALUES  = [4000, 4200, 4400];

// Deterministic day offsets from now — ensures data appears in all time filter windows:
// 3 today, 8 in 7d, 20 in 30d, 47 total
const HVAC_DAYS = [
  // today: 2
  0, 0,
  // days 1-6: 3
  1, 3, 5,
  // days 7-29: 8
  8, 12, 16, 19, 22, 24, 26, 28,
  // days 30-89: 15
  39, 42, 45, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 87, 89,
]; // total: 28

const PLUMBING_DAYS = [
  // today: 1
  0,
  // days 1-6: 1
  4,
  // days 7-29: 2
  11, 19,
  // days 30-89: 8
  31, 37, 43, 49, 55, 62, 70, 79,
]; // total: 12

const ROOFING_DAYS = [
  // days 1-6: 1
  5,
  // days 7-29: 2
  14, 23,
  // days 30-89: 4
  35, 50, 65, 80,
]; // total: 7

interface CampaignDef {
  id: string;
  destinationType: "BOOKING" | "LEAD" | "FOLLOWUP";
  interests: string[];
  days: number[];
  bookedCount: number;   // first N leads get stJobId + SUCCESS routing
  soldValues: number[];  // first M leads get invoiceValue (M = soldValues.length ≤ bookedCount)
  pendingCount: number;  // after bookedCount: pendingCount leads are PENDING
  outOfAreaIndices: number[];
}

export async function generateDemoLeads(
  db: PrismaClient,
  accountId: string,
  hvacId: string,
  plumbingId: string,
  roofingId: string
): Promise<void> {
  // Wipe existing demo leads and CAPI events
  const existingLeads = await db.lead.findMany({ where: { accountId }, select: { id: true } });
  if (existingLeads.length > 0) {
    await db.cAPIEvent.deleteMany({ where: { leadId: { in: existingLeads.map((l) => l.id) } } });
    await db.lead.deleteMany({ where: { accountId } });
  }

  const now = new Date();

  const campaignDefs: CampaignDef[] = [
    {
      id: hvacId,
      destinationType: "BOOKING",
      interests: HVAC_INTERESTS,
      days: HVAC_DAYS,
      bookedCount: 19,
      soldValues: HVAC_SOLD_VALUES,
      pendingCount: 4,
      outOfAreaIndices: [23, 24], // 2 FAILED HVAC leads are out-of-area
    },
    {
      id: plumbingId,
      destinationType: "LEAD",
      interests: PLUMB_INTERESTS,
      days: PLUMBING_DAYS,
      bookedCount: 9,
      soldValues: PLUMBING_SOLD_VALUES,
      pendingCount: 2,
      outOfAreaIndices: [11], // 1 FAILED Plumbing lead is out-of-area
    },
    {
      id: roofingId,
      destinationType: "FOLLOWUP",
      interests: ROOF_INTERESTS,
      days: ROOFING_DAYS,
      bookedCount: 4,
      soldValues: ROOFING_SOLD_VALUES,
      pendingCount: 2,
      outOfAreaIndices: [6],
    },
  ];

  for (const def of campaignDefs) {
    const count = def.days.length;

    for (let i = 0; i < count; i++) {
      const firstName = pick(FIRST);
      const lastName  = pick(LAST);

      const isOutOfArea = def.outOfAreaIndices.includes(i);
      const loc = isOutOfArea ? pick(OUT_LOCS) : pick(IN_AREA_LOCS);
      const streetNum = rnd(9800) + 100;
      const street = `${streetNum} ${pick(loc.streets)}`;

      const dayOffset  = def.days[i];
      const hoursOffset = dayOffset === 0 ? rnd(Math.max(1, now.getHours())) : rnd(23);
      const createdAt  = makeDate(now, dayOffset, hoursOffset);

      const isBooked = i < def.bookedCount;
      const isSold   = i < def.soldValues.length;
      const routingStatus: "SUCCESS" | "PENDING" | "FAILED" = isBooked
        ? "SUCCESS"
        : i < def.bookedCount + def.pendingCount
        ? "PENDING"
        : "FAILED";

      // All booked leads get stJobId regardless of campaign destination type
      const stJobId      = isBooked ? `ST-${rnd(90000) + 10000}` : null;
      const stCustomerId = isBooked ? `CUST-${rnd(90000) + 10000}` : null;
      const invoiceValue = isSold ? def.soldValues[i] : null;
      const bookingValue = isBooked ? (isSold ? def.soldValues[i] : rnd(2000) + 800) : null;
      const routingError = routingStatus === "FAILED"
        ? pick(["ServiceTitan API timeout", "Missing address field", "Duplicate lead — already routed"])
        : null;

      const metaLeadId = `meta_demo_${def.id.slice(-6)}_${i}_${Date.now()}_${rnd(9999)}`;
      const serviceInterest = pick(def.interests);

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
          campaignId: def.id,
          metaLeadId,
          metaAdId:    `ad_demo_${rnd(999999)}`,
          metaAdSetId: `adset_demo_${rnd(999999)}`,
          rawData:  formData,
          formData,
          firstName,
          lastName,
          email:  formData.email,
          phone:  formData.phone_number,
          zip:    loc.zip,
          city:   loc.city,
          state:  "TX",
          street,
          lat: loc.lat + (Math.random() - 0.5) * 0.05,
          lng: loc.lng + (Math.random() - 0.5) * 0.05,
          serviceInterest,
          routingStatus,
          routingError,
          routingAttempts: routingStatus === "FAILED" ? 3 : routingStatus === "SUCCESS" ? 1 : 0,
          stJobId,
          stCustomerId,
          stMatchedCustomer: isBooked && Math.random() > 0.6,
          addressComplete: true,
          bookingValue,
          invoiceValue,
          emailStatus: routingStatus === "SUCCESS" ? "SENT" : "PENDING",
          emailSentAt: routingStatus === "SUCCESS" ? new Date(createdAt.getTime() + 60000) : null,
          capiStatus: isBooked ? "SENT" : "PENDING",
          capiEventId: isBooked ? `formly_lead_${metaLeadId}` : null,
          createdAt,
          updatedAt: createdAt,
        },
      });

      if (isBooked) {
        // Lead event
        await db.cAPIEvent.create({
          data: {
            leadId: lead.id,
            eventName: "Lead",
            eventTime: createdAt,
            status: "SENT",
            metaEventId: `ftrace_l_${lead.id.slice(-8)}`,
            metaAdId: `ad_demo_${rnd(999999)}`,
            sentAt: new Date(createdAt.getTime() + 5000),
            createdAt,
          },
        });

        // Schedule event (appointment booked in ServiceTitan)
        await db.cAPIEvent.create({
          data: {
            leadId: lead.id,
            eventName: "Schedule",
            eventTime: new Date(createdAt.getTime() + 2 * 3600000),
            status: "SENT",
            metaEventId: `ftrace_s_${lead.id.slice(-8)}`,
            metaAdId: `ad_demo_${rnd(999999)}`,
            sentAt: new Date(createdAt.getTime() + 2 * 3600000 + 5000),
            createdAt,
          },
        });

        // Purchase event for sold leads
        if (invoiceValue) {
          await db.cAPIEvent.create({
            data: {
              leadId: lead.id,
              eventName: "Purchase",
              eventTime: new Date(createdAt.getTime() + 2 * 24 * 3600000),
              value: invoiceValue,
              currency: "USD",
              status: "SENT",
              metaEventId: `ftrace_p_${lead.id.slice(-8)}`,
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
