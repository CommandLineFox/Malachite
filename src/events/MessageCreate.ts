import Event from "@event/Event";
import { Message, TextChannel } from "discord.js";
import BotClient from "~/BotClient";
import { verification } from "@utils/Utils";

export default class MessageCreate extends Event {
    public constructor() {
        super({ name: "messageCreate" });
    }

    public async callback(client: BotClient, message: Message): Promise<void> {
        try {
            if (message.partial || message.author.bot || !message.guild) {
                return;
            }

            const guild = await client.database?.getGuild(message.guild.id);
            if (guild?.config.verification?.enabled && guild.config.verification.password && guild.config.verification.channel && message.channel.id === guild.config.verification.channel && guild.config.verification.log) {
                verification(message, client);
            }

            if (!guild?.config.duplicates?.detection || !guild.config.duplicates.search) {
                return;
            }

            const channel = message.guild.channels.cache.get(guild.config.duplicates.search);
            if (!channel) {
                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateSearch": "" } });
            }

            if (message.channel !== channel) {
                return;
            }

            const staff = await client.isMod(message.member!, message.guild);
            if (!staff && guild.config.duplicates.filter?.enabled) {
                if (guild.config.duplicates.filter.words.length > 0) {
                    const content = message.content.normalize().toLowerCase();
                    let text = "";

                    for (let i = 0; i < message.content.length; i++) {
                        if (content[i] >= "a" && content[i] <= "z") {
                            text += content[i];
                        }
                    }

                    for (const word of guild.config.duplicates.filter.words) {
                        if (text.includes(word)) {
                            setTimeout(async () => {
                                await message.delete()
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            }, 100);

                            message.channel.send(`<@${message.author.id}> please do not mention ${word} in your RP requests.`)
                                .then((msg) => {
                                    setTimeout(() => {
                                        msg.delete();
                                    }, 10000);
                                });
                            return;
                        }
                    }
                }
            }

            const delay = guild.config.duplicates.time;
            if (!delay) {
                return;
            }

            const fetch = (await (channel as TextChannel).messages.fetch({ limit: 100 })).toJSON();
            const messages = fetch.filter(msg => msg.createdTimestamp > Date.now() - delay && msg.channel === message.channel && msg.author === message.author && msg.content === message.content && msg != message)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            if (messages.length > 0) {
                message.delete();

                const time = Math.round(messages[messages.length - 1].createdTimestamp / 1000);
                const difference = `<t:${time! + delay / 1000}:R>`;
                message.channel.send(`<@${message.author.id}> you can repost your message ${difference}.`)
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
                return;
            }

            const logs = (await client.database.messages.find({ guild: guild.id, user: message.author.id, content: message.content, creation: { "$gt": Date.now() - delay } }).toArray()).sort((a, b) => a.creation - b.creation);
            if (logs.length > 0) {
                message.delete();

                const time = Math.round(logs[logs.length - 1].creation / 1000);
                const difference = `<t:${time! + delay / 1000}:R>`;
                message.channel.send(`<@${message.author.id}> you can repost your message ${difference}.`)
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
                return;
            }
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}
