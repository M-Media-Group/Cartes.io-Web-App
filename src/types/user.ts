import { Map } from "./map";

export interface User {
    id?: number;
    username: string;
    name: string | null;
    surname: string | null;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
    seen_at: Date;
    created_at: Date;
    updated_at: Date;
    description: string | null;
    is_public: boolean;
    personal_access_tokens?: PersonalAccessToken[];
    public_maps?: Map[];
    public_maps_count?: number;
    public_maps_contributed_to?: Map[];
    roles?: Role[];
    permissions?: Permission[];
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: Date;
    updated_at: Date;
    pivot: RolePivot;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: Date;
    updated_at: Date;
    pivot: PermissionPivot;
}

export interface PermissionPivot {
    role_id: number;
    permission_id: number;
}

export interface RolePivot {
    model_id: number;
    role_id: number;
    model_type: string;
}

export interface PersonalAccessToken {
    id: string;
    user_id: number;
    client_id: number;
    name: string | null;
    scopes: string[];
    revoked: boolean;
    created_at: Date;
    updated_at: Date;
    expires_at: Date;
    client?: Client;
}

export interface Client {
    id: number;
    user_id: null;
    name: string;
    provider: null;
    redirect: string;
    personal_access_client: boolean;
    password_client: boolean;
    revoked: boolean;
    created_at: Date;
    updated_at: Date;
}
