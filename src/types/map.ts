// Generated by https://quicktype.io

import { Category } from "./category";
import { Marker } from "./marker";
import { User } from "./user";

export type privacyOptions = "public" | "unlisted" | "private";
export type usersCanCreateMarkersOptions = "yes" | "no" | "only_logged_in";

export interface Map {
    slug: string;
    title: string | null;
    description: string;
    privacy: privacyOptions;
    users_can_create_markers: usersCanCreateMarkersOptions;
    options: Options | null;
    uuid: string;
    created_at: Date;
    updated_at: Date;
    token?: string;
    categories?: Category[];
    markers?: Marker[];
    related?: Map[];
    markers_count?: number;
    active_markers_count?: number;
    public_contributors?: User[];
    is_linked_to_user?: boolean;
    user?: User | null;
    users_currently_connected?: number;
}

export interface Options {
    links: "required" | "optional" | "disabled" | null;
    default_expiration_time: number | null;
    limit_to_geographical_body_type: "land" | "water" | "no" | null;
}

export interface MapForm {
    token?: string | null;
    title?: string | null;
    slug?: string | null;
    description?: string | null;
    privacy?: privacyOptions | null;
    users_can_create_markers?: usersCanCreateMarkersOptions | null;
}
