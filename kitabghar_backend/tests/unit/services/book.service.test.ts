import jwt from "jsonwebtoken";
import * as userRepository from "../../../src/repositories/user.repository";
import { registerService, loginService } from "../../../src/services/user.service";

jest.mock("../../../src/repositories/user.repository");

const mockedRepo = userRepository as jest.Mocked<typeof userRepository>;

describe("user.service", () => {
  describe("registerService", () => {
    it("throws if the email is already registered", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue({ _id: "existing-id" } as any);

      await expect(
        registerService({ name: "Alice", email: "alice@example.com", password: "password1" })
      ).rejects.toThrow("Email already in use");

      expect(mockedRepo.createUser).not.toHaveBeenCalled();
    });

    it("hashes the password, creates the user, and returns a signed token", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue(null);
      mockedRepo.createUser.mockResolvedValue({
        _id: "new-user-id",
        name: "Alice",
        email: "alice@example.com",
        role: "user",
      } as any);

      const result = await registerService({
        name: "Alice",
        email: "alice@example.com",
        password: "password1",
      });

      // password must have been hashed before being persisted
      const [, , hashedPasswordArg] = mockedRepo.createUser.mock.calls[0];
      expect(hashedPasswordArg).not.toBe("password1");
      expect(mockedRepo.createUser).toHaveBeenCalledWith("Alice", "alice@example.com", expect.any(String));

      expect(result.user).toEqual({
        id: "new-user-id",
        name: "Alice",
        email: "alice@example.com",
        role: "user",
      });

      const decoded = jwt.verify(result.token, "test-jwt-secret") as { id: string };
      expect(decoded.id).toBe("new-user-id");
    });
  });

  describe("loginService", () => {
    it("throws when no user exists for the given email", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue(null);

      await expect(
        loginService({ email: "missing@example.com", password: "whatever" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("throws when the password does not match", async () => {
      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash("correct-password", 4);

      mockedRepo.findUserByEmail.mockResolvedValue({
        _id: "1",
        name: "Bob",
        email: "bob@example.com",
        role: "user",
        password: hashed,
      } as any);

      await expect(
        loginService({ email: "bob@example.com", password: "wrong-password" })
      ).rejects.toThrow("Invalid email or password");
    });

    it("returns a token and user payload for correct credentials", async () => {
      const bcrypt = await import("bcryptjs");
      const hashed = await bcrypt.hash("correct-password", 4);

      mockedRepo.findUserByEmail.mockResolvedValue({
        _id: "1",
        name: "Bob",
        email: "bob@example.com",
        role: "user",
        password: hashed,
      } as any);

      const result = await loginService({ email: "bob@example.com", password: "correct-password" });

      expect(result.user).toEqual({ id: "1", name: "Bob", email: "bob@example.com", role: "user" });
      expect(typeof result.token).toBe("string");
    });
  });
});