import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../BotClient";

export default abstract class Subcommand {
    public readonly data: SlashCommandSubcommandBuilder;

    protected constructor(name: string, description: string) {
        this.data = new SlashCommandSubcommandBuilder()
            .setName(name)
            .setDescription(description);
    }

    public abstract execute(interaction: CommandInteraction, client?: BotClient): void;
}
