import { BotClient } from "./BotClient";
import { getConfig } from "./Config";
import { Database } from "./Database";

async function main(): Promise<void> {
    const config = getConfig("config.json");
    if (!config) {
        return;
    }

    const database = new Database(config.database);
    await database.connect();

    const client = new BotClient(config, database, config.options);
    client.login(config.token);
}

main();
