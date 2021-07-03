class LangLoader {

    /*
     * This LangLoader Models is from my another project: Ptorex Chat
     * https://ptxc.ml/
     */

    getLang(langType, langParkName, langName) {
        var e = require(`../locals/en-US.json`);
        const lp = langParkName;

        function g(i, langParkName) {
            if (i.split(".")[0] !== i) {
                var langParkName = i.split(".")[0];
                var i = i.split(".")[1];
            }

            try {
                var langFile = require(`../locals/${langType}.json`);
                if (langFile.langData[langParkName][i] == undefined)throw Error(1);
            } catch (err) {
                var langFile = e;
            }
            
            try {
                return langFile.langData[langParkName][i];
            } catch (e) {
                return undefined;
            }
        }
        return g(langName, langParkName);
    }
    replace(content, replaceText) {
        var replaced = "";
        return content.split(/(\%\w+?\%)/g).map(function(v) {
            replaced = v.replace(/\%/g,"");
            return replaceText[replaced] || replaced; 
        }).join("");
    }
}

exports.LangLoader = new LangLoader();