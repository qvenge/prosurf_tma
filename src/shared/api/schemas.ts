import { z } from 'zod';

// Base schemas
export const ErrorSchema = z.object({
  code: z.enum([
    'AMOUNT_MISMATCH',
    'DUPLICATE_PAYMENT',
    'HOLD_EXPIRED',
    'NO_SEATS',
    'PROVIDER_UNAVAILABLE',
    'INVALID_CREDENTIALS',
    'USER_EXISTS',
    'WEAK_PASSWORD',
    'INVALID_EMAIL',
    'HAS_ACTIVE_BOOKINGS',
    'HAS_ACTIVE_SESSIONS',
    // Payment-specific error codes
    'INVOICE_CREATION_FAILED',
    'INVOICE_PAYMENT_FAILED',
    'INVOICE_CANCELLED',
    'PAYMENT_PROVIDER_ERROR',
    'INVALID_CURRENCY',
    'PAYMENT_TIMEOUT',
  ]),
  message: z.string(),
  details: z.unknown().nullable(),
});

export const PriceSchema = z.object({
  currency: z.string(),
  amountMinor: z.number().int(),
});

// Common parameters
export const CursorParamSchema = z.string().optional();
export const LimitParamSchema = z.number().int().min(1).max(200).default(20).optional();
export const StartsAfterParamSchema = z.string().datetime().optional();
export const EndsBeforeParamSchema = z.string().datetime().optional();
export const IdempotencyKeySchema = z.string().min(8).max(128);

// User schemas
export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
  id: z.string(),
  telegramId: z.string().nullable(),
  telegramChatId: z.string().nullable().optional(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  email: z.string().nullable().optional(),
  photoUrl: z.string().nullable(),
  dateOfBirth: z.string().datetime().nullish(),
  role: RoleSchema,
  createdAt: z.string().datetime(),
  authMethod: z.enum(['telegram', 'email', 'username']),
  isActive: z.boolean().optional(),
  // Consent fields - dynamic JSON object with content keys
  consents: z.record(z.string(), z.boolean()).optional(),
  consentsAcceptedAt: z.string().datetime().nullable().optional(),
  isProfileComplete: z.boolean().optional(),
});

// Client schema (matches backend ClientDto)
export const ClientSchema = z.object({
  id: z.string(),
  telegramId: z.string().nullable(),
  telegramChatId: z.string().nullable().optional(),
  username: z.string().nullable(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().email().nullable().optional(),
  photoUrl: z.string().nullable(),
  dateOfBirth: z.string().datetime().nullish(),
  isActive: z.boolean().optional(),
  // Consent fields - dynamic JSON object with content keys
  consents: z.record(z.string(), z.boolean()).optional(),
  consentsAcceptedAt: z.string().datetime().nullable().optional(),
  isProfileComplete: z.boolean().optional(),
  createdAt: z.string().datetime(),
});

export const UserUpdateDtoSchema = z.object({
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  photoUrl: z.string().nullable().optional(),
  deletePhoto: z.boolean().optional(),
});

// Complete profile DTO (for first login)
export const CompleteProfileDtoSchema = z.object({
  firstName: z.string().min(1, 'Введите имя').max(128),
  lastName: z.string().min(1, 'Введите фамилию').max(128),
  phone: z.string().min(1, 'Введите номер телефона'),
  consents: z.record(z.string(), z.boolean()),
});

// Event schemas
export const EventTypeSchema = z.enum([
  'training',
  'training:surfing',
  'training:surfskate',
  'tour',
  'activity'
]);

export const EventDescriptionSchema = z.object({
  heading: z.string(),
  body: z.string(),
});

export const TicketPriceSchema = z.object({
  price: PriceSchema,
  description: z.string().nullable().optional(),
});

export const EventTicketSchema = z.object({
  id: z.string(),
  name: z.string(),
  prepayment: TicketPriceSchema.nullable(),
  full: TicketPriceSchema,
});

export const EventTicketCreateSchema = z.object({
  name: z.string(),
  prepayment: TicketPriceSchema.nullable(),
  full: TicketPriceSchema,
});

// Attribute value can be string, number, integer, boolean, or array of strings
export const AttributeValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const EventStatusSchema = z.enum(['ACTIVE', 'CANCELLED']);

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  mapUrl: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketSchema),
  createdAt: z.string().datetime(),
  labels: z.array(z.string()).nullable().optional(),
  attributes: z.record(z.string(), AttributeValueSchema).nullish(),
  images: z.array(z.string()).nullable().optional(),
  previewImage: z.string().nullable().optional(),
  allowDeferredPayment: z.boolean().optional().default(false),
  status: EventStatusSchema.optional(),
});

