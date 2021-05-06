module.exports = {
    fullAuth:true,
    takeStructureData:true,
    needEnergy:true,
    name:"+craft",
    description:"Craft gear for an action\nCraft a resource\nList types of gear/resources that can be crafted",
    usage:"+craft (action) (rank)\n+craft (resource) (amount)\n+craft (intent)",
    example:"+craft mining 2\n+craft iron 1\n+craft options",
    legalParameterCount:[2,3],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canUseFacilities",message,player,dominion,embed)){
            var structureMap = structureData.buildingMap
            var toolMap = structureData.craftingGearMap
            var resourceMap = structureData.craftingResourceMap
            if(input.length == 3){
                var validAction = false
                var validResource = false
                for(var action in toolMap){
                    if(input[1] == action){
                        validAction = true
                    }
                }
                for(var resource in resourceMap){
                    if(input[1] == resource){
                        validResource = true
                    }
                }
                if(validAction){
                    if(tools.cityHasStructure(dominion,toolMap[input[1]].structureReq)){
                        if(toolMap[input[1]].rank[input[2]]){
                            var cleared = true
                            for(var resource in toolMap[input[1]].rank[input[2]].resources){
                                if(!player.resources[resource] || player.resources[resource] < toolMap[input[1]].rank[input[2]].resources[resource]){
                                    cleared = false                  
                                    if(!player.resources[resource]){
                                        player.resources[resource] = 0
                                    }
                                    embed.addField("Not Enough of Resource",player.name + " does not have enough " + resource + " to craft rank " + input[2] + " " +  input[1] + " gear (" + player.resources[resource] + "/" + toolMap[input[1]].rank[input[2]].resources[resource] + ")")
                                }
                            }
                            if(cleared){
                                player.confirming = {
                                    type:"craftGear",
                                    rank:parseInt(input[2]),
                                    action:input[1],
                                    destination:player.id,
                                    expenses:toolMap[input[1]].rank[input[2]].resources,
                                    durability:toolMap[input[1]].rank[input[2]].durability
                                }
                                embed.addField("Crafting Request",player.name + " will craft rank " + player.confirming.rank + " " + player.confirming.action + " gear")
                                embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                tools.updatePlayer(player,function(){
                                    tools.outputEmbed(message.channel,embed,player)     
                                })
                            } else {
                                embed.setColor([255,0,0])
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            var validRanks = ""
                            for(var rank in toolMap[input[1]].rank){
                                validRanks += "\n(" + rank + ")"
                            }
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Rank","Valid ranks to craft " + input[1] + " gear for are:" + validRanks)
                            tools.outputEmbed(message.channel,embed,player) 
                        }
                    }  else {
                        embed.setColor([255,0,0])
                        embed.addField("Missing Structure",structureMap[toolMap[input[1]].structureReq].capitalize() + " needed to craft " + input[1] + " gear")
                        tools.outputEmbed(message.channel,embed,player)
                    }              
                } else if(validResource){
                    if(tools.cityHasStructure(dominion,resourceMap[input[1]].structureReq)){
                        var cleared = true
                        if(!isNaN(parseInt(input[2])) && parseInt(input[2]) > 0){
                            var amount = parseInt(input[2])
                            for(var resource in resourceMap[input[1]].resources){
                                if(player.resources[resource] < resourceMap[input[1]].resources[resource] * amount){
                                    cleared = false                  
                                    embed.addField("Not Enough of Resource",player.name + " does not have enough " + resource + " to craft " + amount + " " + input[1] + " (" + player.resources[resource] + "/" + resourceMap[input[1]].resources[resource] * amount + ")")
                                }
                            }
                            if(cleared){
                                var resourceCount = 0
                                for(var type in player.resources){
                                    resourceCount += player.resources[type]
                                }
                                if(resourceCount + parseInt(input[2]) <= tools.getPlayerStorage(player)){
                                    player.confirming = {
                                        type:"craftResources",
                                        resource:input[1],
                                        destination:player.id,
                                        amount:amount,
                                        expenses:resourceMap[input[1]].resources,
                                    }
                                    embed.addField("Crafting Request",player.name + " will craft " + input[2] + " " + input[1]) 
                                    embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                    tools.updatePlayer(player,function(){
                                        tools.outputEmbed(message.channel,embed,player)     
                                    })
                                } else {
                                    embed.setColor([255,0,0])
                                    embed.addField("Invalid Player Storage",player.name + " does not have enough storage for " + input[2] + " " + input[1])
                                    tools.outputEmbed(message.channel,embed,player) 
                                }
                            } else {
                                embed.setColor([255,0,0])
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Crafting Amount","Please use positive numbers when indicating how much of a resource you would like to craft")
                            tools.outputEmbed(message.channel,embed,player)
                        }  
                    }  else {
                        embed.setColor([255,0,0])
                        embed.addField("Missing Structure",structureMap[resourceMap[input[1]].structureReq].capitalize() + " needed to craft " + input[1])
                        tools.outputEmbed(message.channel,embed,player)
                    } 
                } else {
                    var validActions = ""
                    for(var action in toolMap){
                        validActions += "\n(" + action + ")"
                    }
                    var validResources = ""
                    for(var resource in resourceMap){
                        validResources += "\n(" + resource + ")"
                    }
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Crafting Request",input[1] + " is an invalid gear/resource to craft.\nValid gear to craft are:" + validActions +"\n----\nValid resources to craft for are:" + validResources)
                    tools.outputEmbed(message.channel,embed,player) 
                }
            } else if(input.length == 2){
                if(input[1] == "options"){
                    for(var action in toolMap){
                        var rankString = ""
                        for(var rank in toolMap[action].rank){
                            rankString += "\n\n**Rank:** " +rank + "\n"
                            var detailString = "```"
                            for(var resource in toolMap[action].rank[rank].resources){
                                detailString += "(" + resource.capitalize() + ": " + toolMap[action].rank[rank].resources[resource] + ")\n"
                            }
                            detailString += "(Durability: " +toolMap[action].rank[rank].durability + ")```"
                            rankString += detailString
                        }
                        embed.addField(action.capitalize() + " (" + action +")","\n" + rankString)
                    }
                    for(var resource in resourceMap){
                        var recipieString = "```"
                        for(var recipeResource in resourceMap[resource].resources){
                            recipieString += "(" + recipeResource.capitalize() + ": " + resourceMap[resource].resources[recipeResource] + ")\n"
                        }
                        embed.addField(resource.capitalize() + " (" + resource +")","\n" + recipieString + "```")
                    }
                    tools.outputEmbed(message.channel,embed,player)
                } else {
                    tools.commandError(this,embed,player,message)
                }
            } 
        }
    }
}