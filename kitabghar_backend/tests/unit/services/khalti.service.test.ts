import { khaltiInitiate, khaltiLookup } from "../../../src/services/khalti.service";

const originalEnv = process.env;
const originalFetch = global.fetch;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  global.fetch = jest.fn();
});

afterEach(() => {
  process.env = originalEnv;
  global.fetch = originalFetch;
});

describe("khalti.service", () => {
  describe("khaltiInitiate", () => {
    it("throws a 500-flagged error when KHALTI_SECRET_KEY is not set", async () => {
      delete process.env.KHALTI_SECRET_KEY;
      // Re-import so the module re-reads process.env at load time
      jest.isolateModules(() => {
        const { khaltiInitiate: freshInitiate } = require("../../../src/services/khalti.service");
        return expect(
          freshInitiate({
            return_url: "https://kitabghar.com/purchases/callback",
            website_url: "https://kitabghar.com",
            amount: 50000,
            purchase_order_id: "order-1",
            purchase_order_name: "Clean Code",
            customer_info: { name: "Sanjeev", email: "sanjeev@example.com" },
          })
        ).rejects.toMatchObject({
          message: "Khalti is not configured on the server",
          status: 500,
        });
      });
    });

    it("returns pidx and payment_url when Khalti responds successfully", async () => {
      process.env.KHALTI_SECRET_KEY = "test-secret-key";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          pidx: "test-pidx",
          payment_url: "https://test-pay.khalti.com/?pidx=test-pidx",
        }),
      });

      jest.isolateModules(async () => {
        const { khaltiInitiate: freshInitiate } = require("../../../src/services/khalti.service");
        const result = await freshInitiate({
          return_url: "https://kitabghar.com/purchases/callback",
          website_url: "https://kitabghar.com",
          amount: 50000,
          purchase_order_id: "order-1",
          purchase_order_name: "Clean Code",
          customer_info: { name: "Sanjeev", email: "sanjeev@example.com" },
        });
        expect(result).toEqual({
          pidx: "test-pidx",
          payment_url: "https://test-pay.khalti.com/?pidx=test-pidx",
        });
      });
    });

    it("throws with Khalti's own error detail when the request fails", async () => {
      process.env.KHALTI_SECRET_KEY = "test-secret-key";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Invalid amount" }),
      });

      jest.isolateModules(() => {
        const { khaltiInitiate: freshInitiate } = require("../../../src/services/khalti.service");
        return expect(
          freshInitiate({
            return_url: "https://kitabghar.com/purchases/callback",
            website_url: "https://kitabghar.com",
            amount: -1,
            purchase_order_id: "order-1",
            purchase_order_name: "Clean Code",
            customer_info: { name: "Sanjeev", email: "sanjeev@example.com" },
          })
        ).rejects.toMatchObject({ message: "Invalid amount", status: 400 });
      });
    });
  });

  describe("khaltiLookup", () => {
    it("throws a 500-flagged error when KHALTI_SECRET_KEY is not set", async () => {
      delete process.env.KHALTI_SECRET_KEY;

      jest.isolateModules(() => {
        const { khaltiLookup: freshLookup } = require("../../../src/services/khalti.service");
        return expect(freshLookup("test-pidx")).rejects.toMatchObject({
          message: "Khalti is not configured on the server",
          status: 500,
        });
      });
    });

    it("returns the full lookup result when Khalti responds successfully", async () => {
      process.env.KHALTI_SECRET_KEY = "test-secret-key";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          pidx: "test-pidx",
          status: "Completed",
          transaction_id: "txn-123",
          total_amount: 50000,
        }),
      });

      jest.isolateModules(async () => {
        const { khaltiLookup: freshLookup } = require("../../../src/services/khalti.service");
        const result = await freshLookup("test-pidx");
        expect(result).toEqual({
          pidx: "test-pidx",
          status: "Completed",
          transaction_id: "txn-123",
          total_amount: 50000,
        });
      });
    });

    it("throws with Khalti's own error detail when the pidx is invalid", async () => {
      process.env.KHALTI_SECRET_KEY = "test-secret-key";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Invalid pidx" }),
      });

      jest.isolateModules(() => {
        const { khaltiLookup: freshLookup } = require("../../../src/services/khalti.service");
        return expect(freshLookup("bad-pidx")).rejects.toMatchObject({
          message: "Invalid pidx",
          status: 400,
        });
      });
    });
  });
});