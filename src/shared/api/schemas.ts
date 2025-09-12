import { z } from 'zod';

// Base schemas
export const ErrorSchema = z.object({
  code: z.enum([
    'AMOUNT_MISMATCH',
    'DUPLICATE_PAYMENT',
    'HOLD_EXPIRED',
    'NO_SEATS',
    'PROVIDER_UNAVAILABLE',
  ]),
  message: z.string(),
  details: z.unknown().nullable(),
});

export const PriceSchema = z.object({
  currency: z.string(),
  amountMinor: z.number().int(),
});

// User schemas
export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: RoleSchema,
  createdAt: z.string().datetime(),
});

export const UserUpdateDtoSchema = z.object({
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Event schemas
export const EventTicketSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: PriceSchema,
  capacity: z.number().int().min(0),
});

export const EventTicketCreateSchema = z.object({
  name: z.string(),
  price: PriceSchema,
  capacity: z.number().int().min(0),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  tickets: z.array(EventTicketSchema),
  createdAt: z.string().datetime(),
});

export const EventCreateDtoSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  tickets: z.array(EventTicketCreateSchema),
});

// Session schemas
export const SessionStatusSchema = z.enum(['SCHEDULED', 'CANCELLED']);

export const SessionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable(),
  capacity: z.number().int().min(0),
  remainingSeats: z.number().int().min(0),
  hasBooking: z.boolean().optional(),
  onWaitlist: z.boolean().optional(),
  status: SessionStatusSchema.optional(),
});

export const SessionCreateDtoSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0),
});

export const SessionUpdateDtoSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).optional(),
});

export const SessionCreationResponseSchema = z.object({
  items: z.array(SessionSchema),
});

// Booking schemas
export const BookingStatusSchema = z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);

export const BookingSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  quantity: z.number().int().min(1),
  status: BookingStatusSchema,
  hold: z.object({
    expiresAt: z.string().datetime(),
  }).nullable(),
  totalPrice: PriceSchema,
  createdAt: z.string().datetime(),
});

export const BookRequestSchema = z.object({
  quantity: z.number().int().min(1),
});

// Payment schemas
export const PaymentStatusSchema = z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED']);

export const PaymentNextActionOpenInvoiceSchema = z.object({
  type: z.literal('openInvoice'),
  slugOrUrl: z.string(),
});

export const PaymentNextActionRedirectSchema = z.object({
  type: z.literal('redirect'),
  url: z.string().url(),
});

export const PaymentNextActionNoneSchema = z.object({
  type: z.literal('none'),
});

export const PaymentNextActionSchema = z.union([
  PaymentNextActionOpenInvoiceSchema,
  PaymentNextActionRedirectSchema,
  PaymentNextActionNoneSchema,
]);

export const PaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  amount: PriceSchema,
  status: PaymentStatusSchema,
  createdAt: z.string().datetime(),
  provider: z.enum(['telegram', 'stripe', 'yookassa', 'cloudpayments', 'other']).optional(),
  providerPaymentId: z.string().nullable().optional(),
  providerChargeId: z.string().nullable().optional(),
  nextAction: PaymentNextActionSchema.optional(),
});

// Payment method schemas
export const CardPaymentMethodSchema = z.object({
  method: z.literal('card'),
  provider: z.enum(['telegram', 'stripe', 'yookassa', 'cloudpayments']).optional(),
  returnUrl: z.string().url().optional(),
});

export const CertificatePaymentMethodSchema = z.object({
  method: z.literal('certificate'),
  certificateId: z.string(),
});

export const SeasonTicketPaymentMethodSchema = z.object({
  method: z.literal('pass'),
  seasonTicketId: z.string(),
  passesToSpend: z.number().int().min(1),
});

export const CashbackPaymentMethodSchema = z.object({
  method: z.literal('cashback'),
  amount: PriceSchema,
});

export const PaymentMethodRequestSchema = z.discriminatedUnion('method', [
  CardPaymentMethodSchema,
  CertificatePaymentMethodSchema,
  SeasonTicketPaymentMethodSchema,
  CashbackPaymentMethodSchema,
]);

export const CompositePaymentMethodRequestSchema = z.object({
  methods: z.array(PaymentMethodRequestSchema).min(1),
});

export const PaymentRequestSchema = z.union([
  PaymentMethodRequestSchema,
  CompositePaymentMethodRequestSchema,
]);

// Refund schemas
export const RefundRequestSchema = z.object({
  amount: PriceSchema.optional(),
  reason: z.string().max(256).optional(),
});

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: PriceSchema,
  createdAt: z.string().datetime(),
});

// Certificate schemas
export const CertificateTypeSchema = z.enum(['denomination', 'passes']);

