import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LoggedInScreen from './components/loggedInScreen';
import SignUpScreen from './components/signUp';



export default function Main(){
  const [lsEmpty, setLSEmpty] = useState(true);
  const walletState = useSelector(s => s.walletState);
  useEffect(() => {
    console.log(localStorage.getItem('userInfo'));
    if (localStorage.getItem('userInfo')){
      setLSEmpty(false);
    }
  }, [walletState]);
  return(
    <div className="App">
        <h1>HEDERA WALLET</h1>
        {lsEmpty ? (
          <SignUpScreen />
        ) : (
          <LoggedInScreen />
        )}
        {/* {localStorage.getItem("loggedin") ? (
          <h4>Logged In</h4>
        ) : (
            <SignUpScreen/>
        )} */}
    </div>
  );
}