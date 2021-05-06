module.exports = {
    fullAuth:true,
    name:"+giverole",
    description:"Assign a role to a player",
    usage:"+giverole (role) (user mention)",
    example:"+giverole leader <@549465399020879874>",
    legalParameterCount:[3],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canGiveRole",message,player,dominion,embed)){
            if(dominion.roles[input[1]]){
                var roleID = dominion.roles[input[1]].id
                if(input[2].substring(0,2) == "<@" && input[2].slice(-1) == ">"){
                    var targetID = input[2].split("@")[1].replace(">","").replace("!","")
                    if(message.guild.members.get(targetID)){
                        var guildMember = message.guild.members.get(targetID)
                        tools.getPlayer(targetID,function(player2){
                            if(player2 != null){
                                guildMember.addRole(roleID)
                                embed.addField("Role assigned",player2.name + " has been given the (" + input[1] + ") role")
                                tools.outputEmbed(message.channel,embed,player)
                            } else {
                                embed.setColor([255,0,0])
                                embed.addField("Account not found ","No account found for this user")
                                tools.outputEmbed(message.channel,embed,player)
                            }
                        })
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Guild Member Not Found","Player not found in this server")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid User Mention","User not found")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Role","This role can not be assigned as it does not exist")
                tools.outputEmbed(message.channel,embed,player)
            }
        }
    }
}