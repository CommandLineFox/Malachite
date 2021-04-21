import { string, base, array, object, boolean, optional, optionalArray, number } from "~/ConfigHandler";

export default {
    token: string(""),
    prefix: string("!"),
    owners: array(base.string),
    delay: number(0),
    options: object({
        disableMentions: optional(base.string),
        partials: optionalArray(base.string)
    }),
    db: object({
        name: string(""),
        url: string(""),
        mongoOptions: object({
            useUnifiedTopology: boolean(true)
        })
    })
};
