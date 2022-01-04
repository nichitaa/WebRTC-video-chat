import { IRoutesConfig } from 'auth-react-router';
import { lazy } from 'react';
import { Spin } from 'antd';

const RoomPage = lazy(() => import('./pages/Room/RoomPage'));
const HomePage = lazy(() => import('./pages/Home/HomePage'));

export const routes: IRoutesConfig = {
  defaultFallback: <Spin spinning={true} />,
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