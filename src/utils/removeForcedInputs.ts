import omit from "lodash/omit";

export default function removeForcedInputs<E, T extends object>(
  input: T,
  toRemove: (keyof E)[]
) {
  let _input = { ...omit<T>(input, toRemove) } as T;
  return _input;
}
