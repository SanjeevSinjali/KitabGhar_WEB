import Payment from "../models/payment.model";

export async function createPendingPayment(data: {
  pidx: string;
  buyer: string;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
  amount: number;
  purchaseOrderId: string;
}) {
  return Payment.create({ ...data, status: "Initiated" });
}

export async function findPaymentByPidx(pidx: string) {
  return Payment.findOne({ pidx });
}

export async function updatePaymentStatus(pidx: string, status: string, transactionId?: string | null) {
  return Payment.findOneAndUpdate(
    { pidx },
    { status, ...(transactionId ? { transactionId } : {}) },
    { new: true }
  );
}