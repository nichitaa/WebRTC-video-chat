import { createContext } from 'react';

export interface IStoreContext {
  nickname: string | undefined;
  setNickname: (name: string) => void;
}

const StoreContext = createContext<IStoreContext | undefined>(undefined);

export default StoreContext;