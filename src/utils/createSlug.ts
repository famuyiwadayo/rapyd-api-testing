const createSlug = (name: string) =>
  String(name).toLowerCase().split(" ").join("_");

export default createSlug;
