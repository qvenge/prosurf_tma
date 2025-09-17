import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { EnvUnsupported } from './ui/EnvUnsupported.tsx';

import { router } from './routes';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss'

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';
import { init } from './init.ts';

const root = createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('platformer_debug')
    || import.meta.env.DEV;

  // Configure all application dependencies.
  await init({
    debug,
    eruda: false,
    mockForMacOS: platform === 'macos',
  })
    .then(() => {
      root.render(
        <RouterProvider router={router} />
      );
    });
} catch (e) {
  root.render(<EnvUnsupported/>);
}
