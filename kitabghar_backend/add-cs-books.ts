/**
 * Adds 6 new CS/programming books to the catalog (alongside the existing
 * 30), using the same admin account pattern as scripts/seedCatalog.ts.
 * Safe to re-run — skips any book that already exists by exact title.
 *
 * Run from the kitabghar_backend root:
 *   npx tsx add-cs-books.ts
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
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
    price: 700,
    condition: "Good",
    category: "Academic",
    description:
      "A comprehensive introduction to database systems, covering design, implementation, and management.",
    image: "/books/Database_System_Concepts___Silberschatz.jpg",
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    price: 650,
    condition: "Like New",
    category: "Academic",
    description:
      "A classic guide to becoming a more effective and adaptable software developer.",
    image: "/books/The_Pragmatic_Programmer___Hunt_Thomas.jpg",
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    price: 600,
    condition: "Fair",
    category: "Academic",
    description:
      "The foundational 'Gang of Four' book on reusable object-oriented software design patterns.",
    image: "/books/Design_Patterns___Gang_of_Four.jpg",
  },
  {
    title: "Computer Networking: A Top-Down Approach",
    author: "James F. Kurose & Keith W. Ross",
    price: 700,
    condition: "Good",
    category: "Academic",
    description:
      "A widely-used textbook explaining computer networking concepts from the application layer down.",
    image: "/books/Computer_Networking___Kurose.jpg",
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    price: 750,
    condition: "Good",
    category: "Academic",
    description: "The definitive textbook on algorithms, widely known as 'CLRS'.",
    image: "/books/Introduction_to_Algorithms___Cormen.jpg",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 500,
    condition: "Like New",
    category: "Academic",
    description:
      "A handbook of agile software craftsmanship, focused on writing readable and maintainable code.",
    image: "/books/Clean_Code___Robert_Martin.jpg",
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