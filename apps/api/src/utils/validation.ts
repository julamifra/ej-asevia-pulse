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

const parseRequiredIntegerQuery = (value: unknown, name: string) => {
  const raw = toTrimmedString(value);

  if (!raw) {
    throw new AppError(400, "BAD_REQUEST", `Invalid ${name} parameter`);
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isInteger(parsed) || !/^\d+$/.test(raw)) {
    throw new AppError(400, "BAD_REQUEST", `Invalid ${name} parameter`);
  }

  return parsed;
};

export const parseSummaryMonthQuery = (year: unknown, month: unknown) => {
  const hasYear = toTrimmedString(year) !== undefined;
  const hasMonth = toTrimmedString(month) !== undefined;

  if (!hasYear && !hasMonth) {
    return undefined;
  }

  if (!hasYear || !hasMonth) {
    throw new AppError(400, "BAD_REQUEST", "year and month parameters must be provided together");
  }

  const parsedYear = parseRequiredIntegerQuery(year, "year");
  const parsedMonth = parseRequiredIntegerQuery(month, "month");

  if (parsedYear < 1900 || parsedYear > 2100) {
    throw new AppError(400, "BAD_REQUEST", "Invalid year parameter");
  }

  if (parsedMonth < 1 || parsedMonth > 12) {
    throw new AppError(400, "BAD_REQUEST", "Invalid month parameter");
  }

  return {
    year: parsedYear,
    month: parsedMonth,
    selectedMonth: `${parsedYear}-${String(parsedMonth).padStart(2, "0")}-01`
  };
};
