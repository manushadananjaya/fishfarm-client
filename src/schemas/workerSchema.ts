import { z } from 'zod';

// CertifiedUntil must be strictly in the future (not today, not past)
function futureDateString() {
  return z
    .string()
    .min(1, 'Certification date is required')
    .refine((val) => {
      if (!val) return false;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const date = new Date(val);
      return date > today;
    }, 'Certification date must be in the future (not today)');
}

export const workerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(150, 'Name must be 150 characters or fewer'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(18, 'Worker must be at least 18 years old')
    .max(80, 'Worker must be at most 80 years old'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(256, 'Email must be 256 characters or fewer'),
  position: z.enum(['CEO', 'Worker', 'Captain'], {
    errorMap: () => ({ message: 'Select a valid position' }),
  }),
  certifiedUntil: futureDateString(),
  picture: z
    .instanceof(File)
    .optional()
    .refine(
      (f) => !f || f.size <= 3 * 1024 * 1024,
      'Picture must not exceed 3 MB',
    )
    .refine(
      (f) =>
        !f || ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Picture must be a JPEG, PNG, or WebP image',
    ),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

// Tomorrow as default certifiedUntil
function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const workerDefaultValues: WorkerFormValues = {
  name: '',
  age: 25,
  email: '',
  position: 'Worker',
  certifiedUntil: tomorrowStr(),
  picture: undefined,
};
