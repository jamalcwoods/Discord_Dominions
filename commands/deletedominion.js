module.exports = {
    fullAuth:true,
    name:"+deletedominion",
    description:"Completely wipe all dominion data from this server",
    usage:"+deletedominion",
    example:"+deletedominion",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        if(tools.dominionAuthorization("master",message,player,dominion,embed)){
            player.confirming = {
                type:"deletedominion",
                destination:dominion.id
            }
            embed.addField("Dominion Deletion Request",player.name + " will delete the dominion " + tools.getDominionName(dominion.id))
            embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
            tools.updatePlayer(player,function(){
                tools.outputEmbed(message.channel,embed,player)     
            })
        }
    }
}
