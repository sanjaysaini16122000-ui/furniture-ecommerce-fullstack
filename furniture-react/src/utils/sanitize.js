/**
 * Security utilities for input sanitization and validation.
 * Prevents XSS, injection, and spam attacks.
 */

/**
 * Sanitize a string by escaping HTML special characters.
 * Prevents stored XSS when user input is rendered later.
 */
export function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .trim();
}

/**
 * Validate phone number format (Indian + international).
 * Allows digits, spaces, +, -, and parentheses. 7-15 chars.
 */
export function validatePhone(phone) {
    if (!phone) return false;
    return /^[\d\s+()-]{7,15}$/.test(phone.trim());
}

/**
 * Validate email format (basic check).
 * Returns true if empty (email is optional on contact form).
 */
export function validateEmail(email) {
    if (!email || email.trim() === '') return true; // optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate that a name is reasonable.
 * Must be 1-100 characters, no HTML tags.
 */
export function validateName(name) {
    if (!name || name.trim().length === 0) return false;
    if (name.trim().length > 100) return false;
    if (/<[^>]*>/.test(name)) return false; // no HTML tags
    return true;
}

/**
 * Validate that a message is reasonable.
 * Must be 1-2000 characters.
 */
export function validateMessage(message) {
    if (!message || message.trim().length === 0) return false;
    if (message.trim().length > 2000) return false;
    return true;
}

/**
 * Sanitize an entire form object.
 * Returns a new object with all string values sanitized.
 */
export function sanitizeForm(formData) {
    const sanitized = {};
    for (const [key, value] of Object.entries(formData)) {
        sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : value;
    }
    return sanitized;
}
