import BotClient from "~/BotClient";
import EventRegistry from "./EventRegistry";

export default class EventHandler {
    public readonly client: BotClient;

    public constructor(client: BotClient) {
        this.client = client;

        for (const event of EventRegistry.events) {
            client.on(event.name, (...args) => {
                event.callback(client, ...args);
            });
        }
    }
}
