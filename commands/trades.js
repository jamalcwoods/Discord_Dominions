module.exports = {
    fullAuth:true,
    name:"+trades",
    description:"View the current trades in the dominion this command is used in",
    usage:"+trades",
    example:"+trades",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        tools.listDominionTrades(dominion,message.channel,embed,function(newEmbed){
            tools.outputEmbed(message.channel,newEmbed,player) 
        }) 
    }
}