import { AppError } from "../errors/app-error";

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const parseIdParam = (value: unknown) => {
  const raw = toTrimmedString(value);

  if (!raw) {
    throw new AppError(400, "BAD_REQUEST", "Invalid id parameter");
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, "BAD_REQUEST", "Invalid id parameter");
  }

  return parsed;
};

export const parsePageParam = (value: unknown, defaultValue = 1) => {
  const raw = toTrimmedString(value);

  if (!raw) {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, "BAD_REQUEST", "Invalid page parameter");
  }

  return parsed;
};

export const parseLimitParam = (value: unknown, defaultValue = 10, max = 100) => {
  const raw = toTrimmedString(value);

  if (!raw) {
    return defaultValue;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new AppError(400, "BAD_REQUEST", "Invalid limit parameter");
  }

  return parsed;
};

export const parseOptionalStringParam = (value: unknown) => toTrimmedString(value);
