import type { z } from 'zod';
import * as schemas from './schemas';

// Base types
export type ApiError = z.infer<typeof schemas.ErrorSchema>;
export type Price = z.infer<typeof schemas.PriceSchema>;

// User types
export type Role = z.infer<typeof schemas.RoleSchema>;
export type User = z.infer<typeof schemas.UserSchema>;
export type Client = z.infer<typeof schemas.ClientSchema>;
export type UserUpdateDto = z.infer<typeof schemas.UserUpdateDtoSchema>;
export type CompleteProfileDto = z.infer<typeof schemas.CompleteProfileDtoSchema>;

// Event types
export type EventType = z.infer<typeof schemas.EventTypeSchema>;
export type EventDescription = z.infer<typeof schemas.EventDescriptionSchema>;
export type TicketPrice = z.infer<typeof schemas.TicketPriceSchema>;
export type AttributeValue = z.infer<typeof schemas.AttributeValueSchema>;
export type EventTicket = z.infer<typeof schemas.EventTicketSchema>;
export type EventTicketCreate = z.infer<typeof schemas.EventTicketCreateSchema>;
export type EventStatus = z.infer<typeof schemas.EventStatusSchema>;
export type Event = z.infer<typeof schemas.EventSchema>;
export type EventCreateDto = z.infer<typeof schemas.EventCreateDtoSchema>;
export type EventUpdateDto = z.infer<typeof schemas.EventUpdateDtoSchema>;

// Session types
export type SessionStatus = z.infer<typeof schemas.SessionStatusSchema>;
export type Session = z.infer<typeof schemas.SessionSchema>;
export type SessionCompact = z.infer<typeof schemas.SessionCompactSchema>;
export type SessionCreateDto = z.infer<typeof schemas.SessionCreateDtoSchema>;
export type SessionUpdateDto = z.infer<typeof schemas.SessionUpdateDtoSchema>;
export type SessionCreationResponse = z.infer<typeof schemas.SessionCreationResponseSchema>;
export type SessionBulkUpdateDto = z.infer<typeof schemas.SessionBulkUpdateDtoSchema>;
export type SessionBulkDeleteDto = z.infer<typeof schemas.SessionBulkDeleteDtoSchema>;

// Booking types
export type BookingStatus = z.infer<typeof schemas.BookingStatusSchema>;
export type GuestContact = z.infer<typeof schemas.GuestContactSchema>;
export type Booking = z.infer<typeof schemas.BookingSchema>;
export type BookingExtended = z.infer<typeof schemas.BookingExtendedSchema>;
export type BookingCreateDto = z.infer<typeof schemas.BookingCreateDtoSchema>;
export type BookRequest = z.infer<typeof schemas.BookRequestSchema>;

// Booking with hold TTL header
export interface BookingWithHoldTTL {
  booking: Booking;
  holdTtlSeconds: number | null;
}

// Payment types
export type PaymentStatus = z.infer<typeof schemas.PaymentStatusSchema>;
export type PaymentNextActionOpenInvoice = z.infer<typeof schemas.PaymentNextActionOpenInvoiceSchema>;
export type PaymentNextActionRedirect = z.infer<typeof schemas.PaymentNextActionRedirectSchema>;
export type PaymentNextActionNone = z.infer<typeof schemas.PaymentNextActionNoneSchema>;
export type PaymentNextAction = z.infer<typeof schemas.PaymentNextActionSchema>;
export type Payment = z.infer<typeof schemas.PaymentSchema>;
export type PaymentCategory = z.infer<typeof schemas.PaymentCategorySchema>;
export type PaymentListItem = z.infer<typeof schemas.PaymentListItemSchema>;

// Payment method types
export type CardPaymentMethod = z.infer<typeof schemas.CardPaymentMethodSchema>;
export type CertificatePaymentMethod = z.infer<typeof schemas.CertificatePaymentMethodSchema>;
export type SeasonTicketPaymentMethod = z.infer<typeof schemas.SeasonTicketPaymentMethodSchema>;
export type BonusPaymentMethod = z.infer<typeof schemas.BonusPaymentMethodSchema>;
export type PaymentMethodRequest = z.infer<typeof schemas.PaymentMethodRequestSchema>;
// Simplified: PaymentRequest is always an array of payment methods
export type PaymentRequest = z.infer<typeof schemas.PaymentRequestSchema>;

// Refund types
export type RefundRequest = z.infer<typeof schemas.RefundRequestSchema>;
export type Refund = z.infer<typeof schemas.RefundSchema>;

// Certificate types
export type CertificateType = z.infer<typeof schemas.CertificateTypeSchema>;
export type DenominationCertData = z.infer<typeof schemas.DenominationCertDataSchema>;
export type PassesCertData = z.infer<typeof schemas.PassesCertDataSchema>;
export type Certificate = z.infer<typeof schemas.CertificateSchema>;
export type CertificateCreateDto = z.infer<typeof schemas.CertificateCreateDtoSchema>;

// Certificate product types (for purchase page)
export type CertificateProductPasses = z.infer<typeof schemas.CertificateProductPassesSchema>;
export type CertificateProductDenomination = z.infer<typeof schemas.CertificateProductDenominationSchema>;
export type CertificateProduct = z.infer<typeof schemas.CertificateProductSchema>;
export type CertificateProductsResponse = z.infer<typeof schemas.CertificateProductsResponseSchema>;

// Purchase certificate types
export type PurchaseCertificateDto = z.infer<typeof schemas.PurchaseCertificateDtoSchema>;
export type PurchaseCertificateResponse = z.infer<typeof schemas.PurchaseCertificateResponseSchema>;

