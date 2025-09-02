import { z } from 'zod';

export const CurrencySchema = z.enum(['RUB', 'USD']);

export const EventTypeSchema = z.enum(['surfingTraining', 'surfskateTraining', 'tour', 'other']);

export const RoleSchema = z.enum(['USER', 'ADMIN']);

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
  role: RoleSchema,
  createdAt: z.string().datetime(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export const EventSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: EventTypeSchema,
  location: z.string(),
  capacity: z.number().int().positive(),
  start: z.string().datetime(),
  end: z.string().datetime().nullable(),
  bookingPrice: PriceSchema.optional().nullable(),
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

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
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

export const BookingStatusSchema = z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);

export const CreateBookingSchema = z.object({
  sessionId: z.string(),
  idempotencyKey: z.string().optional(),
});

export const BookingResponseSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  status: BookingStatusSchema,
  price: PriceSchema,
  holdExpiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const BookingWithSessionResponseSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  session: z.object({
    id: z.string(),
    title: z.string(),
    type: EventTypeSchema,
    location: z.string(),
    start: z.string().datetime(),
    end: z.string().datetime().nullable(),
  }),
  status: BookingStatusSchema,
  price: PriceSchema,
  holdExpiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
}).transform((data) => ({
  ...data,
  sessionId: data.sessionId || data.session.id,
}));

export const PaymentStatusSchema = z.enum(['REQUIRES_ACTION', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED']);

export const PaymentMethodSchema = z.enum(['PAYMENT', 'SUBSCRIPTION', 'GIFT', 'WALLET']);

export const YooKassaPaymentMethodTypeSchema = z.enum([
  'bank_card',
  'yoo_money', 
  'sberbank',
  'alfabank',
  'qiwi',
  'apple_pay',
  'google_pay',
  'webmoney',
  'tinkoff_bank',
  'sbp',
  'b2b_sberbank',
  'mobile_balance',
  'cash',
  'installments'
]);

export const GetUserBookingsQuerySchema = z.object({
  status: z.array(BookingStatusSchema).optional(),
  sessionType: z.array(EventTypeSchema).optional(),
  sessionStartFrom: z.string().datetime().optional(),
  sessionStartTo: z.string().datetime().optional(),
  sortBy: z.enum(['bookingCreatedAt', 'sessionStart']).default('bookingCreatedAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
});

export const CreatePaymentIntentSchema = z.object({
  bookingId: z.string(),
  method: PaymentMethodSchema,
});

export const PaymentResponseSchema = z.object({
  id: z.string(),
  bookingId: z.string().nullable(),
  provider: z.string(),
  providerRef: z.string(),
  status: PaymentStatusSchema,
  amountMinor: z.number().int(),
  currency: CurrencySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePaymentIntentResponseSchema = z.object({
  payment: PaymentResponseSchema,
  checkoutUrl: z.string().nullable().optional(),
  clientSecret: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable(),
});

export const WebhookResponseSchema = z.object({
  received: z.boolean(),
  timestamp: z.string().datetime().optional(),
  error: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

// Subscription Schemas
export const SubscriptionStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELED']);

export const SubscriptionPlanResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  sessionsTotal: z.number().int(),
  validityDays: z.number().int(),
  priceMinor: z.number().int(),
  currency: CurrencySchema,
  eventType: EventTypeSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export const SubscriptionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  remaining: z.number().int(),
  expiresAt: z.string().datetime(),
  status: SubscriptionStatusSchema,
  createdAt: z.string().datetime(),
  plan: SubscriptionPlanResponseSchema,
});

export const PurchaseSubscriptionSchema = z.object({
  planId: z.string(),
});

export const PurchaseSubscriptionResponseSchema = z.object({
  paymentId: z.string(),
  providerRef: z.string(),
  clientSecret: z.string().nullable().optional(),
  checkoutUrl: z.string().nullable().optional(),
  amountMinor: z.number().int(),
  currency: z.string(),
  planId: z.string(),
});

export const GetPlansQuerySchema = z.object({
  eventType: EventTypeSchema.optional(),
});

export type Currency = z.infer<typeof CurrencySchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type Role = z.infer<typeof RoleSchema>;
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
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type BookingResponse = z.infer<typeof BookingResponseSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CreatePaymentIntent = z.infer<typeof CreatePaymentIntentSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type CreatePaymentIntentResponse = z.infer<typeof CreatePaymentIntentResponseSchema>;
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionPlanResponse = z.infer<typeof SubscriptionPlanResponseSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type PurchaseSubscription = z.infer<typeof PurchaseSubscriptionSchema>;
export type PurchaseSubscriptionResponse = z.infer<typeof PurchaseSubscriptionResponseSchema>;
export type GetPlansQuery = z.infer<typeof GetPlansQuerySchema>;
export type BookingWithSessionResponse = z.infer<typeof BookingWithSessionResponseSchema>;
export type YooKassaPaymentMethodType = z.infer<typeof YooKassaPaymentMethodTypeSchema>;
export type GetUserBookingsQuery = z.infer<typeof GetUserBookingsQuerySchema>;