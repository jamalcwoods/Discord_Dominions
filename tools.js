const { createCanvas, loadImage, Image } = require('canvas')
function createPlayer(user){
    var playerData = firebase.database().ref("players/" + user.id);
    playerData.once('value').then(function(playerSnapshot) {
        var now = new Date();
        var newPlayer = {
            name:user.username,
            id:user.id,
            lastAction:now.getTime(),
            resources:{
                gold:0
            },
            followers:0,
            maxGear:4,
            gear:["mining","lumberjacking","construction"],
            toolLevel:[1,1,1],
            toolDurability:[-1,-1,-1],
            energy:15,
            energyCap:15,
            dob:now.getTime(),
            prefix:"+"
        }
        playerData.update(newPlayer)
    })
}
function getPlayerStorage(player){
    return 100 + (player.maxGear - player.gear.length) * 100 
}

module.exports = {
    firebase:null,
    client:null,
    version:null,
    fs:null,
    structureData:null,
    prettyms:null,
    cmdCount:null,
    initialize: function(cmdCountI,firebaseI,clientI,versionI,fsI,structureDataI,prettymsI){
        firebase = firebaseI
        client = clientI;
        version = versionI;
        fs = fsI;
        structureData = structureDataI
        prettyms = prettymsI,
        cmdCount = cmdCountI
    },
    getDominionName: function (id){
        return client.guilds.fetch(id).then((guild) =>{
            return guild.name
        })
    },
    updatePlayer: function (newData,callback){
        var playerData = firebase.database().ref("players/" + newData.id);
        playerData.update(newData)
        callback(newData)
    },
    getPlayer: function (id,callback){
        var playerData = firebase.database().ref("players/" + id);
        playerData.once('value').then(function(playerSnapshot) {
            callback(playerSnapshot.val())
        })
    },
    updateDominion: function (newData,callback){
        var dominionData = firebase.database().ref("dominions/" + newData.id);
        dominionData.update(newData)
        callback(newData)
    },
    getDominion: function (id,callback){
        var dominionData = firebase.database().ref("dominions/" + id);
        dominionData.once('value').then(function(dominionSnapshot) {
            callback(dominionSnapshot.val())
        })
    },
    getAllDominionsSnap: function(callback){
        var data = firebase.database().ref("dominions/");
        data.once('value').then(function(snapshot) {
            callback(snapshot)
        })
    },
    deleteDominion: function (id,callback){
        var data = firebase.database().ref("dominions/");
        data.once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                if(child.val().id == id){
                    child.ref.remove();
                    callback()
                }
            })
            
        })
    },
    deletePlayer: function (id,callback){
        var data = firebase.database().ref("players/");
        data.once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                if(child.val().id == id){
                    child.ref.remove();
                    callback()
                }
            })
            
        })
    },
    getRandom: function (min,max){
        return (Math.random() * (max - min)) + min
    },
    drawProfile: function (user,channel,embed,callback){
        this.getPlayer(user.id,function(player){
            var date = new Date(player.dob)
            embed.setTitle(player.name)
            embed.addField("Date Started:","```"+date.toDateString()+"```")
            embed.addField("Energy:","```" + player.energy + " / " + player.energyCap+"```")
            embed.addField("Followers:","```" +player.followers+"```")
            for(var gearIndex in player.gear){
                var durability = player.toolDurability[gearIndex]
                if(durability == -1){
                    durability = "Infinite"
                }
                var rank = player.toolLevel[gearIndex]
                if(rank == 0){
                    rank = "None"
                }
                embed.addField(player.gear[gearIndex].capitalize() + " Gear:","```Rank: " + rank + "\nDurability: " + durability + "```",true)
            }
            var resources = ""
            var resourceCount = 0
            for(var type in player.resources){
                if(player.resources[type] > 0){
                    resources += type.capitalize() + ": " + player.resources[type] + "\n"
                    resourceCount += player.resources[type]
                }
            }
            if(resources == ""){
                embed.addField("Resources (" + resourceCount + " / " + getPlayerStorage(player) + ")","```(None)```")
            } else {
                embed.addField("Resources (" + resourceCount + " / " + getPlayerStorage(player) + "):" ,"```"+resources + "```",true)
            }
            embed.setThumbnail(user.displayAvatarURL)
            callback(embed)
        })
    },
    getDominionStorage: function(dominion){
        var storage = 0
        for(var x in dominion.city){
            for(var y in dominion.city[x]){
                if(dominion.city[x][y].id == 8){
                    storage += 200
                }
                if(dominion.city[x][y].id == 1){
                    storage += 1000
                }
            } 
        }
        return storage
    },
    getPlayerStorage: function(player){
        return getPlayerStorage(player)
    },
    getDominionCapacity: function(dominion){
        var capacity = 0
        for(var x in dominion.city){
            for(var y in dominion.city[x]){
                if(dominion.city[x][y].id == 1){
                    capacity += 5
                }
                if(dominion.city[x][y].id == 9){
                    capacity += 10
                }
            } 
        }
        return capacity
    },
    drawDominion: function(dominion,channel,embed,callback){
        this.getDominionName(dominion.id).then((dominionName) =>{
            var date = new Date(dominion.dob)
            var housing = 0
            embed.setTitle(dominionName)
            embed.addField("Date Created:","```" + date.toDateString()+"```")
            embed.addField("Villager Population: ","```"+dominion.villagerPopulation + "/" + this.getDominionCapacity(dominion)+"```")
            var resources = ""
            var resourceCount = 0
            for(var type in dominion.resources){
                if(dominion.resources[type] > 0){
                    resources += type.capitalize() + ": " + dominion.resources[type] + "\n"
                    resourceCount += dominion.resources[type]
                }
            }
            if(resources == ""){
                embed.addField("Resources (" + resourceCount + " / " + this.getDominionStorage(dominion) + ")","```(None)```")
            } else {
                embed.addField("Resources (" + resourceCount + " / " + this.getDominionStorage(dominion) + "):" ,"```"+resources+"```")
            }
            embed.setThumbnail(channel.guild.splashURL)
            callback(embed)
        })
    },
    listDominionTrades: function(dominion,channel,embed,callback){
        this.getDominionName(dominion.id).then((dominionName) => {
            var trades = {}
            for(var sale in dominion.trading.selling){
                trades[sale] = {}
                trades[sale].selling = dominion.trading.selling[sale]
            }
            for(var buying in dominion.trading.buying){
                if(!trades[buying]){
                    trades[buying] = {}
                }
                trades[buying].buying = dominion.trading.buying[buying]
            }
            var valid = false
            for(var resource in trades){
                valid = true
                var title = resource.capitalize()
                var content = ""
                if(trades[resource].selling){
                    content += "Amount Wanted To Sell: " + trades[resource].selling.amount + "\nSelling " + trades[resource].selling.exchange.amount + " per " + trades[resource].selling.exchange.value + " Gold"
                }
                if(trades[resource].buying){          
                    content += "Amount Wanted To Buy: " + trades[resource].buying.amount + "\nBuying " + trades[resource].buying.exchange.amount + " per " + trades[resource].buying.exchange.value + " Gold"
                }
                embed.addField(title,content,true)
            }
            embed.setTitle(dominionName + "'s Active Trades")
            if(!valid){
                embed.addField("No Trades",dominionName + " is not buying or selling any resources")
            }
            this.outputEmbed(channel,embed)
        })
    },
    drawCity: function (dominion,channel,embed,callback){
        var out = fs.createWriteStream("./cities/" + dominion.id + '.jpg')
        var canvas = createCanvas(290, 290)
        const ctx = canvas.getContext('2d')
        var stream = canvas.pngStream();
        var sprites = {}                
        fs.readdir("./art",function(err,items){
            for(var images in items){
                const img = new Image()
                img.src = "./art/" + items[images]
                sprites[items[images].split(".")[0]] = (img)
            }
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if(dominion.city[i][j].id) {
                        ctx.drawImage(sprites[structureData.buildingMap[dominion.city[i][j].id]],i*32,j*32)
                    } else {
                        ctx.drawImage(sprites[structureData.buildingMap[0]],i*32,j*32)
                    }
                }   
            }    
            ctx.beginPath()  
            for (let i = 0; i < 9; i++) {
                ctx.moveTo(0,i*32)
                ctx.lineTo(290,i*32)   
                ctx.stroke();
                ctx.moveTo(i*32,0)
                ctx.lineTo(i*32,290)   
                ctx.stroke();             
            }            
            stream.on('data', function(chunk){
                out.write(chunk);
              });
               
              stream.on('end', function(){
                out.end(function(){
                    client.guilds.fetch(dominion.id).then((guild) =>{
                        embed.addField("City View","Now viewing the city of the dominion of " + guild.name + "!",true)
                        embed.attachFiles("./cities/" + dominion.id + '.jpg')
                        callback(embed)
                    })
                })
              });
        })
    },
    createPlayer: function(user){
        createPlayer(user)
    },
    outputEmbed: function (channel,embed,player,scroll){
        var now = new Date()
        if(!embed.color){
            embed.setColor([114,137,218])
        }
        if(player){
            if(player.energy != player.energyCap && (now.getTime() - player.lastAction < 120000)){
                embed.setFooter("Discord Dominions v" + version + "| Energy: (" + player.energy + "/" + player.energyCap + ") Recharges in " + prettyms(120000 - (now.getTime() - player.lastAction)) + "...")
            } else {
                embed.setFooter("Discord Dominions v" + version + "| Energy: (" + player.energy + "/" + player.energyCap + ")")
            }
        } else {
            embed.setFooter("Discord Dominions v" + version)
        }
        if(scroll == "help"){
            embed.setFooter("Discord Dominions v" + version + "| Scroll Window | Help | Command #1/" + cmdCount)
            channel.send("",embed).then(message => {
                message.react("⬅").then(() =>{
                    message.react("➡")
                })
            })
        } else {
            console.log(channel)
            channel.send("",embed)
        }   
    },
    cityHasStructure: function(dominion,structureID){
        for(var x in dominion.city){
            for(var y in dominion.city[x]){
                if(dominion.city[x][y] != 0){
                    if(dominion.city[x][y].id == structureID){
                        return dominion.city[x][y]
                    }
                }
            }
        }
        return false
    },
    dominionAuthorization: function(auth,message,player,dominion,embed){
        var authorized = false;
        return message.guild.members.fetch(player.id).then((member) => {
            for(var role of member.roles.cache.array()){
                for(var roleType in dominion.roles){
                    if(dominion.roles[roleType].id == role.id){
                        if(dominion.roles[roleType].permissions.master || dominion.roles[roleType].permissions[auth]){
                            authorized = true
                            break;
                        }
                    }
                }
                if(authorized){
                    break;
                }
            }
            if(authorized){
                return authorized
            } else {
                embed.setColor([255,0,0])
                embed.addField("Invalid Authorization",player.name + " is not authorized for this action")
                this.outputEmbed(message.channel,embed,player)
                return false
            }
        })
    },
    commandError: function (command,embed,player,message){
        embed.setColor([255,0,0])
        var field = {}
        embed.setTitle("Invalid Use of Command: " + message.content.split(" ")[0])
        if(!command.name.multiCommand){
            field.name = command.name
            field.value = ""
            for(var i in command.description.split("\n")){
                field.value += "\n\n**Example #" + (1+parseInt(i)) +":**\n`" + command.example.split("\n")[i] + "`\n" + command.description.split("\n")[i] + "\nUsage:`" + command.usage.split("\n")[i] +"`" 
            } 
            embed.addField(field.name,field.value)         
        }
        this.outputEmbed(message.channel,embed,player)
    },
    createDominion: function (guild,user,channelID){
        var playerData = firebase.database().ref("players/" + user.id);
        playerData.once('value').then(function(playerSnapshot) {
            var now = new Date();
            var dominions = firebase.database().ref("dominions/" + guild.id);
            var city
            guild.roles.create({
                data:{
                    name:"Dominion Leader",
                    color:[255,189,27] 
                }
            }).then(role => {
                var newDominion = {
                    villagerPopulation:0,
                    resources:{     
                        gold:0,                        
                    },
                    roles:{
                        leader:{
                            id:role.id,
                            permissions:{
                                master:true
                            }
                        }
                    },
                    trading:{
                        active:false
                    },
                    city:[],
                    military:[0,0,0,0,0,0,0,0,0,0],
                    id:guild.id,
                    owner:user.id,
                    dob:now.getTime(),
                    legalChannels:[channelID]
                }
                for(var i = 0;i<9;i++){
                    newDominion.city[i] = []
                    for(var j = 0;j<9;j++){
                        if(j == 4 && i == 4){
                            newDominion.city[i][j] = {
                                id:1,
                                health:10,
                                level:0
                            }
                        } else {
                            newDominion.city[i][j] = 0
                        }
                    }  
                }
                if(playerSnapshot.val() == null){
                    (user)
                }
                dominions.update(newDominion)
                guild.members.fetch(user.id).then((member) => {
                    member.roles.add(role.id)
                })
            })   
        })
    }
}
