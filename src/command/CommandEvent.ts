import { Message, MessageOptions, TextChannel, User, Guild, GuildMember, MessageEmbed, TextBasedChannels } from "discord.js";
import BotClient from "~/BotClient";

export default class CommandEvent {
    public readonly message: Message;
    public readonly client: BotClient;
    public readonly author: User;
    public readonly argument: string;
    public readonly channel: TextBasedChannels;
    public readonly isFromGuild: boolean;
    public readonly textChannel: TextChannel | undefined;
    public readonly guild: Guild;
    public readonly member: GuildMember;

    public constructor(message: Message, client: BotClient, argument: string) {
        this.message = message;
        this.client = client;
        this.author = message.author;
        this.argument = argument;
        this.channel = message.channel;
        this.isFromGuild = this.channel.type !== "DM";
        this.textChannel = this.channel instanceof TextChannel ? this.channel : undefined;
        this.guild = message.guild!;
        this.member = message.member!;
    }

    public async send(content: string | MessageEmbed, options?: MessageOptions, autoDelete?: boolean): Promise<Message> {
        const isEmbed = typeof content === "object";
        const opts = {
            ...options,
            embeds: isEmbed ? [content as MessageEmbed] : undefined,
            content: isEmbed ? undefined : content as string
        };

        const message = await this.channel.send(opts);
        if (autoDelete) {
            setTimeout(async () => void await message.delete(), 10000);
        }
        return message;
    }

    public async reply(content: string | MessageEmbed, options?: MessageOptions, autoDelete?: boolean): Promise<Message> {
        const isEmbed = typeof content === "object";
        const opts = {
            ...options,
            embeds: isEmbed ? [content as MessageEmbed] : undefined,
            content: isEmbed ? undefined : content as string
        };

        const message = await this.message.reply(opts);
        if (autoDelete) {
            setTimeout(async () => void await message.delete(), 10000);
        }
        return message;
    }
}
