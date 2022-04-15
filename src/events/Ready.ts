import type { BotClient } from "../BotClient";
import Event from "../event/Event";

export default class Ready extends Event {
    public constructor() {
        super("ready");
    }

    public async callback(client: BotClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);

        const database = client.database;
        client.interval = setInterval(async () => {
            const guilds = client.guilds.cache.toJSON();
            for (const server of guilds) {
                const guild = await database.getGuild(server.id);
                if (!guild?.config.duplicates?.time) {
                    continue;
                }

                database.messages.deleteMany({ guild: guild.id, creation: { "$lt": Date.now() - guild.config.duplicates.time } });
            }
        }, 30000);
    }
}
