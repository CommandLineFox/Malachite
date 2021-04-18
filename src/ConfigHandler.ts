import * as fs from "fs";

interface IFunctionBase {
    (value: any, key: string): boolean | string[];

    readonly theName: string,
}

export interface IFunction<T> {
    (value: any, key: string): boolean | string[];

    readonly trueName: string,
    readonly defaultValue: T;
}

export type IFunctionType<T> = T extends IFunction<infer U> ? U : never;

interface IFunctionTemplate {
    [key: string]: IFunction<any>
}

export type IFunctionResult<T> = { [key in keyof T]: IFunctionType<T[key]> };

function createBaseType(theName: string, check: (value: any, key: string) => boolean | string[]): IFunctionBase {
    function temp(value: any, key: string) {
        return check(value, key);
    }

    temp.theName = theName;
    return temp;
}

function createType<T>(trueName: string, defaultValue: T, check: (value: any, key: string) => boolean | string[]): IFunction<T> {
    function temp(value: any, key: string) {
        return check(value, key);
    }

    temp.trueName = trueName;
    temp.defaultValue = defaultValue;
    return temp;
}

function checkObject(object: { [key: string]: any }, template: IFunctionTemplate, name = "") {
    const errors = [];

    for (const key in template) {
        const check = template[key];

        const result = check(object[key], name + key);
        if (result instanceof Array) {
            errors.push(...result);
        } else if (!result) {
            if (object[key] === undefined) {
                errors.push(`${name}${key} does not exist and must have the type of ${template[key].trueName}`);
            } else {
                errors.push(`${name}${key} must be the type of ${template[key].trueName}`);
            }
        }
    }

    return errors;
}

export const base = {
    boolean: createBaseType("Boolean", (value: any) => typeof value === "boolean"),
    number: createBaseType("Number", (value: any) => typeof value === "number"),
    string: createBaseType("String", (value: any) => typeof value === "string"),
};

export function boolean(defaultValue: boolean): IFunction<boolean> {
    return createType(base.boolean.theName, defaultValue, base.boolean);
}

export function number(defaultValue: number): IFunction<number> {
    return createType(base.number.theName, defaultValue, base.number);
}

export function string(defaultValue: string): IFunction<string> {
    return createType(base.string.theName, defaultValue, base.string);
}

export function object<T extends IFunctionTemplate>(template: T): IFunction<IFunctionResult<T>> {
    const defaultValue: {
        [key: string]: any
    } = {};

    for (const key in template) {
        defaultValue[key] = template[key].defaultValue;
    }

    return createType("Object", defaultValue as IFunctionResult<T>, (value: any, key?: string) => {
        if (typeof value === "object") {
            const errors = checkObject(value, template, key ? key + "." : ".");
            if (errors.length === 0) {
                return true;
            } else {
                return errors;
            }
        } else {
            return false;
        }
    });
}

export function optional<T>(type: IFunctionBase, defaultValue?: T | null): IFunction<T | null | undefined> {
    return createType(type.theName + "?", defaultValue, (value: any, key: string) => value === undefined || value === null || type(value, key));
}

export function optionalObject<T extends IFunctionTemplate>(template: T, defaultValue = true): IFunction<T | null | undefined> {
    const templateObject = object(template);
    return createType(templateObject.trueName + "?", defaultValue ? templateObject.defaultValue as T | null | undefined : null, (value: any, key: string) => value === undefined || value === null || templateObject(value, key));
}

export function arrayWithOptional<T>(type: IFunctionBase, defaultValue: (T | null | undefined)[]): IFunction<(T | null | undefined)[]> {
    return createType(type.theName + "[]", defaultValue, (value: any, key: string) => value instanceof Array && value.every((it) => it === undefined || it === null || type(it, key) === true));
}

export function arrayWithOptionalObject<T extends IFunctionTemplate>(template: T, defaultValue = true): IFunction<(T | null | undefined)[]> {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] as (IFunctionResult<T> | null | undefined)[] : [], (value: any, key: string) => value instanceof Array && value.every((it) => it === undefined || it === null || templateObject(it, key) === true));
}

export function array<T>(type: IFunctionBase, defaultValue: T[] = []): IFunction<T[]> {
    return createType(type.theName + "[]", defaultValue, (value: any, key: string) => value instanceof Array && value.every((it) => type(it, key) === true));
}

export function optionalArray<T>(type: IFunctionBase, defaultValue: T[] | null | undefined = []): IFunction<T | null | undefined> {
    return createType(type.theName + "[]", defaultValue as T | null | undefined, (value: any, key: string) => value === undefined || value === null || value instanceof Array && value.every((it) => type(it, key) === true));
}

export function objectArray<T extends IFunctionTemplate>(template: T, defaultValue = true): IFunction<T[]> {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] : [], (value: any, key: string) => value instanceof Array && value.every((it) => templateObject(it, key) === true));
}

export function optionalObjectArray<T extends IFunctionTemplate>(template: T, defaultValue = true): IFunction<IFunctionResult<T>[] | null | undefined> {
    const templateObject = object(template);
    return createType(templateObject.trueName, defaultValue ? [templateObject.defaultValue] as IFunctionResult<T>[] | null | undefined : [], (value: any, key: string) => value === undefined || value === null || value instanceof Array && value.every((it) => templateObject(it, key) === true));
}

export function generateConfig(file: string, template: IFunctionTemplate): void {
    const config: {
        [key: string]: any
    } = {};

    for (const key in template) {
        config[key] = template[key].defaultValue;
    }

    fs.writeFileSync(file, JSON.stringify(config));
}

export function getConfig<T extends IFunctionTemplate>(file: string, template: T): IFunctionResult<T> | undefined {
    const config = JSON.parse(fs.readFileSync(file).toString());
    const errors = checkObject(config, template);

    if (errors.length === 0) {
        return config as IFunctionResult<T>;
    } else {
        errors.forEach((error) => console.error(error));
        return undefined;
    }
}
