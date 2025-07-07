import { google } from 'googleapis';

const API_SCOPE = [
  'https://www.googleapis.com/auth/admob.readonly',
  'https://www.googleapis.com/auth/admob.report',
];

export const createOAuth2Client = () => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // ví dụ: http://localhost:3000/api/oauth/callback
  );
  return client;
};

export const generateAuthUrl = () => {
  const oAuth2Client = createOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: API_SCOPE,
    prompt: 'consent',
  });
};
