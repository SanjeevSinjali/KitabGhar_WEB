import {
  buyBook,
  listPurchases,
  initiateKhaltiPurchase,
  confirmKhaltiPurchase,
} from "../../../src/services/purchase.service";
import {
  createPurchase,
  findPurchasesByBuyer,
  findBookById,
  markBookSoldIfActive,
} from "../../../src/repositories/purchase.repository";
import { removeWishlistEntry } from "../../../src/repositories/wishlist.repository";
import { notifyBookSold, notifyPaymentCompleted } from "../../../src/services/notification.service";
import { khaltiInitiate, khaltiLookup } from "../../../src/services/khalti.service";
import {
  createPendingPayment,
  findPaymentByPidx,
  updatePaymentStatus,
} from "../../../src/repositories/payment.repository";

jest.mock("../../../src/repositories/purchase.repository");
jest.mock("../../../src/repositories/wishlist.repository");
jest.mock("../../../src/services/notification.service");
jest.mock("../../../src/services/khalti.service");
jest.mock("../../../src/repositories/payment.repository");

const mockedCreatePurchase = createPurchase as jest.Mock;
const mockedFindPurchasesByBuyer = findPurchasesByBuyer as jest.Mock;
const mockedFindBookById = findBookById as jest.Mock;
const mockedMarkBookSoldIfActive = markBookSoldIfActive as jest.Mock;
const mockedRemoveWishlistEntry = removeWishlistEntry as jest.Mock;
const mockedNotifyBookSold = notifyBookSold as jest.Mock;
const mockedNotifyPaymentCompleted = notifyPaymentCompleted as jest.Mock;
const mockedKhaltiInitiate = khaltiInitiate as jest.Mock;
const mockedKhaltiLookup = khaltiLookup as jest.Mock;
const mockedCreatePendingPayment = createPendingPayment as jest.Mock;
const mockedFindPaymentByPidx = findPaymentByPidx as jest.Mock;
const mockedUpdatePaymentStatus = updatePaymentStatus as jest.Mock;

