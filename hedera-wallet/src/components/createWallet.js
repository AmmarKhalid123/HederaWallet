import React, { useEffect, useState } from "react";
import { Mnemonic } from "@hashgraph/cryptography";
import { PrivateKey } from "@hashgraph/sdk";
import { BASE_URL } from "../constants";
import { pbkdf2Sync, randomBytes } from 'crypto';
import AES from 'crypto-js/aes';
import { useDispatch } from "react-redux";
import { initializeState } from "../redux/ActionCreators";
import { getBalance } from "../helpers";

const CWStepOne = ({cb, setSteps, step}) => {
  const confirmStep = async () => {
    let pwd = document.getElementById('pwd').value;
    let confirmpwd = document.getElementById('confirmpwd').value;
    if (pwd.length < 6){
      alert('Password should be greater than 6');
    }
    else if (confirmpwd !== pwd){
      alert('Confirm pwd do not match pwd');
    }
    else{
      let mnem = await Mnemonic.generate();
      if (cb){
        cb(pwd, mnem);
      }
      setSteps(step+1);
    }
  }
  return (
    <div>
      <div style={{marginTop: '10px'}}>
        <label htmlFor='pwd' style={{marginTop: '5px'}}>Enter your password (min. 6 characters)</label> <br/>
        <input type="password" id='pwd' placeholder='Enter Password' />
      </div>
      
      <div style={{marginTop: '10px'}}>
        <label htmlFor='confirmpwd' style={{marginTop: '5px'}}>Enter your password (min. 6 characters)</label> <br/>
        <input type="password" id='confirmpwd' placeholder='Confirm Password' />
      </div>

      <button onClick={confirmStep}>Confirm</button>
    </div>
  );
}

const CWStepTwo = ({wordsArr, step, setSteps}) => {
  console.log(wordsArr);
  
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

const CWStepThree = ({ wordsArr, step, setSteps, pwd }) => {
  const [ldng, setLoading] = useState(false);
  const checkWordsSequence = () => {
    let wordphrase = document.getElementById('wordphrase').value;
    if (wordsArr.words.join(' ') === wordphrase){
      alert('Confirmed');
      setLoading(true);
      saveUser();
    }
  }
  const saveToLocal = async (pvtkey, pubkey, accountId, testnet) => {
    console.log(pvtkey, pubkey, accountId);
    const salt = randomBytes(16).toString('hex');
    console.log(salt, pwd);
    const hash = pbkdf2Sync(pwd, salt, 1000, 64, `sha512`).toString(`hex`);
    console.log(hash);
    localStorage.setItem("SnH", JSON.stringify({salt: salt, hash: hash}));
    
    let data;
    if (testnet){
      data = {
        testnet: [
          {
            pvtkey, pubkey, accountId, transactions: []
          }
        ],
        mainnet: []
      };  
    }
    else{
      data = {
        testnet: [],
        mainnet: [
        {
          pvtkey, pubkey, accountId, transactions: []
        }
        ]
      };  
    }
    const encrypted_data = AES.encrypt(JSON.stringify(data), pwd);
    localStorage.setItem("userInfo", encrypted_data);
    let blnc = await getBalance(accountId, pvtkey, true);
    dispatch(initializeState(salt, hash, accountId, pubkey, pvtkey, blnc.result.balance, pwd, testnet));
  }

  const saveUser = async () => {
    let network = document.getElementById('create-new-acc-network').value;
    console.log(network);
    let pvkey = await wordsArr.toPrivateKey();
    console.log(pvkey.toString());
    let a = PrivateKey.fromString(pvkey.toString());
    console.log(a.publicKey.toString());
    console.log(a.publicKey.toStringRaw());
    let res = await fetch(`${BASE_URL}/create-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pubkey: a.publicKey.toStringRaw(),
        network
      })
    }).then(r => r.json());
    console.log(res, res.accountId);
    saveToLocal(pvkey.toString(), a.publicKey.toStringDer(), res.accountId, network === 'testnet');
    // let pvkeystr = a.toStringDer());
    // let a.publicKey.toStringDer());
    console.log(a.publicKey.toStringDer());
  }
  const dispatch = useDispatch();


  return(
    <div>
      {ldng ? (<>...</>) : (
        <>
          <textarea id="wordphrase" rows="4" cols="50" placeholder="Enter the passphrase in the same sequence:" /> 
          <br/>
          <select id="create-new-acc-network">
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
          </select>
          <button onClick={checkWordsSequence}>Confirm</button>
        </>
      )}
    </div>
  );
}


export default function CreateWallet({setCreateWallet}){
  const [createWalletSteps, setCreateWalletSteps] = useState(1);
  const [pswrd, setPassword] = useState('');
  const [mnemonc, setMneomic] = useState(null);

  const CWsteps = {
    1: <CWStepOne setSteps={setCreateWalletSteps} step={createWalletSteps} cb={(pwd, mnm) => {setPassword(pwd); setMneomic(mnm); return true;}} />,
    2: <CWStepTwo setSteps={setCreateWalletSteps} step={createWalletSteps} wordsArr={mnemonc} />,
    3: <CWStepThree setSteps={setCreateWalletSteps} step={createWalletSteps} wordsArr={mnemonc} pwd={pswrd} />,
    // 4: <CWStepFour setSteps={setCreateWalletSteps} step={createWalletSteps} wordsArr={mnemonc} pwd={pswrd} />
  };
  
  return(
    <>
      {CWsteps[createWalletSteps]}
    </>
  );
}