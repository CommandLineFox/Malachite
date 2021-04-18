import BotClient from "~/BotClient";
import CommandRegistry from "@command/CommandRegistry";
import { Message } from "discord.js";
import CommandEvent from "@command/CommandEvent";

export default class CommandHandler {
    private readonly client: BotClient;
    private readonly mentions: string[];

    public constructor(client: BotClient) {
        this.client = client;
        this.mentions = [`<@${this.client.user!.id}>`, `<@!${this.client.user!.id}>`];
        client.on("message", async (message) => {
            if (!message.author.bot) {
                await this.handleMessage(message);
            }
        });
    }

    private async handleMessage(message: Message) {
        const content = message.content;
        const prefix = await this.client.getPrefix(message.guild!);

        if (content.startsWith(prefix)) {
            await this.handlePrefix(message, content.slice(prefix.length).trim());
        } else if (content.startsWith(this.mentions[0])) {
            await this.handleMention(message, content.slice(this.mentions![0].length).trim());
        } else if (content.startsWith(this.mentions[1])) {
            await this.handleMention(message, content.slice(this.mentions![1].length).trim());
        }
    }

    private async handlePrefix(message: Message, content: string) {
        if (content.length === 0) {
            return;
        }

        const [trigger, args = ""] = content.split(/\s+([\s\S]+)/);
        const command = CommandRegistry.getCommand(trigger);

        if (command === undefined) {
            return;
        }

        try {
            await command.execute(new CommandEvent(message, this.client, args));
        } catch (error) {
            this.client.emit("error", error);
        }
    }

    private async handleMention(message: Message, content: string) {
        if (content.length === 0) {
            message.reply(`My prefix here is \`${await this.client.getPrefix(message.guild!)}\``);
            return;
        }

        this.handlePrefix(message, content);
    }
}
