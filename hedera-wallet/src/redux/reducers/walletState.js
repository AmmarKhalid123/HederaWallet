import * as ActionTypes from '../ActionTypes';

export const WalletState = (state = {
    isLoading: false,
    errMess: null,
    initialized: false,
    selectedAcc: {},
    walletState: {
        SnH: [],
        testnet: {accounts: []},
        mainnet: {accounts: []},
        pwd: ''
    },
}, action) => {
    let upd_state = {};
    let upd_state_sel_acc = {};
    switch(action.type) {
        case ActionTypes.SET_ACCOUNTS:
            if (action.payload.testnet.accounts.length > 0){
                upd_state = action.payload.testnet.accounts[0];
                upd_state.testnet = true;
                action.payload.mainnet.accounts = state.walletState.mainnet.accounts.concat(action.payload.mainnet.accounts);
            }
            if (action.payload.mainnet.accounts.length > 0){
                upd_state = action.payload.mainnet.accounts[0];
                upd_state.testnet = false;
                action.payload.testnet.accounts = state.walletState.testnet.accounts.concat(action.payload.testnet.accounts);
            }
            return {...state, initialized: true, selectedAcc: upd_state, walletState: action.payload };
        case ActionTypes.INITIALIZE_STATE:
            let selAcc = {};
            upd_state.SnH = [action.payload.salt, action.payload.hash];
            upd_state.pwd = action.payload.pwd;
            console.log(state);
            if (action.payload.testnet){
                upd_state.testnet = {accounts: state.walletState.testnet.accounts.concat([{accountId: action.payload.testnet.id, pvtkey: action.payload.testnet.pvtkey, pubkey: action.payload.testnet.pubkey, balance: action.payload.testnet.balance, transactions: action.payload.testnet.transactions}])};
                selAcc = {accountId: action.payload.testnet.id, pvtkey: action.payload.testnet.pvtkey, pubkey: action.payload.testnet.pubkey, balance: action.payload.testnet.balance, testnet: true, transactions: action.payload.testnet.transactions};
                upd_state.mainnet = state.walletState.mainnet;
            }
            if (action.payload.mainnet){
                upd_state.mainnet = {accounts: state.walletState.mainnet.accounts.concat([{accountId: action.payload.mainnet.id, pvtkey: action.payload.mainnet.pvtkey, pubkey: action.payload.mainnet.pubkey, balance: action.payload.mainnet.balance, transactions: action.payload.mainnet.transactions}])};
                selAcc = {accountId: action.payload.mainnet.id, pvtkey: action.payload.mainnet.pvtkey, pubkey: action.payload.mainnet.pubkey, balance: action.payload.mainnet.balance, testnet: false, transactions: action.payload.mainnet.transactions};
                upd_state.testnet = state.walletState.testnet;
            }
            console.log("Updated Wallet State:", upd_state);
            return {...state, initialized: true, selectedAcc: selAcc, walletState: upd_state}
        case ActionTypes.UPDATE_SELECTED_ACC:
            upd_state = action.payload.account;
            upd_state.testnet = action.payload.testnet;
            return {...state, selectedAcc: upd_state};
        case ActionTypes.ADD_TRANSFER_TRANSACTION:
            console.log("initial",state);
            let t = {
                type: 0, to: action.payload.to, 
                amount: action.payload.balance, txHash: action.payload.txid};
            upd_state = state.walletState;
            if (action.payload.testnet){
                upd_state.testnet.accounts.forEach((acc, i) => {
                    if (acc.accountId === action.payload.from){
                        upd_state.testnet.accounts[i].transactions = state.walletState.testnet.accounts[i].transactions.concat([t]);
                    }
                })
            }
            else{
                upd_state.mainnet.accounts.forEach((accm, im) => {
                    if (accm.accountId === action.payload.from){
                        upd_state.mainnet.accounts[im].transactions = state.walletState.mainnet.accounts[im].transactions.concat([t]);
                    }
                })
            }
            console.log("final", {...state, selectedAcc: {...state.selectedAcc, transactions: [...state.selectedAcc.transactions, t]}, walletState: upd_state});
            return {...state, selectedAcc: {...state.selectedAcc, transactions: [...state.selectedAcc.transactions, t]}, walletState: upd_state};


        // case ActionTypes.SET_NEW_ACCOUNT:
        //     upd_state.SnH = [state.walletState.SnH[0], state.walletState.SnH[1]];
        //     console.log(state);
        //     if (action.payload.testnet){
        //         upd_state.testnet = {accounts: state.walletState.testnet.accounts.concat({accountId: action.payload.testnet.id, pvtkey: action.payload.testnet.pvtkey, pubkey: action.payload.testnet.pubkey, balance: action.payload.testnet.balance})};
        //     }
        //     if (action.payload.mainnet){
        //         upd_state.mainnet = {accounts: state.walletState.mainnet.accounts.concat({accountId: action.payload.mainnet.id, pvtkey: action.payload.mainnet.pvtkey, pubkey: action.payload.mainnet.pubkey, balance: action.payload.mainnet.balance})};
        //     }
        //     console.log("Updated Wallet State:", upd_state);
        //     return {...state, walletState}
        default:
            return state;
    }
};