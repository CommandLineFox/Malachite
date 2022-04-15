import { Client, ClientOptions, Collection, Guild, GuildMember } from "discord.js";
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

    public async isMod(member: GuildMember, guild: Guild): Promise<boolean> {
        if (this.isAdmin(member)) {
            return true;
        }

        const guildModel = await this.database?.guilds.findOne({ id: guild.id });
        if (!guildModel) {
            return false;
        }

        const moderators = guildModel.config.roles?.moderator;
        if (!moderators || moderators.length === 0) {
            return false;
        }

        let mod = false;
        for (const id of moderators) {
            if (member.roles.cache.some(role => role.id === id)) {
                mod = true;
            }
        }

        return mod;
    }

    public isAdmin(member: GuildMember): boolean {
        return member.permissions.has("ADMINISTRATOR");
    }
}
