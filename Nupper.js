const fs = require('fs');
const unzip = require('unzip');
const request = require('request');
const pjson = require('./package.json');
const vc = require('version_compare');
const child_process = require('child_process');

const _ = require('lodash');

const DEBGUG = false;

const DEFAULTS_NUPPER = {
    repoLocation: '',
    branch: '',
    jsonHost: 'raw.githubusercontent.com',
    contentHost: 'codeload.github.com',
    autoCheck: 5000,
    tempFileName: 'UpdateFile.zip',
    autoUpdate: false,
};

const EVENTS = {
    DOWNLOAD_COMPLETE: 'DOWNLOAD_COMPLETE',
    UP_TO_DATE: 'UP_TO_DATE',
    OUT_OF_DATE: 'OUT_OF_DATE',
    INSTALL_BEGIN: 'INSTALL_BEGIN',
    INSTALL_COMPLETE: 'INSTALL_COMPLETE',
    DOWNLOAD_BEGIN: 'DOWNLOAD_BEGIN'
};

class EventClass {
    constructor(ev) {
        this.es = {};

        Object.keys(ev).forEach((key) => {
            this.es[ev[key]] = [];
        });
    }
    triggerEvent(type, data) {
        this.es[type].forEach((cb) => {
            cb(data);
        });
    }
    on(type, cb) {
        this.es[type].push(cb);
        return () => {
            if (this.es[type].indexOf(cb) === -1) return;
            this.es[type].splice(this.es[type].indexOf(cb), 1);
        }
    }
}

class Nupper extends EventClass {
    constructor(settings) {
        super(EVENTS);
        this.settings = _.extend(DEFAULTS_NUPPER, settings);
        if (this.settings.autoCheck) {
            this.checkInterval = setInterval(() => {
                d('Checking remote...');
                this.checkUpdate();
            }, this.settings.autoCheck);
        }
        this.events = EVENTS;
    }

    async checkUpdate() {
        const url = 'https://' + this.settings.jsonHost + '/' + this.settings.repoLocation + '/' + this.settings.branch + "/package.json";
        get(url, (data => {
            const rv = data.version;
            const lv = pjson.version;
            const update = vc.compare(lv, rv);//-1: update, 0: you're good, 1: you're from the future
            if (update > 0) console.log('That\'s strange. You are ahead of the repo.');
            else if (update == 0) d('Up to date'); //up to date
            else if (update < 0) {
                d('Need to update');
                this.triggerEvent(EVENTS.OUT_OF_DATE, { local: lv, repo: rv });
                if (this.settings.autoUpdate) {
                    this.downloadUpdate();
                }
            }
        }));
    }

    downloadUpdate() {
        d('Downloading ZIP...');
        this.triggerEvent(EVENTS.DOWNLOAD_BEGIN);
        const url = 'https://' + this.settings.contentHost + '/' + this.settings.repoLocation + '/zip/' + this.settings.branch;

        const output = './' + this.settings.tempFileName;
        var out = fs.createWriteStream(output);
        request(url)
            .pipe(out)
            .on('close', () => {
                d('Temp file written to');
                this.triggerEvent(EVENTS.DOWNLOAD_COMPLETE);
                if (this.settings.autoUpdate) {
                    this.updateFromFile(true);
                }
            });
    }

    updateFromFile(deleteFile, tempFileName) {
        this.triggerEvent(EVENTS.INSTALL_BEGIN);
        const output = tempFileName || './' + this.settings.tempFileName;
        fs.stat(output, (err, stat) => {
            if (err) {
                console.log('[Nupper]: File does not exist.');
                return;
            }
            if (err == null) {
                var past1 = false;
                fs.createReadStream(output).pipe(unzip.Parse())
                    .on('entry', (entry) => {
                        if (past1) {
                            const name = /[^/]*$/.exec(entry.path)[0];
                            if (DEBGUG) {
                                d('Pretend I\'m writing the file');
                            }
                            else {
                                entry.pipe(fs.createWriteStream(name));
                            }
                        }
                        entry.autodrain();
                        past1 = true;
                    }).on('close', () => {
                        d('Finished pulling all the files.');
                        this.triggerEvent(EVENTS.INSTALL_COMPLETE);
                        child_process.execSync("npm install");//install those new packages
                        if (deleteFile) {
                            fs.unlink(output, () => {
                                d('Deleted temp file.');
                            });
                        }
                    });
            }
        });
    }
}

module.exports = Nupper;

function get(url, callback) {
    request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            console.log('Error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {
            callback(data);
        }
    })
}
function d(m) {
    if (DEBGUG) {
        console.log('[Nupper]: ' + m);
    }
}
function c(m) {
    console.log('[Nupper]: ' + m);
}
