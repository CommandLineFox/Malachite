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
            const guilds = client.guilds.cache.array();
            for (const server of guilds) {
                const guild = await database.getGuild(server.id);
                if (!guild?.config.time) {
                    continue;
                }

                database.messages.deleteMany({ guild: guild.id, creation: { "$lt": Date.now() - guild.config.time } });
            }
        }, 30000);
    }
}
