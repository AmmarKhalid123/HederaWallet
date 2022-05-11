import { AccountBalanceQuery, Client } from "@hashgraph/sdk";

export const getBalance = async (accountId, pvtKey, testnet) => {
  console.log(accountId, pvtKey, testnet);
  try {
    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this reallyyy easy!
    let client;
    if (testnet){
      client = Client.forTestnet();
    }
    else{
      client = Client.forMainnet();
    }

    client.setOperator(accountId, pvtKey);

    //Verify the account balance of new
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log("ACCOUNTS BALANE", accountBalance);
    return { result: { balance: parseFloat(accountBalance.hbars.toString()) }, error: false, message: "Balance fetched" };
  } catch (err) {
      console.log("ERROR", err);
      return { result: undefined, error: true, message: `Error while fetching balance ${err}` };
  }

}