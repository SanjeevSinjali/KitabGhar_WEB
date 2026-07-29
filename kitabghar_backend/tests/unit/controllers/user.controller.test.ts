import { Request, Response } from "express";
import {
  register,
  login,
  googleAuth,
  whoami,
  updateProfile,
  requestPasswordChange,
  confirmPasswordChange,
  forgotPassword,
  resetPassword,
} from "../../../src/controllers/user.controller";
import { registerService, loginService, googleAuthService } from "../../../src/services/user.service";
import { notifyProfileUpdate, notifyPasswordReset } from "../../../src/services/notification.service";
import { sendPasswordChangeCode, sendForgotPasswordCode } from "../../../src/utils/mailer";
import User from "../../../src/models/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";

jest.mock("../../../src/services/user.service");
jest.mock("../../../src/services/notification.service");
jest.mock("../../../src/utils/mailer");
jest.mock("../../../src/models/user.model");
jest.mock("bcryptjs");

const mockedRegisterService = registerService as jest.Mock;
const mockedLoginService = loginService as jest.Mock;
const mockedGoogleAuthService = googleAuthService as jest.Mock;
const mockedNotifyProfileUpdate = notifyProfileUpdate as jest.Mock;
const mockedNotifyPasswordReset = notifyPasswordReset as jest.Mock;
const mockedSendPasswordChangeCode = sendPasswordChangeCode as jest.Mock;
const mockedSendForgotPasswordCode = sendForgotPasswordCode as jest.Mock;
const mockedBcryptCompare = bcrypt.compare as unknown as jest.Mock;
const mockedBcryptGenSalt = bcrypt.genSalt as unknown as jest.Mock;
const mockedBcryptHash = bcrypt.hash as unknown as jest.Mock;

const MockedUser = User as jest.Mocked<typeof User>;

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function mockReq(body: Record<string, unknown> = {}, user: Record<string, unknown> = {}) {
  return { body, user } as unknown as Request;
}

/** Mimics Mongoose's `.select()` chain: Model.findX(...).select(...) */
function selectChain(resolvedValue: unknown) {
  return { select: jest.fn().mockResolvedValue(resolvedValue) };
}

let randomIntSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockedBcryptGenSalt.mockResolvedValue("salt");
  mockedBcryptHash.mockResolvedValue("hashed-value");
  // Spy on just this one function of the real crypto module, rather than
  // auto-mocking the whole built-in module (which crashes test collection).
  randomIntSpy = jest.spyOn(crypto, "randomInt").mockReturnValue(123456 as any);
});

afterEach(() => {
  randomIntSpy.mockRestore();
});

