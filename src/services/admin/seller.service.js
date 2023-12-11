import Seller from "@/models/seller.model.js";
import APIFeatures from "@/utils/APIFeatures.js";

const sellerServiceAdmin = {
  async searchSeller(queryStr) {
    function generatePipeline(regexPatterns) {
      return [
        {
          $match: {
            active: true,
            $and: regexPatterns.map((pattern) => ({
              storeAndSellerName: { $regex: pattern },
            })),
          },
        },
      ];
    }

    const features = new APIFeatures(Seller, queryStr, true, generatePipeline)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let sellers = await features.execute();
    sellers = sellers[0];
    return sellers;
  },
  async getAllSeller() {
    return;
  },
};

export default sellerServiceAdmin;
