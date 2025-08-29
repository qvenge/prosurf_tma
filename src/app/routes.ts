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
    handle: { bottomBar: { visible: true, mode: 'nav' as const } },
    children: [
      { index: true, Component: Home },
      {
        path: 'trainings',
        children: [
          { index: true, Component: TrainingCategories },
          { path: 'categories/:categorySlug', Component: Trainings },
          {
            path: 'sessions/:trainingId',
            Component: TrainingPage,
            handle: { bottomBar: { visible: true, mode: 'custom' as const } },
          },
        ],
      },
    ],
  },
]);