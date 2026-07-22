import { z } from "zod";
export type { CreateBookDTO } from "../dtos/book.dto";

export const CreateBookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  author: z.string().min(2, "Author must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  condition: z.enum(["Like New", "Good", "Fair"]).default("Good"),
  category: z
    .enum(["Fiction", "Non-Fiction", "Academic", "Self-Help", "Biography", "Children's", "Comics", "Other"])
    .default("Other"),
  description: z.string().max(500, "Description is too long").optional(),
});