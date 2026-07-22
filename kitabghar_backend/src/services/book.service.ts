import {
  createBook,
  findBooksBySeller,
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