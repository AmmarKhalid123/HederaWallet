const { AccountCreateTransaction, Client, Key, PublicKey } = require('@hashgraph/sdk');
var express = require('express');
const config = require('../config');
var router = express.Router();
var cors = require('./cors');


router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create-account', cors.corsWithOptions, async (req, res, next) => {
  console.log(req.body);
  let client;
  if (req.body.network === 'testnet'){
    client = Client.forTestnet();
    client.setOperator(config.TESTNET_ACCOUNT_ID, config.TESTNET_PVTKEY);
  }
  else{
    client = Client.forTestnet();
    client.setOperator(config.MAINNET_ACCOUNT_ID, config.MAINNET_PVTKEY);  
  }
  let pubkey = PublicKey.fromString(req.body.pubkey);
  console.log(pubkey);
  let r = await new AccountCreateTransaction().setKey(pubkey).execute(client);
  console.log(r);
  const getReceipt = await r.getReceipt(client);
  console.log(getReceipt);
  const newAccountId = getReceipt.accountId;
  console.log(newAccountId);
  console.log(newAccountId.toString);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, accountId: newAccountId.toString()});
});

module.exports = router;
