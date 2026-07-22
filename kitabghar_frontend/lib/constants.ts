export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Academic",
  "Self-Help",
  "Biography",
  "Children's",
  "Comics",
  "Other",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];