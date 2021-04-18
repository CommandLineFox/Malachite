import Group from "@command/Group";

export const Basic = new Group({ name: "Basic", description: "" });
export const Mail = new Group({ name: "Mail", description: "", guildOnly: true, ownerOnly: true });
export const Moderation = new Group({ name: "Moderation", description: "", guildOnly: true, modOnly: true });
export const Administration = new Group({ name: "Administration", description: "", guildOnly: true, adminOnly: true });
export const OwnerOnly = new Group({ name: "Owner Only", description: "", ownerOnly: true });
