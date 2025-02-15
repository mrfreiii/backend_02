import {config} from 'dotenv';
config();

export const SETTINGS = {
    PORT: process.env.PORT || 3003,
    PATH: {
        USERS: '/users',
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTING: "/testing"
    },
    CREDENTIALS: {
        LOGIN: "admin",
        PASSWORD: "qwerty",
    }
};