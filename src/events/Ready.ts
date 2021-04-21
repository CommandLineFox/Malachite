import Event from "@event/Event";
import BotClient from "~/BotClient";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: BotClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);

        const database = client.database;
        client.interval = setInterval(async () => {
            database.messages.deleteMany({ creation: {"$lt": Date.now() - client.config.delay}});
        }, 30000);
    }
}
