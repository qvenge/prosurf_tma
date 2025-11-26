import { lazy, Suspense } from 'react';
import { App } from './ui/App';
import { AppProvider } from './ui/AppProvider';
import { RouterErrorBoundary } from './ui/RouterErrorBoundary';
import { Spinner } from '@/shared/ui';

// Lazy load all page components for code splitting
const HomePage = lazy(() => import('@/pages/home').then(m => ({ default: m.HomePage })));
const TrainingCategoriesPage = lazy(() => import('@/pages/training-categories').then(m => ({ default: m.TrainingCategoriesPage })));
const Trainings = lazy(() => import('@/pages/trainings').then(m => ({ default: m.Trainings })));
const Profile = lazy(() => import('@/pages/profile').then(m => ({ default: m.Profile })));
const ProfileEditForm = lazy(() => import('@/pages/profile-edit-form').then(m => ({ default: m.ProfileEditForm })));
const ProfileComplete = lazy(() => import('@/pages/profile-complete').then(m => ({ default: m.ProfileComplete })));
const SessionPaymentPage = lazy(() => import('@/pages/session-payment').then(m => ({ default: m.SessionPaymentPage })));
const SeasonTicketPaymentPage = lazy(() => import('@/pages/season-ticket-payment').then(m => ({ default: m.SeasonTicketPaymentPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/payment-success').then(m => ({ default: m.PaymentSuccessPage })));
const EventsPage = lazy(() => import('@/pages/events').then(m => ({ default: m.EventsPage })));
const SessionPage = lazy(() => import('@/pages/session').then(m => ({ default: m.SessionPage })));
const MyBookings = lazy(() => import('@/pages/my-bookings').then(m => ({ default: m.MyBookings })));
const WaitlistPage = lazy(() => import('@/pages/my-waitlist').then(m => ({ default: m.WaitlistPage })));
const MyPayments = lazy(() => import('@/pages/my-payments').then(m => ({ default: m.MyPayments })));
const MySeasonTicketsPage = lazy(() => import('@/pages/my-season-tickets').then(m => ({ default: m.MySeasonTicketsPage })));
const MyCertificatesPage = lazy(() => import('@/pages/my-certificates').then(m => ({ default: m.MyCertificatesPage })));
const CertificatePaymentPage = lazy(() => import('@/pages/certificate-payment').then(m => ({ default: m.CertificatePaymentPage })));
const ArticlePage = lazy(() => import('@/pages/article').then(m => ({ default: m.ArticlePage })));
const CertificateActivationPage = lazy(() => import('@/pages/certificate-activation').then(m => ({ default: m.CertificateActivationPage })));

// Suspense wrapper component for lazy-loaded routes
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <Spinner size="l" />
    </div>
  }>
    {children}
  </Suspense>
);

export const routes = [
  {
    Component: AppProvider,
    children: [
      {
        path: '/',
        Component: App,
        errorElement: <RouterErrorBoundary />,
        handle: { bottomBar: { visible: true, mode: 'nav' as const } },
        children: [
          {
            index: true,
            element: <SuspenseWrapper><HomePage /></SuspenseWrapper>
          },
          {
            path: 'season-tickets/:planId/payment',
            element: <SuspenseWrapper><SeasonTicketPaymentPage /></SuspenseWrapper>,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'certificates/purchase',
            element: <SuspenseWrapper><CertificatePaymentPage /></SuspenseWrapper>,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'certificates/activate',
            element: <SuspenseWrapper><CertificateActivationPage /></SuspenseWrapper>,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'payment-success',
            element: <SuspenseWrapper><PaymentSuccessPage /></SuspenseWrapper>,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'trainings',
            children: [
              {
                index: true,
                element: <SuspenseWrapper><TrainingCategoriesPage /></SuspenseWrapper>
              },
              {
                path: 'categories/:categorySlug',
                element: <SuspenseWrapper><Trainings /></SuspenseWrapper>
              },
              {
                path: 'sessions/:sessionId',
                element: <SuspenseWrapper><SessionPage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: true, mode: 'custom' as const } },
              },
              {
                path: 'sessions/:sessionId/payment',
                element: <SuspenseWrapper><SessionPaymentPage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: false } },
              },
              {
                path: ':bookingId/payment-success',
                element: <SuspenseWrapper><PaymentSuccessPage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: false } },
              },
            ],
          },
          {
            path: 'events',
            children: [
              {
                index: true,
                element: <SuspenseWrapper><EventsPage /></SuspenseWrapper>,
              },
              {
                path: 'sessions/:sessionId',
                element: <SuspenseWrapper><SessionPage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: true, mode: 'custom' as const } },
              },
              {
                path: 'sessions/:sessionId/payment',
                element: <SuspenseWrapper><SessionPaymentPage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: false } },
              }
            ]
          },
          {
            path: 'profile',
            children: [
              {
                index: true,
                element: <SuspenseWrapper><Profile /></SuspenseWrapper>
              },
              {
                path: 'complete',
                element: <SuspenseWrapper><ProfileComplete /></SuspenseWrapper>,
                handle: { bottomBar: { visible: false } },
              },
              {
                path: 'edit',
                element: <SuspenseWrapper><ProfileEditForm /></SuspenseWrapper>,
                handle: { bottomBar: { visible: true, mode: 'custom' as const } },
              },
              {
                path: 'bookings',
                element: <SuspenseWrapper><MyBookings /></SuspenseWrapper>
              },
              {
                path: 'waitlist',
                element: <SuspenseWrapper><WaitlistPage /></SuspenseWrapper>
              },
              {
                path: 'payments',
                element: <SuspenseWrapper><MyPayments /></SuspenseWrapper>
              },
              {
                path: 'season-tickets',
                element: <SuspenseWrapper><MySeasonTicketsPage /></SuspenseWrapper>
              },
              {
                path: 'certificates',
                element: <SuspenseWrapper><MyCertificatesPage /></SuspenseWrapper>,
              },
              {
                path: 'articles/:articleType',
                element: <SuspenseWrapper><ArticlePage /></SuspenseWrapper>,
                handle: { bottomBar: { visible: false } },
              }
            ],
          }
        ],
      },
    ],
  }
];