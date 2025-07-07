// import { google } from 'googleapis';
// import { promises as fs } from 'fs';
// import * as path from 'path';

// const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// const CLIENT_SECRETS = {
// 	client_id: process.env.GOOGLE_CLIENT_ID,
// 	client_secret: process.env.GOOGLE_CLIENT_SECRET,
// 	redirect_uri: process.env.GOOGLE_REDIRECT_URI,
// };

// const API_SCOPE = [
// 	'https://www.googleapis.com/auth/admob.readonly',
// 	'https://www.googleapis.com/auth/admob.report',
// ];

// export async function login() {
// 	const { client_id, client_secret, redirect_uri } = CLIENT_SECRETS;

// 	if (!client_id || !client_secret || !redirect_uri) {
// 		throw new Error('Missing Google OAuth credentials. Check your .env file.');
// 	}

// 	const oAuth2Client = new google.auth.OAuth2(
// 		client_id,
// 		client_secret,
// 		redirect_uri,
// 	);

// 	try {
// 		const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
// 		const tokens = JSON.parse(tokenData);
// 		oAuth2Client.setCredentials(tokens);
// 		console.log('\nUsing saved token from token.json');
// 		return google.admob({ version: 'v1', auth: oAuth2Client });
// 	} catch (err) {
// 		console.log('\nNo saved token found. Redirecting to login...');
// 	}

// 	const authUrl = oAuth2Client.generateAuthUrl({
// 		access_type: 'offline',
// 		scope: API_SCOPE,
// 	});

// 	console.log('\nOpen the following URL to authorize the app:\n');
// 	console.log(authUrl);
// 	const open = (await import('open')).default;
// 	await open(authUrl);


// 	const code = await askUserForCode();
// 	console.log(`\nReceived authorization code: ${code}`);

// 	const response = await oAuth2Client.getToken(code.trim());
// 	const tokens = response.tokens;

// 	if (!tokens || !tokens.access_token) {
// 		throw new Error('Failed to retrieve access token.');
// 	}

// 	oAuth2Client.setCredentials(tokens);

// 	await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
// 	console.log(`\nToken saved to ${TOKEN_PATH}`);

// 	return google.admob({ version: 'v1', auth: oAuth2Client });
// }

// async function askUserForCode(): Promise<string> {
// 	return new Promise((resolve) => {
// 		process.stdout.write('\nEnter the code from Google: ');
// 		process.stdin.once('data', (data) => resolve(data.toString().trim()));
// 	});
// }
