import React, { useState } from 'react';
import { AppRoutes } from './app-router/AppRouter';
import { StoreProvider } from './context/StoreProvider';

const App = () => {
  const [nickname, setNickname] = useState<string | undefined>(undefined);

  return <StoreProvider
    nickname={nickname}
    setNickname={setNickname}>
    <AppRoutes />
  </StoreProvider>;
};

export default App;
