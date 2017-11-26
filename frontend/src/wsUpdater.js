// reconnecting websocket

const RECONNECT_TIMEOUT = 1000;

// singleton
let instance = null;

export default class wsUpdater {

    constructor(url) {
        if (instance) return instance;
        instance = this;
        if (!url) throw "url wan't defined at WsUpdatesListener constructor";
        this.ws = new WebSocket(url);
        this.buffer = [];
        this.ws.onopen = () => {
            this.buffer.forEach(msg => {
                this.send(msg);
            })
        };
        this.ws.onclose = () => setTimeout(() => {
            this.ws = new WebSocket(url);
        }, RECONNECT_TIMEOUT);
    }

    send(msg) {
        // alert(this.ws.readyState);
        if (this.ws.readyState === 1) {
            // alert(msg + 'send')
            this.ws.send(msg)
        }
        else if (this.ws.readyState === 0) {
            // alert(msg + 'buffer');
            this.buffer.push(msg)
        }
    }

    get onmessage() {
        return this.ws.onmessage;
    }

    set onmessage(v) {
        this.ws.onmessage = v;
    }

}
