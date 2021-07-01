class downloadData {
    setup() {
        if (typeof(this.https) === "undefined") this.https = require("https");
        if (typeof(this.fs) === "undefined") this.fs = require("fs");
        if (typeof(this.unzip) === "undefined") this.unzip = require("unzipper");
        if (typeof(this.progress) === "undefined") this.progress = require("cli-progress");
        if (typeof(this.path) === "undefined") this.path = require("path");
    }
    download() {
        return new Promise((rs, rj) => {
            this.setup();
            const fs = this.fs;
            if (fs.existsSync("javas")) {
                rs(true);
            } else {
                const https = this.https;
                const unzip = this.unzip;
                const progress = this.progress;
                const path = this.path;
                var cntlength = 0;
                if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");
                console.log("Start downloading Java Runtime. Wait a monent.");

                var bar = new progress.SingleBar({}, progress.Presets.legacy);

                var file = fs.createWriteStream("tmp/javas.zip");
                var request = https.get("https://dl.botmc.cf/javas.zip", respond => {
                    var ttdl = 0;
                    cntlength = Number(respond.headers["content-length"]);
                    bar.start(cntlength, 0);
                    respond.on("data", data => {
                        ttdl += data.length;
                        bar.update(ttdl);
                    })
                    respond.pipe(file);
                });
            
                request.on("close", () => {
                    bar.stop();
                    file.close();
                    console.log("Java Runtime download successful, now starting unzip!");
                    var fileread = fs.createReadStream("tmp/javas.zip").pipe(unzip.Extract({ path: path.join(__dirname, "../") }));
                    fileread.on("close", () => {
                        console.log("Unzip successful!");
                        fs.rmSync("tmp/javas.zip");
                        rs(true);
                    })
                })
            }
        })
    }
}

module.exports.downloadData = new downloadData();