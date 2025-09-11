import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { Home } from '@/pages/home';
import { TrainingCategories } from '@/pages/training-categories';
import { Trainings } from '@/pages/trainings';
import { TrainingPage } from '@/pages/training';
import { Profile } from '@/pages/profile';
import { PaymentPage } from '@/pages/payment';
import { BookingPage } from '@/pages/booking';
import { EventsPage } from '@/pages/events';
import { EventSessionPage } from '@/pages/event-session';
import { MyBookings } from '@/pages/my-bookings';
import { MyWaitlist } from '@/pages/my-waitlist';
import { MyPayments } from '@/pages/my-payments';

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
        path: 'trainings',
        children: [
          { 
            index: true, 
            Component: TrainingCategories
          },
          { 
            path: 'categories/:categorySlug', 
            Component: Trainings
          },
          {
            path: 'sessions/:trainingId',
            Component: TrainingPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
          {
            path: 'sessions/:trainingId/payment',
            Component: PaymentPage,
            handle: { bottomBar: { visible: false } },
          },
          {
            path: 'sessions/:trainingId/booked',
            Component: BookingPage,
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
            Component: EventSessionPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
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
            path: 'bookings', 
            Component: MyBookings
          },
          { 
            path: 'waitlist', 
            Component: MyWaitlist
          },
          { 
            path: 'payments', 
            Component: MyPayments
          },
        ],
      },
    ],
  },
]);