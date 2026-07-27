const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,72}$/;
const NAME_MAX_LENGTH = 100;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

export function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Required';
  }
  return trimmed.length > NAME_MAX_LENGTH ? `At most ${NAME_MAX_LENGTH} characters` : null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Required';
  }
  return EMAIL_PATTERN.test(trimmed) ? null : 'Enter a valid email address';
}

export function validateRequired(value: string): string | null {
  return value.trim() ? null : 'Required';
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Required';
  }
  return PASSWORD_PATTERN.test(value)
    ? null
    : 'Min 8 characters with an uppercase, lowercase, number and symbol';
}

export function validateAvatar(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Use a PNG, JPG or GIF image';
  }
  return file.size > IMAGE_MAX_BYTES ? 'Image must be under 5 MB' : null;
}
