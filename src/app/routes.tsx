import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { Home } from '@/pages/home';
import { TrainingCategoriesPage } from '@/pages/training-categories';
import { Trainings } from '@/pages/trainings';
import { Profile } from '@/pages/profile';
import { ProfileEditForm } from '@/pages/profile-edit-form';
import { PaymentPage } from '@/pages/payment';
import { PaymentSuccessPage } from '@/pages/payment-success';
import { EventsPage } from '@/pages/events';
import { SessionPage } from '@/pages/session';
import { MyBookings } from '@/pages/my-bookings';
import { WaitlistPage } from '@/pages/my-waitlist';
import { MyPayments } from '@/pages/my-payments';
import { MySeasonTicketsPage } from '@/pages/my-season-tickets';

import { AppProvider } from './ui/AppProvider';

const _App = () => <AppProvider><App /></AppProvider>;

export const router = createBrowserRouter([
  {
    path: '/',
    Component: _App,
    handle: { bottomBar: { visible: true, mode: 'nav' as const } },
    children: [
      { 
        index: true, 
        Component: Home
      },
      {
        path: 'season-tickets/:planId/payment',
        Component: PaymentPage,
        handle: { bottomBar: { visible: false } },
      },
      {
        path: 'payment-success',
        Component: PaymentSuccessPage,
        handle: { bottomBar: { visible: false } },
      },
      {
        path: 'trainings',
        children: [
          { 
            index: true, 
            Component: TrainingCategoriesPage
          },
          { 
            path: 'categories/:categorySlug', 
            Component: Trainings
          },
          {
            path: 'sessions/:sessionId',
            Component: SessionPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
          {
            path: 'sessions/:sessionId/payment',
            Component: PaymentPage,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: ':bookingId/payment-success',
            Component: PaymentSuccessPage,
            handle: { bottomBar: { visible: false } },
          },
        ],
      },
      {
        path: 'events',
        children: [
          { 
            index: true, 
            Component: EventsPage,
          },
          {
            path: 'sessions/:sessionId',
            Component: SessionPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
          {
            path: 'sessions/:sessionId/payment',
            Component: PaymentPage,
            handle: { bottomBar: { visible: false } },
          }
        ]
      },
      {
        path: 'profile', 
        children: [
          { 
            index: true, 
            Component: Profile
          },
          {
            path: 'edit',
            Component: ProfileEditForm,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
          { 
            path: 'bookings', 
            Component: MyBookings
          },
          { 
            path: 'waitlist', 
            Component: WaitlistPage
          },
          { 
            path: 'payments', 
            Component: MyPayments
          },
          {
            path: 'season-tickets',
            Component: MySeasonTicketsPage
          }
        ],
      }
    ],
  },
]);