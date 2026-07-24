import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../../src/app";
import User from "../../src/models/user.model";
import Book from "../../src/models/book.model";
import { connectTestDB, disconnectTestDB, clearTestDB } from "../setup/db";

const BOOKS_URL = "/api/v1/books";

// Track files multer writes to disk during upload tests so we can clean
// them up afterwards instead of leaving test artifacts in public/books.
const uploadedImagePaths: string[] = [];

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  for (const relPath of uploadedImagePaths) {
    const fullPath = path.join(__dirname, "..", "..", relPath.replace(/^\//, ""));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  await disconnectTestDB();
});

async function registerAndLogin(email: string): Promise<string> {
  const res = await request(app).post("/api/v1/auth/register").send({
    name: "Seller",
    email,
    password: "password123",
  });
  return res.body.token as string;
}

describe("Book routes (integration)", () => {
  let token: string;
  let sellerId: string;

  beforeEach(async () => {
    token = await registerAndLogin("seller@example.com");
    const seller = await User.findOne({ email: "seller@example.com" });
    sellerId = String(seller!._id);
  });

  it("rejects all book routes without authentication", async () => {
    const res = await request(app).get(`${BOOKS_URL}/mine`);
    expect(res.status).toBe(401);
  });

  describe("POST /", () => {
    it("rejects listing creation when no image is attached", async () => {
      const res = await request(app)
        .post(BOOKS_URL)
        .set("Authorization", `Bearer ${token}`)
        .field("title", "Clean Code")
        .field("author", "Robert C. Martin")
        .field("price", "500");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Book image is required");
    });

    it("rejects listing creation when the payload fails validation", async () => {
      const res = await request(app)
        .post(BOOKS_URL)
        .set("Authorization", `Bearer ${token}`)
        .field("title", "C") // too short
        .field("author", "Robert C. Martin")
        .field("price", "500")
        .attach("image", Buffer.from([0xff, 0xd8, 0xff, 0xdb]), {
          filename: "cover.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(400);

      if (res.body.data?.image) uploadedImagePaths.push(res.body.data.image);
    });

    it("creates a book listing with an attached image", async () => {
      const res = await request(app)
        .post(BOOKS_URL)
        .set("Authorization", `Bearer ${token}`)
        .field("title", "Clean Code")
        .field("author", "Robert C. Martin")
        .field("price", "500")
        .field("condition", "Good")
        .field("category", "Academic")
        .attach("image", Buffer.from([0xff, 0xd8, 0xff, 0xdb]), {
          filename: "cover.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Clean Code");
      expect(res.body.data.source).toBe("user");
      expect(res.body.data.image).toMatch(/^\/books\//);

      uploadedImagePaths.push(res.body.data.image);
    });
  });

  describe("GET /featured", () => {
    it("only returns admin-sourced books and includes pagination meta", async () => {
      await Book.create({
        title: "Admin Book",
        author: "A",
        price: 100,
        image: "/books/a.jpg",
        seller: sellerId,
        source: "admin",
      });
      await Book.create({
        title: "User Book",
        author: "B",
        price: 200,
        image: "/books/b.jpg",
        seller: sellerId,
        source: "user",
      });

      const res = await request(app).get(`${BOOKS_URL}/featured`).set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Admin Book");
      expect(res.body.meta).toMatchObject({ page: 1, limit: 6, total: 1, totalPages: 1 });
    });
  });

  describe("GET /search", () => {
    it("returns admin books whose title or author matches the query", async () => {
      await Book.create({
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        price: 300,
        image: "/books/p.jpg",
        seller: sellerId,
        source: "admin",
      });
      await Book.create({
        title: "Unrelated Title",
        author: "Someone Else",
        price: 50,
        image: "/books/u.jpg",
        seller: sellerId,
        source: "admin",
      });

      const res = await request(app)
        .get(`${BOOKS_URL}/search`)
        .query({ q: "Pragmatic" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("The Pragmatic Programmer");
    });
  });

  describe("GET /mine and DELETE /:id", () => {
    it("lists only the authenticated seller's own books and allows deleting one", async () => {
      const book = await Book.create({
        title: "My Book",
        author: "Me",
        price: 100,
        image: "/books/m.jpg",
        seller: sellerId,
        source: "user",
      });

      const listRes = await request(app).get(`${BOOKS_URL}/mine`).set("Authorization", `Bearer ${token}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);

      const deleteRes = await request(app)
        .delete(`${BOOKS_URL}/${book._id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);

      const afterDelete = await Book.findById(book._id);
      expect(afterDelete).toBeNull();
    });

    it("returns 404 when trying to delete a book owned by another seller", async () => {
      const otherToken = await registerAndLogin("other@example.com");
      const book = await Book.create({
        title: "Not Yours",
        author: "Me",
        price: 100,
        image: "/books/n.jpg",
        seller: sellerId,
        source: "user",
      });

      const res = await request(app)
        .delete(`${BOOKS_URL}/${book._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(404);

      const stillThere = await Book.findById(book._id);
      expect(stillThere).not.toBeNull();
    });
  });
});