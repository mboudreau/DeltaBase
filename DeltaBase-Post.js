var aws = require('aws-sdk');
var db = new aws.DynamoDB();

exports.handler = function (events, context) {
	console.log('Received event: ' + JSON.stringify(events));

	if (events instanceof Object) {
		if (typeOf(events) != 'array') {
			events = [events];
		}

		if (!verify(events)) {
			context.fail('Object cannot be verified, missing keys id, type, timestamp and data');
			return;
		}

		var params = {
			RequestItems: {
				'DeltaStore-Streams': []
			}
		};

		for (var i = 0, len = events.length, event; i < len; i++) {
			event = events[i];
			var request = {
				PutRequest: {
					Item: {
						id: {S: event.id},
						type: {S: event.type},
						timestamp: {N: event.timestamp + ''},
						data: {M: event.data}
					}
				}
			};
			params.RequestItems['DeltaStore-Streams'].push(request);
		}
		db.batchWriteItem(params, function (err, data) {
			if (err) {
				context.fail('Not able to save event into Stream: ' + JSON.stringify(err));
				return;
			} else {
				context.succeed();
			}
		});
		context.succeed('Done.');

	} else {
		context.fail('Event must be an object or an array of objects.');
	}
};

function verify(arr) {
	var bool = true;
	for (var i = 0, len = arr.length; i < len; i++) {
		bool = bool && verifyObject(arr[i]);
	}

	return bool;
}

function verifyObject(obj) {
	var id = obj.id && typeOf(obj.id) == 'string';
	console.log('id: ' + id);
	var type = obj.type && typeOf(obj.type) == 'string';
	console.log('type: ' + type);
	var timestamp = obj.timestamp && typeOf(obj.timestamp) == 'number';
	console.log('timestamp: ' + timestamp);
	var data = obj.data;
	console.log('data: ' + data);
	return (id && type && timestamp && data);
}

function typeOf(obj) {
	return obj === null ? 'null' // null
		: obj === global ? 'global' // window in browser or global in nodejs
		: (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
		: obj.nodeType ? 'object' // DOM element
		: ({}).toString.call(obj).slice(8, -1).toLowerCase();
}
