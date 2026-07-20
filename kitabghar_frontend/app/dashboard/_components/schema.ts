import { z } from "zod";

export const sellBookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  author: z.string().min(2, "Author must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  condition: z.enum(["Like New", "Good", "Fair"]),
  description: z.string().max(500, "Description is too long").optional(),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Book photo is required")
    .refine((files) => files[0]?.size <= 4 * 1024 * 1024, "Image must be smaller than 4MB")
    .refine(
      (files) => ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
      "Only jpg, png, or webp images are allowed"
    ),
});

export type SellBookFormInput = z.input<typeof sellBookSchema>;
export type SellBookFormData = z.output<typeof sellBookSchema>;