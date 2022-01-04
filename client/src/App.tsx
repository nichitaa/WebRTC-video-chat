import React, { useState } from 'react';
import { StoreProvider } from './context/StoreProvider';
import ThemeSwitcher from './shared/ThemeSwitcher';
import { AppRouter, Routes } from 'auth-react-router';
import { routes } from './routes';

const App = () => {
  const [nickname, setNickname] = useState<string | undefined>(undefined);

  return <StoreProvider nickname={nickname} setNickname={setNickname}>
    <ThemeSwitcher />
    <AppRouter routes={routes}>
      <Routes />
    </AppRouter>
  </StoreProvider>;
};

export default App;
