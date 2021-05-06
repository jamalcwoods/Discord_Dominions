module.exports = {
    fullAuth:true,
    name:"+dominion",
    description:"View the current dominion this command is used in",
    usage:"+dominion",
    example:"+dominion",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        tools.drawDominion(dominion,message.channel,embed,function(newEmbed){
            tools.outputEmbed(message.channel,newEmbed,player) 
        }) 
    }
}