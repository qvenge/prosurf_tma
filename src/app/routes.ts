import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { Home } from '@/pages/home';
import { TrainingCategories } from '@/pages/training-categories';
import { Trainings } from '@/pages/trainings';
import { TrainingPage } from '@/pages/training';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: Home },
      {
        path: 'trainings',
        children: [
          { index: true, Component: TrainingCategories },
          { path: 'categiries/:categoryId', Component: Trainings },
          { path: 'items/:trainingId', Component: TrainingPage },
        ],
      },
    ],
  },
]);