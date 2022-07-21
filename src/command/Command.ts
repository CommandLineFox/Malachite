import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";
import type { BotClient } from "../BotClient";
import type Subcommand from "./Subcommand";

export default abstract class Command {
    public readonly data: SlashCommandBuilder;
    public readonly subcommands: Collection<string, Subcommand>;
    public readonly botPermissions?: bigint;
    public readonly userPermissions?: bigint;

    protected constructor(name: string, description: string, botPermissions?: bigint, userPermissions?: bigint) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)

        this.subcommands = new Collection();
        this.botPermissions = botPermissions;
        this.userPermissions = userPermissions;
    }

    public abstract execute(interaction: CommandInteraction, client?: BotClient): void;
}
