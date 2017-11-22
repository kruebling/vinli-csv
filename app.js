const _ = require('lodash');
const request = require('request');
const json2csv = require('json2csv');
const fs = require('fs');


var appId = 'APPID';
var appSecret = 'APPSECRET';


var deviceId = 'DEVICEID';

var encodeAuth = new Buffer(appId + ':' + appSecret).toString('base64'); //get your app
var since = '2016-01-25T00:00:00.000Z';
var until = '2016-12-01T00:00:00.000Z';


var fileName = 'telemetry-messages-device-' + deviceId + '.csv';


var keyList = [];
var allMessages = [];


var options = { method: 'GET',

  url: 'https://telemetry.vin.li/api/v1/devices/' + deviceId + '/messages?limit=100',
  headers:
   { 'cache-control': 'no-cache',
     authorization: 'Basic ' + encodeAuth } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  if (response.statusCode === 200){
    console.log('request worked!');

    var responseBody = JSON.parse(body);

    responseBody.messages.forEach(function(message){
      allMessages.push(message);
    });

     if (Number(responseBody.meta.pagination.remaining) > 0) {

      nextRequest(responseBody.meta.pagination.links.prior);
      console.log('next call');
    } else {
      console.log('getting fields...');
      getKeys(allMessages, null);
      generateCSV();
    }

  } else {
    console.log('something went wrong, response code ' + response.statusCode + response.body);
  }
});




function nextRequest(url) {

  var options = { method: 'GET',
    url: url,
    headers:
     { 'cache-control': 'no-cache',
       authorization: 'Basic ' + encodeAuth } };

       request(options, function (error, response, body) {
         if (error) throw new Error(error);

         if (response.statusCode === 200){
           var responseBody = JSON.parse(body);

           responseBody.messages.forEach(function(message){
             allMessages.push(message);
           });

           if (Number(responseBody.meta.pagination.remaining) > 0) {

             nextRequest(responseBody.meta.pagination.links.prior);
             console.log(responseBody.meta.pagination.remaining + ' remaining messages to process');

           } else {
             console.log('getting fields...');
             getKeys(allMessages, null);
             generateCSV();
           }
         }
       });
}



function getKeys(obj, parent){
    var keys = Object.keys(obj);

    keys.forEach(function(key){

      if(_.isObject(obj[key])){
        //if the key is an object run this function again, but for the key object

        getKeys(obj[key], parent + "." + key);

      } else {
        var newKey = _.trimStart(parent + "."+ key, "null.");
        var k = newKey.substring(newKey.length, newKey.indexOf(".") + 1);
        keyList.push(k);
        keyList = _.uniq(keyList);
      }
    });
}

function generateCSV(){
    var jsoncsv = json2csv({data: allMessages, fields: keyList});

    fs.writeFile('/Users/Keegan/Desktop/'+fileName,jsoncsv,function(err){
      if (err) throw err;
      console.log('file saved');
    });
}
