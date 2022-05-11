import { pbkdf2Sync } from "crypto";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import { getBalance } from "../helpers";
import { setAllAccounts, updateSelectedAcc } from "../redux/ActionCreators";
import { Button, Dropdown } from "react-bootstrap";
import CreateAnotherWalletScreen from "./createAnotherWalletScreen";
import ImportAnotherWalletScreen from "./importAnotherWalletScreen";
import SendHBAR from "./sendHBARSection";

export default function LoggedInScreen(){
  const walletState = useSelector(state => state.walletState);
  const dispatch = useDispatch();
  const [importWlt, setImportWallet] = useState(false);
  const [createWlt, setCreateWallet] = useState(false);
  const [showTx, setShowTx] = useState(false);
  const checkPwdAndLoadData = async () => {
    let entered_pwd = document.getElementById('loginpwd').value;
    if (entered_pwd){
      let SnH = JSON.parse(localStorage.getItem('SnH'));
      console.log(SnH);
      let salt = SnH.salt;
      let hash = SnH.hash;
      let test_hash = pbkdf2Sync(entered_pwd, salt, 1000, 64, `sha512`).toString(`hex`);  
      console.log(test_hash);
      if (test_hash === hash){
        const data = AES.decrypt(localStorage.getItem('userInfo'), entered_pwd);
        console.log(JSON.parse(data.toString(CryptoJS.enc.Utf8)));
        let all_accounts = JSON.parse(data.toString(CryptoJS.enc.Utf8))
        for (let i = 0; i < all_accounts.mainnet.length; i++){
          let r = await getBalance(all_accounts.mainnet[i].accountId, all_accounts.mainnet[i].pvtkey, false);
          all_accounts.mainnet[i].balance = r.result.balance;
        }
        
        for (let i = 0; i < all_accounts.testnet.length; i++){
          let r = await getBalance(all_accounts.testnet[i].accountId, all_accounts.testnet[i].pvtkey, true);
          all_accounts.testnet[i].balance = r.result.balance;
        }
        console.log(all_accounts);
        dispatch(setAllAccounts(all_accounts, salt, hash, entered_pwd));
      }
      else{
        alert('Wrong Pwd');
      }
    }
  }
  const displayTx = (tx) => {
    switch (tx.type){
      case 0:
        return (<div><div style={{border: '1px solid', borderRadius: '10px', padding: '10px 20px', margin: '10px 0px', display: 'inline-block'}}>
          <span>To: {tx.to}</span><br/>
          <span>HBAR Transferred: {tx.amount}</span><br/>
          <span>Network: {walletState.selectedAcc.testnet ? 'Testnet': 'Mainnet'}</span>
        </div></div>)
    }
  }
  if (walletState.initialized){
    return(
      <>
        <h2>Show Accounts</h2>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Dropdown Button
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {walletState.walletState.testnet.accounts.map(acc => {
              return(
                <>
                  <Dropdown.Item key={acc.accountId} onClick={() => dispatch(updateSelectedAcc(acc, true))}>
                    <p style={{marginBottom: '0px'}}>{acc.accountId}</p>
                    <small>testnet</small>
                  </Dropdown.Item>
                  <hr/>
                </>
                );
            })}
            {walletState.walletState.mainnet.accounts.map(acc => {
              return(
                <>
                  <Dropdown.Item key={acc.accountId}  onClick={() => dispatch(updateSelectedAcc(acc, false))}>
                    <p style={{marginBottom: '0px'}}>{acc.accountId}</p>
                    <small>mainnet</small>
                  </Dropdown.Item>
                  <hr/>
                </>
                );
            })}
            <Dropdown.Item onClick={() => {setImportWallet(false); setCreateWallet(true)}}>
              Create Wallet
            </Dropdown.Item>
            <Dropdown.Item onClick={() => {setCreateWallet(false); setImportWallet(true)}}>
              Import Wallet
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {createWlt ? (
          <CreateAnotherWalletScreen setCreateWallet={setCreateWallet} />
        ) : (<></>)}
        {importWlt ? (
          <ImportAnotherWalletScreen setImportWallet={setImportWallet} />
        ) : (<></>)}
        {!createWlt && !importWlt && Object.keys(walletState.selectedAcc).length > 0 ? (
          <div>
            <h4>
              Current Wallet Details:
            </h4>
            <p>Account ID: {walletState.selectedAcc.accountId}</p>
            <p>Public Key: {walletState.selectedAcc.pubkey.split("302a300506032b6570032100")[1].substring(0,7)}...{walletState.selectedAcc.pubkey.split("302a300506032b6570032100")[1].substring(58,64)}</p>
            <p>Private Key: {walletState.selectedAcc.pvtkey}</p>
            <p>Balance: {walletState.selectedAcc.balance}</p>
            <p>Network: {walletState.selectedAcc.testnet ? 'Testnet' : 'Mainnet'}</p>
            <div>
              <button onClick={() => setShowTx(!showTx)}>Show Transactions</button>
              {showTx ? (<>
                {walletState.selectedAcc.transactions.length > 0 ? walletState.selectedAcc.transactions.map(tx => {
                  return displayTx(tx)
                }) : (
                  <h4>No Transactions</h4>
                )}
              </>) : (<></>)}
            </div>
            <SendHBAR />
          </div>
        ) : (<></>)}
      </>
    );
  }
  else{
    return (
      <>
      <div>
        <label htmlFor="loginpwd">Enter Your Password: </label> <br/>
        <input id="loginpwd" placeholder="Enter Password" type="password" />
      </div>
      <button onClick={checkPwdAndLoadData}>Login</button><br/>
      <p>Or import using seed phrase/pvtkey</p>
      </>
    );        
  }
}