import { createError } from ".";

const validateFields = <T>(
  obj: any,
  optionalFields: (keyof T)[] | any[] = []
) => {
  const keys = Object.keys(obj);
  //   .filter(
  //     (val) => !optionalFields.includes(val as any)
  //   );
  console.log("optional fields", optionalFields);
  const fieldsRequired: string[] = [];
  keys.forEach((key) => {
    if (!obj[key]) fieldsRequired.push(key);
  });

  console.log("required", fieldsRequired);
  if (fieldsRequired.length > 0)
    throw createError(
      `${fieldsRequired.join(", ")} ${
        fieldsRequired.length === 1 ? "is" : "are"
      } required`,
      400
    );
};

export default validateFields;
