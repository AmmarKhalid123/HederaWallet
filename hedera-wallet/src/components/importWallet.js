import { Button } from "react-bootstrap";
import React , { useState } from "react";
import { Mnemonic, Client, AccountInfoQuery, PrivateKey, Hbar } from "@hashgraph/sdk";
import { useDispatch, useSelector } from "react-redux";
import AES from 'crypto-js/aes';
import { getBalance } from "../helpers";
import CryptoJS from 'crypto-js';
import { initializeState, setNewAccount } from "../redux/ActionCreators";
import { pbkdf2Sync, randomBytes } from "crypto";
// import {  } from "@hashgraph/cryptography";

const checkAccountDetails = async (_accountId, _publicKey, _privateKey, network) => {

  try {

      // Create our connection to the Hedera network
      // The Hedera JS SDK makes this reallyyy easy!

      const privateKeyObj = PrivateKey.fromString(_privateKey);
      const publicKeyObj = privateKeyObj.publicKey;
      const publicKeyString = publicKeyObj.toStringRaw();

      if (publicKeyString === _publicKey) {

          // const query = new AccountInfoQuery()
          //     .setAccountId(_accountId);

          //Sign with client operator private key and submit the query to a Hedera network
          // const accountInfo = await query.execute(client);
          // console.log(accountInfo);
          // const fetchPublicKey = accountInfo.key.toString();
          let account_check;
          if (network === 'Testnet'){
            console.log("aa");
            account_check = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts?account.id=${_accountId}`)
            .then(r => r.json())  
          }
          else{
            console.log("a");
            account_check = await fetch(`https://mainnet-public.mirrornode.hedera.com/api/v1/accounts?account.id=${_accountId}`)
            .then(r => r.json())  
          }
          console.log(account_check);
          console.log(_publicKey, account_check.accounts[0].key.key)
          console.log(_publicKey === account_check.accounts[0].key.key);
          if (account_check.accounts?.length > 0){
            if (_publicKey === account_check.accounts[0].key.key){
              return { result: { keysVerified: true }, error: false, message: `Account verified` }
            } else {
                return { result: { keysVerified: false }, error: false, message: `Public key does not corresponds to this account id` }
            }
          }
          else{
            return { result: { keysVerified: false }, error: false, message: `Invalid Account Id` }
          }
      } else {
          return { result: { keysVerified: false }, error: false, message: `Public key does not corresponds to this private key` }
      }


  } catch (err) {
      console.log("ERROR", err)
      return { result: { keysVerified: false }, error: true, message: `Cannot verify the account - ${err}` }
  }
}

