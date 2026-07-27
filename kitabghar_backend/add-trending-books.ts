/**
 * Adds 2 specific books to the catalog under the Academic category, using
 * cover images already copied into public/books/.
 * Safe to re-run — skips any book that already exists by exact title.
 *
 * Run from the kitabghar_backend root:
 *   npx tsx add-trending-books.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model";
import Book from "./src/models/book.model";

dotenv.config();

interface NewBook {
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  category: string;
  description: string;
  image: string;
}

const NEW_BOOKS: NewBook[] = [
  {
    title: "You Don't Know JS Yet: Get Started",
    author: "Kyle Simpson",
    price: 550,
    condition: "Like New",
    category: "Academic",
    description:
      "The first book in the You Don't Know JS Yet series, covering JavaScript fundamentals in depth.",
    image: "/books/You_Dont_Know_JS_Yet___Kyle_Simpson.jpg",
  },
  {
    title: "Code Complete",
    author: "Steve McConnell",
    price: 600,
    condition: "Good",
    category: "Academic",
    description:
      "A comprehensive handbook of software construction best practices.",
    image: "/books/Code_Complete___Steve_McConnell.jpg",
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB\n");

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("No admin user found — create/promote one before running this script.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Using admin account: ${admin.email}\n`);

  let created = 0;
  let skipped = 0;

  for (const book of NEW_BOOKS) {
    const existing = await Book.findOne({ title: book.title });
    if (existing) {
      console.log(`Skipping "${book.title}" — already exists.`);
      skipped++;
      continue;
    }

    await Book.create({
      title: book.title,
      author: book.author,
      price: book.price,
      description: book.description,
      category: book.category,
      condition: book.condition,
      image: book.image,
      seller: admin._id,
      status: "Active",
      source: "admin",
    });

    console.log(`Created "${book.title}" (${book.category})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});