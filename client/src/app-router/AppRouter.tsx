import { Route, Routes } from 'react-router-dom';
import { Common } from './Common';
import { routes } from './routes';

export const AppRoutes = () => {
  return (
    <Routes>
      {routes.common.map(({ path, component }) => (
        <Route
          key={path}
          path={path}
          element={<Common component={component} />}
        />
      ))}
    </Routes>
  );
};