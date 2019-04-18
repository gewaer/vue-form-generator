import * as slug from "slugify";
import { toLower } from "lodash";

export function slugify(value) {
    return slug(value);
}

export function lowercase(value) {
    return toLower(value);
}
