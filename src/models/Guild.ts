import { ObjectId } from "bson";

export interface Roles {
    moderator?: string[];
}

export interface Channels {
    duplicateLog?: string;
    duplicateSearch?: string;
}

export interface GuildConfig {
    prefix?: string;
    roles?: Roles;
    channels?: Channels;
    duplicateDetection?: boolean;
    time?: number;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: GuildConfig;
}
