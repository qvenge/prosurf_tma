import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router';

import { router } from './routes';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss'

import { init } from '@telegram-apps/sdk-react';

init();

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
