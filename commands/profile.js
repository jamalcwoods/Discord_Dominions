module.exports = {
    fullAuth:true,
    name:"+profile",
    description:"View your profile\nView a users profile",
    usage:"+profile\n\+profile (user mention)",
    example:"+profile\n+profile <@163809334852190208>",
    legalParameterCount:[1,2],
    run: function(tools,input,dominion,player,message,embed){
        if(input.length == 1){
            tools.drawProfile(message.author,message.channel,embed,function(newEmbed){
                tools.outputEmbed(message.channel,newEmbed,player) 
            })
        } else if(input.length == 2){
            if(input[1].substring(0,2) == "<@" && input[1].slice(-1) == ">"){
                var targetID = input[1].split("@")[1].replace(">","").replace("!","")
                if(message.guild.members.get(targetID)){
                    var guildMember = message.guild.members.get(targetID)
                    tools.getPlayer(targetID,function(player2){
                        if(player2 != null){
                            tools.drawProfile(guildMember.user,message.channel,embed,function(newEmbed){
                                tools.outputEmbed(message.channel,newEmbed,player) 
                            })
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
        } 
    }
}