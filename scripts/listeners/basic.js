'use strict'

const child_process = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Basic Built in Commands
 */
class basic {
    /**
     * Defines listeners and sets a global reference to this object
     */
    constructor() {

        this.listeners = [
            // h version
            {
                regex: /\bh\b\s*?\bversion\b\s*$/i,
                handler: this.handleVersion.bind(this)
            },
            // h system
            {
                regex: /\bh\b\s*?\bsystem\b\s*$/i,
                handler: this.handleSystem.bind(this)
            },
            // h help
            {
                regex: /\bh\b\s*?\bhelp\b\s*\b(.*)\b$/i,
                handler: this.handleHelp.bind(this)
            },
        ];

        global.basic = this;
    } // constructor


    /**
     * Goes up directories until it finds a package.json file and then returns the full path to the file.
     *
     * @param {string} dir
     */
    findPackage(dir) {
        if(!dir) {
            return false;
        }
        var filename = dir + '/package.json';
        if (fs.existsSync(filename)) {
            return filename;
        }
        return this.findPackage(path.dirname(dir));
    }

    /**
     * Gets the contents of the package.json file for this project as a JavaScript object
     * @return {object}
     */
    package() {
        var path = this.findPackage(__dirname);
        if(path) {
            return require(path);
        }
    }

    /**
     * Prints the current version from package.json to the chat
     * @param {Response} res
     */
    handleVersion (res) {
        res.send('`'+this.version()+'`');
    }


    /**
     * Gets the version from package.json
     * @return {string}
     */
    version() {
        return this.package().version;
    }

    /**
     * Attempts to identify the machine by running lsb_release -a and parsing the results then returns the info.
     * @return {object}
     */
    system () {
        return {
            platform: process.platform,
            lsb_release: function() {
                var output = child_process.execSync('lsb_release -a');

                var keys = {
                    'LSB Version': 'lsbVersion',
                    'Distributor ID': 'distributorID',
                    'Description': 'description',
                    'Release': 'release',
                    'Codename': 'codename'
                };

                var data = output.toString('utf8').split('\n');

                var result = {};

                for(var i in data) {
                    var l = data[i];

                    var pos = l.indexOf(':');
                    if (pos === -1) {
                        continue;
                    }
                    result[keys[l.substr(0, pos)]] = l.substr(pos + 2);
                }

                return result;
            },
            sw_vers: function() {
                var output = child_process.execSync('sw_vers');

                var keys = {
                    'ProductName': 'productName',
                    'ProductVersion': 'productVersion',
                    'BuildVersion': 'buildVersion'
                };

                var data = output.toString('utf8').split('\n');

                var result = {};

                for(var i in data) {
                    var l = data[i];

                    var pos = l.indexOf(':');
                    if (pos === -1) {
                        continue;
                    }
                    result[keys[l.substr(0, pos)]] = l.substr(pos + 2);
                }

                return result;
            }
        };
    } // system()

    /**
     * Handles the system command
     * @param {Response} res
     */
    handleSystem (res) {
        var platform = this.system().platform;

        if(platform == 'darwin') {
            var details = this.system().sw_vers();
            res.send(details.productName + ' ' + details.productVersion);
            return;
        }

        if(platform == 'linux') {
            var details = this.system().lsb_release();
            res.send(details.description);
            return;
        }

        if(platform == 'win32') {
            res.send('Windows');
            return;
        }
    }

    /**
     * Gets the Git helper class
     */
    git() {
        return require(global.henshin.applicationPath+'/src/git.js');
    }

    /**
     * Handles the help command
     * @param {Response} res
     */
    handleHelp(res) {
        var helptext = '';
        helptext += '*henshin v'+this.version()+' '+this.git().branch()+"*\n\n";
        helptext += 'usage: h <command>'+"\n\n";

        var scripts = {};

        if(!res.match[1]) {
            helptext += 'These are common henshin commands used in various situations:' + "\n\n";
            for(var i in henshin.scripts) {
                for(var x in henshin.scripts[i].listeners) {
                    if(typeof henshin.scripts[i].listeners[x].help == 'string') {
                        scripts[i] = true;
                        helptext += henshin.scripts[i].listeners[x].help + "\n";
                    }
                }
            }
        }

        var options = [];

        for(var s in scripts) {
            options.push({
                text: s[0].toUpperCase() + s.slice(1),
                value: s
            });
        }

        res.send({
            attachments: [{
                title: 'Henshin Help',
                fallback: 'Henshin Help',
                text: helptext,
                color: '#009966',
                mrkdwn_in: ['text'],
                callback_id: 'help',
            }],
            username: process.env.HUBOT_SLACK_BOTNAME,
            as_user: true
        });
    }
}

module.exports = new basic();
