import Seller from "@/models/seller.model.js";

const sellerServiceAdmin = {
  async searchSeller(query) {
    const searchQuery = query;
    const searchTerms = searchQuery.split(/\s+/).filter(Boolean);
    const regexPatterns = searchTerms.map((term) => new RegExp(term, "i"));

    const pipeLine = [
      {
        $match: {
          active: true,
          $and: regexPatterns.map((pattern) => ({
            storeAndSellerName: { $regex: pattern },
          })),
        },
      },
    ];
    const sellers = await Seller.aggregate(pipeLine);
    return sellers;
  },
};

export default sellerServiceAdmin;
