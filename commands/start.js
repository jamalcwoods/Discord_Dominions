module.exports = {
    name:"+start",
    description:"Start your account",
    usage:"+start",
    example:"+start",
    legalParameterCount:[1],
    run: function(tools,input,message,embed){
        tools.getPlayer(message.author.id,function(player){
            if(player == null){
                embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!",true)
                tools.createPlayer(message.author)
                tools.outputEmbed(message.channel,embed)  
            } else {
                embed.setColor([255,0,0])
                embed.addField("Error","A player account already exists for " + message.author.username,true)
                tools.outputEmbed(message.channel,embed)  
            }
        })
    }
}