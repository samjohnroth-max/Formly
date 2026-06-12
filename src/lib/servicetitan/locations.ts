import { stFetchJson } from "./client";
import type { STConnectionShape } from "@/types/db";

interface STLocationResponse {
  id: number;
}

interface STLocationPage {
  data: Array<{ id: number }>;
}

interface STAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Returns the first active location ID for a ServiceTitan customer, or null.
 * Used to reuse an existing location when matching an existing customer.
 */
export async function findCustomerLocation(
  connection: STConnectionShape,
  customerId: string
): Promise<string | null> {
  try {
    const res = await stFetchJson<STLocationPage>(
      connection,
      `/crm/v2/tenant/${connection.tenantId}/locations?customerId=${customerId}&active=true&pageSize=1`
    );
    const first = res.data?.[0];
    return first ? String(first.id) : null;
  } catch {
    return null;
  }
}

/**
 * Creates a new ServiceTitan location for a customer.
 * The location name signals to the CSR whether the address needs confirmation.
 */
export async function createSTLocation(
  connection: STConnectionShape,
  customerId: string,
  address: STAddress,
  locationName: string
): Promise<string> {
  const location = await stFetchJson<STLocationResponse>(
    connection,
    `/crm/v2/tenant/${connection.tenantId}/locations`,
    {
      method: "POST",
      body: JSON.stringify({
        customerId: Number(customerId),
        name: locationName,
        address,
      }),
    }
  );
  return String(location.id);
}
