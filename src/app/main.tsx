import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { RouterProvider } from 'react-router/dom';

import { router } from './routes';
import { ApiProvider } from '@/shared/api';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiProvider>
      <RouterProvider router={router} />
    </ApiProvider>
  </StrictMode>,
)
