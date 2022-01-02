import { useContext } from 'react';
import StoreContext from './StoreContext';

export const useStoreContext = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStoreContext hook must be used only within a StoreProvider!');

  return ctx;
};