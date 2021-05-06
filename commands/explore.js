module.exports = {
    fullAuth:true,
    needEnergy:true,
    takeStructureData:true,
    name:"+explore",
    description:"Explore the overworld for random encounters",
    usage:"+explore",
    example:"+explore",
    legalParameterCount:[1],
    run: function(structureData,tools,input,dominion,player,message,embed){
        if(player.gear.includes("exploring")){
            var gearIndex = player.gear.indexOf("exploring")
            var gearRank = player.toolLevel[gearIndex]
            var journeyYields = structureData.journeyYield
            var journeyQueue = []
            for(var event in journeyYields.events){
                if(Math.random() <= journeyYields.events[event].chance[gearRank - 1]){
                    var field = {
                        title:journeyYields.events[event].title,
                        description:""
                    }
                    var circumstances = journeyYields.events[event].challenges
                    for(var task of circumstances){
                        var succeeded = 0;
                        if(player.gear.indexOf(task.gear) != -1){
                            if(player.toolLevel[player.gear.indexOf(task.gear)] >= Math.round(tools.getRandom(task.threshold[0],task.threshold[1]))){
                                succeeded = 1
                            } else {
                                succeeded = 2
                            }
                        }
                        var results; 
                        if(succeeded == 1){
                            field.description += "\n\n" + player.name + task.winMessage
                            results = task.rewards 
                        } else if(succeeded == 2){
                            field.description += "\n\n" + player.name + task.loseMessage
                            results = task.punishments 
                        } else if(succeeded == 0){
                            field.description += "\n\n" + player.name + task.failMessage
                            results = task.punishments
                        }
                        if(results){
                            for(var result of results){
                                if(!result.chance || Math.random() <= result.chance[player.toolLevel[player.gear.indexOf(task.gear)] - 1]){
                                    switch(result.type){
                                        case "GAINRESOURCE":
                                            var resource;
                                            if(result.resource == "RANDOM"){
                                                while(!player.resources[resource]){
                                                    resource = structureData.resources[Math.round(Math.random() * structureData.resources.length)]
                                                }
                                            } else {
                                                resource = result.resource
                                            }
                                            var amount = Math.round(tools.getRandom(result.amount[0],result.amount[1]))
                                            if(!player.resources[resource]){
                                                player.resources[resource] = 0
                                            }
                                            player.resources[resource] += amount
                                            field.description += "\nGained " + amount + " " + resource
                                            break;
                                        case "LOSERESOURCE":
                                            var resource;
                                            if(result.resource == "RANDOM"){
                                                while(!player.resources[resource]){
                                                    resource = structureData.resources[Math.round(Math.random() * structureData.resources.length)]
                                                }
                                            } else {
                                                resource = result.resource
                                            }
                                            var amount = Math.round(tools.getRandom(result.amount[0],result.amount[1]))
                                            if(player.resources[resource] - amount < 0){
                                                amount = player.resources[resource]
                                                delete player.resources[resource]
                                            } else {
                                                player.resources[resource] -= amount
                                            }
                                            field.description += "\nLost " + amount + " " + resource
                                            break;
                                        case "LOSEENERGY":
                                            var amount = Math.round(tools.getRandom(result.amount[0],result.amount[1]))
                                            if(player.energy - amount < 0){
                                                amount = player.energy
                                                player.energy = 0
                                            } else {
                                                player.energy -= amount
                                            }
                                            field.description += "\nLost " + amount + " energy"
                                            break;
                                    }
                                }
                            }         
                        }
                    }
                    journeyQueue.push(field)
                }
            }
            var empty = true
            for(var moment of journeyQueue){
                empty = false
                embed.addField(moment.title,moment.description)
            }
            if(empty){
                embed.addField("No Events","Nothing happened during " + player.name + "'s exploration")
            }
            tools.updatePlayer(player,function(){
                tools.outputEmbed(message.channel,embed,player)
            })
        } else {
            embed.setColor([255,0,0])
            embed.addField("Missing Gear","You need exploring gear to preform this action")
            tools.outputEmbed(message.channel,embed,player)
        }
}
}