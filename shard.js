var Discord = require('discord.js'),
fs = require('fs'),
request = require('request'),
PubNub = require('pubnub'),
terminator = require('terminate'),
colors = require('colors'),
pubnub = new PubNub({
    publishKey: 'pub-c-2611a1e2-dc0e-4f70-be94-131b81e4b33d',
    subscribeKey: 'sub-c-3b821aee-101c-11e8-bb6e-d6d19ee12a32',
    ssl: true
}),
shards = [],
numberShards = 1;
var manager = new Discord.ShardingManager('./index.js', { respawn: false });
manager.spawn(numberShards).then(function(collection) {
    shards = collection.array()
}).catch(function(error) { });
