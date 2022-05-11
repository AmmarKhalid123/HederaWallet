import React, { useState } from "react";
import CreateWallet from "./createWallet";
import ImportMain from "./importWallet";

export default function SignUpScreen(){

  const [createWallet, setCreateWallet] = useState(false);

  const [importWallet, setImportWallet] = useState(false);
  const [importWalletSteps, setImportWalletSteps] = useState(1);



  return(
    <div>
      <button onClick={() => {setImportWallet(true); setCreateWallet(false);}}>Import Wallet</button>
      <button onClick={() => {setCreateWallet(true); setImportWallet(false);}}>Create Wallet</button>

      {createWallet ? (
        <CreateWallet setCreateWallet={setCreateWallet}/>
      ) : <></>}


      {importWallet ? (
        <ImportMain setImportWallet={setImportWallet}/>
      ) : <></>}

    </div>
  );
}