export const DenominationCertDataSchema = z.object({
  amount: PriceSchema,
});

export const PassesCertDataSchema = z.object({
  passes: z.number().int().min(1),
});

const CertificateDataSchema = z.union([
  DenominationCertDataSchema,
  PassesCertDataSchema,
]);

export const CertificateSchema = z.object({
  id: z.string(),
  type: CertificateTypeSchema,
  data: CertificateDataSchema,
  expiresAt: z.string().datetime().nullable(),
  ownerUserId: z.string(),
});

export const CertificateCreateDtoSchema = z.object({
  type: CertificateTypeSchema,
  data: CertificateDataSchema,
  expiresAt: z.string().datetime().nullable().optional(),
  ownerUserId: z.string(),
});

// Season ticket schemas
export const SeasonTicketPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  eventIds: z.array(z.string()),
});

export const SeasonTicketPlanCreateDtoSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  eventIds: z.array(z.string()),
});

export const SeasonTicketPlanUpdateDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: PriceSchema.optional(),
  passes: z.number().int().min(1).optional(),
  eventIds: z.array(z.string()).optional(),
});

export const SeasonTicketStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);

export const SeasonTicketSchema = z.object({
  id: z.string(),
  planId: z.string(),
  userId: z.string(),
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int().min(0),
  validUntil: z.string().datetime().nullable(),
});

// Cashback schemas
export const CashbackTransactionTypeSchema = z.enum(['EARN', 'REDEEM', 'ADJUST']);

export const CashbackTransactionSchema = z.object({
  id: z.string(),
  type: CashbackTransactionTypeSchema,
  amount: PriceSchema,
  createdAt: z.string().datetime(),
  note: z.string().nullable(),
});

export const CashbackWalletSchema = z.object({
  balance: PriceSchema,
  history: z.array(CashbackTransactionSchema),
});

export const CashbackRulesSchema = z.object({
  earnRates: z.array(z.object({
    product: z.enum(['single', 'certificate', 'seasonTicket']),
    rate: z.number().min(0).max(1),
  })),
  maxRedeemRate: z.number().min(0).max(1),
});

// Waitlist schemas
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  position: z.number().int().min(1),
});

// Admin schemas
export const AuditLogSchema = z.object({
  id: z.string(),
  ts: z.string().datetime(),
  actorUserId: z.string(),
  action: z.string(),
  subjectType: z.string(),
  subjectId: z.string(),
});

export const JobExecutionResultSchema = z.object({
  expired: z.number().int(),
});

// Auth schemas
export const LoginRequestSchema = z.object({
  initData: z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Telegram webhook schemas
export const TelegramUserSchema = z.object({
  id: z.number().int(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
});

export const SuccessfulPaymentSchema = z.object({
  currency: z.string(),
  total_amount: z.number().int(),
  invoice_payload: z.string(),
  telegram_payment_charge_id: z.string(),
  provider_payment_charge_id: z.string(),
});

export const MessageSchema = z.object({
  message_id: z.number().int(),
  from: TelegramUserSchema,
  date: z.number().int(),
  chat: z.object({}).passthrough(),
  successful_payment: SuccessfulPaymentSchema.optional(),
});

export const OrderInfoSchema = z.object({}).passthrough();

export const PreCheckoutQuerySchema = z.object({
  id: z.string(),
  from: TelegramUserSchema,
  currency: z.string(),
  total_amount: z.number().int(),
  invoice_payload: z.string(),
  shipping_option_id: z.string().optional(),
  order_info: OrderInfoSchema.optional(),
});

export const TelegramUpdateSchema = z.object({
  update_id: z.number().int(),
  pre_checkout_query: PreCheckoutQuerySchema.optional(),
  message: MessageSchema.optional(),
}).passthrough();

// Paginated response schemas
export const PaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) => z.object({
  items: z.array(itemSchema),
  next: z.string().nullable(),
});

// Common parameters
export const CursorParamSchema = z.string().optional();
export const LimitParamSchema = z.number().int().min(1).max(200).default(20).optional();
export const StartsAfterParamSchema = z.string().datetime().optional();
export const EndsBeforeParamSchema = z.string().datetime().optional();
export const IdempotencyKeySchema = z.string().min(8).max(128);

// Filter schemas for different endpoints
export const EventFiltersSchema = z.object({
  q: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const SessionFiltersSchema = z.object({
  eventId: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const BookingFiltersSchema = z.object({
  userId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const UserFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const CertificateFiltersSchema = z.object({
  userId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const SeasonTicketFiltersSchema = z.object({
  userId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const WaitlistFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const AuditLogFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const SeasonTicketPlanFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});