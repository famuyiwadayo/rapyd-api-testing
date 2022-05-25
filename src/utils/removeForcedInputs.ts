import omit from "lodash/omit";

export default function removeForcedInputs<T extends object>(
  input: T,
  toRemove: (keyof T)[]
) {
  let _input = { ...omit<T>(input, toRemove) } as T;
  return _input;
}
