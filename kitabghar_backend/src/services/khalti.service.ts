const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY as string;

interface InitiatePayload {
  return_url: string;
  website_url: string;
  amount: number; // paisa
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: { name: string; email?: string; phone?: string };
}

function extractKhaltiError(data: any): string {
  if (!data) return "Unknown Khalti error";
  if (data.detail) return data.detail;
  // Validation errors look like { "return_url": ["This field may not be blank."], "error_key": "validation_error" }
  const fieldErrors = Object.entries(data)
    .filter(([key]) => key !== "error_key")
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join(" | ");
  return fieldErrors || "Unknown Khalti error";
}

export async function khaltiInitiate(payload: InitiatePayload) {
  if (!KHALTI_SECRET_KEY) {
    throw Object.assign(new Error("KHALTI_SECRET_KEY is not set in the backend .env file."), { status: 500 });
  }

  const res = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Khalti initiate error:", JSON.stringify(data, null, 2));
    throw Object.assign(new Error(extractKhaltiError(data)), { status: res.status });
  }
  return data as { pidx: string; payment_url: string; expires_at: string; expires_in: number };
}

export async function khaltiLookup(pidx: string) {
  const res = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Khalti lookup error:", JSON.stringify(data, null, 2));
    throw Object.assign(new Error(extractKhaltiError(data)), { status: res.status });
  }
  return data as {
    pidx: string;
    total_amount: number;
    status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled";
    transaction_id: string | null;
  };
}