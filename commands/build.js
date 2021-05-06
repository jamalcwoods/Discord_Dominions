module.exports = {
    fullAuth:true,
    needEnergy:true,
    takeStructureData:true,
    name:"+build",
    description:"Build a structure in the city of the dominion the command is executed in\nList all structures that can be built",
    usage:"+build (structure) (x-coordinate) (y-coordinate)\n+build (intent)",
    example:"+build mine 3 3\n+build options",
    legalParameterCount:[4,2],
    run: function(structureData,tools,input,dominion,player,message,embed){
        tools.dominionAuthorization("canBuildCity",message,player,dominion,embed).then((result) => {
            if(result){
                var structureMap = structureData.buildStructureMap
                if(input.length == 4){
                    if(structureMap[input[1]] != undefined){
                        if(player.gear.includes("construction")){
                            var gearIndex = player.gear.indexOf("construction")
                            var desiredBuild = structureMap[input[1]]
                            if(player.toolLevel[gearIndex] >= desiredBuild.buildLevel){      
                                tools.getDominionName(dominion.id).then((dominionName) => {
                                    var cleared = true
                                    for(var resource in desiredBuild.resources){
                                        if(!dominion.resources[resource] || dominion.resources[resource] < desiredBuild.resources[resource]){
                                            cleared = false
                                            embed.setColor([255,0,0])
                                            if(!dominion.resources[resource]){
                                                dominion.resources[resource] = 0
                                            }
                                            embed.addField("Not Enough of Resource",dominionName + " does not have enough " + resource + " to build a " + input[1] + " (" + dominion.resources[resource] + "/" + desiredBuild.resources[resource]+ ")")
                                        }
                                    }
                                    if(cleared){
                                        if(!isNaN(parseInt(input[2])) && parseInt(input[2]) >= 1 && parseInt(input[2]) <= 9){
                                            if(!isNaN(parseInt(input[3])) && parseInt(input[3]) >= 1 && parseInt(input[3]) <= 9){
                                                var coords = [parseInt(input[2]) - 1,parseInt(input[3]) - 1]
                                                if(dominion.city[coords[0]][coords[1]] == 0){
                                                    player.confirming = {
                                                        type:"build",
                                                        destination:dominion.id,
                                                        desiredBuild:desiredBuild,
                                                        coordinates:coords,
                                                        name:input[1]
                                                    }
                                                    embed.addField("Construction Request",player.name + " will build a " + input[1] + " for " + dominionName)
                                                    embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                                                    tools.updatePlayer(player,function(){
                                                        tools.outputEmbed(message.channel,embed,player)     
                                                    }) 
                                                } else {
                                                    embed.setColor([255,0,0])
                                                    embed.addField("Structure Already Exists","There is already a structure at these coordinates")
                                                    tools.outputEmbed(message.channel,embed,player)
                                                }
                                            } else {
                                                embed.setColor([255,0,0])
                                                embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                                                tools.outputEmbed(message.channel,embed,player)
                                            }
                                        } else {
                                            embed.setColor([255,0,0])
                                            embed.addField("Invalid Coordinates","Invalid coordinates for structure")
                                            tools.outputEmbed(message.channel,embed,player)
                                        }
                                    } else {
        
                                        tools.outputEmbed(message.channel,embed,player)
                                    } 
                                })
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Missing Gear","You need construction rank " + desiredBuild.buildLevel + " gear to preform this action")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Missing Gear","You need construction gear to preform this action")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    }
                } else if(input.length == 2){
                    if(input[1] == "options"){
                        for(var structure in structureMap){
                            var costString = ""
                            for(var resource in structureMap[structure].resources){
                                costString += resource.capitalize() + ": " + structureMap[structure].resources[resource] +"\n"
                            }
                            embed.addField(structure.capitalize() + " (" + structure +")","Costs:\n" + costString)
                        }
                        tools.outputEmbed(message.channel,embed,player)
                    } else {
                        tools.commandError(this,embed,player,message)
                    }
                } 
            }
        })
    }
}