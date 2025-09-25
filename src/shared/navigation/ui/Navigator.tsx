import { createContext, useContext, useState, useEffect, useMemo, type PropsWithChildren } from 'react';
import { NavigationState, type NavigationStateEvnetPayload } from '../navigation-state';
import { useNavigate as useReactRouterNavigate } from 'react-router';

interface Navigator {
  switchTab(tab: Tab): void;
  back(): void;
  forward(): void;
  goTo(pos: number): void;
  push(link: string): void;
  replace(link: string): void;
}

type Tab = 'home' | 'trainings' | 'events' | 'profile';

const state = new NavigationState<Tab>({
  defaulTabLinks: {
    home: '/',
    trainings: '/trainings',
    events: '/events',
    profile: '/profile'
  }
});

const NavigatorContext = createContext<Navigator | null>(null);

export function NavigatorProvider({ children }: PropsWithChildren) {
  const navigate = useReactRouterNavigate();

  useEffect(() => {
    navigate(state.currentLink);
  }, []);

  const navigator = useMemo(() => ({
    switchTab(tab: Tab) {
      state.switchTab(tab);
      navigate(state.currentLink);
    },

    back() {
      state.back();
      navigate(state.currentLink);
    },

    forward() {
      state.forward();
      navigate(state.currentLink);
    },

    goTo(pos: number) {
      state.goTo(pos);
      navigate(state.currentLink);
    },

    push(link: string) {
      state.push(link);
      navigate(state.currentLink);
    },

    replace(link: string) {
      state.replace(link);
      navigate(state.currentLink);
    }
  }), [navigate]);

  useEffect(() => {
    // if (!backButton.isSupported()) {
    //   return;
    // }

    // if (!backButton.isMounted()) {
    //   backButton.mount();
    // }

    // const handleBackButtonClick = () => {
    //   navigator.back();
    // };

    // const updateBackButtonVisibility = () => {
    //   if (state.currentPos === 0 ) {
    //     backButton.hide()
    //   } else {
    //     backButton.show();
    //   }
    // };

    // backButton.onClick(handleBackButtonClick);

    // const removeChangeListener = state.on('history:change', updateBackButtonVisibility);

    // return () => {
    //   removeChangeListener();
    //   backButton.offClick(handleBackButtonClick);
    // };
  }, [navigator]);

  useEffect(() => {
    return state.on('history:change', (payload) => {
      navigate(payload.link);
    });
  }, [navigator]);

  return (
    <NavigatorContext.Provider value={navigator}>
      {children}
    </NavigatorContext.Provider>
  );
}

export const useNavigator = () => {
  const navigator = useContext(NavigatorContext);

  if (!navigator) {
    throw new Error('useNavigator must be used within a NavigatorProvider');
  }

  return navigator;
};

export const useNavigate = () => {
  const navigator = useNavigator();
  return navigator.push.bind(navigator);
}

export const useNavigationState = () => {
  const [value, setValue] = useState<NavigationStateEvnetPayload>({ tab: state.currentTab, link: state.currentLink });

  useEffect(() => {
    return state.on('history:change', (payload) => {
      setValue(payload);
    });
  }, []);

  return value;
}