module.exports = {
    fullAuth:true,
    name:"+createrole",
    description:"Create a role for your dominion",
    usage:"+createrole (role name) (red value) (blue value) (green value)",
    example:"+createrole miners 0 0 255",
    legalParameterCount:[5],
    run: function(tools,input,dominion,player,message,embed){
        var authorized = false;
        if(tools.dominionAuthorization("canMakeRole",message,player,dominion,embed)){
            if(dominion.roles[input[1]] == undefined){
                if(!isNaN(parseInt(input[2])) && parseInt(input[2]) >= 0 && parseInt(input[2]) <= 255){
                    if(!isNaN(parseInt(input[3])) && parseInt(input[3]) >= 0 && parseInt(input[3]) <= 255){
                        if(!isNaN(parseInt(input[4])) && parseInt(input[4]) >= 0 && parseInt(input[4]) <= 255){
                            message.guild.createRole({
                                name:input[1],
                                color:[parseInt(input[2]),parseInt(input[3]),parseInt(input[4])] 
                            }).then(role => {
                                dominion.roles[input[1]] = {
                                    id:role.id,
                                    permissions:{
                                        canMakeRole:false,
                                        canGiveRole:false,
                                        canTakeResources:false,
                                        canBuildCity:false,
                                        canManageTrading:false,
                                        canOpenChannels:false,
                                        canUseFacilities:false
                                    }
                                }
                                tools.updateDominion(dominion,function(){
                                    embed.addField("Role Created","The role (" + input[1] + ") has been created")
                                    tools.outputEmbed(message.channel,embed,player)
                                })
                            })
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                        tools.outputEmbed(message.channel,embed,player)
                    }  
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Role Color","Colors for roles are designated by 3 RGB values separated by spaces\nExample: +createRole green 0 255 0")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Role Already Present","A role with the name (" + input[1] + ") already exists")
                tools.outputEmbed(message.channel,embed,player)
            }
        }
    }
}