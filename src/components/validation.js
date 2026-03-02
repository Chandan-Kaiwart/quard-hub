// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const MAX_REGISTRATIONS = 22;

export const VALID_CATEGORIES = [
  "UG_STUDENT/PG_Student",
  "PhD/RESEARCH_SCHOLAR",
  "FACULTY/Academicians",
];

// ─── Form Field Validators ────────────────────────────────────────────────────

/** First / Last name: letters, spaces, hyphens, apostrophes — 2 to 40 chars */
export const validateName = (value) =>
  /^[A-Za-z\s'-]{2,40}$/.test(value);

/** Standard email format */
export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Phone: optional leading +, digits/spaces/hyphens — exactly 10 digits */
export const validatePhone = (value) =>
  /^[+]?[\d\s-]{10}$/.test(value);

/** College / organization: 3 to 120 chars */
export const validateCollege = (value) =>
  typeof value === "string" &&
  value.length >= 3 &&
  value.length <= 120;

/** Category must be one of the known enum values */
export const validateCategory = (value) =>
  VALID_CATEGORIES.includes(value);

/** File validation */
export const validateFile = (file) =>
  !!file &&
  file.size > 0 &&
  file.size <= MAX_FILE_SIZE &&
  ALLOWED_FILE_TYPES.includes(file.type);

// ─── Sanitization ─────────────────────────────────────────────────────────────

export const sanitize = (value) =>
  typeof value === "string" ? value.trim() : "";

// ─── Full Form Validation ─────────────────────────────────────────────────────

export function validateRegistrationForm(fields) {
  const { firstName, lastName, email, phone, college, category, file } = fields;

  if (!validateName(firstName))
    return { valid: false, error: "Please enter a valid first name." };

  if (!validateName(lastName))
    return { valid: false, error: "Please enter a valid last name." };

  if (!validateEmail(email))
    return { valid: false, error: "Please enter a valid email address." };

  if (!validatePhone(phone))
    return { valid: false, error: "Please enter a valid phone number." };

  if (!validateCollege(college))
    return { valid: false, error: "Please enter a valid college/organization." };

  if (!validateCategory(category))
    return { valid: false, error: "Please select a valid category." };

  if (!validateFile(file))
    return {
      valid: false,
      error: "Invalid file. Only JPG, PNG, PDF under 5MB allowed.",
    };

  return { valid: true };
}

// ─── Server-side / API Validators ────────────────────────────────────────────

export function validateApiPayload(fields) {
  const {
    first_name,
    last_name,
    email,
    phone,
    college,
    category,
    id_proof_url,
  } = fields;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !college ||
    !category ||
    !id_proof_url
  ) {
    return { valid: false, error: "All fields are required." };
  }

  if (!validateName(sanitize(first_name)))
    return { valid: false, error: "Invalid first name." };

  if (!validateName(sanitize(last_name)))
    return { valid: false, error: "Invalid last name." };

  if (!validateEmail(sanitize(String(email)).toLowerCase()))
    return { valid: false, error: "Invalid email address." };

  if (!validatePhone(sanitize(phone)))
    return { valid: false, error: "Invalid phone number." };

  if (!validateCollege(sanitize(college)))
    return { valid: false, error: "Invalid college/organization." };

  if (!validateCategory(sanitize(category)))
    return { valid: false, error: "Invalid category." };

  return { valid: true };
}

// ─── Supabase / DB Validators ─────────────────────────────────────────────────

export function validateRegistrationLimit(currentCount) {
  if (currentCount >= MAX_REGISTRATIONS) {
    return {
      valid: false,
      error: `Registration is full. Maximum ${MAX_REGISTRATIONS} registrations reached.`,
    };
  }

  return { valid: true };
}

export function validateStoragePath(path) {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: "Storage path is empty." };
  }

  if (/[\\]|\.\./.test(path)) {
    return { valid: false, error: "Storage path contains invalid characters." };
  }

  return { valid: true };
}

export function validateUploadFile(file) {
  if (!file)
    return { valid: false, error: "No file provided." };

  if (file.size === 0)
    return { valid: false, error: "File is empty." };

  if (file.size > MAX_FILE_SIZE)
    return { valid: false, error: "File exceeds the 5MB size limit." };

  if (!ALLOWED_FILE_TYPES.includes(file.type))
    return {
      valid: false,
      error: "Only JPG, PNG, and PDF files are allowed.",
    };

  return { valid: true };
}