const tData = {
  bookId: "book-1",
  title: "Clean Code",
  author: "Robert C. Martin",
  price: "500",
  image: "/books/clean-code.jpg",
  condition: "Good",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("purchase.service", () => {
  describe("buyBook", () => {
    it("throws when the buyer tries to buy their own listing", async () => {
      mockedFindBookById.mockReturnValue({
        then: undefined,
        catch: (fn: any) => Promise.resolve({ seller: "buyer-1" }),
      });
      // findBookById(...).catch(...) — simulate a resolved book directly
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "buyer-1" }),
      } as any);

      await expect(
        buyBook("buyer-1", "Sanjeev", tData)
      ).rejects.toMatchObject({ message: "You can't buy your own listing.", status: 400 });

      expect(mockedMarkBookSoldIfActive).not.toHaveBeenCalled();
    });

    it("throws when the book has already been sold (atomic check fails)", async () => {
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "other-seller" }),
      } as any);
      mockedMarkBookSoldIfActive.mockResolvedValue(null);

      await expect(
        buyBook("buyer-1", "Sanjeev", tData)
      ).rejects.toMatchObject({ message: "This book has already been sold.", status: 400 });

      expect(mockedCreatePurchase).not.toHaveBeenCalled();
    });

    it("creates the purchase, removes the wishlist entry, and notifies the seller on success", async () => {
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "seller-1" }),
      } as any);
      mockedMarkBookSoldIfActive.mockResolvedValue({ seller: "seller-1" });
      mockedRemoveWishlistEntry.mockResolvedValue(undefined);
      mockedCreatePurchase.mockResolvedValue({ _id: "p1", ...tData });

      const result = await buyBook("buyer-1", "Sanjeev", tData);

      expect(mockedRemoveWishlistEntry).toHaveBeenCalledWith("buyer-1", "book-1");
      expect(mockedCreatePurchase).toHaveBeenCalledWith("buyer-1", tData);
      expect(mockedNotifyBookSold).toHaveBeenCalledWith("seller-1", "Sanjeev", "Clean Code", "500");
      expect(result).toEqual({ _id: "p1", ...tData });
    });

    it("does not notify the seller when buyer and seller happen to be the same after all (defensive check)", async () => {
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "buyer-1" }),
      } as any);
      // Force past the initial ownership check by having findBookById initially
      // resolve to null (book somehow not found by that lookup), then let
      // markBookSoldIfActive report the seller matches the buyer.
      mockedFindBookById.mockReturnValueOnce({
        catch: () => Promise.resolve(null),
      } as any);
      mockedMarkBookSoldIfActive.mockResolvedValue({ seller: "buyer-1" });
      mockedRemoveWishlistEntry.mockResolvedValue(undefined);
      mockedCreatePurchase.mockResolvedValue({ _id: "p1", ...tData });

      await buyBook("buyer-1", "Sanjeev", tData);

      expect(mockedNotifyBookSold).not.toHaveBeenCalled();
    });

    it("still creates the purchase when the book can't be found at all (existingBook is null)", async () => {
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve(null),
      } as any);
      mockedRemoveWishlistEntry.mockResolvedValue(undefined);
      mockedCreatePurchase.mockResolvedValue({ _id: "p1", ...tData });

      const result = await buyBook("buyer-1", "Sanjeev", tData);

      expect(mockedMarkBookSoldIfActive).not.toHaveBeenCalled();
      expect(mockedNotifyBookSold).not.toHaveBeenCalled();
      expect(result).toEqual({ _id: "p1", ...tData });
    });

    it("does not fail the whole purchase if removing the wishlist entry errors", async () => {
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "seller-1" }),
      } as any);
      mockedMarkBookSoldIfActive.mockResolvedValue({ seller: "seller-1" });
      mockedRemoveWishlistEntry.mockRejectedValue(new Error("not found"));
      mockedCreatePurchase.mockResolvedValue({ _id: "p1", ...tData });

      const result = await buyBook("buyer-1", "Sanjeev", tData);

      expect(result).toEqual({ _id: "p1", ...tData });
    });
  });

  describe("listPurchases", () => {
    it("delegates directly to findPurchasesByBuyer", async () => {
      mockedFindPurchasesByBuyer.mockResolvedValue([{ _id: "p1" }]);

      const result = await listPurchases("buyer-1");

      expect(mockedFindPurchasesByBuyer).toHaveBeenCalledWith("buyer-1");
      expect(result).toEqual([{ _id: "p1" }]);
    });
  });

  describe("initiateKhaltiPurchase", () => {
    it("throws when the book is no longer available", async () => {
      mockedFindBookById.mockResolvedValue({ status: "Sold", seller: "seller-1" });

      await expect(
        initiateKhaltiPurchase("buyer-1", "buyer@example.com", undefined, tData)
      ).rejects.toMatchObject({ message: "This book is no longer available.", status: 400 });

      expect(mockedKhaltiInitiate).not.toHaveBeenCalled();
    });

    it("throws when the buyer tries to buy their own listing", async () => {
      mockedFindBookById.mockResolvedValue({ status: "Active", seller: "buyer-1" });

      await expect(
        initiateKhaltiPurchase("buyer-1", "buyer@example.com", undefined, tData)
      ).rejects.toMatchObject({ message: "You can't buy your own listing.", status: 400 });
    });

    it("throws on an invalid/unparseable price", async () => {
      mockedFindBookById.mockResolvedValue({ status: "Active", seller: "seller-1" });

      await expect(
        initiateKhaltiPurchase("buyer-1", "buyer@example.com", undefined, {
          ...tData,
          price: "not-a-number",
        })
      ).rejects.toMatchObject({ message: "Invalid price.", status: 400 });
    });

    it("converts price to paisa correctly and returns pidx + payment_url on success", async () => {
      mockedFindBookById.mockResolvedValue({ status: "Active", seller: "seller-1" });
      mockedKhaltiInitiate.mockResolvedValue({
        pidx: "test-pidx",
        payment_url: "https://test-pay.khalti.com/?pidx=test-pidx",
      });
      mockedCreatePendingPayment.mockResolvedValue(undefined);

      const result = await initiateKhaltiPurchase(
        "buyer-1",
        "buyer@example.com",
        "9800000000",
        { ...tData, price: "Rs. 500" }
      );

      expect(mockedKhaltiInitiate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50000 }) // Rs. 500 -> 50000 paisa
      );
      expect(mockedCreatePendingPayment).toHaveBeenCalledWith(
        expect.objectContaining({ pidx: "test-pidx", amount: 50000 })
      );
      expect(result).toEqual({
        pidx: "test-pidx",
        payment_url: "https://test-pay.khalti.com/?pidx=test-pidx",
      });
    });

    it("propagates the error when Khalti itself fails (e.g. not configured)", async () => {
      mockedFindBookById.mockResolvedValue({ status: "Active", seller: "seller-1" });
      mockedKhaltiInitiate.mockRejectedValue(
        Object.assign(new Error("Khalti is not configured on the server"), { status: 500 })
      );

      await expect(
        initiateKhaltiPurchase("buyer-1", "buyer@example.com", undefined, tData)
      ).rejects.toMatchObject({ message: "Khalti is not configured on the server", status: 500 });

      expect(mockedCreatePendingPayment).not.toHaveBeenCalled();
    });
  });

  describe("confirmKhaltiPurchase", () => {
    const tPayment = {
      pidx: "test-pidx",
      buyer: "buyer-1",
      bookId: "book-1",
      title: "Clean Code",
      author: "Robert C. Martin",
      price: "500",
      image: "/books/clean-code.jpg",
      condition: "Good",
      status: "Pending",
    };

    it("throws 404 when the payment record doesn't exist", async () => {
      mockedFindPaymentByPidx.mockResolvedValue(null);

      await expect(
        confirmKhaltiPurchase("test-pidx", "buyer-1", "Sanjeev")
      ).rejects.toMatchObject({ message: "Payment not found.", status: 404 });
    });

    it("throws 403 when the payment belongs to a different buyer", async () => {
      mockedFindPaymentByPidx.mockResolvedValue({ ...tPayment, buyer: "someone-else" });

      await expect(
        confirmKhaltiPurchase("test-pidx", "buyer-1", "Sanjeev")
      ).rejects.toMatchObject({ message: "Not authorized.", status: 403 });
    });

    it("returns the existing purchase directly if this payment was already completed (idempotent)", async () => {
      mockedFindPaymentByPidx.mockResolvedValue({ ...tPayment, status: "Completed" });
      mockedFindPurchasesByBuyer.mockResolvedValue([{ bookId: "book-1", _id: "already-purchased" }]);

      const result = await confirmKhaltiPurchase("test-pidx", "buyer-1", "Sanjeev");

      expect(result).toEqual({ bookId: "book-1", _id: "already-purchased" });
      expect(mockedKhaltiLookup).not.toHaveBeenCalled();
    });

    it("throws when Khalti reports the payment is not Completed", async () => {
      mockedFindPaymentByPidx.mockResolvedValue(tPayment);
      mockedKhaltiLookup.mockResolvedValue({ pidx: "test-pidx", status: "Pending" });
      mockedUpdatePaymentStatus.mockResolvedValue(undefined);

      await expect(
        confirmKhaltiPurchase("test-pidx", "buyer-1", "Sanjeev")
      ).rejects.toMatchObject({ message: "Payment pending.", status: 400 });

      expect(mockedUpdatePaymentStatus).toHaveBeenCalledWith("test-pidx", "Pending", undefined);
    });

    it("completes the purchase, notifies the buyer, and marks the payment Completed on success", async () => {
      mockedFindPaymentByPidx.mockResolvedValue(tPayment);
      mockedKhaltiLookup.mockResolvedValue({
        pidx: "test-pidx",
        status: "Completed",
        transaction_id: "txn-123",
      });
      mockedUpdatePaymentStatus.mockResolvedValue(undefined);
      mockedNotifyPaymentCompleted.mockResolvedValue(undefined);

      // buyBook's own dependencies, since confirmKhaltiPurchase calls it internally
      mockedFindBookById.mockReturnValue({
        catch: () => Promise.resolve({ seller: "seller-1" }),
      } as any);
      mockedMarkBookSoldIfActive.mockResolvedValue({ seller: "seller-1" });
      mockedRemoveWishlistEntry.mockResolvedValue(undefined);
      mockedCreatePurchase.mockResolvedValue({ _id: "p1", bookId: "book-1" });

      const result = await confirmKhaltiPurchase("test-pidx", "buyer-1", "Sanjeev");

      expect(mockedUpdatePaymentStatus).toHaveBeenCalledWith("test-pidx", "Completed", "txn-123");
      expect(mockedNotifyPaymentCompleted).toHaveBeenCalledWith(
        "buyer-1", "Sanjeev", "Clean Code", "500", "txn-123"
      );
      expect(result).toEqual({ _id: "p1", bookId: "book-1" });
    });
  });
});