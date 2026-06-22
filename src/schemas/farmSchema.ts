import { z } from 'zod';

const GPS_PRECISION_REGEX = /^-?\d+(\.\d{1,4})?$/;

function gpsLatitude() {
  return z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .refine(
      (v) => GPS_PRECISION_REGEX.test(String(v)),
      'Latitude may have at most 4 decimal places',
    );
}

function gpsLongitude() {
  return z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .refine(
      (v) => GPS_PRECISION_REGEX.test(String(v)),
      'Longitude may have at most 4 decimal places',
    );
}

export const farmSchema = z.object({
  name: z
    .string()
    .min(1, 'Farm name is required')
    .max(200, 'Farm name must be 200 characters or fewer'),
  gpsLatitude: gpsLatitude(),
  gpsLongitude: gpsLongitude(),
  numberOfCages: z
    .number({ invalid_type_error: 'Number of cages must be a number' })
    .int('Number of cages must be a whole number')
    .min(1, 'Must have at least 1 cage'),
  hasBarge: z.boolean(),
  picture: z
    .instanceof(File)
    .optional()
    .refine(
      (f) => !f || f.size <= 5 * 1024 * 1024,
      'Picture must not exceed 5 MB',
    )
    .refine(
      (f) =>
        !f || ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Picture must be a JPEG, PNG, or WebP image',
    ),
});

export type FarmFormValues = z.infer<typeof farmSchema>;

export const farmDefaultValues: FarmFormValues = {
  name: '',
  gpsLatitude: 63.4305,
  gpsLongitude: 10.3951,
  numberOfCages: 1,
  hasBarge: false,
  picture: undefined,
};
