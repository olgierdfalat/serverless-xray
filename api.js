'use strict';
let AWS;

const uuid = require('uuid');
if (process.env._X_AMZN_TRACE_ID) {
  const AWSXRay = require('aws-xray-sdk');
  AWS = AWSXRay.captureAWS(require('aws-sdk'));
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup")
  AWS = require('aws-sdk');
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const id = uuid.v1();
  const traceId = event.headers['X-Amzn-Trace-Id'];
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id,
      text: 'Dynamodb and XRay Test: ' + id,
      traceId,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the new item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify({item: params.Item, event, context})
    };
    callback(null, response);
  });
};