export const EventCreateDtoSchema = z.object({
  title: z.string(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketCreateSchema),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  images: z.array(z.string()).nullable().optional(),
});

export const EventUpdateDtoSchema = z.object({
  title: z.string().optional(),
  description: z.array(EventDescriptionSchema).nullable().optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  tickets: z.array(EventTicketCreateSchema).optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
  images: z.array(z.string()).nullable().optional(),
});

// Session schemas
export const SessionStatusSchema = z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETE']);

export const SessionSchema = z.object({
  id: z.string(),
  event: EventSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  remainingSeats: z.number().int().min(0),
  hasBooking: z.boolean().optional(),
  onWaitlist: z.boolean().optional(),
  status: SessionStatusSchema.optional(),
  labels: z.array(z.string()).nullable().optional(),
  attributes: z.record(z.string(), AttributeValueSchema).nullish(),
  effectiveLabels: z.array(z.string()).optional(),
  effectiveAttributes: z.record(z.string(), AttributeValueSchema).optional(),
  createdAt: z.string().datetime().optional(),
});

export const SessionCompactSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  remainingSeats: z.number().int().min(0),
  hasBooking: z.boolean().optional(),
  onWaitlist: z.boolean().optional(),
  status: SessionStatusSchema.optional(),
  labels: z.array(z.string()).nullable().optional(),
  attributes: z.record(z.string(), AttributeValueSchema).nullish(),
  effectiveLabels: z.array(z.string()).optional(),
  effectiveAttributes: z.record(z.string(), AttributeValueSchema).optional(),
  createdAt: z.string().datetime().optional(),
});

export const SessionCreateDtoSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionUpdateDtoSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionCreationResponseSchema = z.object({
  items: z.array(SessionSchema),
});

export const SessionBulkUpdateDtoSchema = z.object({
  id: z.string(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  attributes: z.record(z.string(), AttributeValueSchema).optional(),
});

export const SessionBulkDeleteDtoSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  force: z.boolean().default(false).optional(),
});

// Booking schemas
export const BookingStatusSchema = z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);

export const GuestContactSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{7,15}$/),
  firstName: z.string().max(128).nullable().optional(),
  lastName: z.string().max(128).nullable().optional(),
  email: z.string().email().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

export const BookingSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  clientId: z.string().nullable(),
  quantity: z.number().int().min(1),
  status: BookingStatusSchema,
  hold: z.object({
    expiresAt: z.string().datetime(),
  }).nullable().optional(),
  totalPrice: PriceSchema,
  guestContact: GuestContactSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  createdByAdminId: z.string().nullable().optional(),
  isPaid: z.boolean().default(true),
});

export const BookingExtendedSchema = BookingSchema.extend({
  client: UserSchema.optional(),
  session: SessionSchema.optional(),
  paymentInfo: z.object({
    method: z.enum(['card', 'certificate', 'pass', 'bonus', 'composite']),
    paymentId: z.string().nullable().optional(),
    certificateId: z.string().nullable().optional(),
    seasonTicketId: z.string().nullable().optional(),
  }).nullable().optional(),
});

