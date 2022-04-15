import type { MessageReaction, User } from "discord.js";
import moment from "moment";
import type { BotClient } from "../BotClient";
import Event from "../event/Event";
import { formatUser } from "../utils/Utils";

export default class MessageReactionAdd extends Event {
    public constructor() {
        super("messageReactionAdd");
    }

    public async callback(client: BotClient, messageReaction: MessageReaction, user: User): Promise<void> {
        try {
            if (messageReaction.partial) {
                messageReaction = await messageReaction.fetch();
            }

            const message = messageReaction.message;
            const server = message.guild;
            if (!server || user.bot) {
                return;
            }

            const guild = await client.database.getGuild(server.id);
            if (!guild?.config.verification?.log || message.channel.id !== guild.config.verification.log) {
                return;
            }

            const verification = guild.verifications.find(verification => verification.message === message.id);
            if (!verification) {
                return;
            }


            const duration = moment(message.createdAt).fromNow(true);

            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
            switch (messageReaction.emoji.name) {
                case "✅": {
                    if (guild.config.roles?.unverified) {
                        const unverified = server.roles.cache.get(guild.config.roles.unverified);
                        if (unverified) {
                            const member = server.members.cache.get(verification.user);
                            if (member) {
                                await member.roles.remove(unverified);
                            }
                        }
                    }

                    if (guild.config.roles?.member) {
                        const memberRole = server.roles.cache.get(guild.config.roles.member);
                        if (memberRole) {
                            const member = server.members.cache.get(verification.user);
                            if (member) {
                                await member.roles.add(memberRole);
                                await message.edit(`✅ ${formatUser(member.user)} has been verified by ${user.tag} after ${duration}`);
                                await message.reactions.removeAll();
                                await client.database.guilds.updateOne({ id: guild.id }, { "$pull": { "verifications": verification } });
                            }
                        }
                    } else {
                        message.channel.send(`Couldn't find the member role, please add it via config with \`/config member set <role>\`.`)
                            .then((msg) => {
                                setTimeout(async () => msg.delete(), 10000);
                            });
                    }
                    break;
                }

                case "❗": {
                    if (guild.config.roles?.probation) {
                        const probation = server.roles.cache.get(guild.config.roles.probation);
                        if (probation) {
                            const member = server.members.cache.get(verification.user);
                            if (member) {
                                member.roles.add(probation);
                                message.edit(`❗ ${formatUser(member.user)} has been put on probation by ${user.tag} after ${duration}`);
                                message.reactions.removeAll();
                                client.database.guilds.updateOne({ id: guild.id }, { "$pull": { "verifications": verification } });
                            }
                        }
                    } else {
                        message.channel.send(`Couldn't find the probation role, please add it via config with /config probation set <role>\`.`)
                            .then((msg) => {
                                setTimeout(async () => msg.delete(), 10000);
                            });
                    }
                    break;
                }

                case "❌": {
                    const member = server.members.cache.get(verification.user);
                    if (member) {
                        if (member.kickable) {
                            const format = formatUser(member.user);
                            member.kick("Verification");
                            message.edit(`❌ ${format} has been kicked by ${user.tag} after ${duration}`);
                            message.reactions.removeAll();
                            client.database.guilds.updateOne({ id: guild.id }, { "$pull": { "verifications": verification } });
                        } else {
                            message.channel.send("Couldn't kick the user. Please make sure my role has the right permissions and is above the user's highest role.")
                                .then((msg) => {
                                    setTimeout(async () => msg.delete(), 10000);
                                });
                        }
                    }
                    break;
                }

                case "🔞": {
                    const member = server.members.cache.get(verification.user);
                    if (member) {
                        if (member.bannable) {
                            const format = formatUser(member.user);
                            member.ban({ reason: "Verification" });
                            message.edit(`🔞 ${format} has been banned by ${user.tag} after ${duration}`);
                            message.reactions.removeAll();
                            client.database.guilds.updateOne({ id: guild.id }, { "$pull": { "verifications": verification } });
                        } else {
                            message.channel.send("Couldn't ban the user. Please make sure my role has the right permissions and is above the user's highest role.")
                                .then((msg) => {
                                    setTimeout(async () => msg.delete(), 10000);
                                });
                        }
                    }
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}
