import catchAsync from "../../utils/catchAsync.js";
import sellerServiceAdmin from "../../services/admin/seller.service.js";

const sellerControllerAdmin = {
  searchSeller: catchAsync(async (req, res, next) => {
    const sellers = await sellerServiceAdmin.searchSeller(req.query.q);
    return res.status(200).json(sellers);
  }),

  getSellerById: catchAsync(async (req, res, next) => {
    const sellers = await sellerServiceAdmin.getSellerById(req.params.sellerId);
    return res.status(200).json(sellers);
  }),
};

export default sellerControllerAdmin;
