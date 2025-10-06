import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router';
import { router } from './routes';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss'

const root = createRoot(document.getElementById('root')!);

root.render(
  <RouterProvider router={router} />
);
