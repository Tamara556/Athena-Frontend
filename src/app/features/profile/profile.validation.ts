const NAME_MAX_LENGTH = 100;
const GOAL_MAX_LENGTH = 120;
const FOCUS_MAX_LENGTH = 80;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

export function validateName(value: string): string | null {
  return validateText(value, NAME_MAX_LENGTH);
}

export function validateGoal(value: string): string | null {
  return validateText(value, GOAL_MAX_LENGTH);
}

export function validateFocus(value: string): string | null {
  return validateText(value, FOCUS_MAX_LENGTH);
}

export function validateText(value: string, maxLength: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Required';
  }
  return trimmed.length > maxLength ? `At most ${maxLength} characters` : null;
}

export function validateAvatar(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Use a PNG, JPG or GIF image';
  }
  return file.size > IMAGE_MAX_BYTES ? 'Image must be under 5 MB' : null;
}
