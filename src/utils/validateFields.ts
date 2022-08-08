import { createError } from ".";

export default function <T>(input: T, requiredFields: (keyof T)[]) {
  const keys = Object.keys(input);
  const missingFields: string[] = [];

  console.log("Required fields", requiredFields);
  requiredFields.forEach((key) => {
    if (!keys.includes(key as string)) missingFields.push(key as string);
  });

  // console.log("required", fieldsRequired);
  const len = missingFields.length;
  if (len > 0) throw createError(`${missingFields.join(", ")} field${len < 2 ? "" : "s"} ${len === 1 ? "is" : "are"} required`, 400);
}
