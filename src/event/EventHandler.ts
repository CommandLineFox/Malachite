import { readdirSync } from "fs";
import type { BotClient } from "../BotClient";
import type Event from "./Event";

export default class EventHandler {
    readonly client: BotClient;
    public readonly events: Event[];

    public constructor(client: BotClient) {
        this.client = client;
        this.events = getEvents();

        for (const event of this.events) {
            client.on(event.name, (...args) => {
                event.callback(client, ...args);
            });
        }
    }
}

function getEvents(): Event[] {
    const events = [];
    const folder = readdirSync("./dist/events");
    for (const file of folder) {
        if (!file.endsWith(".js")) {
            continue;
        }

        let event;
        try {
            const path = `../events/${file}`;
            event = require(path).default;

        } catch (error) {
            console.log(error);
        }

        events.push(new event);
    }

    return events;
}
