module.exports = {
    fullAuth:true,
    name:"+end",
    description:"Remove your account",
    usage:"+end",
    example:"+end",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        tools.getAllDominionsSnap(function(snapshot){
            var isLeader = 0
            snapshot.forEach(function(child) {
                if(child.val().owner == player.id){
                    isLeader = child.val().id
                }
            })
            if(isLeader == 0){
                player.confirming = {
                    type:"end",
                    destination:player.id
                }
                embed.addField("Account Deletion Request",player.name + " will delete the account of " + player.name)
                embed.addField("Confirmation",player.name + " must type +yes to confirm this action or +no to decline"); 
                tools.updatePlayer(player,function(){
                    tools.outputEmbed(message.channel,embed,player)     
                })
            } else {
                embed.setColor([255,0,0])
                embed.addField("Unhandled Responsibility",player.name + " is the leader of the dominion of " + tools.getDominionName(isLeader) + " and cannot delete their account till they transfer ownership or delete the dominion")
                tools.outputEmbed(message.channel,embed,player)
            }
        })
    }
}