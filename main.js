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
const fs = require("fs");
const dwnd = require("./api/download.js");
const { LangLoader } = require("./api/langLoader.js");

const lang = config.lang;

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
        if (config.rolesControl !== undefined) if (!message.member.roles.cache.array().some(r => config.rolesControl.indexOf(r.id) !== -1)) return false;
        var msgArray = message.content.split(" ");
        var perfix = msgArray.shift();
        var command = msgArray.shift();

        if (perfix !== config.botPrefix) return false;
        if (command === "help") {
            var embed = new Discord.MessageEmbed()
                .setColor('#58b500')
                .setTitle(LangLoader.getLang(lang, "helpPage", "title"))
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setDescription(LangLoader.getLang(lang, "helpPage", "description"))
                .addFields(
                    { name: config.botPrefix, value: LangLoader.getLang(lang, "helpPage", "prefixDesc") },
                    { name: '\u200B', value: '\u200B' },
                    { name: `${config.botPrefix} start (${LangLoader.getLang(lang, "common", "serverID")})`, value: LangLoader.getLang(lang, "helpPage", "commandDesc1"), inline: true },
                    { name: `${config.botPrefix} command (${LangLoader.getLang(lang, "common", "serverID")})`, value: LangLoader.getLang(lang, "helpPage", "commandDesc2"), inline: true },
                    { name: `${config.botPrefix} stop (${LangLoader.getLang(lang, "common", "serverID")})`, value: LangLoader.getLang(lang, "helpPage", "commandDesc3"), inline: true },
                    { name: `${config.botPrefix} list`, value: LangLoader.getLang(lang, "helpPage", "commandDesc4"), inline: true }
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
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "cannotFindServer")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "cannoFindServer"))
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            if (servers.find(e => e.id === serverId) !== undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "serverStarted")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "serverStarted"))
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
            var runArgs = serverinfo.runArgs || "";
            servers.push({ id: serverId, server: (exec(`${javaRuntime} -jar "${serverinfo.folder}/${serverinfo.serverFileName}" nogui ${runArgs}`, { cwd: serverinfo.folder })) });

            var embed = new Discord.MessageEmbed()
                .setColor("#79de31")
                .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "start"), { serverName: serverinfo.name }))
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
                    .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "output"), { serverName: serverinfo.name }))
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(output)
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                if (output.match(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\] \[Server thread\/INFO\]\w*: There are 0 of a max of [0-9]* players online:\w*/gm)) {
                    var embed = new Discord.MessageEmbed()
                        .setColor('#ff3b3b')
                        .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "idleShutdownTit"), { serverName: serverinfo.name }))
                        .setURL(config.authorSite)
                        .setAuthor(config.authorName, config.authorImg, config.authorSite)
                        .setDescription(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "idleShutdownDesc"), { idleTimeout: (config.idleTimeout / 1000 / 60) }))
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
                        .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "startCompleteTit"), { serverName: serverinfo.name }))
                        .setURL(config.authorSite)
                        .setAuthor(config.authorName, config.authorImg, config.authorSite)
                        .setDescription(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "startCompleteDesc"), { serverName: serverinfo.name }))
                        .setTimestamp()
                        .setFooter(config.author, config.authorImg);
                    message.channel.send(embed);
                }
                chkusr = false;
            });
            server.on("close", () => {
                //console.log(`If you cannot run the server, you can try "chmod 777 javas/*" on project's root folder in linux system.`);
                rmServer(serverId);
                var embed = new Discord.MessageEmbed()
                    .setColor("#79de31")
                    .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "close"), { serverName: serverinfo.name }))
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
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "cannotFindServer")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "cannoFindServer"))
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            if (servers.find(e => e.id === serverId) === undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "serverClosed")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "serverClosed"))
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            var server = servers.find(e => e.id === serverId).server;
            server.stdin.write("stop\n");

            var embed = new Discord.MessageEmbed()
                .setColor('#ff3b3b')
                .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "serverManualCloseTit"), { serverName: serverinfo.name }))
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setDescription(LangLoader.getLang(lang, "serverRun", "serverManualCloseDesc"))
                .setTimestamp()
                .setFooter(config.author, config.authorImg);
            message.channel.send(embed);
            return true;
        }
        if (command === "list") {
            var serversinfo = config.minecraftServerFolders;
            for (var serverinfo of serversinfo) {
                var serverdata = servers.find(e => e.id === serverinfo.id);
                serverdata === undefined ? serverdata = LangLoader.getLang(lang, "common", "notStart") : serverdata = LangLoader.getLang(lang, "common", "started");
                var embed = new Discord.MessageEmbed()
                    .setColor('#58b500')
                    .setTitle(LangLoader.getLang(lang, "serverList", "title"))
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.replace(LangLoader.getLang(lang, "serverList", "description"), { serverName: serverinfo.name }))
                    .addFields(
                        { name: LangLoader.getLang(lang, "serverList", "info1"), value: serverdata },
                        { name: '\u200B', value: '\u200B' },
                        { name: LangLoader.getLang(lang, "serverList", "info2"), value: serverinfo.name, inline: true },
                        { name: LangLoader.getLang(lang, "serverList", "info3"), value: serverinfo.id, inline: true },
                        { name: LangLoader.getLang(lang, "serverList", "info4"), value: serverinfo.version, inline: true },
                        { name: LangLoader.getLang(lang, "serverList", "info5"), value: serverinfo.folder, inline: true },
                        { name: LangLoader.getLang(lang, "serverList", "info6"), value: serverinfo.serverFileName, inline: true },
                    )
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
            }
        }
        if (command === "command") {
            var serverId = msgArray.shift();
            var runCommand = msgArray.join(" ");
            var serverinfo = config.minecraftServerFolders.find(e => e.id === serverId);
            if (serverinfo === undefined) {
                 var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "cannotFindServer")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "cannoFindServer"))
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            if (servers.find(e => e.id === serverId) === undefined) {
                var embed = new Discord.MessageEmbed()
                    .setColor('#ff3b3b')
                    .setTitle(`${LangLoader.getLang(lang, "common", "error")} - ${LangLoader.getLang(lang, "errorsTitle", "serverClosed")}`)
                    .setURL(config.authorSite)
                    .setAuthor(config.authorName, config.authorImg, config.authorSite)
                    .setDescription(LangLoader.getLang(lang, "errorsDesc", "serverClosed"))
                    .setTimestamp()
                    .setFooter(config.author, config.authorImg);
                message.channel.send(embed);
                return;
            }

            var server = servers.find(e => e.id === serverId).server;
            server.stdin.write(`${runCommand}\n`);

            var embed = new Discord.MessageEmbed()
                .setColor('#ff3b3b')
                .setTitle(LangLoader.replace(LangLoader.getLang(lang, "serverRun", "runCommand"), { serverName: serverinfo.name }))
                .setURL(config.authorSite)
                .setAuthor(config.authorName, config.authorImg, config.authorSite)
                .setDescription(`\`${runCommand}\``)
                .setTimestamp()
                .setFooter(config.author, config.authorImg);
            message.channel.send(embed);
            return true;
        }
    })
}
