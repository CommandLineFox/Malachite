import type { BotClient } from "../BotClient";
import Event from "../event/Event";

export default class Disconnect extends Event {
    public constructor() {
        super("disconnect");
    }

    public callback(client: BotClient): void {
        if (client.interval) {
            client.interval.unref();
        }
    }
}
