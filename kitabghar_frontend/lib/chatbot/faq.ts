export interface FaqEntry {
  keywords: string[];
  answer: string;
}

export const faqData: FaqEntry[] = [
  {
    keywords: ["hi", "hello", "hey", "hola", "namaste"],
    answer: "Hey there! 👋 I'm the KitabGhar assistant. Ask me about buying, selling, payments, or your account.",
  },
  {
    keywords: ["sell", "list a book", "list my book", "add a book", "post a book"],
    answer: "To sell a book, go to your Dashboard and click \"List a Book.\" Add the title, author, price, condition, and a photo — it'll show up for buyers right away.",
  },
  {
    keywords: ["buy", "purchase", "how to buy", "how do i buy"],
    answer: "Just find a book you like on the Browse page and click \"Buy Now.\" You'll be taken to Khalti to complete payment securely.",
  },
  {
    keywords: ["payment", "khalti", "pay", "how do i pay"],
    answer: "We use Khalti for payments. When you click \"Buy Now,\" you'll be redirected to Khalti's checkout to pay with your Khalti wallet.",
  },
  {
    keywords: ["forgot password", "reset password", "can't login", "cant login", "cannot login"],
    answer: "No worries — click \"Forgot password?\" on the login page. We'll email you a 6-digit code to reset it.",
  },
  {
    keywords: ["wishlist", "save book", "favorite"],
    answer: "Tap the heart icon on any book to add it to your Wishlist. You can view your saved books anytime from the Wishlist tab.",
  },
  {
    keywords: ["account", "profile", "update profile", "change name", "change email", "avatar"],
    answer: "You can update your name, email, or profile photo from your Profile page. Look for the edit option near your account details.",
  },
  {
    keywords: ["refund", "return", "cancel order", "cancel purchase"],
    answer: "Purchases are between buyers and sellers directly, so please reach out to the seller first. If you need more help, contact our support team.",
  },
  {
    keywords: ["contact", "support", "help", "human", "real person", "customer service"],
    answer: "You can reach our support team by emailing support@kitabghar.com — we're happy to help with anything I can't answer here!",
  },
  {
    keywords: ["thank", "thanks", "thank you"],
    answer: "You're welcome! Happy to help. 📚",
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    answer: "Bye! Come back anytime you have questions. 👋",
  },
];

export const fallbackAnswer =
  "I'm not totally sure about that one. Try asking me about buying, selling, payments, wishlist, or your account — or email support@kitabghar.com for anything else.";

export function getFaqAnswer(message: string): string {
  const normalized = message.toLowerCase();

  for (const entry of faqData) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.answer;
    }
  }

  return fallbackAnswer;
}

export const suggestedQuestions = [
  "How do I sell a book?",
  "How do I pay?",
  "Forgot password?",
];