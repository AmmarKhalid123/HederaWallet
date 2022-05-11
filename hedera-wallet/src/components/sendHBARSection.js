import { AccountId, Client, Hbar, Transaction, TransferTransaction } from "@hashgraph/sdk";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTransferTransaction } from "../redux/ActionCreators";
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';

export default function SendHBAR(){
  const [show, setShow] = useState(false);
  const walletState = useSelector(state => state.walletState);
  const dispatch = useDispatch();

  const addTransferTransactionToLocal = (to, balance, txid) => {
    const data = AES.decrypt(localStorage.getItem('userInfo'), walletState.walletState.pwd);
    let userInfo = JSON.parse(data.toString(CryptoJS.enc.Utf8));
    console.log("initial local", userInfo);
    if (walletState.selectedAcc.testnet){
        userInfo.testnet.forEach((acc, i) => {
            if (acc.accountId === walletState.selectedAcc.accountId){
                console.log("adding to local, t");
                userInfo.testnet[i].transactions.push({
                    type: 0, to: to, 
                    amount: balance, txHash: txid
                });
            }
        })
    }
    else{
        userInfo.mainnet.forEach((acc, i) => {
            if (acc.accountId === walletState.selectedAcc.accountId){
                console.log("adding to local, m");
                userInfo.mainnet[i].transactions.push({
                    type: 0, to: to, 
                    amount: balance, txHash: txid
                });
            }
        })
    }
    console.log("final local",userInfo)
    let encrypted_data = AES.encrypt(JSON.stringify(userInfo), walletState.walletState.pwd);
    localStorage.setItem('userInfo', encrypted_data)
  }

  const sendHBAR = async () => {
    let blnc = document.getElementById('sendamt').value;
    let accId = document.getElementById('sendaccid').value;
    // var uint8array = new TextEncoder().encode("2f34da7e11d31068272cbac0c4a0031020bccd2ad2566b5d542d893a55ea1d06798e692d8ef1f955faf80ef0dc40312e");
    // console.log(uint8array)
    
    // var string = new TextDecoder(encoding).decode(uint8array);
    if (blnc && accId){
      blnc = parseFloat(blnc);
      if (blnc > 0){
        let client;
        if (walletState.selectedAcc.testnet){
          client = Client.forTestnet();
        }
        else{
          client = Client.forMainnet();
        }
  
        client.setOperator(walletState.selectedAcc.accountId, walletState.selectedAcc.pvtkey);
        
        const sendHbar = await new TransferTransaction()
        .addHbarTransfer(walletState.selectedAcc.accountId, Hbar.fromTinybars(-blnc*100000000)) //Sending account
        .addHbarTransfer(accId, Hbar.fromTinybars(blnc*100000000)) //Receiving account
        .execute(client);
        console.log(sendHbar);
        console.log("tx hash:", sendHbar.transactionHash);
        console.log("tx hash in str:", Buffer.from(sendHbar.transactionHash).toString("hex"));
        const transactionReceipt = await sendHbar.getReceipt(client);
        console.log(transactionReceipt);
        addTransferTransactionToLocal(accId, blnc, Buffer.from(sendHbar.transactionHash).toString("hex"));
        dispatch(addTransferTransaction(walletState.selectedAcc.accountId, accId, blnc, Buffer.from(sendHbar.transactionHash).toString("hex"), walletState.selectedAcc.testnet));
      }
      else{
        alert('Sending amount should greater than 0');
      }
    }
    else{
      alert('Enter fields');
    }
  }
  
  return(
    <div>
      <button onClick={() => setShow(!show)} >{show ? 'Cancel' : 'Send'}</button>
      {show ? (<>
        <div>
          <label htmlFor="sendamt">Enter HBAR to send:</label><br/>
          <input placeholder="Amount to send" type="number" id="sendamt" />
        </div>
        <div>
          <label htmlFor="sendaccid">Enter Account ID:</label><br/>
          <input placeholder="Account ID" id="sendaccid" />
        </div>
        <p>This transaction will take place on {walletState.selectedAcc.testnet ? <strong>Testnet</strong> : <strong>Mainnet</strong>}</p>
        <button onClick={sendHBAR}>Send</button>
      </>) : (<></>)}
    </div>
  );
}