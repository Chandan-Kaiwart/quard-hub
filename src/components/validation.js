// ─── Server-side Validation (Vercel Safe) ─────────────────────────

const MAX_REGISTRATIONS = 30;

const VALID_CATEGORIES = [
  "UG_STUDENT/PG_Student",
  "PhD/RESEARCH_SCHOLAR",
  "FACULTY/Academicians",
];

const validateName = (value) =>
  /^[A-Za-z\s'-]{2,40}$/.test(value);

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePhone = (value) =>
  /^[+]?[\d\s-]{10}$/.test(value);

const validateCollege = (value) =>
  value.length >= 3 && value.length <= 120;

const validateCategory = (value) =>
  VALID_CATEGORIES.includes(value);

const sanitize = (value) =>
  typeof value === "string" ? value.trim() : "";

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

  if (!first_name || !last_name || !email || !phone || !college || !category || !id_proof_url) {
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

export function validateRegistrationLimit(currentCount) {
  if (currentCount >= MAX_REGISTRATIONS) {
    return {
      valid: false,
      error: `Registration is full. Maximum ${MAX_REGISTRATIONS} registrations reached.`,
    };
  }

  return { valid: true };
}