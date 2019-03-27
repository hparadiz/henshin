'use strict'

const fs = require('fs');
const path = require('path');
const {RtmClient, WebClient} = require('@slack/client');

/**
 * A Slack Bot
 */
class henshin {
    constructor() {
        /**
         * @var string Application Root Path
         */
        this.applicationPath = this.findApplicationPath(__dirname);
        this.config = require(this.applicationPath+'/config/base.js');
        this.scripts = [];
        this.listeners = [];

        process.on('SIGTERM', this.handleShutdown);
        process.on('SIGINT', this.handleShutdown);

        this.SlackWebClient = new WebClient(process.env.HENSHIN_SLACK_OAUTH_ACCESS_TOKEN);

        global.henshin = this;
    }

    /**
     * Itterates over values of this.config.scipts and runs this.loadDir on them
     * @returns {Promise}
     */
    async bootstrap() {
        var ctx = this;
        return new Promise(async (resolve,reject) => {
            for (var i=0; i<ctx.config.scripts.length; i++) {
                var path = __dirname + '/' + this.config.scripts[i];
                await ctx.loadDir.call(this,path);
                if(i+1 == ctx.config.scripts.length) {
                    resolve();
                }
            }
        });
    }

    /**
     * Attempts to require all js files in the directory passed into the function
     *
     * @param {string} dir
     *
     * @returns {Promise}
     */
    async loadDir(dir) {
        var ctx = this;
        return new Promise((resolve,reject) => {
            if(fs.existsSync(dir)) {
                fs.readdir(dir, function(err, items) {
                    for (var i=0; i<items.length; i++) {
                        if(items[i].endsWith('.js')) {
                            var instance = require(dir + '/' + items[i]);
                            var script = path.basename(dir + '/' + items[i],'.js');
                            ctx.scripts[script] = instance;
                            if(instance.listeners) {
                                ctx.listeners = ctx.listeners.concat(instance.listeners);
                            }
                        }
                        if(i+1 == items.length) {
                            resolve();
                        }
                    }
                });
            }
            else {
                console.log('Attempted to load '+dir+' but it is missing.');
                resolve();
            }
        });
    }

    /**
     * Binds all listeners defined in all the classes
     *
     * @param {henshin} robot
     */
    static async loader(robot) {
        var ctx = this;
        await ctx.bootstrap().catch(this.handleErrors);
        for(var i in ctx.listeners) {
            robot.hear(ctx.listeners[i].regex,ctx.listeners[i].handler);
        }
        this.robot = robot;
    }

    /**
     * Prints errors to console log
     * @param {string} error
     */
    static async handleErrors(error) {
        console.log('Error: ' + error);
    }

    /**
     * Shuts down the bot
     * @param {event} e
     */
    async handleShutdown(e) {
        console.log('Shutting down.');
        process.exit();
    }

    /**
     * Figures out the root of the application by looking for package.json
     */
    findApplicationPath(dir) {
        if(!dir) {
            return false;
        }
        var filename = dir + '/package.json';
        if (fs.existsSync(filename)) {
            return dir;
        }
        return this.findApplicationPath(path.dirname(dir));
    }
}

module.exports = henshin.loader.bind(new henshin());
