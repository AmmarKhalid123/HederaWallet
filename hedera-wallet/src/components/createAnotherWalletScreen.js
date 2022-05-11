import React, { useEffect, useState } from "react";
import { Mnemonic } from "@hashgraph/cryptography";
import { AccountCreateTransaction, Client, PrivateKey, PublicKey } from "@hashgraph/sdk";
import { BASE_URL } from "../constants";
import { pbkdf2Sync, randomBytes } from 'crypto';
import AES from 'crypto-js/aes';
import { useDispatch, useSelector } from "react-redux";
import { initializeState } from "../redux/ActionCreators";
import { getBalance } from "../helpers";
import { Button } from "react-bootstrap";
import CryptoJS from 'crypto-js';


const CWStepOne = ({setNetwork, network, walletState, cb}) => {
  const checkBalanceAndSet = async () => {
    let selectedAcc = document.getElementById('select-acc').value;
    console.log(selectedAcc, network);
    let fullAcc;
    if (network === 'testnet'){
      fullAcc = walletState.walletState.testnet.accounts.filter(a => {
        console.log(a);
        return a.accountId === selectedAcc;
      });
    }
    else if (network === 'mainnet'){
      fullAcc = walletState.walletState.mainnet.accounts.filter(a => {
        console.log(a);
        return a.accountId === selectedAcc
      });
    }
    console.log(fullAcc)
    if (fullAcc[0].balance > 0){
      let mnem = await Mnemonic.generate();
      cb(fullAcc[0], mnem);
    }
    else{
      alert('You do not have required amount to create an account, please deposit some hbar then try again!');
    }
  }
  
  return(
    <>
      <h4>Select network to create account on:</h4>
      <select onChange={(e) => setNetwork(e.target.selectedOptions[0].value)}>
        <option value="testnet">Testnet</option>
        <option value="mainnet">Mainnet</option>
      </select>
      {network === 'mainnet' ? (
        walletState.walletState.mainnet.accounts?.length > 0 ? (
          <>
            <p style={{color: 'red'}}>
              This will cost you around 0.05USD. Select account to deduct this fees from.
            </p>
            <select id="select-acc">
              {walletState.walletState.mainnet.accounts.map(acc => (
                <option value={acc.accountId}>
                  <span>
                    {acc.accountId} || <small style={{fontSize: '10px'}}>HBAR: {acc.balance}</small>
                  </span>
                </option>
              ))}
            </select>
          </>
        ) : (<></>)
      ) : (
        walletState.walletState.testnet.accounts?.length > 0 ? (
          <>
            <p style={{color: 'red'}}>
              This will cost you around 0.05USD. Select account to deduct this fees from.
            </p>
            <select id="select-acc">
              {walletState.walletState.testnet.accounts.map(acc => (
                <option value={acc.accountId}>
                  <span>
                    {acc.accountId} || <small style={{fontSize: '10px'}}>HBAR: {acc.balance}</small>
                  </span>
                </option>
              ))}
            </select>
          </>
        ) : (<></>)  
      )}
      <Button onClick={checkBalanceAndSet}>Next</Button>
    </>
  );
}

const CWStepTwo = ({wordsArr, step, setSteps}) => {  

  const copyText = (str) => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    console.log(str);
    document.execCommand('copy');
    console.log(str);
    document.body.removeChild(el);
    console.log(str);
    alert('Copied');
  }

  const confirmStep = () => {
    setSteps(step+1);
  }

  return(
    <>
      <div style={{
        width: '31%', border: '1px solid', marginLeft: 'auto', marginRight: 'auto', borderRadius: '10px', padding: '10px',
      }}>
        <h4>Keep these 24 words phrase somewhere safe. You can restore your account using this phrase in future if required. </h4>
        <p>
          {wordsArr.words.join(' ')}        
        </p>
        <p style={{
          display: 'flex', justifyContent: 'end'
        }}>
          <span style={{borderRadius: '10px', border: '1px solid', cursor: 'pointer', padding: '5px 10px'}} onClick={() => copyText(wordsArr.words.join(' '))}>Copy</span>
        </p>
      </div>
      <button onClick={confirmStep}>Next</button>
    </>
  );
}

