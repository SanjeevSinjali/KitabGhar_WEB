import jwt from "jsonwebtoken";
import User from "../../../src/models/user.model";
import { protect } from "../../../src/middleware/auth";

jest.mock("jsonwebtoken");
jest.mock("../../../src/models/user.model", () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedUser = User as unknown as { findById: jest.Mock };

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("auth middleware - protect", () => {
  const next = jest.fn();

  it("returns 401 when no token is present in headers or cookies", async () => {
    const req: any = { headers: {}, cookies: {} };
    const res = mockRes();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, no token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer token fails verification", async () => {
    const req: any = { headers: { authorization: "Bearer bad-token" }, cookies: {} };
    const res = mockRes();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalid or expired" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user to the request and calls next() for a valid bearer token", async () => {
    const req: any = { headers: { authorization: "Bearer good-token" }, cookies: {} };
    const res = mockRes();
    const fakeUser = { _id: "user-1", name: "Alice" };

    mockedJwt.verify.mockReturnValue({ id: "user-1" } as any);
    mockedUser.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });

    await protect(req, res, next);

    expect(mockedUser.findById).toHaveBeenCalledWith("user-1");
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("reads the token from cookies when no Authorization header is present", async () => {
    const req: any = { headers: {}, cookies: { token: "cookie-token" } };
    const res = mockRes();
    const fakeUser = { _id: "user-2" };

    mockedJwt.verify.mockReturnValue({ id: "user-2" } as any);
    mockedUser.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });

    await protect(req, res, next);

    expect(mockedJwt.verify).toHaveBeenCalledWith("cookie-token", "test-jwt-secret");
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);
  });
});