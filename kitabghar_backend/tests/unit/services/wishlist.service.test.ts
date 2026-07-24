import * as wishlistRepository from "../../../src/repositories/wishlist.repository";
import * as notificationService from "../../../src/services/notification.service";
import {
  toggleWishlist,
  removeFromWishlist,
  listWishlist,
  WISHLIST_LIMIT,
} from "../../../src/services/wishlist.service";

jest.mock("../../../src/repositories/wishlist.repository");
jest.mock("../../../src/services/notification.service");

const mockedRepo = wishlistRepository as jest.Mocked<typeof wishlistRepository>;
const mockedNotifications = notificationService as jest.Mocked<typeof notificationService>;

const sampleData = {
  bookId: "book-1",
  title: "Clean Code",
  author: "Robert C. Martin",
  price: "500",
  image: "/books/img.jpg",
  condition: "Good",
};

describe("wishlist.service", () => {
  describe("toggleWishlist", () => {
    it("removes the entry if it already exists (toggle off)", async () => {
      mockedRepo.findWishlistEntry.mockResolvedValue({ _id: "w1" } as any);

      const result = await toggleWishlist("user-1", "Alice", sampleData);

      expect(mockedRepo.removeWishlistEntry).toHaveBeenCalledWith("user-1", "book-1");
      expect(mockedRepo.addWishlistEntry).not.toHaveBeenCalled();
      expect(result).toEqual({ wishlisted: false });
    });

    it("adds the entry and notifies the user if it doesn't exist yet", async () => {
      mockedRepo.findWishlistEntry.mockResolvedValue(null);
      mockedRepo.countWishlistByUser.mockResolvedValue(0);

      const result = await toggleWishlist("user-1", "Alice", sampleData);

      expect(mockedRepo.addWishlistEntry).toHaveBeenCalledWith("user-1", sampleData);
      expect(mockedNotifications.notifyWishlistAdd).toHaveBeenCalledWith("user-1", "Alice", "Clean Code");
      expect(result).toEqual({ wishlisted: true });
    });

    it(`throws a 400-flagged error once the user has ${WISHLIST_LIMIT} items`, async () => {
      mockedRepo.findWishlistEntry.mockResolvedValue(null);
      mockedRepo.countWishlistByUser.mockResolvedValue(WISHLIST_LIMIT);

      await expect(toggleWishlist("user-1", "Alice", sampleData)).rejects.toMatchObject({
        status: 400,
        message: `You can't have more than ${WISHLIST_LIMIT} books in your wishlist.`,
      });

      expect(mockedRepo.addWishlistEntry).not.toHaveBeenCalled();
      expect(mockedNotifications.notifyWishlistAdd).not.toHaveBeenCalled();
    });
  });

  describe("removeFromWishlist", () => {
    it("throws a 404-flagged error when nothing was removed", async () => {
      mockedRepo.removeWishlistEntry.mockResolvedValue(null);

      await expect(removeFromWishlist("user-1", "book-1")).rejects.toMatchObject({
        status: 404,
        message: "Wishlist item not found",
      });
    });

    it("returns the removed document on success", async () => {
      mockedRepo.removeWishlistEntry.mockResolvedValue({ _id: "w1" } as any);

      const result = await removeFromWishlist("user-1", "book-1");

      expect(result).toEqual({ _id: "w1" });
    });
  });

  describe("listWishlist", () => {
    it("delegates straight to the repository", async () => {
      mockedRepo.findWishlistByUser.mockResolvedValue([{ _id: "w1" }] as any);

      const result = await listWishlist("user-1");

      expect(mockedRepo.findWishlistByUser).toHaveBeenCalledWith("user-1");
      expect(result).toEqual([{ _id: "w1" }]);
    });
  });
});