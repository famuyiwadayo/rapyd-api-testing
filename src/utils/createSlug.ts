import camelCase from "lodash/camelCase";

const createSlug = (name: string) => camelCase(name);

export default createSlug;
