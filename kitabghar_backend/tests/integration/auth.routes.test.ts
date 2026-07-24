import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/user.model";
import { connectTestDB, disconnectTestDB, clearTestDB } from "../setup/db";

const AUTH_URL = "/api/v1/auth";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Auth routes (integration)", () => {
  describe("POST /register", () => {
    it("registers a new user and returns a token + user payload", async () => {
      const res = await request(app).post(`${AUTH_URL}/register`).send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      });
      expect(typeof res.body.token).toBe("string");

      const userInDb = await User.findOne({ email: "john@example.com" }).select("+password");
      expect(userInDb).not.toBeNull();
      // password must be hashed, never stored in plaintext
      expect(userInDb!.password).not.toBe("password123");
    });

    it("rejects registration with a duplicate email", async () => {
      await request(app).post(`${AUTH_URL}/register`).send({
        name: "John Doe",
        email: "dup@example.com",
        password: "password123",
      });

      const res = await request(app).post(`${AUTH_URL}/register`).send({
        name: "Jane Doe",
        email: "dup@example.com",
        password: "password456",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already in use");
    });

    it("rejects an invalid payload with a 400 and validation message", async () => {
      const res = await request(app).post(`${AUTH_URL}/register`).send({
        name: "J",
        email: "not-an-email",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post(`${AUTH_URL}/register`).send({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
      });
    });

    it("logs in successfully with correct credentials", async () => {
      const res = await request(app).post(`${AUTH_URL}/login`).send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("login@example.com");
      expect(typeof res.body.token).toBe("string");
    });

    it("rejects an incorrect password", async () => {
      const res = await request(app).post(`${AUTH_URL}/login`).send({
        email: "login@example.com",
        password: "wrong-password",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("rejects an unknown email", async () => {
      const res = await request(app).post(`${AUTH_URL}/login`).send({
        email: "nouser@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /whoami", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).get(`${AUTH_URL}/whoami`);
      expect(res.status).toBe(401);
    });

    it("returns the current user's profile (without password) when authenticated", async () => {
      const registerRes = await request(app).post(`${AUTH_URL}/register`).send({
        name: "Whoami User",
        email: "whoami@example.com",
        password: "password123",
      });
      const token = registerRes.body.token;

      const res = await request(app).get(`${AUTH_URL}/whoami`).set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("whoami@example.com");
      expect(res.body.data.password).toBeUndefined();
    });

    it("returns 401 for a malformed/invalid token", async () => {
      const res = await request(app).get(`${AUTH_URL}/whoami`).set("Authorization", "Bearer not-a-real-token");
      expect(res.status).toBe(401);
    });
  });
});