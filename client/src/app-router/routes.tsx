import { lazy, ReactElement } from 'react';

interface IRoute {
  path: string;
  component: ReactElement;
}

interface IRoutes {
  public: IRoute[];
  private: IRoute[];
  common: IRoute[];
}

// public

// private

// common
const RoomPage = lazy(() => import('../pages/Room/RoomPage'));
const HomePage = lazy(() => import('../pages/Home/HomePage'));

export const routes: IRoutes = {
  public: [],
  private: [],
  common: [
    {
      path: '/',
      component: <HomePage />,
    },
    {
      path: '/room/:roomId',
      component: <RoomPage />,
    },
    {
      path: '*',
      component: <p>Page not found</p>,
    },
  ],
};