import { ObjectId } from "bson";

interface Roles {
    moderator?: string[];
    member?: string;
    unverified?: string;
}

interface Verification {
    enabled?: boolean;
    channel?: string;
    log?: string;
}

interface Welcome {
    notification?: boolean;
    channel?: string;
    message?: string;
}

interface LeaveLog {
    notification?: boolean;
    message?: string;
    channel?: string;
    emote?: string;
}

interface Duplicates {
    detection?: boolean;
    log?: string;
    search?: string;
    time?: number;
}

interface Config {
    prefix?: string;
    roles?: Roles;
    duplicates?: Duplicates;
    leaveLog?: LeaveLog;
    verification?: Verification;
    welcome?: Welcome;
}

export interface Guild {
    _id: ObjectId;
    id: string;
    config: Config;
}
