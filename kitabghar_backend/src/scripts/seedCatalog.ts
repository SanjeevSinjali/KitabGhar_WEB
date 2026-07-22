import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/book.model";
import User from "../models/user.model";

dotenv.config();

type SeedBook = {
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  category: string;
  image: string;
};

const catalog: SeedBook[] = [
  // Fiction
  { title: "To Kill a Mockingbird", author: "Harper Lee", price: 850, condition: "Good", category: "Fiction", image: "To_Kill_a_Mockingbird___Harper_Lee.jpg" },
  { title: "1984", author: "George Orwell", price: 750, condition: "Like New", category: "Fiction", image: "1984___George_Orwell.jpg" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 700, condition: "Good", category: "Fiction", image: "The_Great_Gatsby___F__Scott_Fitzgerald.jpg" },
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", price: 900, condition: "Fair", category: "Fiction", image: "One_Hundred_Years_of_Solitude___Gabriel_Garci_a_Ma_rquez.jpg" },
  { title: "The Kite Runner", author: "Khaled Hosseini", price: 800, condition: "Good", category: "Fiction", image: "The_Kite_Runner___Khaled_Hosseini.jpg" },

  // Academic
  { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", price: 2200, condition: "Good", category: "Academic", image: "ntroduction_to_Algorithms___Cormen__Leiserson__Rivest__Stein.jpg" },
  { title: "Operating System Concepts", author: "Silberschatz, Galvin, Gagne", price: 1800, condition: "Good", category: "Academic", image: "Operating_System_Concepts___Silberschatz__Galvin__Gagne.jpg" },
  { title: "Discrete Mathematics and Its Applications", author: "Kenneth Rosen", price: 1600, condition: "Fair", category: "Academic", image: "Discrete_Mathematics_and_Its_Applications___Kenneth_Rosen.jpg" },
  { title: "Principles of Economics", author: "N. Gregory Mankiw", price: 1400, condition: "Good", category: "Academic", image: "Principles_of_Economics___N__Gregory_Mankiw.jpg" },
  { title: "Organic Chemistry", author: "Paula Yurkanis Bruice", price: 1900, condition: "Good", category: "Academic", image: "Organic_Chemistry___Paula_Yurkanis_Bruice.jpg" },
  { title: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", price: 2400, condition: "Like New", category: "Academic", image: "Artificial_Intelligence-_A_Modern_Approach___Russell___Norvig.jpg" },
  { title: "Design Thinking", author: "Nigel Cross", price: 950, condition: "Like New", category: "Academic", image: "Design_Thinking.jpg" },

  // Non-Fiction
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", price: 950, condition: "Like New", category: "Non-Fiction", image: "Sapiens-_A_Brief_History_of_Humankind___Yuval_Noah_Harari.jpg" },
  { title: "Freakonomics", author: "Steven Levitt & Stephen Dubner", price: 700, condition: "Good", category: "Non-Fiction", image: "Freakonomics___Steven_Levitt___Stephen_Dubner.jpg" },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", price: 850, condition: "Good", category: "Non-Fiction", image: "Thinking__Fast_and_Slow___Daniel_Kahneman.jpg" },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", price: 800, condition: "Fair", category: "Non-Fiction", image: "Guns__Germs__and_Steel___Jared_Diamond.jpg" },
  { title: "The Selfish Gene", author: "Richard Dawkins", price: 750, condition: "Good", category: "Non-Fiction", image: "The_Selfish_Gene___Richard_Dawkins.jpg" },

  // Self-Help
  { title: "Atomic Habits", author: "James Clear", price: 650, condition: "Like New", category: "Self-Help", image: "Atomic_Habits___James_Clear.jpg" },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", price: 700, condition: "Good", category: "Self-Help", image: "The_7_Habits_of_Highly_Effective_People___Stephen_Covey.jpg" },
  { title: "Deep Work", author: "Cal Newport", price: 680, condition: "Good", category: "Self-Help", image: "Deep_Work___Cal_Newport.jpg" },
  { title: "Can't Hurt Me", author: "David Goggins", price: 750, condition: "Like New", category: "Self-Help", image: "Can_t_Hurt_Me___David_Goggins.jpg" },

  // Biography
  { title: "Steve Jobs", author: "Walter Isaacson", price: 900, condition: "Good", category: "Biography", image: "Steve_Jobs___Walter_Isaacson.jpg" },
  { title: "Educated", author: "Tara Westover", price: 800, condition: "Like New", category: "Biography", image: "Educated___Tara_Westover.jpg" },
  { title: "Shoe Dog", author: "Phil Knight", price: 750, condition: "Good", category: "Biography", image: "Shoe_Dog___Phil_Knight.jpg" },

  // Children's
  { title: "Charlotte's Web", author: "E.B. White", price: 450, condition: "Good", category: "Children's", image: "Charlotte_s_Web___E_B__White.jpg" },
  { title: "Matilda", author: "Roald Dahl", price: 500, condition: "Like New", category: "Children's", image: "Matilda___Roald_Dahl.jpg" },
  { title: "The Very Hungry Caterpillar", author: "Eric Carle", price: 400, condition: "Good", category: "Children's", image: "The_Very_Hungry_Caterpillar___Eric_Carle.jpg" },

  // Comics
  { title: "Watchmen", author: "Alan Moore & Dave Gibbons", price: 900, condition: "Good", category: "Comics", image: "Watchmen___Alan_Moore___Dave_Gibbons.jpg" },
  { title: "Maus", author: "Art Spiegelman", price: 850, condition: "Good", category: "Comics", image: "Maus___Art_Spiegelman.jpg" },
  { title: "Persepolis", author: "Marjane Satrapi", price: 800, condition: "Like New", category: "Comics", image: "Persepolis___Marjane_Satrapi.jpg" },
];

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kitabghar";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("No admin user found. Create an admin account first.");
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const book of catalog) {
    const exists = await Book.findOne({ title: book.title, source: "admin" });
    if (exists) {
      console.log(`Skipping "${book.title}" — already exists`);
      skipped++;
      continue;
    }

    await Book.create({
      title: book.title,
      author: book.author,
      price: book.price,
      condition: book.condition,
      category: book.category,
      description: "",
      image: `/books/${book.image}`,
      seller: admin._id,
      status: "Active",
      source: "admin",
    });

    console.log(`Created "${book.title}" (${book.category})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});