# Discord BOT Open Minecraft Server

A Discord BOT can open your Minecraft Servers.

## The Video

[It's on YouTube](https://www.youtube.com/watch?v=VAqaoz0ctFw)

## How to use

0. Use npm to install all models (`npm install`).
1. Typing your Discord BOT Authorization Token into the file "`config.json`"'s discordToken
2. Typing your Minecraft Servers' Information into "minecraftServerFolders" Like: 
```json
{
  "name": "Name of Server",
  "id": "this-is-id",
  "version": "Version of Server",
  "javaVersion": "16 //Optional, can be number or string",
  "folder": "/path/to/your/server/folder",
  "serverFileName": "server.jar"
}
```
Here is the example:
![Example1](https://cdn.discordapp.com/attachments/655638858784047105/857038433846296596/unknown.png)

3. Download the Java Runtime (`https://www.mediafire.com/file/l3ebjfbk9c6won5/javas.zip/file`) and unzip to the root folder.
4. Run the BOT (`node main.js`).

# Issue

 - All Minecraft version under MC 1.17 are run well in Java 8, but Minecraft 1.17 (I think they will make all version above MC 1.17 run in latest Java version) CANNOT run (even Java 14/15, so you need to change your Java version when you are running between the latest Minecraft and all versions under MC 1.17).
 - All Minecraft versions can run well in latest Java version, but Forge (idk Bukkit, Paper, Fabric) cannot.
 - If you are running in Linux System, you may change the mod value of the Java Runtime file.

## Enjoy

 - This bot can run well in Windows, Ubuntu/Linux (I tested).