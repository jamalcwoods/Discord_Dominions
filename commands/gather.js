module.exports = {
    fullAuth:true,
    takeStructureData:true,
    needEnergy:true,
    aliases:["+mine","+chop","+hunt","+farm"],
    aliasesUsage:["+mine","+chop","+hunt","+farm"],
    aliasesDescription:["Gather minerals","Chop down trees","Hunt animals","Farm resources"],
    aliasesExample:["+mine","+chop","+hunt","+farm"],
    multiCommand:true,
    name:"gather",
    legalParameterCount:[1,2],
    run: function(structureData,tools,input,dominion,player,message,embed){
        tools.getDominionName(dominion.id).then((dominionName) =>{
            var command = input[0].slice(1).toLocaleLowerCase()
            var actionMap = structureData.actionMap
            var buildingMap = structureData.buildingMap
            var yieldMaps = structureData.yieldMaps                                   
            var action = actionMap[input[1]];
            if(action != undefined || yieldMaps[command].DEFAULT){
                if(yieldMaps[command].DEFAULT){
                    action = actionMap[command];
                }
                var resourceStructureID = yieldMaps[command][action].structure
                var energyCost = yieldMaps[command][action].energyCostNS
                if(tools.cityHasStructure(dominion,resourceStructureID)){
                    energyCost = yieldMaps[command][action].energyCost
                }
                if(energyCost != null){
                    if(player.energy > energyCost){
                        if(player.gear.includes(action) > 0){
                            var gearIndex = player.gear.indexOf(action)
                            var gearRank = player.toolLevel[gearIndex]
                            player.energy -= energyCost        
                            var maximumYield = 0
                            for(var resource in yieldMaps[command][action].resources){
                                if(yieldMaps[command][action].resources[resource].chance[gearRank - 1] > 0){
                                    maximumYield += Math.round(yieldMaps[command][action].resources[resource].minMax[1] * player.toolLevel[gearIndex])
                                }
                            }
                            var currentCapacity = 0
                            for(var type in player.resources){
                                currentCapacity += player.resources[type]
                            }
                            if(currentCapacity + maximumYield <= tools.getPlayerStorage(player)){
                                var structureRank = tools.cityHasStructure(dominion,resourceStructureID).level
                                if(!structureRank){
                                    structureRank = 1
                                }
                                var resourceYield = {}
                                for(var resource in yieldMaps[command][action].resources){
                                    if(Math.random() <= yieldMaps[command][action].resources[resource].chance[gearRank - 1]){
                                        resourceYield[resource] = Math.round(tools.getRandom(yieldMaps[command][action].resources[resource].minMax[0],yieldMaps[command][action].resources[resource].minMax[1])) * structureRank
                                    }                              
                                }
                                embed.setTitle(player.name + "'s " + action.capitalize() + " Result: (" + energyCost + " energy spent)")
                                for(var type in resourceYield){
                                    if(resourceYield[type] > 0){
                                        if(!player.resources[type]){
                                            player.resources[type] = 0
                                        }
                                        player.resources[type] += resourceYield[type]
                                        embed.addField(type.capitalize(),"```" + resourceYield[type] + "```",true)
                                    }   
                                }
                                if(player.toolDurability[gearIndex] != -1){
                                    player.toolDurability[gearIndex]--
                                    if(player.toolDurability[gearIndex] == 0){
                                        if(["mining","lumberjacking","construction"].includes(player.gear[gearIndex])){
                                            player.toolLevel[gearIndex] = 1
                                            player.toolDurability[gearIndex] = -1
                                            embed.addField(action.capitalize() + " Gear Destroyed",player.name + "'s rank " + player.toolLevel[gearIndex] + " " + action + " gear has been destroyed! You now have rank 1 " + player.gear[gearIndex] + " gear")
                                        } else {
                                            embed.addField(action.capitalize() + " Gear Destroyed",player.name + "'s rank " + player.toolLevel[gearIndex] + " " + action + " gear has been destroyed! You can no longer execute the " + player.gear[gearIndex] + "action")
                                            player.gear.splice(gearIndex,1)
                                            player.toolDurability.splice(gearIndex,1)
                                            player.toolLevel.splice(gearIndex,1)
                                        }
                                    } else {
                                        embed.addField(action.capitalize() + " Gear Used",player.name + "'s rank " + player.toolLevel[gearIndex] + " " + action + " gear has " + player.toolDurability[gearIndex] + " uses remaining")
                                    }
                                }
                                tools.updatePlayer(player,function(newPlayer){
                                    tools.outputEmbed(message.channel,embed,newPlayer)
                                })
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Not Enough Capacity",player.name + " would not be able to store the maximum resource yield from this action")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Missing Gear",player.name + " needs " + action + " gear to " + command)
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        if(player.energy == energyCost){
                            embed.setColor([255,0,0])
                            embed.addField("Warning",player.name + " would pass out from exhaustion if they were to " + command)
                            tools.outputEmbed(message.channel,embed,player)
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Out of Energy",player.name + " needs more energy in order to " + command + " (" + player.energy + "/" + energyCost +")")
                            tools.outputEmbed(message.channel,embed,player)
                        }  
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Structure Required",dominionName + " must have a " + buildingMap[resourceStructureID] + " for players to " + command + " here")
                    tools.outputEmbed(message.channel,embed,player)
                }
            }  else {
                var validResources = ""
                for(var resource in yieldMaps[command]){
                    validResources += "(" + resource + ")\n"
                }
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource","Players can not " + command + " " + input[1] + ".List of things players can " + command + ":\n" + validResources)
                tools.outputEmbed(message.channel,embed,player)
            }
        })
    }
}

