# smart-api [![Build Status](https://travis-ci.org/smart-storm/storm-api.svg?branch=master)](https://travis-ci.org/smart-storm/storm-api) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/29116a58834442fbaca8ab88a39e65ab)](https://www.codacy.com/app/jwszolek/storm-api?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=smart-storm/storm-api&amp;utm_campaign=Badge_Grade)

WebAPI for getting data from IoT and pushing them to the Kafka queue

## Adding measurements via a POST request
Adding measurements data for a sensor is a fairly simple task. What you need to do is to send a POST request to this URL:<br> http://alfa.smartstorm.io/api/v1/measure<br>
You will need to set the herein specified fields in your request:
1. **user_id** - set this to your alfa.smartstorm.io site login, eg. "user@example.com",
2. **sensor_id** - the id of the sensor you wish to upload data for, eg. "1234567890abcdefedcba098",
3. **desc** - a description for your measurement. This can be pretty much anything, for example: "humidity"
4. **measure_value** - the measured value, for example 10.

Sample code in python using requests library is provided here: https://gist.github.com/opiechow/e5bf3e73211f01a67f69299bbb8f82c2
