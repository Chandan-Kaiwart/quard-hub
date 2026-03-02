export const MAX_REGISTRATIONS = 30;

const VALID_CATEGORIES = [
  "UG_STUDENT/PG_Student",
  "PhD/RESEARCH_SCHOLAR",
  "FACULTY/Academicians",
];

function validateName(value) {
  return /^[A-Za-z\s'-]{2,40}$/.test(value);
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  return /^[+]?[\d\s-]{10}$/.test(value);
}

function validateCollege(value) {
  return value.length >= 3 && value.length <= 120;
}

function validateCategory(value) {
  return VALID_CATEGORIES.includes(value);
}

function sanitize(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateApiPayload(fields) {
  const {
    first_name,
    last_name,
    email,
    phone,
    college,
    category,
    id_proof_url,
    transaction_id,
  } = fields;

  if (!first_name || !last_name || !email || !phone || !college || !category || !id_proof_url || !transaction_id) {
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