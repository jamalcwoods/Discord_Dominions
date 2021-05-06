module.exports = {
    fullAuth:true,
    name:"+removerole",
    description:"Remove a dominion role from a player",
    usage:"+removerole (dominon role) (user mention)",
    example:"+removerole builder <@549465399020879874>",
    legalParameterCount:[3],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("canGiveRole",message,player,dominion,embed)){
            if(input[1] != "leader"){
                if(dominion.roles[input[1]]){
                    var roleID = dominion.roles[input[1]].id
                    if(input[2].substring(0,2) == "<@" && input[2].slice(-1) == ">"){
                        var targetID = input[2].split("@")[1].replace(">","").replace("!","")
                        if(message.guild.members.get(targetID)){
                            var guildMember = message.guild.members.get(targetID)
                            tools.getPlayer(targetID,function(player2){
                                if(player2 != null){
                                    guildMember.removeRole(roleID)
                                    embed.addField("Role Removed",player2.name + " has had the (" + input[1] + ") role removed")
                                    tools.outputEmbed(message.channel,embed,player)
                                } else {
                                    embed.setColor([255,0,0])
                                    embed.addField("Account not found ","No account found for this user")
                                    tools.outputEmbed(message.channel,embed,player)
                                }
                            })
                        } else {
                            embed.setColor([255,0,0])
                            embed.addField("Guild Memeber Not Found","Player not found in this server")
                            tools.outputEmbed(message.channel,embed,player)
                        }
                    } else {
                        embed.setColor([255,0,0])
                        embed.addField("Invalid User Mention","User not found")
                        tools.outputEmbed(message.channel,embed,player)
                    }
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Invalid Role","This role can not be removed as it does not exist")
                    tools.outputEmbed(message.channel,embed,player)
                }
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Role","The leader role can not be removed")
                tools.outputEmbed(message.channel,embed,player)
            }
        }
    }
}