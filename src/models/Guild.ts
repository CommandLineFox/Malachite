interface Roles {
    moderator?: string[];
    member?: string;
    unverified?: string;
    probation?: string;
    verified?: string;
    nsfw?: string;
}

interface Verifications {
    user: string;
    message: string;
}

interface Verification {
    enabled?: boolean;
    channel?: string;
    log?: string;
    password?: string;
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
    maxImageCount?: number;
    imageLimit?: boolean;
}

interface Config {
    prefix?: string;
    roles?: Roles;
    autoRemoveNsfw?: boolean;
    autoAddUnverified?: boolean;
    duplicates?: Duplicates;
    leaveLog?: LeaveLog;
    verification?: Verification;
    welcome?: Welcome;
}

export interface Guild {
    id: string;
    verifications: Verifications[];
    config: Config;
}
