import { string, base, array, object, boolean, optional, optionalArray } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    options: object({
        disableMentions: optional(base.string),
        partials: optionalArray(base.string),
        intents: optionalArray(base.string)
    }),
    db: object({
        name: string(""),
        url: string(""),
        mongoOptions: object({
            useUnifiedTopology: boolean(true)
        })
    })
};