export const BookingCreateDtoSchema = z.object({
  quantity: z.number().int().min(1),
  clientId: z.string().nullable().optional(),
  guestContact: GuestContactSchema.nullable().optional(),
  status: z.enum(['HOLD', 'CONFIRMED']).default('HOLD').optional(),
  ticketId: z.string().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
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
  bookingId: z.string().nullable(), // Nullable for season ticket payments
  amount: PriceSchema,
  status: PaymentStatusSchema,
  createdAt: z.string().datetime(),
  provider: z.enum(['telegram', 'stripe', 'yookassa', 'cloudpayments', 'other']).optional(),
  providerPaymentId: z.string().nullable().optional(),
  providerChargeId: z.string().nullable().optional(),
  nextAction: PaymentNextActionSchema.nullable(),
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

export const BonusPaymentMethodSchema = z.object({
  method: z.literal('bonus'),
  amount: PriceSchema, // Amount in kopecks (amountMinor) - will be converted to bonus by server (1 bonus = 1 ruble = 100 kopecks)
});

export const PaymentMethodRequestSchema = z.discriminatedUnion('method', [
  CardPaymentMethodSchema,
  CertificatePaymentMethodSchema,
  SeasonTicketPaymentMethodSchema,
  BonusPaymentMethodSchema,
]);

// Simplified: paymentMethods is always an array (single or multiple methods)
export const PaymentRequestSchema = z
  .array(PaymentMethodRequestSchema)
  .min(1)
  .max(10);

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

// Payment list schemas
export const PaymentCategorySchema = z.enum(['session', 'seasonTicket', 'certificate']);

export const PaymentListItemSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  category: PaymentCategorySchema,
  labels: z.array(z.string()).nullable().optional(),
  attrs: z.record(z.string(), z.unknown()).nullable().optional(),
  price: PriceSchema,
  bonus: z.number().nullable().optional(), // Bonus amount (1 bonus = 1 ruble)
  status: PaymentStatusSchema,
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

// Note: This schema is defined but not directly used, as we use the union directly in CertificateSchema
// Keeping it for potential future use
// const CertificateDataSchema = z.discriminatedUnion('type', [
//   z.object({ type: z.literal('denomination'), amount: PriceSchema }),
//   z.object({ type: z.literal('passes'), passes: z.number().int().min(1) }),
// ]);

export const CertificateSchema = z.object({
  id: z.string(),
  type: CertificateTypeSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  expiresAt: z.string().datetime().nullable().optional(),
  ownerUserId: z.string().optional(),
});

export const CertificateCreateDtoSchema = z.object({
  type: CertificateTypeSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  expiresAt: z.string().datetime().nullable().optional(),
  ownerUserId: z.string(),
});

// Certificate product schemas (for purchase page)
export const CertificateProductPassesSchema = z.object({
  type: z.literal('passes'),
  passes: z.number().int().min(1),
  price: PriceSchema,
  description: z.string().optional(),
});

export const CertificateProductDenominationSchema = z.object({
  type: z.literal('denomination'),
  minAmount: PriceSchema.optional(),
  maxAmount: PriceSchema.optional(),
  description: z.string().optional(),
});

export const CertificateProductSchema = z.union([
  CertificateProductPassesSchema,
  CertificateProductDenominationSchema,
]);

export const CertificateProductsResponseSchema = z.object({
  items: z.array(CertificateProductSchema),
});

// Purchase certificate schemas
export const PurchaseCertificateDtoSchema = z.object({
  type: CertificateTypeSchema,
  amount: PriceSchema.optional(), // Required for 'denomination' type
  paymentMethods: PaymentRequestSchema, // Array of payment methods
});

export const PurchaseCertificateResponseSchema = z.object({
  certificate: CertificateSchema,
  payment: PaymentSchema,
});

// Certificate status enum
export const CertificateStatusSchema = z.enum([
  'PENDING_ACTIVATION',
  'ACTIVATED',
  'EXPIRED',
]);

// Client brief schema (for certificate ownership info)
export const ClientBriefSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
});

// Full certificate DTO (with all fields from server)
export const CertificateDtoSchema = z.object({
  id: z.string(),
  code: z.string().optional(), // Only visible to purchaser or admin
  type: CertificateTypeSchema,
  status: CertificateStatusSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  purchasedBy: ClientBriefSchema.optional(),
  activatedBy: ClientBriefSchema.optional(),
  activatedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});

// Activate certificate request
export const ActivateCertificateRequestSchema = z.object({
  code: z.string().min(1),
});

// Event filter schemas (for season ticket matching)
export const EventFilterLabelsSchema = z.object({
  any: z.array(z.string()).optional(),
  all: z.array(z.string()).optional(),
  none: z.array(z.string()).optional(),
}).nullable().optional();

