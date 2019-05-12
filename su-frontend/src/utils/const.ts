// TODO: For scaling, modify these so that they point to Nginx endpoints

// export const ACCOUNTS_API = 'http://localhost:3001';
// export const USER_API = 'http://localhost:3002';
// export const QUESTIONS_API = 'http://localhost:3003';
// export const ANSWERS_API = 'http://localhost:3004';
// export const SEARCH_API = 'http://localhost:3005';

export const API = 'smores.cse356.compas.cs.stonybrook.edu'; // localhost
export const ACCOUNTS_API = `http://${API}`;
export const USER_API = `http://${API}/user`;
export const QUESTIONS_API = `http://${API}/questions`;
export const ANSWERS_API = `http://${API}/answers`;
export const SEARCH_API = `http://${API}/search`;
export const MEDIA_API = `http://${API}/addmedia`;


export const STATUS_OK = 'OK';
export const STATUS_ERR = 'error';

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAaSt2fAMaQqq1FZk5E+dhrZk3ZG2q/uG2
WNBGImujPTrkmmzYVpwb72VkBQWzi/rGFevzqWxMK30P3lfcskcXcwIDAQAB
-----END PUBLIC KEY-----`;