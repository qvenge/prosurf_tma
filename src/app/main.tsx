import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { routes } from './routes';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss'

const root = createRoot(document.getElementById('root')!);
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
