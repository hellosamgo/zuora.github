var request = require('request'),
    config = require('./config');

console.log(process.argv);

var makeConnection = function(callback){
  var connectUrl = 'https://api.zuora.com/rest/v1/connections';
  var connectHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apiAccessKeyId': config.access_key,
      'apiSecretAccessKey': config.secret_key
    };

  request.post({ url: connectUrl, headers: connectHeaders}, function (err, res, body) {
    if (err) return console.error(err);
    if (res.statusCode !== 200) return console.error(res.body);

    var cookie = res.headers['set-cookie'][0].split(';')[0];
    callback(cookie);
  });
}

var getAccount = function(cookie, accountId, callback) {
  var getUrl = 'https://api.zuora.com/rest/v1/accounts/' + accountId;

  var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cookie': cookie
    };

  request.get({ url: getUrl, headers: headers}, function (err, res, body) {
    if (err) return console.error(err);
    if (res.statusCode !== 200) return console.error(res.body);

    var data = JSON.parse(body);
    callback(data, accountId);
  });
}

var accounts = [];
for (var i = 50000; i < 50020; i++) {
    accounts.push(i)}

makeConnection(function(cookie){
  for (var i = 0; i < accounts.length; i++) {
    getAccount(cookie, accounts[i], function(data, account){
      if (data.success) {
        console.log("Account :", account, " MRR: $", data.metrics.contractedMrr);
      } else {
        console.log("Could not find Account: ",  account);
      }
    });
  };
});
