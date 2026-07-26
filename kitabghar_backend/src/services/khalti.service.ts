/**
 * Server-to-server calls to Khalti's ePayment API (v2).
 * Docs: https://docs.khalti.com/khalti-epayment/
 */

const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface KhaltiInitiateParams {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info: CustomerInfo;
}

interface KhaltiInitiateResult {
  pidx: string;
  payment_url: string;
}

interface KhaltiLookupResult {
  pidx: string;
  status: string;
  transaction_id?: string;
  total_amount?: number;
}

export async function khaltiInitiate(
  params: KhaltiInitiateParams
): Promise<KhaltiInitiateResult> {
  if (!KHALTI_SECRET_KEY) {
    throw Object.assign(new Error("Khalti is not configured on the server"), {
      status: 500,
    });
  }

  const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(data?.detail || "Failed to initiate Khalti payment"),
      { status: 400 }
    );
  }

  return { pidx: data.pidx, payment_url: data.payment_url };
}

export async function khaltiLookup(pidx: string): Promise<KhaltiLookupResult> {
  if (!KHALTI_SECRET_KEY) {
    throw Object.assign(new Error("Khalti is not configured on the server"), {
      status: 500,
    });
  }

  const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(data?.detail || "Failed to verify Khalti payment"),
      { status: 400 }
    );
  }

  return data;
}