export const EventFilterAttributesSchema = z.object({
  eq: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  in: z.record(z.string(), z.array(z.union([z.string(), z.number()])).min(1)).optional(),
  gte: z.record(z.string(), z.number()).optional(),
  lte: z.record(z.string(), z.number()).optional(),
  bool: z.record(z.string(), z.boolean()).optional(),
  exists: z.record(z.string(), z.boolean()).optional(),
}).nullable().optional();

export const EventFilterSchema = z.object({
  labels: EventFilterLabelsSchema,
  attributes: EventFilterAttributesSchema,
}).nullable().optional();

export const SeasonTicketMatchModeSchema = z.enum(['IDS_ONLY', 'FILTER_ONLY', 'ANY', 'ALL']);

// Season ticket schemas
export const SeasonTicketPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  expiresIn: z.number().int().min(1),
  matchMode: SeasonTicketMatchModeSchema.default('ALL').optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema,
});

export const SeasonTicketStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']);

export const SeasonTicketSchema = z.object({
  id: z.string(),
  plan: SeasonTicketPlanSchema,
  clientId: z.string(),
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int().min(0),
  validUntil: z.string().datetime(),
});

// Bonus schemas
export const BonusTransactionTypeSchema = z.enum(['EARN', 'REDEEM', 'ADJUST']);

export const BonusTransactionSchema = z.object({
  id: z.string(),
  type: BonusTransactionTypeSchema,
  amount: z.number(), // Bonus amount (1 bonus = 1 ruble)
  createdAt: z.string().datetime(),
  note: z.string().nullable().optional(),
});

// Certificate activation results
// Simplified schemas for season ticket returned in activation response
export const CertificateActivationSeasonTicketPlanSchema = z.object({
  name: z.string(),
  passes: z.number().int().min(1),
  matchMode: SeasonTicketMatchModeSchema,
});

export const CertificateActivationSeasonTicketDataSchema = z.object({
  id: z.string(),
  plan: CertificateActivationSeasonTicketPlanSchema,
  status: SeasonTicketStatusSchema,
  remainingPasses: z.number().int().min(0),
  validUntil: z.string().datetime(),
});

export const CertificateActivationResultSeasonTicketSchema = z.object({
  type: z.literal('season_ticket'),
  seasonTicket: CertificateActivationSeasonTicketDataSchema,
});

export const CertificateActivationResultBonusSchema = z.object({
  type: z.literal('bonus'),
  bonusOperation: BonusTransactionSchema,
  newBalance: z.number(), // Bonus balance (1 bonus = 1 ruble)
});

// Certificate activation response
export const CertificateActivationResponseSchema = z.object({
  certificate: CertificateDtoSchema,
  result: z.discriminatedUnion('type', [
    CertificateActivationResultSeasonTicketSchema,
    CertificateActivationResultBonusSchema,
  ]),
});

// Check certificate by code response
export const CheckCertificateResponseSchema = z.object({
  code: z.string(),
  type: CertificateTypeSchema,
  data: z.union([
    DenominationCertDataSchema,
    PassesCertDataSchema,
  ]),
  status: CertificateStatusSchema,
  expiresAt: z.string().datetime().nullable().optional(),
  canActivate: z.boolean(),
  reason: z.string().optional(),
});

// Purchased certificates filters
export const PurchasedCertificateFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  status: CertificateStatusSchema.optional(),
});

// Activated certificates filters
export const ActivatedCertificateFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// List certificates response (paginated)
export const ListCertificatesResponseSchema = z.object({
  items: z.array(CertificateDtoSchema),
  next: z.string().nullable(),
});

// Season ticket plan DTOs
export const SeasonTicketPlanCreateDtoSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: PriceSchema,
  passes: z.number().int().min(1),
  expiresIn: z.number().int().min(1),
  matchMode: SeasonTicketMatchModeSchema.default('ALL').optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema,
});

export const SeasonTicketPlanUpdateDtoSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: PriceSchema.optional(),
  passes: z.number().int().min(1).optional(),
  expiresIn: z.number().int().min(1).optional(),
  matchMode: SeasonTicketMatchModeSchema.optional(),
  eventIds: z.array(z.string()).nullable().optional(),
  eventFilter: EventFilterSchema.optional(),
});

