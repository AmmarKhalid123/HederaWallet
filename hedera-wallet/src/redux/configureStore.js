import { combineReducers, applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit'
// import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { WalletState } from './reducers/walletState';


export const createStore = () => {
  
    const store = configureStore({
      reducer: {
        walletState: WalletState
      },
      middleware: [logger]
    });
    return store;
}
