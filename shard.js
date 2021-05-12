var Discord = require('discord.js'),
fs = require('fs'),
request = require('request'),
PubNub = require('pubnub'),
terminator = require('terminate'),
credentials = require("./credentials.json"),
colors = require('colors'),
pubnub = new PubNub(credentials.pubnub),
shards = [],
numberShards = 1;
var manager = new Discord.ShardingManager('./index.js', { respawn: false });
manager.spawn(numberShards).then(function(collection) {
    shards = collection.array()
}).catch(function(error) { });
