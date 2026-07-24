import { adminOnly } from "../../../src/middleware/admin";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("adminOnly middleware", () => {
  const next = jest.fn();

  it("returns 401 if no user is attached to the request", () => {
    const req: any = {};
    const res = mockRes();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Not authorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if the user is not an admin", () => {
    const req: any = { user: { role: "user" } };
    const res = mockRes();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Admin access only" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when the user is an admin", () => {
    const req: any = { user: { role: "admin" } };
    const res = mockRes();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});