const addAccountInLocalStorage = (accountId, pubkey, pvtkey, network, pwd) => {
  console.log(pvtkey, pubkey, accountId);
  const salt = randomBytes(16).toString('hex');
  console.log(salt, pwd);
  const hash = pbkdf2Sync(pwd, salt, 1000, 64, `sha512`).toString(`hex`);
  console.log(hash);
  localStorage.setItem("SnH", JSON.stringify({salt: salt, hash: hash}));
  let data;
  if (network === 'Testnet'){
    data = {
      testnet: [
        {
          pvtkey, pubkey, accountId, transactions: []
        }
      ],
      mainnet: []
    };  
  }
  else if (network === 'Mainnet'){
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
  // let blnc = await getBalance(accountId, pvtkey, network === 'Testnet');
  // console.log(blnc);
  // dispatch(initializeState(salt, hash, accountId, pubkey, pvtkey, blnc.result.balance, pwd, network === 'Testnet'));

  // const data = AES.decrypt(localStorage.getItem('userInfo'), pwd);
  // let all_accounts = JSON.parse(data.toString(CryptoJS.enc.Utf8))
  // if (network === 'Testnet'){
  //   all_accounts.testnet.push({
  //     accountId,
  //     pubkey,
  //     pvtkey
  //   });
  // }
  // else if (network === 'Mainnet'){
  //   all_accounts.mainnet.push({
  //     accountId,
  //     pubkey,
  //     pvtkey
  //   });
  // }
  // console.log(all_accounts);
  // const encrypted_data = AES.encrypt(JSON.stringify(all_accounts), pwd);
  // localStorage.setItem("userInfo", encrypted_data);
}


function ImportWalletScreen({pwd, setImportWallet}){
  const [importKey, setImportKey] = useState('');
  const [accountId, setAccountId] = useState('');

  const walletState = useSelector(s => s.walletState);
  const dispatch = useDispatch();
  const addNewAccount = async () => {
    let pvt_key = document.getElementById('importpwd').value;
    let account_id = document.getElementById('importid').value;
    if (pvt_key && account_id){
      // let p1 = document.getElementById('pvt-type').value;
      let p2 = document.getElementById('network').value;
      // if (p1 === 'Mnemonic (24 words)'){
      //   console.log('checking 24 words');
      //   try{
      //     console.log(pvt_key)
      //     let mn = await Mnemonic.fromString(pvt_key);
      //     console.log(mn);
      //     console.log(mn.toString());
      //     let a = await PrivateKey.fromMnemonic(mn.toString(), "abcdef123456");
      //     console.log(a);
      //     console.log(a.toStringDer());
      //     console.log(a.publicKey.toStringDer());
      //     let re = await checkAccountDetails(account_id, a.publicKey.toStringRaw(), a.toStringRaw(), p2);
      //     if (re.result.keysVerified){
      //       addAccountInLocalStorage(account_id, a.publicKey.toStringDer(), a.toStringDer(), p2, walletState.walletState.pwd);
      //       let blnc = await getBalance(account_id, a.toStringDer(), a.publicKey.toStringDer(), p2 === 'Testnet');
      //       let final = dispatch(initializeState(JSON.parse(localStorage.getItem('SnH')).salt, JSON.parse(localStorage.getItem('SnH')).hash, account_id, a.publicKey.toStringDer(), a.toStringDer(), blnc, walletState.walletState.pwd, p2 === 'Testnet'));
      //       console.log(final);
      //       alert('Suces')
      //       setImportWallet(false);
      //       // dispatch(setNewAccount(account_id, a.toStringDer(), a.publicKey.toStringDer(), blnc));
      //     }
      //     else{
      //       alert(`Failed: ${re.message}`);
      //     }
      //   }
      //   catch(e){
      //     alert('Invalid Mnemonic');
      //   }
      // }
      // else if (p1 === 'Private Key'){
        console.log('checking pvt key');
        let a = PrivateKey.fromString(pvt_key);
        console.log(a);
        let re = await checkAccountDetails(account_id, a.publicKey.toStringRaw(), a.toStringRaw(), p2);
        console.log(re);
        if (re.result.keysVerified){
          addAccountInLocalStorage(account_id, a.publicKey.toStringDer(), a.toStringDer(), p2, pwd);
          let blnc = await getBalance(account_id, a.toStringDer(), a.publicKey.toStringDer(), p2 === 'Testnet');
          console.log(blnc);
          let final = dispatch(initializeState(JSON.parse(localStorage.getItem('SnH')).salt, JSON.parse(localStorage.getItem('SnH')).hash, account_id, a.publicKey.toStringDer(), a.toStringDer(), blnc.result.balance, pwd, p2 === 'Testnet'));
          console.log(final);
          alert('Suces')
          setImportWallet(false);
        }
        else{
          alert(`Failed: ${re.message}`);
        }
      // }
      // console.log(p1, p2);
    }
  }

  return(
    <div>
      <h3>
        Import Wallet
      </h3>
      <label htmlFor="importid">Account ID:</label><br/>
      <input placeholder="x.y.z" id="importid" onClick={(e) => setAccountId(e.target.value)} /> <br/>
      <br/>
      <label htmlFor="importpwd">Please Enter Private Key:</label><br/>
      <input placeholder="Private Key" id="importpwd" onClick={(e) => setImportKey(e.target.value)} /> <br/>
      {/* <select id="pvt-type">
        <option>Mnemonic (24 words)</option>
        <option>Private Key</option>
      </select> */}
      <br/>
      <select id="network">
        <option>Testnet</option>
        <option>Mainnet</option>
      </select>
      
      <Button onClick={addNewAccount}>Import</Button>
    </div>
  );
}


const CWStepOne = ({cb}) => {
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
      if (cb){
        cb(pwd);
      }
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

export default function ImportMain({setImportWallet}){
  const [pwd, setPwd] = useState('');
  const [importMainSteps, setImportMainSteps] = useState(1);

  const IWsteps = {
    1: <CWStepOne cb={(p) => {setPwd(p); setImportMainSteps(importMainSteps+1);}}  />,
    2: <ImportWalletScreen pwd={pwd} setImportWallet={setImportWallet} />,
  };
  
  return(
    <>
      {IWsteps[importMainSteps]}
    </>
  );
}