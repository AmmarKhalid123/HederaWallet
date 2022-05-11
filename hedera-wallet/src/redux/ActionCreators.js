import * as ActionTypes from './ActionTypes';


export const initializeState = (salt, hash, id, pubkey, pvtkey, balance, pwd, testnet) => {
  if (testnet){
    return {
      type: ActionTypes.INITIALIZE_STATE,
      payload: {
        salt, hash, pwd,
        testnet: {id, pubkey, pvtkey, balance, transactions: []}
      }
    }
  }
  else {
    return {
      type: ActionTypes.INITIALIZE_STATE,
      payload: {
        salt, hash, pwd,
        mainnet: {id, pubkey, pvtkey, balance, transactions: []}
      }    
    }
  }
};

export const updateSelectedAcc = (acc, testnet) => ({
  type: ActionTypes.UPDATE_SELECTED_ACC,
  payload: {
    account: acc,
    testnet
  }
})

export const setAllAccounts = (all_accounts, salt, hash, entered_pwd) => ({
  type: ActionTypes.SET_ACCOUNTS,
  payload: {
    SnH: [salt, hash],
    testnet: {accounts: all_accounts.testnet},
    mainnet: {accounts: all_accounts.mainnet},
    pwd: entered_pwd
  }
});

export const setNewAccount = (accountId, pvtkey, pubkey, balance) => ({
  type: ActionTypes.SET_NEW_ACCOUNT,
  payload: {
    accountId,
    balance,
    pvtkey,
    pubkey
  }
});

export const addTransferTransaction = (from, to, balance, txid, testnet) => ({
  type: ActionTypes.ADD_TRANSFER_TRANSACTION,
  payload: {
    from, to, balance, txid, testnet
  }
})