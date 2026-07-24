import { sendSuccess, sendError } from "../../../src/utils/apiResponse";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("apiResponse utils", () => {
  describe("sendSuccess", () => {
    it("defaults to status 200 and message 'Success'", () => {
      const res = mockRes();

      sendSuccess(res, { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Success", data: { id: 1 } });
    });

    it("uses a custom status and message when provided", () => {
      const res = mockRes();

      sendSuccess(res, { id: 1 }, "Created", 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Created", data: { id: 1 } });
    });

    it("includes pagination meta when provided", () => {
      const res = mockRes();
      const meta = { page: 1, limit: 10, total: 42, totalPages: 5 };

      sendSuccess(res, [], "OK", 200, meta);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "OK", data: [], meta });
    });

    it("omits meta entirely when not provided", () => {
      const res = mockRes();

      sendSuccess(res, []);

      const body = res.json.mock.calls[0][0];
      expect(body.meta).toBeUndefined();
    });
  });

  describe("sendError", () => {
    it("defaults to status 500 and message 'Error'", () => {
      const res = mockRes();

      sendError(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Error", data: null });
    });

    it("uses a custom message and status when provided", () => {
      const res = mockRes();

      sendError(res, "Not found", 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Not found", data: null });
    });
  });
});