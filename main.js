/*
 * BotMC - A Discord BOT can open your Minecraft Server
 * https://botmc.cf
 *
 * Script By: 000hen(凝桑, 3ZH-Studio Network)
 *
 * p.s. This BOT script is all in Chinese(Taiwan)
 * 
 */
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const { spawn, exec } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");
const dwnd = require("./api/download.js");

const platform = os.platform();
var dwndone = false;
var servers = [];
dwnd.downloadData.download().then(e => {
    dwndone = true;
})

async function runt() {
    if (dwndone === true) {
        run();
    } else {
        setTimeout(() => runt(), 1000);
    }
}

runt();


function run() {
    client.login(config.discordToken);

    function rmServer(serverId) {
        for (var s = 0; s < servers.length; s++) {
            if (servers[s].id === serverId) {
                servers.splice(s, 1);
                break;
            }
        }
    }

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on("message", message => {
        var msgArray = message.content.split(" ");
        var perfix = msgArray.shift();
        var command = msgArray.shift();

        if (perfix !== config.botPrefix) return false;
        if (command === "help") {
            var embed = new Discord.MessageEmbed()
                .setColor('#58b500')
                .setTitle('Discord BOT for Minecraft Startup Help')
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setDescription('這是幫助頁面')
                .addFields(
                    { name: config.botPrefix, value: '是指令前輟!!' },
                    { name: '\u200B', value: '\u200B' },
                    { name: `${config.botPrefix} start (伺服器ID)`, value: '啟動伺服器', inline: true },
                    { name: `${config.botPrefix} stop (伺服器ID)`, value: '關閉伺服器', inline: true },
                    { name: `${config.botPrefix} list`, value: '伺服器列表', inline: true }
                )
                .setTimestamp()
                .setFooter(config.author, config.authorImg);
            message.channel.send(embed);
            return true;
        }
        if (command === "start") {
            var serverId = msgArray.shift();
            if (config.minecraftServerFolders.find(e => e.id === serverId) === undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle('錯誤 - 找不到伺服器')
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription('我們找不到您所希望的伺服器ID')
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            if (servers.find(e => e.id === serverId) !== undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle('錯誤 - 已啟動伺服器')
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription('這台伺服器已啟動了')
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            var serverinfo = config.minecraftServerFolders.find(e => e.id === serverId);
            
            //var javaRuntime = "java";
            
            if (platform === "win32") {
                var javaRuntime = `"${__dirname}/javas/win32/${(serverinfo.javaVersion || "8")}/bin/java.exe"`;
            } else if (platform === "linux") {
                fs.chmodSync("javas/*", 777);
                var javaRuntime = `"${__dirname}/javas/linux/${(serverinfo.javaVersion || "8")}/bin/java"`;
            } else {
                throw new Error("Unsupport your Operating System");
            }
            try {
                if (!fs.existsSync(javaRuntime)) { }
            } catch (err) {
                javaRuntime = "java";
                console.warn("Hey! You need to download the Java Runtime into this project's folder, or we will run in local Java version.\n\nCheck this line's annotation.");
                
                // * Runtime Download Url (525MB, Unzip: 891MB, Include: Windows, Linux): https://dl.botmc.cf/javas.zip
                // * (I use mediafire to storge because the zip is too big for Github).
                // * You just need unzip, and threw the folder (name "javas") into this project's root folder.
                
            }

            //servers.push({ id: serverId, server: (spawn(`"${javaRuntime}"`, [`-jar`, `"${serverinfo.folder}/${serverinfo.serverFileName}"`, `nogui`, { cwd: serverinfo.folder })) }); //==>This is not working for me.
            servers.push({ id: serverId, server: (exec(`${javaRuntime} -jar "${serverinfo.folder}/${serverinfo.serverFileName}" nogui`, { cwd: serverinfo.folder })) });

            var embed = new Discord.MessageEmbed()
                .setColor("#79de31")
                .setTitle(`伺服器 ${serverinfo.name} 啟動了`)
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setTimestamp()
                .setFooter(config.author, config.authorImg);
            message.channel.send(embed);

            var chkusr = false;

            var server = servers.find(e => e.id === serverId).server;
            server.stdout.on("data", data => {
                var output = Buffer.from(data).toString();
                var embed = new Discord.MessageEmbed()
                    .setColor("#79de31")
                    .setTitle(`伺服器 ${serverinfo.name} 輸出`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(output)
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                if (output.match(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\] \[Server thread\/INFO\]\w*: There are 0 of a max of [0-9]* players online:\w*/gm)) {
                    var embed = new Discord.MessageEmbed()
                        .setColor('#ff3b3b')
                        .setTitle(`伺服器 ${serverinfo.name} 關閉`)
                        .setURL(config.authorSite)
                        .setAuthor(config.authorName, config.authorImg, config.authorSite)
                        .setDescription(`為節省伺服器效能, 伺服器在無人 ${config.idleTimeout / 1000 / 60} 分鐘後即自動關閉`)
                        .setTimestamp()
                        .setFooter(config.author, config.authorImg);
                    message.channel.send(embed);
                    setTimeout(() => {
                        server.stdin.write("stop\n");
                        clearInterval(chkusronline);
                    }, 1000);
                    
                };
                if (output.match(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\] \[Server thread\/INFO\]\w*: Done \([0-9]*\.[0-9]*s\)! For help, type "help"/gm)) {
                    var embed = new Discord.MessageEmbed()
                        .setColor("#79de31")
                        .setTitle(`伺服器 ${serverinfo.name} 啟動成功`)
                        .setURL(config.authorSite)
                        .setAuthor(config.authorName, config.authorImg, config.authorSite)
                        .setDescription(`現在你們可以進入 ${serverinfo.name} 暢玩了!`)
                        .setTimestamp()
                        .setFooter(config.author, config.authorImg);
                    message.channel.send(embed);
                }
                chkusr = false;
            });
            server.on("close", () => {
                console.log(`If you cannot run the server, you can try "chmod 777 javas/*" on project's root folder in linux system.`);
                rmServer(serverId);
                var embed = new Discord.MessageEmbed()
                    .setColor("#79de31")
                    .setTitle(`伺服器 ${serverinfo.name} 關閉了`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
            })

            var chkusronline = setInterval(() => {
                chkusr = true;
                server.stdin.write("list\n");
            }, config.idleTimeout); //If Minecraft Server is idling, Bot will shutdown the server.
        }
        if (command === "stop") {
            var serverId = msgArray.shift();
            var serverinfo = config.minecraftServerFolders.find(e => e.id === serverId);
            if (serverinfo === undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle('錯誤 - 找不到伺服器')
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription('我們找不到您所希望的伺服器ID')
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            if (servers.find(e => e.id === serverId) === undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle('錯誤 - 伺服器已關閉')
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription('這台伺服器已關閉了')
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            var server = servers.find(e => e.id === serverId).server;
            server.stdin.write("stop\n");

            var embed = new Discord.MessageEmbed()
                .setColor('#ff3b3b')
                .setTitle(`伺服器 ${serverinfo.name} 關閉`)
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setDescription('已手動關閉伺服器')
                .setTimestamp()
                .setFooter(config.author, config.authorImg);
            message.channel.send(embed);
            return true;
        }
        if (command === "list") {
            var serversinfo = config.minecraftServerFolders;
            for (var serverinfo of serversinfo) {
                var serverdata = servers.find(e => e.id === serverinfo.id);
                serverdata === undefined ? serverdata = "尚未啟動" : serverdata = "已啟動";
                var embed = new Discord.MessageEmbed()
                    .setColor('#58b500')
                    .setTitle('Discord BOT for Minecraft Startup Servers List')
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(`這是伺服器 ${serverinfo.name} 的資訊`)
                    .addFields(
                        { name: '伺服器狀態', value: serverdata },
                        { name: '\u200B', value: '\u200B' },
                        { name: '伺服器名稱', value: serverinfo.name, inline: true },
                        { name: '伺服器ID', value: serverinfo.id, inline: true },
                        { name: "伺服器版本", value: serverinfo.version, inline: true },
                        { name: "伺服器ROOT資料夾", value: serverinfo.folder, inline: true },
                        { name: '伺服器檔案名稱', value: serverinfo.serverFileName, inline: true },
                    )
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
            }
        }
    })
}