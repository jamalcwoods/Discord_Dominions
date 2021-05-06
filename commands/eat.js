module.exports = {
    fullAuth:true,
    takeStructureData:true,
    needEnergy:true,
    name:"+eat",
    description:"Eat a resource to gain energy",
    usage:"+eat (resource) (amount)",
    example:"+eat (resource) (amount)",
    legalParameterCount:[3],
    run: function(structureData,tools,input,dominion,player,message,embed){
        var consumables = structureData.consumableMap
        if(consumables[input[2]]){
            if(!isNaN(input[1]) && parseInt(input[1]) > 0){
                if(parseInt(input[1]) % consumables[input[2]][0] == 0){
                    if(player.resources[input[2]] >= parseInt(input[1])){
                        if(player.energyCap - player.energy >= consumables[input[2]][1] * (parseInt(input[1])/consumables[input[2]][0])){
                            player.energy += consumables[input[2]][1] * (parseInt(input[1])/consumables[input[2]][0])
                            player.resources[input[2]] -= parseInt(input[1])
                            if(player.resources[input[2]] == 0){
                                delete player.resources[input[2]]
                            }
                            embed.addField(player.name.capitalize() + " Consumed " + input[1] + " " + input[2],player.name + " gained " + consumables[input[2]][1] * (parseInt(input[1])/consumables[input[2]][0]) + " energy")
                            tools.updatePlayer(player,function(newPlayer){
                                tools.outputEmbed(message.channel,embed,newPlayer)
                            })
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Energy Overload",player.name + " would overflow their energy if they ate " + input[1] + " " + input[2])
                            tools.outputEmbed(message.channel,embed,player) 
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Not Enough of Resource",player.name + " does not have " + input[1] + " " + input[2] + " to eat")
                        tools.outputEmbed(message.channel,embed,player) 
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Resource Amount",input[2] + " can only be eaten in groups of " + consumables[input[2]][0])
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource Amount",input[2] + " is not a valid amount of a resource to consume. Please use positive numbers to determine how much of a resource you would like to consume")
                tools.outputEmbed(message.channel,embed,player)
            }
        } else {
            var validResources = ""
            for(var resource in consumables){
                validResources += "(" + resource + ")\n"
            }
            embed.setColor([255,0,0])
            embed.addField("Invalid Resource",input[2] + " is not a valid resource to eat. Valid resources to eat are:\n" + validResources)
            tools.outputEmbed(message.channel,embed,player)
        }
    }
}