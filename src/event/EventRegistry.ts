import Event from "@event/Event";
import { readdirSync } from "fs";

class EventRegistry {
    public readonly events: readonly Event[];

    public constructor() {
        this.events = this.loadEvents();
    }

    private loadEvents(): Event[] {
        const events = [];
        const folder = readdirSync("./dist/events");
        for (const file of folder) {
            if (!file.endsWith(".js")) {
                continue;
            }

            let event;
            try {
                const path = `../events/${file}`;
                // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
                event = require(path).default;

            } catch (error) {
                console.log(error);
            }

            events.push(new event);
        }

        return events;
    }
}

export default new EventRegistry();
