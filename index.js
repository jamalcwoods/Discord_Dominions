const Discord = require("discord.js");
const firebase = require("firebase");
const credentials = require("./credentials.json")
const tools = require("./tools.js")
const prettyms = require("pretty-ms")
const structureData = require("./data.json")
const client = new Discord.Client();
const fs = require("fs")
let commands = {};
fs.readdir("./commands", function(err, items) {
    for(var command of items){
        commands[command.split(".js")[0]] = require("./commands/" + command)
    }
});
var helpFields = []
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var version = "0.0.1"
firebase.initializeApp(credentials.database);

client.login(credentials.token)

client.on('ready', () => {
    for(var command in commands){
        var field = {}
        if(commands[command].multiCommand){
            for(var index in commands[command].aliases){
                field = {}
                field.name = commands[command].aliases[index]
                field.value = ""
                for(var i in commands[command].aliasesDescription[index].split("\n")){
                    field.value += "\n\n**Example #" + (1+parseInt(i)) + ":**\n`" + commands[command].aliasesExample[index].split("\n")[i] + "`\n" + commands[command].aliasesDescription[index].split("\n")[i] + "\nUsage:`" + commands[command].aliasesUsage[index].split("\n")[i] + "`" 
                }
                helpFields.push(field)
            }
        } else {
            field.name = commands[command].name
            field.value = ""
            for(var i in commands[command].description.split("\n")){
                field.value += "\n\n**Example #" + (1+parseInt(i)) +":**\n`" + commands[command].example.split("\n")[i] + "`\n" + commands[command].description.split("\n")[i] + "\nUsage:`" + commands[command].usage.split("\n")[i] +"`" 
            }
            helpFields.push(field)
        }
    }
    tools.initialize(helpFields.length,firebase,client,version,fs,structureData,prettyms)

	console.log("Starting Dominions v" + version + " ... on shard #" + (client.shard.ids[0] + 1))
	setInterval(function(){
		client.user.setPresence({game:{name:"Discord Dominions v" + version}})
	},60000)
});

client.on('guildMemberUpdate', (oldMember,newMember) => {
    tools.getDominion(newMember.guild.id,function(dominion){
        if(dominion != null){
            if(newMember.user.id != dominion.owner && newMember["_roles"].includes(dominion.roles.leader.id)){
                var embed = new Discord.MessageEmbed()
                tools.getPlayer(newMember.user.id,function(player){
                    if(player != null){
                        for(var member of newMember.guild.members.array()){
                            if(member["_roles"].includes(dominion.roles.leader.id) && member.user.id != newMember.user.id){
                                member.removeRole(dominion.roles.leader.id)
                            }
                        }
                        dominion.owner = newMember.user.id
                        embed.addField("New Leadership",newMember.user.username + " has been made leader of the dominion of " + newMember.guild.name + "!")
                        tools.updateDominion(dominion,function(){
                            for(var channel in dominion.legalChannels){
                                tools.outputEmbed(client.channels.get(dominion.legalChannels[channel]),embed)
                            }  
                        })
                    } else {
                        newMember.removeRole(dominion.roles.leader.id)
                        if(newMember.user.id != client.user.id){
                            embed.addField("Attempted Promotion","A user tried to give you owner ship of the dominion of " + newMember.guild.name + ". Please do +start and ask them to try again",true)
                            newMember.user.createDM().then(dm => {
                                    tools.outputEmbed(dm,embed)
                                }
                            )
                        }
                    }
                })
                
            }
        } 
    })   
})

client.on("messageReactionAdd", (reaction,user) =>{
    if(reaction.message.author.id == client.user.id){
        if(user.id != client.user.id){
            if(reaction.message.embeds[0].footer.text.split("|")[1] == " Scroll Window "){
                if("➡" == reaction["_emoji"].name){
                    switch(reaction.message.embeds[0].footer.text.split("|")[2]){
                        case " Help ":
                            var currentIndex = parseInt(reaction.message.embeds[0].footer.text.split("|")[3].split("#")[1].split("/")[0])
                            if(helpFields[currentIndex]){
                                var embed = new Discord.MessageEmbed()
                                embed.setColor([114,137,218])
                                embed.addField(helpFields[currentIndex].name,helpFields[currentIndex].value)
                                embed.setFooter("Discord Dominions v" + version + "| Scroll Window | Help | Command #" + (currentIndex + 1) + "/" + helpFields.length)
                                reaction.message.edit("",embed)
                                reaction.message.reactions.removeAll().then(() => {
                                    reaction.message.react("⬅").then(() =>{
                                        reaction.message.react("➡")
                                    })
                                })
                            }
                            break;
                    }
                } else if("⬅" == reaction["_emoji"].name){
                    switch(reaction.message.embeds[0].footer.text.split("|")[2]){
                        case " Help ":
                            var currentIndex = parseInt(reaction.message.embeds[0].footer.text.split("|")[3].split("#")[1].split("/")[0]) - 2
                            if(helpFields[currentIndex]){
                                var embed = new Discord.MessageEmbed()
                                embed.setColor([114,137,218])
                                embed.addField(helpFields[currentIndex].name,helpFields[currentIndex].value)
                                embed.setFooter("Discord Dominions v" + version + "| Scroll Window | Help | Command #" + (currentIndex + 1) + "/" + helpFields.length)
                                reaction.message.edit("",embed)
                                reaction.message.reactions.removeAll().then(() => {
                                    reaction.message.react("⬅").then(() =>{
                                        reaction.message.react("➡")
                                    })
                                })
                            }
                            break;
                    }
                }
            }
        }
    }
})

