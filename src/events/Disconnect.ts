import Event from "@event/Event";
import BotClient from "~/BotClient";

export default class Disconnect extends Event {
    public constructor() {
        super({ name: "disconnect" });
    }

    public callback(client: BotClient): void {
        if (client.interval) {
            client.interval.unref();
        }
    }
}
