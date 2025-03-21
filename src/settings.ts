import {config} from 'dotenv';
config();

export const SETTINGS = {
    PORT: process.env.PORT || 3003,
    PATH: {
        USERS: '/users',
        BLOGS: '/blogs',
        POSTS: '/posts',
        AUTH: '/auth',
        COMMENTS: '/comments',
        TESTING: "/testing",
        RATE_LIMIT: "/rate-limit",
        SESSIONS: "/sessions",
    },
    CREDENTIALS: {
        LOGIN: "admin",
        PASSWORD: "qwerty",
    },
    JWT_SECRET: "some secret qwerty"
};