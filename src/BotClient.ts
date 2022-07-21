import { Client, ClientOptions, Collection } from "discord.js";
import type Command from "./command/Command";
import CommandHandler from "./command/CommandHandler";
import type { Config } from "./Config";
import type { Database } from "./Database";
import EventHandler from "./event/EventHandler";

export class BotClient extends Client {
    public readonly config: Config;
    public readonly database: Database;
    public readonly commands: Collection<string, Command>;
    public interval?: NodeJS.Timeout;

    public constructor(config: Config, database: Database, options: ClientOptions) {
        super(options);
        this.config = config;
        this.database = database;
        this.commands = new Collection();

        new EventHandler(this);
        this.once("ready", () => {
            new CommandHandler(this);
        })
    }
}
