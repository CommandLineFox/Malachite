import Command from "../../command/Command";
import type { CommandInteraction } from "discord.js";

export default class Ping extends Command {
    public constructor() {
        super("ping", "Check's the bot's responsiveness", undefined, undefined);
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("Pong!");
    }
}
