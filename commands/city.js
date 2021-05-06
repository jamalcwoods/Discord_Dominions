module.exports = {
    fullAuth:true,
    name:"+city",
    description:"Displays a map of the city of the dominion the command is executed in",
    usage:"+city",
    example:"+city",
    legalParameterCount:[1],
    run: function(tools,input,dominion,player,message,embed){
        tools.drawCity(dominion,message.channel,embed,function(newEmbed){
            tools.outputEmbed(message.channel,newEmbed,player)
        })
    }
}