import { z } from 'zod';

function futureDateString() {
  return z
    .string()
    .min(1, 'Certification date is required')
    .refine((val) => {
      if (!val) return false;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return new Date(val) > today;
    }, 'Certification date must be in the future');
}

export const personSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(150, 'Name must be 150 characters or fewer'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(256, 'Email must be 256 characters or fewer'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(18, 'Must be at least 18 years old')
    .max(80, 'Must be at most 80 years old'),
  certifiedUntil: futureDateString(),
  picture: z
    .instanceof(File)
    .optional()
    .refine((f) => !f || f.size <= 3 * 1024 * 1024, 'Picture must not exceed 3 MB')
    .refine(
      (f) => !f || ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Picture must be a JPEG, PNG, or WebP image',
    ),
});

export type PersonFormValues = z.infer<typeof personSchema>;

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const personDefaultValues: PersonFormValues = {
  name: '',
  email: '',
  age: 25,
  certifiedUntil: tomorrowStr(),
  picture: undefined,
};
