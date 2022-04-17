const getUpdateOptions = (): {
  runValidators: boolean;
  setDefaultsOnInsert: boolean;
  upsert: boolean;
  new: boolean;
} => {
  return {
    runValidators: true,
    setDefaultsOnInsert: true,
    upsert: true,
    new: true,
  };
};

export default getUpdateOptions;
