export interface User {
    id: number;
    username: string;
    name: string | null;
    surname: string | null;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
    seen_at: Date;
    created_at: Date;
    updated_at: Date;
}
