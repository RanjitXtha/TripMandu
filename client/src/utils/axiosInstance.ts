import axios from 'axios';

const BASE_URL: string = 'http://localhost:8080/api/v1';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})