const CWStepThree = ({ step, setSteps, wordsArr, pwd, network, setCreateWallet, feePayer }) => {
  const [loadngg, setLoadingStart] = useState(false);
  const saveUser = async () => {
    let pvkey = await wordsArr.toPrivateKey();
    console.log(pvkey.toString());
    let a = PrivateKey.fromString(pvkey.toString());
    console.log(a.publicKey.toString());
    console.log(a.publicKey.toStringRaw());
    let res = await createNewAccount(network === 'testnet', a.publicKey.toStringDer());
    addAccountInLocalStorage(res.accountId, a.publicKey.toStringDer(), a.toStringDer());
    let blnc = await getBalance(res.accountId, a.toStringDer(), network === 'testnet');
    console.log(blnc);
    let final = dispatch(initializeState(JSON.parse(localStorage.getItem('SnH')).salt, JSON.parse(localStorage.getItem('SnH')).hash, res.accountId, a.publicKey.toStringDer(), a.toStringDer(), blnc.result.balance, pwd, network === 'testnet'));
    console.log(final);
    alert('Suces')
    console.log(a.publicKey.toStringDer());
    setCreateWallet(false);

    // saveToLocal(pvkey.toString(), a.publicKey.toStringDer(), res.accountId, true);
    // let pvkeystr = a.toStringDer());
    // let a.publicKey.toStringDer());
  }
  const dispatch = useDispatch();

  const createNewAccount = async (testnet, newAccPubKey) => {
    let client;
    if (testnet){
      client = Client.forTestnet();
    }
    else{
      client = Client.forMainnet();
    }
    client.setOperator(feePayer.accountId, feePayer.pvtkey);
    let pubkey = PublicKey.fromString(newAccPubKey);
    console.log(pubkey);
    let r = await new AccountCreateTransaction().setKey(pubkey).execute(client);
    console.log(r);
    const getReceipt = await r.getReceipt(client);
    console.log(getReceipt);
    const newAccountId = getReceipt.accountId;  
    return {accountId: newAccountId.toString()};
  }

  
  const addAccountInLocalStorage = async (accountId, pubkey, pvtkey) => {
    const data = AES.decrypt(localStorage.getItem('userInfo'), pwd);
    let all_accounts = JSON.parse(data.toString(CryptoJS.enc.Utf8))
    if (network === 'testnet'){
      all_accounts.testnet.push({
        accountId,
        pubkey,
        pvtkey,
        transactions: []
      });
    }
    else if (network === 'testnet'){
      all_accounts.mainnet.push({
        accountId,
        pubkey,
        pvtkey,
        transactions: []
      });
    }
    console.log(all_accounts);
    const encrypted_data = AES.encrypt(JSON.stringify(all_accounts), pwd);
    localStorage.setItem("userInfo", encrypted_data);  
  }


  const checkWordsSequence = () => {
    let wordphrase = document.getElementById('wordphrase').value;
    if (wordsArr.words.join(' ') === wordphrase){
      alert('Confirmed');
      setLoadingStart(true);
      saveUser();
    }
  }

  return(
    <div>
      {loadngg ? (
        <>....</>
      ) : (
        <>
          <textarea id="wordphrase" rows="4" cols="50" placeholder="Enter the passphrase in the same sequence:" /> 
          <br/>
          <button onClick={checkWordsSequence}>Confirm</button>
        </>
      )}
    </div>
  );
}

export default function CreateAnotherWalletScreen({setCreateWallet}){
  const [createWalletSteps, setCreateWalletSteps] = useState(1);
  const [network, setNetwork] = useState('testnet');
  const [mnemonc, setMneomic] = useState(null);
  const [feePayer, setFeePayer] = useState('');

  const walletState = useSelector(s => s.walletState);

  const CWsteps = {
    1: <CWStepOne setSteps={setCreateWalletSteps} step={createWalletSteps} setNetwork={setNetwork} network={network} walletState={walletState}
    cb={(acc, mnm) => {setFeePayer(acc); setMneomic(mnm); setCreateWalletSteps(createWalletSteps+1)}} 
    />,
    2: <CWStepTwo setSteps={setCreateWalletSteps} step={createWalletSteps} wordsArr={mnemonc} />,
    3: <CWStepThree setSteps={setCreateWalletSteps} setCreateWallet={setCreateWallet} network={network} feePayer={feePayer} pwd={walletState.walletState.pwd} wordsArr={mnemonc} step={createWalletSteps} wordsArr={mnemonc} />,
  };
  
  return(
    <>
      {CWsteps[createWalletSteps]}
    </>
  );
}