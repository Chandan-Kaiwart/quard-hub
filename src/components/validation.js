export const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const VALID_CATEGORIES = [
  "UG_STUDENT/PG_Student",
  "PhD/RESEARCH_SCHOLAR",
  "FACULTY/Academicians",
];

export const validateName = (value) =>
  /^[A-Za-z\s'-]{2,40}$/.test(value);

export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validatePhone = (value) =>
  /^[+]?[\d\s-]{10}$/.test(value);

export const validateCollege = (value) =>
  value && value.length >= 3 && value.length <= 120;

export const validateCategory = (value) =>
  VALID_CATEGORIES.includes(value);

export const validateFile = (file) =>
  file &&
  file.size > 0 &&
  file.size <= MAX_FILE_SIZE &&
  ALLOWED_FILE_TYPES.includes(file.type);

export const sanitize = (value) =>
  typeof value === "string" ? value.trim() : "";