describe("user.controller", () => {
  describe("register", () => {
    it("returns 201 with token + user on valid payload", async () => {
      const req = mockReq({ name: "Sanjeev", email: "sanjeev@example.com", password: "Password123!" });
      const res = mockRes();
      mockedRegisterService.mockResolvedValue({ token: "tok", user: { id: "u1" } });

      await register(req, res);

      expect(mockedRegisterService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 400 on an empty/invalid payload without calling the service", async () => {
      const req = mockReq({});
      const res = mockRes();

      await register(req, res);

      expect(mockedRegisterService).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("login", () => {
    it("returns 200 with token + user on valid credentials", async () => {
      const req = mockReq({ email: "sanjeev@example.com", password: "Password123!" });
      const res = mockRes();
      mockedLoginService.mockResolvedValue({ token: "tok", user: { id: "u1" } });

      await login(req, res);

      expect(mockedLoginService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 on an empty/invalid payload without calling the service", async () => {
      const req = mockReq({});
      const res = mockRes();

      await login(req, res);

      expect(mockedLoginService).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("googleAuth", () => {
    it("returns 200 with token + user for a valid ID token", async () => {
      const req = mockReq({ idToken: "valid-google-id-token" });
      const res = mockRes();
      mockedGoogleAuthService.mockResolvedValue({ token: "tok", user: { id: "u1" } });

      await googleAuth(req, res);

      expect(mockedGoogleAuthService).toHaveBeenCalledWith("valid-google-id-token");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when idToken is missing", async () => {
      const req = mockReq({});
      const res = mockRes();

      await googleAuth(req, res);

      expect(mockedGoogleAuthService).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when googleAuthService throws (e.g. email already has a password account)", async () => {
      const req = mockReq({ idToken: "valid-google-id-token" });
      const res = mockRes();
      mockedGoogleAuthService.mockRejectedValue(
        new Error("An account with this email already exists. Please log in with your email and password instead.")
      );

      await googleAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("whoami", () => {
    it("returns 200 with the current user (no password) when found", async () => {
      const req = mockReq({}, { id: "u1" });
      const res = mockRes();
      MockedUser.findById = jest.fn().mockReturnValue(selectChain({ _id: "u1", name: "Sanjeev" }));

      await whoami(req, res);

      expect(MockedUser.findById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { _id: "u1", name: "Sanjeev" } })
      );
    });

    it("returns 404 when the user no longer exists", async () => {
      const req = mockReq({}, { id: "u1" });
      const res = mockRes();
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(null));

      await whoami(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("updateProfile", () => {
    it("updates name/email, saves, and fires a notification for a non-admin user", async () => {
      const req = mockReq({ name: "New Name" }, { id: "u1" }) as any;
      const res = mockRes();
      MockedUser.findById = jest
        .fn()
        .mockResolvedValue({ name: "Old Name", email: "old@example.com" });
      MockedUser.findByIdAndUpdate = jest.fn().mockReturnValue(
        selectChain({ _id: "u1", name: "New Name", role: "user" })
      );

      await updateProfile(req, res);

      expect(MockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        { name: "New Name" },
        { new: true, runValidators: true }
      );
      expect(mockedNotifyProfileUpdate).toHaveBeenCalledWith("u1", "New Name", ["name"]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("does not fire a notification for an admin user", async () => {
      const req = mockReq({ name: "New Name" }, { id: "u1" }) as any;
      const res = mockRes();
      MockedUser.findById = jest.fn().mockResolvedValue({ name: "Old Name" });
      MockedUser.findByIdAndUpdate = jest.fn().mockReturnValue(
        selectChain({ _id: "u1", name: "New Name", role: "admin" })
      );

      await updateProfile(req, res);

      expect(mockedNotifyProfileUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 when the user doesn't exist", async () => {
      const req = mockReq({ name: "New Name" }, { id: "u1" }) as any;
      const res = mockRes();
      MockedUser.findById = jest.fn().mockResolvedValue(null);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("requestPasswordChange", () => {
    it("sends a verification code when the current password is correct", async () => {
      const req = mockReq({ currentPassword: "correct-password" }, { id: "u1" });
      const res = mockRes();
      const userDoc = {
        email: "sanjeev@example.com",
        password: "hashed-real-password",
        save: jest.fn().mockResolvedValue(undefined),
      };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));
      mockedBcryptCompare.mockResolvedValue(true);

      await requestPasswordChange(req, res);

      expect(mockedSendPasswordChangeCode).toHaveBeenCalledWith("sanjeev@example.com", "123456");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when the current password is incorrect", async () => {
      const req = mockReq({ currentPassword: "wrong-password" }, { id: "u1" });
      const res = mockRes();
      const userDoc = { email: "sanjeev@example.com", password: "hashed-real-password" };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));
      mockedBcryptCompare.mockResolvedValue(false);

      await requestPasswordChange(req, res);

      expect(mockedSendPasswordChangeCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 for a Google-only account with no password set", async () => {
      const req = mockReq({ currentPassword: "anything" }, { id: "u1" });
      const res = mockRes();
      const userDoc = { email: "sanjeev@example.com", password: undefined };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));

      await requestPasswordChange(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("confirmPasswordChange", () => {
    it("updates the password when the code is valid and not expired", async () => {
      const req = mockReq({ code: "123456", newPassword: "NewPassword123!" }, { id: "u1" });
      const res = mockRes();
      const userDoc = {
        _id: "u1",
        name: "Sanjeev",
        role: "user",
        passwordChangeCode: "hashed-code",
        passwordChangeCodeExpires: new Date(Date.now() + 60_000),
        save: jest.fn().mockResolvedValue(undefined),
      };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));
      mockedBcryptCompare.mockResolvedValue(true);

      await confirmPasswordChange(req, res);

      expect(userDoc.save).toHaveBeenCalled();
      expect(mockedNotifyProfileUpdate).toHaveBeenCalledWith("u1", "Sanjeev", ["password"]);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when the code has expired", async () => {
      const req = mockReq({ code: "123456", newPassword: "NewPassword123!" }, { id: "u1" });
      const res = mockRes();
      const userDoc = {
        passwordChangeCode: "hashed-code",
        passwordChangeCodeExpires: new Date(Date.now() - 60_000),
      };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));

      await confirmPasswordChange(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when the code does not match", async () => {
      const req = mockReq({ code: "000000", newPassword: "NewPassword123!" }, { id: "u1" });
      const res = mockRes();
      const userDoc = {
        passwordChangeCode: "hashed-code",
        passwordChangeCodeExpires: new Date(Date.now() + 60_000),
      };
      MockedUser.findById = jest.fn().mockReturnValue(selectChain(userDoc));
      mockedBcryptCompare.mockResolvedValue(false);

      await confirmPasswordChange(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("forgotPassword", () => {
    it("returns a generic success message even when the email doesn't exist (no user enumeration)", async () => {
      const req = mockReq({ email: "nobody@example.com" });
      const res = mockRes();
      MockedUser.findOne = jest.fn().mockReturnValue(selectChain(null));

      await forgotPassword(req, res);

      expect(mockedSendForgotPasswordCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "If an account exists with that email, a reset code has been sent.",
        })
      );
    });

    it("sends a code and still returns the same generic message when the user exists", async () => {
      const req = mockReq({ email: "sanjeev@example.com" });
      const res = mockRes();
      const userDoc = {
        email: "sanjeev@example.com",
        password: "hashed-real-password",
        save: jest.fn().mockResolvedValue(undefined),
      };
      MockedUser.findOne = jest.fn().mockReturnValue(selectChain(userDoc));

      await forgotPassword(req, res);

      expect(mockedSendForgotPasswordCode).toHaveBeenCalledWith("sanjeev@example.com", "123456");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("resetPassword", () => {
    it("resets the password with a valid, unexpired code", async () => {
      const req = mockReq({ email: "sanjeev@example.com", code: "123456", newPassword: "NewPassword123!" });
      const res = mockRes();
      const userDoc = {
        _id: "u1",
        name: "Sanjeev",
        role: "user",
        passwordChangeCode: "hashed-code",
        passwordChangeCodeExpires: new Date(Date.now() + 60_000),
        save: jest.fn().mockResolvedValue(undefined),
      };
      MockedUser.findOne = jest.fn().mockReturnValue(selectChain(userDoc));
      mockedBcryptCompare.mockResolvedValue(true);

      await resetPassword(req, res);

      expect(userDoc.save).toHaveBeenCalled();
      expect(mockedNotifyPasswordReset).toHaveBeenCalledWith("u1", "Sanjeev");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when there is no pending code for that email", async () => {
      const req = mockReq({ email: "sanjeev@example.com", code: "123456", newPassword: "NewPassword123!" });
      const res = mockRes();
      MockedUser.findOne = jest.fn().mockReturnValue(selectChain(null));

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});