// ─── Constants ─────────────────────────────

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const VALID_CATEGORIES = [
  "UG_STUDENT/PG_Student",
  "PhD/RESEARCH_SCHOLAR",
  "FACULTY/Academicians",
];

// ─── Validators ───────────────────────────

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

// ─── Sanitizer ───────────────────────────

export const sanitize = (value) =>
  typeof value === "string" ? value.trim() : "";

// ─── Form Validation ─────────────────────

export function validateRegistrationForm(fields) {
  const { firstName, lastName, email, phone, college, category, file } = fields;

  if (!validateName(firstName))
    return { valid: false, error: "Invalid first name." };

  if (!validateName(lastName))
    return { valid: false, error: "Invalid last name." };

  if (!validateEmail(email))
    return { valid: false, error: "Invalid email." };

  if (!validatePhone(phone))
    return { valid: false, error: "Invalid phone number." };

  if (!validateCollege(college))
    return { valid: false, error: "Invalid college." };

  if (!validateCategory(category))
    return { valid: false, error: "Invalid category." };

  if (!validateFile(file))
    return { valid: false, error: "Invalid file." };

  return { valid: true };
}