// Certificate status and activation types
export type CertificateStatus = z.infer<typeof schemas.CertificateStatusSchema>;
export type ClientBrief = z.infer<typeof schemas.ClientBriefSchema>;
export type CertificateDto = z.infer<typeof schemas.CertificateDtoSchema>;
export type ActivateCertificateRequest = z.infer<typeof schemas.ActivateCertificateRequestSchema>;
export type CertificateActivationResultSeasonTicket = z.infer<typeof schemas.CertificateActivationResultSeasonTicketSchema>;
export type CertificateActivationResultBonus = z.infer<typeof schemas.CertificateActivationResultBonusSchema>;
export type CertificateActivationResponse = z.infer<typeof schemas.CertificateActivationResponseSchema>;
export type CheckCertificateResponse = z.infer<typeof schemas.CheckCertificateResponseSchema>;
export type PurchasedCertificateFilters = z.infer<typeof schemas.PurchasedCertificateFiltersSchema>;
export type ActivatedCertificateFilters = z.infer<typeof schemas.ActivatedCertificateFiltersSchema>;
export type ListCertificatesResponse = z.infer<typeof schemas.ListCertificatesResponseSchema>;

// Event filter types (for season ticket matching)
export type EventFilterLabels = z.infer<typeof schemas.EventFilterLabelsSchema>;
export type EventFilterAttributes = z.infer<typeof schemas.EventFilterAttributesSchema>;
export type EventFilter = z.infer<typeof schemas.EventFilterSchema>;
export type SeasonTicketMatchMode = z.infer<typeof schemas.SeasonTicketMatchModeSchema>;

// Season ticket types
export type SeasonTicketPlan = z.infer<typeof schemas.SeasonTicketPlanSchema>;
export type SeasonTicketPlanCreateDto = z.infer<typeof schemas.SeasonTicketPlanCreateDtoSchema>;
export type SeasonTicketPlanUpdateDto = z.infer<typeof schemas.SeasonTicketPlanUpdateDtoSchema>;
export type SeasonTicketStatus = z.infer<typeof schemas.SeasonTicketStatusSchema>;
export type SeasonTicket = z.infer<typeof schemas.SeasonTicketSchema>;

// Bonus types
export type BonusTransactionType = z.infer<typeof schemas.BonusTransactionTypeSchema>;
export type BonusTransaction = z.infer<typeof schemas.BonusTransactionSchema>;
export type BonusWallet = z.infer<typeof schemas.BonusWalletSchema>;
export type BonusRules = z.infer<typeof schemas.BonusRulesSchema>;

// Waitlist types
export type WaitlistEntry = z.infer<typeof schemas.WaitlistEntrySchema>;

// Admin types
export type AuditLog = z.infer<typeof schemas.AuditLogSchema>;
export type JobExecutionResult = z.infer<typeof schemas.JobExecutionResultSchema>;

// Auth types
export type TelegramLoginDto = z.infer<typeof schemas.TelegramLoginDtoSchema>;
export type AuthResponse = z.infer<typeof schemas.AuthResponseSchema>;
export type RefreshRequest = z.infer<typeof schemas.RefreshRequestSchema>;
export type RefreshResponse = z.infer<typeof schemas.RefreshResponseSchema>;

// Telegram webhook types
export type TelegramUser = z.infer<typeof schemas.TelegramUserSchema>;
export type SuccessfulPayment = z.infer<typeof schemas.SuccessfulPaymentSchema>;
export type Message = z.infer<typeof schemas.MessageSchema>;
export type OrderInfo = z.infer<typeof schemas.OrderInfoSchema>;
export type PreCheckoutQuery = z.infer<typeof schemas.PreCheckoutQuerySchema>;
export type TelegramUpdate = z.infer<typeof schemas.TelegramUpdateSchema>;

// Paginated response types
export type PaginatedResponse<T> = {
  items: T[];
  next: string | null;
};

// Filter types
export type EventFilters = z.infer<typeof schemas.EventFiltersSchema>;
export type SessionFilters = z.infer<typeof schemas.SessionFiltersSchema>;
export type BookingFilters = z.infer<typeof schemas.BookingFiltersSchema>;
export type UserFilters = z.infer<typeof schemas.UserFiltersSchema>;
export type CertificateFilters = z.infer<typeof schemas.CertificateFiltersSchema>;
export type SeasonTicketFilters = z.infer<typeof schemas.SeasonTicketFiltersSchema>;
export type WaitlistFilters = z.infer<typeof schemas.WaitlistFiltersSchema>;
export type AuditLogFilters = z.infer<typeof schemas.AuditLogFiltersSchema>;
export type SeasonTicketPlanFilters = z.infer<typeof schemas.SeasonTicketPlanFiltersSchema>;
export type PaymentFilters = z.infer<typeof schemas.PaymentFiltersSchema>;

// Image types
export type ImageUploader = z.infer<typeof schemas.ImageUploaderSchema>;
export type Image = z.infer<typeof schemas.ImageSchema>;
export type ImageFilters = z.infer<typeof schemas.ImageFiltersSchema>;

// Common parameter types
export type CursorParam = z.infer<typeof schemas.CursorParamSchema>;
export type LimitParam = z.infer<typeof schemas.LimitParamSchema>;
export type StartsAfterParam = z.infer<typeof schemas.StartsAfterParamSchema>;
export type EndsBeforeParam = z.infer<typeof schemas.EndsBeforeParamSchema>;
export type IdempotencyKey = z.infer<typeof schemas.IdempotencyKeySchema>;

// HTTP response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  status: number;
  statusText: string;
}

// Authentication context types
export interface AuthState {
  user: (User | Client) | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Query key factory types
export interface QueryKeyFactory {
  all: readonly string[];
  lists: () => readonly string[];
  list: (filters?: Record<string, unknown>) => readonly string[];
  details: () => readonly string[];
  detail: (id: string) => readonly string[];
}
