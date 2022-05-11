import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Mnemonic } from '@hashgraph/cryptography';
import { createStore } from './redux/configureStore';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css'
import Main from './main';

const store = createStore();

function App() {



  return (
    <Provider store={store}>
      <Main/>
    </Provider>
  );
}

export default App;
