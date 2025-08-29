import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom';

import { router } from './routes';

import { AppProvider } from './ui/AppProvider';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss'

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
)
