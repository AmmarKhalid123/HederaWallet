const express = require('express');
const cors = require('cors');
const app = express();


var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    if (true){
        corsOptions = { origin: true };
        callback(null, corsOptions);
    }
    else {
        console.log('here');
        corsOptions = { origin: false };
        callback(new Error('Restricted Endpoint'), corsOptions);
    }
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);