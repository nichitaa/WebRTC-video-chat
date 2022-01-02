import { FC } from 'react';
import StoreContext, { IStoreContext } from './StoreContext';

const StoreProvider: FC<IStoreContext> = ({ children, nickname, setNickname }) =>
  <StoreContext.Provider value={{ nickname, setNickname }}>{children}</StoreContext.Provider>;

export { StoreProvider };