// Bonus wallet schema
export const BonusWalletSchema = z.object({
  balance: z.number(), // Bonus balance (1 bonus = 1 ruble)
  history: z.array(BonusTransactionSchema).optional(),
});

export const BonusRulesSchema = z.object({
  earnRate: z.number().min(0).max(1),
  maxRedeemRates: z.object({
    single: z.number().min(0).max(1),
    seasonTicket: z.number().min(0).max(1),
    certificate: z.number().min(0).max(1),
  }),
});

// Waitlist schemas
export const WaitlistEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  clientId: z.string(),
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
export const TelegramLoginDtoSchema = z.object({
  initData: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  client: ClientSchema,
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

// Filter schemas for different endpoints
export const EventFiltersSchema = z.object({
  q: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()])).min(1)).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
});

export const SessionFiltersSchema = z.object({
  eventId: z.string().optional(),
  startsAfter: StartsAfterParamSchema,
  endsBefore: EndsBeforeParamSchema,
  minRemainingSeats: z.number().int().min(0).optional(),
  onWaitlist: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'startsAt']).default('startsAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()])).min(1)).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
});

export const BookingFiltersSchema = z.object({
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.array(z.enum(['HOLD', 'CONFIRMED', 'CANCELLED', 'EXPIRED'])).optional(),
  bookingType: z.enum(['registered', 'guest', 'all']).optional(),
  includeUser: z.boolean().optional(),
  includeSession: z.boolean().optional(),
  includePaymentInfo: z.boolean().optional(),
  includeGuestContact: z.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  startsAfter: z.string().datetime().optional(),
  startsBefore: z.string().datetime().optional(),
  endsAfter: z.string().datetime().optional(),
  endsBefore: z.string().datetime().optional(),
  minQuantity: z.number().int().min(1).optional(),
  maxQuantity: z.number().int().min(1).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  eventId: z.string().optional(),
  seasonTicketId: z.string().optional(),
  createdBy: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalPrice', 'status', 'startsAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), AttributeValueSchema).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()])).min(1)).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
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
  sessionId: z.string().optional(),
  eventId: z.string().optional(),
  status: z.array(SeasonTicketStatusSchema).optional(),
  hasRemainingPasses: z.boolean().optional(),
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
  eventIds: z.array(z.string()).optional(),
  sessionId: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

export const PaymentFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  status: z.array(PaymentStatusSchema).optional(),
  category: PaymentCategorySchema.optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  'labels.any': z.array(z.string()).optional(),
  'labels.all': z.array(z.string()).optional(),
  'labels.none': z.array(z.string()).optional(),
  'attr.eq': z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  'attr.in': z.record(z.string(), z.array(z.union([z.string(), z.number()])).min(1)).optional(),
  'attr.gte': z.record(z.string(), z.number()).optional(),
  'attr.lte': z.record(z.string(), z.number()).optional(),
  'attr.bool': z.record(z.string(), z.boolean()).optional(),
  'attr.exists': z.record(z.string(), z.boolean()).optional(),
  sortBy: z.enum(['createdAt', 'price', 'status']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Image schemas
export const ImageUploaderSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
});

export const ImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  objectName: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number().int(),
  tags: z.array(z.string()),
  uploader: ImageUploaderSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ImageFiltersSchema = z.object({
  q: z.string().optional(),
  mimetype: z.string().optional(),
  'tags.any': z.array(z.string()).optional(),
  'tags.all': z.array(z.string()).optional(),
  'tags.none': z.array(z.string()).optional(),
  minSize: z.number().int().min(0).optional(),
  maxSize: z.number().int().min(0).optional(),
  uploadedAfter: z.string().datetime().optional(),
  uploadedBefore: z.string().datetime().optional(),
  uploadedBy: z.string().optional(),
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
});

// Content schemas (universal key-value content storage)
export const ContentSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const ContentFiltersSchema = z.object({
  cursor: CursorParamSchema,
  limit: LimitParamSchema,
  keyPrefix: z.string().optional(),
  q: z.string().optional(),
});