import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { Home } from '@/pages/home';
import { TrainingCategories } from '@/pages/training-categories';
import { Trainings } from '@/pages/trainings';
import { TrainingPage } from '@/pages/training';
import { Profile } from '@/pages/profile';
import { PaymentPage } from '@/pages/payment';
import { BookingPage } from '@/pages/booking';
import { LoginPage } from '@/pages/login';
import { EventsPage } from '@/pages/events';
import { EventSessionPage } from '@/pages/event-session';
import { MyBookings } from '@/pages/my-bookings';
import { MyWaitlist } from '@/pages/my-waitlist';
import { MyPayments } from '@/pages/my-payments';
import { ProtectedRoute } from '@/shared/ui/protected-route';

const ProtectedHome = () => <ProtectedRoute><Home /></ProtectedRoute>;
const ProtectedTrainingCategories = () => <ProtectedRoute><TrainingCategories /></ProtectedRoute>;
const ProtectedTrainings = () => <ProtectedRoute><Trainings /></ProtectedRoute>;
const ProtectedTrainingPage = () => <ProtectedRoute><TrainingPage /></ProtectedRoute>;
const ProtectedPaymentPage = () => <ProtectedRoute><PaymentPage /></ProtectedRoute>;
const ProtectedBookingPage = () => <ProtectedRoute><BookingPage /></ProtectedRoute>;
const ProtectedEventsPages = () => <ProtectedRoute><EventsPage /></ProtectedRoute>;
const ProtectedEventSessionPage = () => <ProtectedRoute><EventSessionPage /></ProtectedRoute>;

const ProtectedProfile = () => <ProtectedRoute><Profile /></ProtectedRoute>;
const ProtectedBookings = () => <ProtectedRoute><MyBookings /></ProtectedRoute>;
const ProtectedWaitlist = () => <ProtectedRoute><MyWaitlist /></ProtectedRoute>;
const ProtectedPayments = () => <ProtectedRoute><MyPayments /></ProtectedRoute>;

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: App,
    handle: { bottomBar: { visible: true, mode: 'nav' as const } },
    children: [
      { 
        index: true, 
        Component: ProtectedHome
      },
      {
        path: 'trainings',
        children: [
          { 
            index: true, 
            Component: ProtectedTrainingCategories
          },
          { 
            path: 'categories/:categorySlug', 
            Component: ProtectedTrainings
          },
          {
            path: 'sessions/:trainingId',
            Component: ProtectedTrainingPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
          {
            path: 'sessions/:trainingId/payment',
            Component: ProtectedPaymentPage,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'sessions/:trainingId/booked',
            Component: ProtectedBookingPage,
            handle: { bottomBar: { visible: false } },
          },
        ],
      },
      {
        path: 'events',
        children: [
          { 
            index: true, 
            Component: ProtectedEventsPages,
          },
          {
            path: 'sessions/:sessionId',
            Component: ProtectedEventSessionPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          }
        ]
      },
      { 
        path: 'profile', 
        children: [
          { 
            index: true, 
            Component: ProtectedProfile
          },
          { 
            path: 'bookings', 
            Component: ProtectedBookings
          },
          { 
            path: 'waitlist', 
            Component: ProtectedWaitlist
          },
          { 
            path: 'payments', 
            Component: ProtectedPayments
          },
        ],
      },
    ],
  },
]);