module.exports = {
    fullAuth:true,
    needEnergy:true,
    takeStructureData:true,
    name:"+take",
    description:"Take resources from the dominion the command is executed in",
    usage:"+take (amount) (resource)",
    example:"+take 1 stone",
    legalParameterCount:[3],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canTakeResources",message,player,dominion,embed)){
            tools.getDominionName(dominion.id).then((dominionName) =>{
                var resources = structureData.resources
                if(resources.includes(input[2])){
                    if(!isNaN(parseInt(input[1])) && parseInt(input[1]) > 0){
                        if(dominion.resources[input[2]] >= parseInt(input[1])){
                            var resourceCount = 0
                            for(var type in player.resources){
                                resourceCount += player.resources[type]
                            }
                            if(resourceCount + parseInt(input[1]) <= tools.getPlayerStorage(player)){
                                player.confirming = {
                                    type:"take",
                                    amount:parseInt(input[1]),
                                    resource:input[2],
                                    destination:player.id,
                                    donator:dominion.id,
                                }
                                embed.addField("Taking Resources",player.name + " will be taking " + input[1] + " " + input[2] + " from the dominion of " + dominionName)
                                embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                tools.updatePlayer(player,function(){
                                    tools.outputEmbed(message.channel,embed,player)     
                                })
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Invalid Player Storage",player.name + " does not have enough storage for " + input[1] + " " + input[2])
                                tools.outputEmbed(message.channel,embed,player) 
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Not Enough of Resource",dominionName + " does not have " + input[1] + " " + input[2] + " to be taken")
                            tools.outputEmbed(message.channel,embed,player) 
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Resource Amount",input[1] + " is not a valid amount of a resource to take. Please use positive numbers to determine how much of a resource you would like to take")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    var validResources = ""
                    for(var resource of resources){
                        validResources += "(" + resource + ")\n"
                    }
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Resource",input[2] + " is not a valid resource to take. Valid resources to take are:\n" + validResources)
                    tools.outputEmbed(message.channel,embed,player)
                }
            })
        }
    }
}