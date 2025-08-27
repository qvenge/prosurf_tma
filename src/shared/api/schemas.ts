import { z } from 'zod';

export const CurrencySchema = z.enum(['RUB', 'USD']);

export const EventTypeSchema = z.enum(['surfingTraining', 'surfskateTraining', 'tour', 'other']);

export const PriceSchema = z.object({
  currency: CurrencySchema,
  amount: z.string().regex(/^\d+\.\d{2}$/, 'Price must be in format "0.00"'),
});

export const DescriptionSectionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const EventSessionSchema = z.object({
  title: z.string(),
  type: EventTypeSchema,
  location: z.string(),
  capacity: z.number().int().positive(),
  start: z.string().datetime(),
  end: z.string().datetime().nullable(),
  bookingPrice: PriceSchema.nullable(),
  price: PriceSchema,
  remainingSeats: z.number().int().nonnegative(),
  description: z.array(DescriptionSectionSchema),
});

export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterDataSchema = z.object({
  email: z.string().email('Invalid email format').transform(email => email.toLowerCase().trim()),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one digit'),
  name: z.string().min(1).optional(),
});

export const LoginResponseSchema = z.object({
  tokenType: z.string(),
  accessToken: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
});

export const LogoutRequestSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

export const EventSessionFiltersSchema = z.object({
  types: z.array(EventTypeSchema).optional(),
  minRemainingSeats: z.number().int().nonnegative().optional(),
});

export const GetEventSessionsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  filters: EventSessionFiltersSchema.optional(),
  offset: z.number().int().nonnegative().optional().default(0),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type DescriptionSection = z.infer<typeof DescriptionSectionSchema>;
export type User = z.infer<typeof UserSchema>;
export type EventSession = z.infer<typeof EventSessionSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterData = z.infer<typeof RegisterDataSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type EventSessionFilters = z.infer<typeof EventSessionFiltersSchema>;
export type GetEventSessionsQuery = z.infer<typeof GetEventSessionsQuerySchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;