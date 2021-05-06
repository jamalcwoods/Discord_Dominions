module.exports = {
    fullAuth:true,
    name:"+prefix",
    description:"Change your personal prefix",
    usage:"+prefix (new prefix)",
    example:"+prefix !",
    legalParameterCount:[2],
    run: function(tools,input,dominion,player,message,embed){
        player.prefix = input[1]
        embed.addField("Prefix Changed",player.name + "'s prefix has been changed to: " + input[1] + ". They may use the default one at anytime.")
        tools.updatePlayer(player,function(){
            tools.outputEmbed(message.channel,embed,player)
        })
    }
}