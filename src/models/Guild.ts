import { ObjectId } from "bson";

export interface Roles {
    moderator?: string[];
    member?: string;
}

export interface Channels {
    duplicateLog?: string;
    duplicateSearch?: string;
    leaveChannel?: string;
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    channels?: Channels;
    duplicateDetection?: boolean;
    time?: number;
    leaveNotification?: boolean;
    leaveMessage?: string;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
}
