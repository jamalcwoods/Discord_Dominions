module.exports = {
    name:"+claim",
    description:"Claim a server as your dominion",
    usage:"+claim",
    example:"+claim",
    legalParameterCount:[1],
    run: function(tools,input,message,embed){
        if(message.author.id == message.guild.ownerID){
            tools.getDominion(message.guild.id,function(dominion){
                if(dominion == null){
                    embed.addField("Dominion Created","The dominion of " + message.guild.name + " has been created! All commands related to Discord Dominions will be handled here",true)
                    embed.addField("Player Created","Welcome to the world of Discord Dominions " + message.author.username + "!\n\nYou have been given the 'Dominion Leader' role. Only one person on a server may have this role. Giving this role to another person will transfer leadership of this dominion",true)
                    tools.createDominion(message.guild,message.author,message.channel.id)
                    tools.outputEmbed(message.channel,embed)  
                } else {
                    embed.setColor([255,0,0])
                    embed.addField("Error","A dominion for this server has already been created",true)
                    tools.outputEmbed(message.channel,embed)  
                }
            })
        } else {
            embed.setColor([255,0,0])
            embed.addField("Error","Only a server owner may claim a dominion",true)
            tools.outputEmbed(message.channel,embed)
        }
    }
}
