import { Request, Response } from "express";
import {
  purchaseBook,
  getPurchases,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../../../src/controllers/purchase.controller";
import {
  buyBook,
  listPurchases,
  initiateKhaltiPurchase,
  confirmKhaltiPurchase,
} from "../../../src/services/purchase.service";

jest.mock("../../../src/services/purchase.service");

const mockedBuyBook = buyBook as jest.Mock;
const mockedListPurchases = listPurchases as jest.Mock;
const mockedInitiateKhaltiPurchase = initiateKhaltiPurchase as jest.Mock;
const mockedConfirmKhaltiPurchase = confirmKhaltiPurchase as jest.Mock;

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function mockReq(body: Record<string, unknown> = {}, user: Record<string, unknown> = {}) {
  return { body, user } as unknown as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("purchase.controller", () => {
  describe("purchaseBook", () => {
    it("returns 201 with the purchase on success", async () => {
      const req = mockReq(
        { bookId: "b1", title: "Clean Code", author: "R. Martin", price: "500", image: "/x.jpg", condition: "Good" },
        { id: "u1", name: "Sanjeev" }
      );
      const res = mockRes();
      mockedBuyBook.mockResolvedValue({ _id: "p1", title: "Clean Code" });

      await purchaseBook(req, res);

      expect(mockedBuyBook).toHaveBeenCalledWith("u1", "Sanjeev", {
        bookId: "b1",
        title: "Clean Code",
        author: "R. Martin",
        price: "500",
        image: "/x.jpg",
        condition: "Good",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Purchase successful" })
      );
    });

    it("returns 400 when bookId is missing", async () => {
      const req = mockReq({ title: "Clean Code" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();

      await purchaseBook(req, res);

      expect(mockedBuyBook).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when title is missing", async () => {
      const req = mockReq({ bookId: "b1" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();

      await purchaseBook(req, res);

      expect(mockedBuyBook).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("uses the error's own status and message when the service throws a flagged error", async () => {
      const req = mockReq({ bookId: "b1", title: "Clean Code" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();
      mockedBuyBook.mockRejectedValue(
        Object.assign(new Error("This book has already been sold."), { status: 400 })
      );

      await purchaseBook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "This book has already been sold." })
      );
    });

    it("defaults to 500 when the service throws a plain error with no status", async () => {
      const req = mockReq({ bookId: "b1", title: "Clean Code" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();
      mockedBuyBook.mockRejectedValue(new Error("Unexpected failure"));

      await purchaseBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPurchases", () => {
    it("returns 200 with the user's purchases on success", async () => {
      const req = mockReq({}, { id: "u1" });
      const res = mockRes();
      mockedListPurchases.mockResolvedValue([{ _id: "p1" }, { _id: "p2" }]);

      await getPurchases(req, res);

      expect(mockedListPurchases).toHaveBeenCalledWith("u1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Purchases retrieved successfully" })
      );
    });

    it("returns an error response when the service throws", async () => {
      const req = mockReq({}, { id: "u1" });
      const res = mockRes();
      mockedListPurchases.mockRejectedValue(new Error("Database unavailable"));

      await getPurchases(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Database unavailable" })
      );
    });
  });

  describe("initiateKhaltiPayment", () => {
    it("returns 200 with pidx/payment_url on success", async () => {
      const req = mockReq(
        { bookId: "b1", title: "Clean Code", author: "R. Martin", price: "500", image: "/x.jpg", condition: "Good" },
        { id: "u1", email: "sanjeev@example.com", phone: undefined }
      );
      const res = mockRes();
      mockedInitiateKhaltiPurchase.mockResolvedValue({
        pidx: "test-pidx",
        payment_url: "https://test-pay.khalti.com/?pidx=test-pidx",
      });

      await initiateKhaltiPayment(req, res);

      expect(mockedInitiateKhaltiPurchase).toHaveBeenCalledWith(
        "u1",
        "sanjeev@example.com",
        undefined,
        { bookId: "b1", title: "Clean Code", author: "R. Martin", price: "500", image: "/x.jpg", condition: "Good" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Payment initiated" })
      );
    });

    it("returns 400 when price is missing", async () => {
      const req = mockReq({ bookId: "b1", title: "Clean Code" }, { id: "u1", email: "sanjeev@example.com" });
      const res = mockRes();

      await initiateKhaltiPayment(req, res);

      expect(mockedInitiateKhaltiPurchase).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 500 when Khalti is not configured on the server", async () => {
      const req = mockReq(
        { bookId: "b1", title: "Clean Code", price: "500" },
        { id: "u1", email: "sanjeev@example.com" }
      );
      const res = mockRes();
      mockedInitiateKhaltiPurchase.mockRejectedValue(
        Object.assign(new Error("Khalti is not configured on the server"), { status: 500 })
      );

      await initiateKhaltiPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Khalti is not configured on the server" })
      );
    });
  });

  describe("verifyKhaltiPayment", () => {
    it("returns 200 with the confirmed purchase on success", async () => {
      const req = mockReq({ pidx: "test-pidx" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();
      mockedConfirmKhaltiPurchase.mockResolvedValue({ _id: "p1", title: "Clean Code" });

      await verifyKhaltiPayment(req, res);

      expect(mockedConfirmKhaltiPurchase).toHaveBeenCalledWith("test-pidx", "u1", "Sanjeev");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Purchase confirmed" })
      );
    });

    it("returns 400 when pidx is missing", async () => {
      const req = mockReq({}, { id: "u1", name: "Sanjeev" });
      const res = mockRes();

      await verifyKhaltiPayment(req, res);

      expect(mockedConfirmKhaltiPurchase).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns the service's error when payment was not completed", async () => {
      const req = mockReq({ pidx: "test-pidx" }, { id: "u1", name: "Sanjeev" });
      const res = mockRes();
      mockedConfirmKhaltiPurchase.mockRejectedValue(
        Object.assign(new Error("Payment pending."), { status: 400 })
      );

      await verifyKhaltiPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Payment pending." })
      );
    });
  });
});