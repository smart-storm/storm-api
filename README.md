# smart-api [![Build Status](https://travis-ci.org/smart-storm/storm-api.svg?branch=master)](https://travis-ci.org/smart-storm/storm-api) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/29116a58834442fbaca8ab88a39e65ab)](https://www.codacy.com/app/jwszolek/storm-api?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=smart-storm/storm-api&amp;utm_campaign=Badge_Grade)

WebAPI for getting data from IoT and pushing them to the Kafka queue

## Adding measurements via a POST request
Adding measurements data for a sensor is a fairly simple task. What you need to do is to send a POST request to this URL:<br> http://alfa.smartstorm.io/api/v1/measure<br>
You will need to set the herein specified fields in your request:
1. **user_id** - set this to your alfa.smartstorm.io site login, eg. "user@example.com",
2. **sensor_id** - the id of the sensor you wish to upload data for, eg. "1234567890abcdefedcba098",
3. **desc** - a description for your measurement. This can be pretty much anything, for example: "humidity"
4. **measure_value** - the measured value, for example 10.

Sample code in python using requests library is provided here:

```python
import requests
url = "http://alfa.smartstorm.io/api/v1/measure"
data = {"user_id": "user@example.net",
        "sensor_id": "1234567890abcdef",
        "desc" : "some_random_description",
        "measure_value" : "10"}
r = requests.post(url,data)
```

## Fetching measurements via a GET request
Fetching of given sensor's measurement is achieved via a HTTP GET request send to the following URL address: <br>
http://alfa.smartstorm.io/api/v1/measure<br>
This request should be sent with following GET parameters (appended to the URL address):
1. **user_id** - set this to your alfa.smartstorm.io site login, eg. "user@example.com",
2. **sensor_id** - the id of the sensor which data you wish to fetch, eg. "1234567890abcdefedcba098",
3. **offset** - an integer value equal to the value of the "created_epoch" field of the latest measurement you would like to skip. Eg. If you wish to load measurements newer than your recently fetched sample whose created_epoch == 1554, set the offset parameter to 1554. Offset parameter equal to 0 returns all available measurements for the given sensor.


A sample GET /measure request taken from an iOS client app looks like this:

```objective-c
NSString *userId = @"user-email@address.com";
NSString *sensorId = @"sensorId-from-smartstorm";
NSString * targetUrl = [NSString stringWithFormat:@"http://alfa.smartstorm.io/api/v1/measure?user_id=%@&sensor_id=%@&offset=%@",userId, sensorId, self.offset];
NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init];
[request setHTTPMethod:@"GET"];
[request setURL:[NSURL URLWithString:targetUrl]];
```
