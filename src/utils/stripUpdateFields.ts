const stripUpdateFields = <T>(model: T): T => {
  if (!model) return model;
  delete model["_id"];
  delete model["createdAt"];
  delete model["updatedAt"];
  return model;
};

export default stripUpdateFields;