client.on('message', message => {
    if(message.author.id == client.user.id){
        return
    } 
    var input = message.content.split(" ")
    var playerData = firebase.database().ref("players/" + message.author.id);
    playerData.once('value').then(function(playerSnapshot) {
        var dominions = firebase.database().ref("dominions/" + message.guild.id);
        dominions.once('value').then(function(dominionSnapshot) {
            var prefix = "+";
            var legal = true;
            var player = playerSnapshot.val()
            var dominion = dominionSnapshot.val()
            if(player != null){
                prefix = player.prefix 
            }
            if(dominion != null){
                legal = dominion.legalChannels.includes(message.channel.id)
            }
            var embed = new Discord.MessageEmbed();
            if(input[0].slice(0,prefix.length) == prefix || input[0].slice(0,1) == "+"){
                if(legal){
                    var commandString = input[0].slice(prefix.length).toLocaleLowerCase()
                    if(commandString == "help"){
                        embed.addField(helpFields[0].name,helpFields[0].value)
                        tools.outputEmbed(message.channel,embed,null,"help")
                    } else {
                        for(var command in commands){
                            if(commands[command].aliases){
                                if(commandString == commands[command].name){
                                    commandString = null
                                } else if(commands[command].aliases.includes(input[0])){
                                    commandString = commands[command].name
                                }
                            }
                        }
                        if(commands[commandString]){
                            var command = commands[commandString]
                            if(command.legalParameterCount.includes(input.length)){
                                if(command.fullAuth){
                                    if(dominion != null && player != null){
                                        var now = new Date();
                                        if(now.getTime() - player.lastAction >= 120000 && player.energy != player.energyCap){
                                            var energyGain = Math.floor((now.getTime() - player.lastAction)/120000)
                                            if(player.energy + energyGain > player.energyCap){
                                                energyGain = player.energyCap - player.energy
                                                player.energy = player.energyCap
                                            } else {
                                                player.energy += energyGain
                                            }
                                            player.lastAction = now.getTime()
                                            tools.updatePlayer(player,function(){
                                                if((command.needEnergy && player.energy >= 1) || !command.needEnergy){
                                                    embed.addField("Gained Energy","[You gained " + energyGain + " energy!](https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id +")")
                                                    if(command.takeStructureData){
                                                        command.run(structureData,tools,input,dominion,player,message,embed)
                                                    } else {
                                                        command.run(tools,input,dominion,player,message,embed)
                                                    }
                                                } else {
                                                    embed.setColor([255,0,0])
                                                    embed.addField("Passed Out","You need at least 1 energy to preform this action")
                                                    tools.outputEmbed(message.channel,embed,player)
                                                }
                                            })
                                        } else {
                                            if((command.needEnergy && player.energy >= 1) || !command.needEnergy){
                                                if(command.takeStructureData){
                                                    command.run(structureData,tools,input,dominion,player,message,embed)
                                                } else {
                                                    command.run(tools,input,dominion,player,message,embed)
                                                }
                                            } else {
                                                embed.setColor([255,0,0])
                                                embed.addField("Passed Out","You need at least 1 energy to preform this action")
                                                tools.outputEmbed(message.channel,embed,player)
                                            }
                                        }
                                    } else {
                                        if(dominion == null){
                                            embed.setColor([255,0,0])
                                            embed.addField("Error","A dominion must be started in this server before this command can be used here. Have the server owner do the command '+claim' in the channel that will be used for this bots functions.",true)
                                        }
                                        if(player == null){
                                            embed.setColor([255,0,0])
                                            embed.addField("Error","No player account exists for " + message.author.username +". Please do +start",true)
                                        }
                                        tools.outputEmbed(message.channel,embed,player)
                                    }            
                                } else {
                                    command.run(tools,input,message,embed)
                                }
                            } else {
                                tools.commandError(command,embed,player,message)
                            }                 
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Error","Command not found",true)
                            tools.outputEmbed(message.channel,embed) 
                        }
                    }
                } else {
                    var legalChannels = dominion.legalChannels
                    var channelList = ""
                    for(var channel in legalChannels){
                        channelList += "<#" + legalChannels[channel] + ">  "
                    }
                    embed.setColor([255,0,0])
                    embed.addField("Error","Commands for Discord Dominions can only be used in the following channels: " + channelList,true)
                    tools.outputEmbed(message.channel,embed)  
                }   
            }                   
        })
	})
})

client.on('guildCreate', guild => {
    var embed = new Discord.MessageEmbed();
    embed.addField("Welcome to Discord Dominions!","Please have the owner of this server do the command '+claim' in the in the channel that will be used for this bots functions.")
    var sent = false;
    var i = 0;
    guild.fetchMember(client.user).then(member => {
        while(!sent){   
            if(guild.channels.array()[i].permissionsFor(member).has("SEND_MESSAGES") && guild.channels.array()[i].sendEmbed != undefined){
                tools.outputEmbed(guild.channels.array()[i],embed) 
                sent = true
            }
            i++
        }
    })
})