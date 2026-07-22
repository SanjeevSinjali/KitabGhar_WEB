import Book, { IBook } from "../models/book.model";

export async function createBook(data: {
  title: string;
  author: string;
  price: number;
  condition: string;
  description?: string;
  image: string;
  seller: string;
  source: "admin" | "user";
}): Promise<IBook> {
  const book = new Book(data);
  return book.save();
}

export async function findBooksBySeller(sellerId: string): Promise<IBook[]> {
  return Book.find({ seller: sellerId }).sort({ createdAt: -1 });
}

export async function findFeaturedBooksPaginated(
  page: number,
  limit: number
): Promise<{ data: IBook[]; total: number }> {
  const query: Record<string, unknown> = { source: "admin" };

  const total = await Book.countDocuments(query);
  const data = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total };
}

export async function findAllBooksPaginated(
  page: number,
  limit: number,
  search?: string
): Promise<{ data: IBook[]; total: number }> {
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Book.countDocuments(query);
  const data = await Book.find(query)
    .populate("seller", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data, total };
}

export async function findBookByIdPopulated(id: string): Promise<IBook | null> {
  return Book.findById(id).populate("seller", "name email avatar");
}

export async function deleteBookById(id: string): Promise<IBook | null> {
  return Book.findByIdAndDelete(id);
}

export async function updateBookStatus(
  id: string,
  status: "Active" | "Sold"
): Promise<IBook | null> {
  return Book.findByIdAndUpdate(id, { status }, { new: true });
}