import {
  createBook,
  findBooksBySeller,
  findBookOwnedBySeller,
  updateBookOwnedBySeller,
  deleteBookOwnedBySeller,
  findFeaturedBooksPaginated,
  searchBooks,
  findAllBooksPaginated,
  findBookByIdPopulated,
  deleteBookById,
  updateBookStatus,
} from "../repositories/book.repository";
import type { CreateBookDTO } from "../dtos/book.dto";
import type { IBook } from "../models/book.model";
import type { PaginationMeta } from "../utils/apiResponse";

export async function createBookService(
  sellerId: string,
  sellerRole: string,
  data: CreateBookDTO,
  image: string
): Promise<IBook> {
  return createBook({
    ...data,
    image,
    seller: sellerId,
    source: sellerRole === "admin" ? "admin" : "user",
  });
}

export async function listMyBooks(sellerId: string): Promise<IBook[]> {
  return findBooksBySeller(sellerId);
}

export async function updateMyBook(
  bookId: string,
  sellerId: string,
  data: Partial<CreateBookDTO>,
  image?: string
): Promise<IBook> {
  const existing = await findBookOwnedBySeller(bookId, sellerId);
  if (!existing) {
    throw Object.assign(new Error("Book not found or you don't have permission to edit it"), { status: 404 });
  }

  const fields: Record<string, unknown> = { ...data };
  if (image) fields.image = image;

  const updated = await updateBookOwnedBySeller(bookId, sellerId, fields);
  if (!updated) throw Object.assign(new Error("Failed to update book"), { status: 500 });
  return updated;
}

export async function deleteMyBook(bookId: string, sellerId: string): Promise<void> {
  const deleted = await deleteBookOwnedBySeller(bookId, sellerId);
  if (!deleted) {
    throw Object.assign(new Error("Book not found or you don't have permission to delete it"), { status: 404 });
  }
}

export async function listFeaturedBooks(page?: string, limit?: string, category?: string) {
  const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
  const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 6;

  const { data, total } = await findFeaturedBooksPaginated(currentPage, currentLimit, category);
  const totalPages = Math.ceil(total / currentLimit);

  return { data, meta: { page: currentPage, limit: currentLimit, total, totalPages } };
}

export async function searchBooksService(q: string): Promise<IBook[]> {
  if (!q || q.trim().length < 1) return [];
  return searchBooks(q.trim(), 8);
}

export async function adminListBooks(
  page?: string,
  limit?: string,
  search?: string
): Promise<{ data: IBook[]; meta: PaginationMeta }> {
  const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
  const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
  const currentSearch = search && search.trim() !== "" ? search : undefined;

  const { data, total } = await findAllBooksPaginated(currentPage, currentLimit, currentSearch);
  const totalPages = Math.ceil(total / currentLimit);

  return {
    data,
    meta: { page: currentPage, limit: currentLimit, total, totalPages },
  };
}

export async function adminGetBookById(id: string): Promise<IBook> {
  const book = await findBookByIdPopulated(id);
  if (!book) throw Object.assign(new Error("Book not found"), { status: 404 });
  return book;
}

export async function adminDeleteBook(id: string): Promise<void> {
  const book = await deleteBookById(id);
  if (!book) throw Object.assign(new Error("Book not found"), { status: 404 });
}

export async function adminUpdateBookStatus(
  id: string,
  status: "Active" | "Sold"
): Promise<IBook> {
  const book = await updateBookStatus(id, status);
  if (!book) throw Object.assign(new Error("Book not found"), { status: 404 });
  return book;
}