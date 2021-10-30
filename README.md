# BotMC

A Discord BOT can open your Minecraft Servers.

## The Video

<https://www.youtube.com/watch?v=VAqaoz0ctFw>

## Feature

 - [x] You can use your Discord to open Minecraft Server.
 - [x] Your friends also can open your Minecraft Server (Require in the same Discord Guild with the bot).
 - [x] You can run commands in Discord.
 - [x] Auto shutdown when the server have nobody.
 - [ ] Easy to Use.
 - [x] Easy to connect to your Minecraft Server.
 - [ ] Easy to modify your Minecraft Server.
 - [x] Easy to run server as your own parameters.
 - [x] Allow some roles (Discord) to open your Minecraft Server.
 - [x] Support multi-language (Support: en-US, zh-TW; You need to change in `config.json`).

## How to use

***Node JS 12 or above is required***

Download the Releases Here: <https://github.com/000hen/BotMC/releases/latest>

0. Use npm to install all models (`npm install`).
1. Typing your Discord BOT Authorization Token into the file "`config.json`"'s discordToken
2. Typing your Minecraft Servers' Information into "minecraftServerFolders" Like: 
```json
{
  "name": "Name of Server",
  "id": "this.is.id",
  "version": "Version of Server",
  "javaVersion": "16 // Optional, can be number or string, should be 16 or 8",
  "folder": "/path/to/your/server/folder",
  "serverFileName": "server.jar",
  "runArgs": "--Server --Run --Args --Here // Optional"
}
```
Here is the example:
![Example1](https://cdn.discordapp.com/attachments/655638858784047105/857038433846296596/unknown.png)

3. ~~Download the Java Runtime (`https://dl.botmc.cf/javas.zip`) and unzip to the root folder.~~ (It will auto download when you run it.)
4. Run the BOT (`node main.js`).

Here is the Running screenshot:
![Example2](https://cdn.discordapp.com/attachments/655638858784047105/860378183601881088/unknown.png)

Run commands in Discord:
![Example3](https://cdn.discordapp.com/attachments/698551378745884835/903946084756373525/unknown.png)

# Issue

 - All Minecraft version under MC 1.17 are run well in Java 8, but Minecraft 1.17 (I think they will make all version above MC 1.17 run in latest Java version) CANNOT run (even Java 14/15, ~~so you need to change your Java version when you are running between the latest Minecraft and all versions under MC 1.17~~ I make the bot can change Java Runtime, but you need to change your `javaVersion` in config.json's minecraftServerFolders).
 - `javaVersion` only have two versions: JDK 16, JDK 8
 - All Minecraft versions can run well in latest Java version, but Forge (idk Bukkit, Paper, Fabric) cannot.
 - If you are running in Linux System, you may change the permission value of the Java Runtime file.

## Enjoy

 - This bot can run well in Windows, Ubuntu/Linux (I tested).
