import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { Home } from '@/pages/home';
import { TrainingCategories } from '@/pages/training-categories';
import { Trainings } from '@/pages/trainings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: Home },
      { path: 'trainings', Component: TrainingCategories },
      { path: 'trainings/:category', Component: Trainings }
    ],
  },
]);