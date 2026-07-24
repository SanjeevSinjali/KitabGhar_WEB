import request from "supertest";
import app from "../../src/app";
import { connectTestDB, disconnectTestDB, clearTestDB } from "../setup/db";

const WISHLIST_URL = "/api/v1/wishlist";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

function sampleBook(id: string) {
  return {
    bookId: id,
    title: `Book ${id}`,
    author: "Author",
    price: "100",
    image: "/books/x.jpg",
    condition: "Good",
  };
}

describe("Wishlist routes (integration)", () => {
  let token: string;

  beforeEach(async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Buyer",
      email: "buyer@example.com",
      password: "password123",
    });
    token = res.body.token;
  });

  it("rejects requests without authentication", async () => {
    const res = await request(app).get(WISHLIST_URL);
    expect(res.status).toBe(401);
  });

  it("adds a book to the wishlist and lists it", async () => {
    const res = await request(app)
      .post(`${WISHLIST_URL}/toggle`)
      .set("Authorization", `Bearer ${token}`)
      .send(sampleBook("book1"));

    expect(res.status).toBe(200);
    expect(res.body.data.wishlisted).toBe(true);

    const list = await request(app).get(WISHLIST_URL).set("Authorization", `Bearer ${token}`);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].bookId).toBe("book1");
  });

  it("removes the book when toggled a second time", async () => {
    await request(app).post(`${WISHLIST_URL}/toggle`).set("Authorization", `Bearer ${token}`).send(sampleBook("book2"));

    const res = await request(app)
      .post(`${WISHLIST_URL}/toggle`)
      .set("Authorization", `Bearer ${token}`)
      .send(sampleBook("book2"));

    expect(res.status).toBe(200);
    expect(res.body.data.wishlisted).toBe(false);

    const list = await request(app).get(WISHLIST_URL).set("Authorization", `Bearer ${token}`);
    expect(list.body.data).toHaveLength(0);
  });

  it("enforces the 5-item wishlist limit", async () => {
    for (let i = 1; i <= 5; i++) {
      const r = await request(app)
        .post(`${WISHLIST_URL}/toggle`)
        .set("Authorization", `Bearer ${token}`)
        .send(sampleBook(`book${i}`));
      expect(r.status).toBe(200);
    }

    const res = await request(app)
      .post(`${WISHLIST_URL}/toggle`)
      .set("Authorization", `Bearer ${token}`)
      .send(sampleBook("book6"));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/can't have more than 5 books/);
  });

  it("returns 404 when deleting a wishlist item that doesn't exist", async () => {
    const res = await request(app)
      .delete(`${WISHLIST_URL}/does-not-exist`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("deletes an existing wishlist item directly via DELETE /:bookId", async () => {
    await request(app).post(`${WISHLIST_URL}/toggle`).set("Authorization", `Bearer ${token}`).send(sampleBook("book9"));

    const res = await request(app)
      .delete(`${WISHLIST_URL}/book9`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const list = await request(app).get(WISHLIST_URL).set("Authorization", `Bearer ${token}`);
    expect(list.body.data).toHaveLength(0);
  });
});