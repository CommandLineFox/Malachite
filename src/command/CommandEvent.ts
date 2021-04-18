import { Message, StringResolvable, MessageOptions, TextChannel, DMChannel, User, Guild, GuildMember, NewsChannel, MessageEmbed } from "discord.js";
import BotClient from "~/BotClient";

export default class CommandEvent {
    public readonly message: Message;
    public readonly client: BotClient;
    public readonly author: User;
    public readonly argument: string;
    public readonly channel: TextChannel | DMChannel | NewsChannel;
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
        this.isFromGuild = this.channel.type === "text";
        this.textChannel = this.channel instanceof TextChannel ? this.channel : undefined;
        this.guild = message.guild!;
        this.member = message.member!;
    }

    public async send(content: StringResolvable, options?: MessageOptions | MessageEmbed): Promise<Message | Message[]> {
        return options ? this.channel.send(content, options) : this.channel.send(content);
    }

    public async reply(content: StringResolvable, options?: MessageOptions): Promise<Message | Message[]> {
        return options ? this.message.reply(content, options) : this.message.reply(content);
    }
}
