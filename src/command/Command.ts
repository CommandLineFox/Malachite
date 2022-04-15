import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, PermissionResolvable } from "discord.js";
import type { BotClient } from "../BotClient";
import type Subcommand from "./Subcommand";

export default abstract class Command {
    public readonly data: SlashCommandBuilder;
    public readonly subcommands: Collection<string, Subcommand>;
    public readonly botPermissions: PermissionResolvable[];
    public readonly userPermissions: PermissionResolvable[];

    protected constructor(name: string, description: string, botPermissions?: PermissionResolvable[], userPermissions?: PermissionResolvable[]) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)

        this.subcommands = new Collection();
        this.botPermissions = botPermissions ?? [];
        this.userPermissions = userPermissions ?? [];
    }

    public abstract execute(interaction: CommandInteraction, client?: BotClient): void;
}
