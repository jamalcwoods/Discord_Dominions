module.exports = {
    fullAuth:true,
    name:"+togglepermission",
    description:"Toggle permission on a role",
    usage:"+togglepermission (dominon role) (permission)",
    example:"+togglepermission builder canBuildCity",
    legalParameterCount:[3],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canMakeRole",message,player,dominion,embed)){
            if(input[1] != "leader"){
                if(dominion.roles[input[1]]){
                    if(dominion.roles[input[1]].permissions[input[2]] != undefined){
                        if(dominion.roles[input[1]].permissions[input[2]]){
                            dominion.roles[input[1]].permissions[input[2]] = false
                        } else {
                            dominion.roles[input[1]].permissions[input[2]] = true
                        }
                        embed.addField("Permission Toggled","The permission (" + input[2] + ") for the (" + input[1] + ") role has been toggled to " + dominion.roles[input[1]].permissions[input[2]])
                        tools.updateDominion(dominion,function(){
                            tools.outputEmbed(message.channel,embed,player)
                        })
                    } else {
                        var validPermissions = ""
                        for(var permission in dominion.roles[input[1]].permissions){
                            validPermissions += "(" + permission + ")\n"
                        }
                        embed.setColor([255,0,0])
                        embed.addField("Invalid Permission","Valid permissions are:\n" + validPermissions)
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Role","This roles permissions can not be edited as it does not exist")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Role","The leader role can not be edited")
                tools.outputEmbed(message.channel,embed,player)
            }
        }
    }
}