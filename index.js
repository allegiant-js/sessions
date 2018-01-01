const path = require('path');
const common = require('@allegiant/common');
const Storage = require('@allegiant/jsonstore');
const JSONStore = Storage.JSONStore;
const Storable = Storage.Storable;
const expect = common.expect;

class Session extends Storable {
    constructor(store, name, secure, updateExpiry, autoStart, conn) {
        super(store, false);

        // these three properties are set on construction only
        this._secure = secure;
        this._updateExpiry = updateExpiry;
        this._conn = conn;
        this.name = name;

        if (autoStart)
            this.start();
    }

    static hasExpired(data) {
        var now = new Date(),
            expired = new Date(data.expires);

        return (expired.getTime() - now.getTime() <= 0);
    }

    static isValid(data) {
        return !(!super.isValid(data) ||
            (typeof data['expires'] == 'undefined' || data['expires'] === null) || 
            (typeof data['secure'] == 'undefined' || data['secure'] === null) ||
            (typeof data['data'] == 'undefined' || data['data'] === null) ||
            this.hasExpired(data) // this will force invalidation if the session has expired
            );
    }

    getData() {
        var list=[];
        for (var i in this.data) {
            if (!this.data.hasOwnProperty(i)) continue;
            list.push({ key: i, val: this.data[i] });
        }

        return this.data;
    }

    reset(id=false, update=false, data={}, expiry=false) {
        super.reset(id, update, data);
        this._expiry = expiry;
    }

    async start() {
        if (this.store === false)
            throw new Error("Session store not defined");

        var regen = true;
        var id = this._conn.cookies.get(this.name); 

        if (id !== null) {
            var data = this.store.get(id);
            if (typeof data !== 'object') {
                console.log("Invalid session: ", id, ": Not an object"); // eslint-disable-line
            } else if (data.secure != this._secure) {
                console.log("Invalid session: ", id, ": Security doesn't match"); // eslint-disable-line
            } else {
                regen = false;
                this.reset(id, this._updateExpiry, data.data, 
                           this._updateExpiry ? common.getFutureMs(common.MSONEHOUR) : data.expires);
            }
        }

        if (regen) {
            // defaulting to one hour to check pruning
            this.reset(super._genUniqueId(), true, {}, common.getFutureMs(common.MSONEHOUR));

            this._conn.cookies.set(this.name, {
                value: this._id,
                path: '/',
                expires: this._expiry.toUTCString(),
                httpOnly: true,
                secure: this._secure
            });
        }

        if (this.needsUpdate)
            await this.save();
    }

    async save() {
        return super.save({
            expires: this._expiry,
            secure: this._secure,
            data: this.data,
        });
    }

    async invalidate() {
        if (!await super.destroy())
            return;

        this._conn.cookies.expire(this.name, { httpOnly: true, secure: this._secure });

        this._expiry = null;
        this._secure = null;
        this._conn = null;
        this.name = null;
    }
    
    async regen() {
        await this.invalidate();
        await this.start();
    }
}

Session.Configure = function(app, options={}) {
    var config = {};
    config.required = { '@allegiant/cookies': true };

    config.enabled = expect(options.enabled, true);
    config.path    = expect(options.path, path.resolve(path.join(process.cwd(), 'sessions'))),
    config.secure  = app.secure && expect(options.secure, false);
    config.store   = expect(options.store, config.enabled) ? new JSONStore(Session, config.path, true) : false;
    config.updateExpiry = expect(options.updateExpiry, true);
    config.autoStart = expect(options.autoStart, false);
    config.name    = expect(options.name, 'id');

    if (config.enabled) {
        config.Session = Session.bind(null, config.store, config.name, config.secure, config.updateExpiry, config.autoStart);

        config.bind = function(app) {
            app.on('serve', async function(conn) {
                conn.session = config.store ? new config.Session(conn) : false;
            }, 'dynamic')
            .on('end', async function(conn) {
                if (conn.session && config.store)
                    conn.session.save();
            }.bind(this));
        };
    }

    return config;
};

exports = module.exports = Session;
