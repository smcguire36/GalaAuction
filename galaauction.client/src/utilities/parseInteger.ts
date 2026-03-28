export const parseOptionalInt = (
  value: FormDataEntryValue | null,
): number | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const parseRequiredInt = (
  value: FormDataEntryValue | null,
): number => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Value is required");
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Value is not a valid number");
  }
  return parsed;
};
