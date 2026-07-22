export interface CreateBookDTO {
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  category: string;
  description?: string;
}