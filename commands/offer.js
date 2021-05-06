module.exports = {
    fullAuth:true,
    takeStructureData:true,
    name:"+offer",
    description:"Set a offer at a dominion's trading post",
    usage:"+offer (total amount) (resource) (minimum gold per transaction) (minimum resource per transaction)",
    example:"+offer 20 lumber 1 5",
    legalParameterCount:[5],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canManageTrading",message,player,dominion,embed)){
            var resources = structureData.resources
            if(resources.includes(input[2])){
                if(!isNaN(parseInt(input[1])) && parseInt(input[1]) > 0){
                    if(!isNaN(parseInt(input[3])) && parseInt(input[1]) > 0){
                        if(!isNaN(parseInt(input[4])) && parseInt(input[1]) > 0){
                            var totalAmount = parseInt(input[1])
                            var minGold = parseInt(input[3])
                            var minResource = parseInt(input[4])
                            var dominionCurrentStorage = 0
                            for(var resource in dominion.resources){
                                dominionCurrentStorage += dominion.resources[resource]
                            }
                            if(dominionCurrentStorage + minGold <= tools.getDominionStorage(dominion)){
                                if(dominion.resources[input[2]] >= totalAmount){
                                    player.confirming = {
                                        type:"offer",
                                        totalAmount:totalAmount,
                                        minGold:minGold,
                                        minResource:minResource,
                                        resource:input[2],
                                        destination:dominion.id
                                    }
                                    embed.addField("Trading Offer",tools.getDominionName(dominion.id) + " will be selling " + totalAmount + " " + input[2] + " at a rate of " + minResource + " " + input[2] + " for " + minGold + " gold")
                                    embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                    tools.updatePlayer(player,function(){
                                        tools.outputEmbed(message.channel,embed,player)     
                                    })
                                } else {
                                    embed.setColor([255,0,0])
                                    embed.addField("Invalid Dominion " + input[2].capitalize() + " Reserves",tools.getDominionName(dominion.id) + " does not have " + input[2] + " " + input[2] + " to offer")
                                    tools.outputEmbed(message.channel,embed,player) 
                                }
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Invalid Dominion Storage",tools.getDominionName(dominion.id) + " does not have enough storage for " + input[1] + " gold")
                                tools.outputEmbed(message.channel,embed,player) 
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Amount","Please use positive numbers when indicating a minimum amount of " + input[2] + " a player will receive per transaction")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Amount","Please use positive numbers when indicating a minimum amount of gold a player will receive per transaction")
                        tools.outputEmbed(message.channel,embed,player)
                    }   
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Amount","Please use positive numbers when indicating a total number of a resource you would like to offer")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                var validResources = ""
                for(var resource of resources){
                    validResources += "(" + resource + ")\n"
                }
                embed.setColor([255,0,0])
                embed.addField("Invalid Resource",input[2] + " is not a valid resource to offer. Valid resources to offer are:\n" + validResources)
                tools.outputEmbed(message.channel,embed,player)   
            }
        }
    }
}