module.exports = {
    fullAuth:true,
    name:"+no",
    description:"Decline a request",
    usage:"+no",
    example:"+no",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        if(player.confirming){
            embed.addField(player.confirming.type.capitalize() + " Request Cancelled", player.name + " is no longer pending a confirmation")
            player.confirming = null
            tools.updatePlayer(player,function(){
                tools.outputEmbed(message.channel,embed)
            })
        } else {
            embed.setColor([255,0,0])
            embed.addField("No Pending Confirmation",player.name + " is not confirming anything at the current moment")
            tools.outputEmbed(message.channel,embed)
        }
    }
}