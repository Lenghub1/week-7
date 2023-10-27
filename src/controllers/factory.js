const factory = {
  createOne(createDocService) {
    return async (req, res, next) => {
      try {
        await createDocService(req.body);
        return res.json("Create a product");
      } catch (error) {
        next(error);
      }
    };
  },
};

export default factory;
