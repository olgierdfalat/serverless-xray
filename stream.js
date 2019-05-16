'use strict';
const AWSXRay = require('aws-xray-sdk');
const parentTraceId = process.env._X_AMZN_TRACE_ID;

module.exports.process = async (event, context, callback) => {
  const timestamp = new Date().getTime();

    const records = event.Records;

    records.forEach(record => {
      if (record.eventName == 'INSERT') {
        const id = record.dynamodb.NewImage.id.S;
        const text = record.dynamodb.NewImage.text.S;
        const rootTraceId = record.dynamodb.NewImage.traceId.S;
        console.log('new record retrieved:', {id, text, rootTraceId});
        console.log('-'.repeat(150));
        const segment = new AWSXRay.Segment('testSegment', rootTraceId, parentTraceId);
        AWSXRay.setSegment(segment);
      }
    })

    callback(null);
};