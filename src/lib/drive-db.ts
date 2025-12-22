import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
];

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_ROLE_ACCESS;

export async function getUserByEmail(email: string) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A2:H', // Assuming headers are row 1
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return null;

        // Email is col 0
        const userRow = rows.find((row) => row[0] === email);
        if (!userRow) return null;

        return {
            email: userRow[0],
            passwordHash: userRow[1],
            name: userRow[2],
            role: userRow[3],
            phone: userRow[4],
            status: userRow[5],
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

export async function createUser(user: { email: string; passwordHash: string; name: string; role: string; phone: string }) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    user.email,
                    user.passwordHash,
                    user.name,
                    user.role,
                    user.phone,
                    'Pending', // Default status
                    '', // Reset token
                    new Date().toISOString()
                ]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateUserStatus(email: string, status: string) {
    try {
        // First find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A:A',
        });

        const rows = response.data.values;
        if (!rows) return false;

        const rowIndex = rows.findIndex(row => row[0] === email);
        if (rowIndex === -1) return false;

        // Update Status column (F = index 5, so F{rowIndex+1})
        // Row 1 is header, so if rowIndex is 1 (2nd row), it is row 2. +1 maps correctly.
        const range = `Users!F${rowIndex + 1}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[status]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        return false;
    }
}

export async function getModulesForRole(role: string) {
    try {
        // 1. Get Access Rules
        const accessResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'AccessControl!A2:D',
        });

        const rows = accessResponse.data.values;
        if (!rows) return [];

        // Filter folders for this role
        const allowedFolders = rows.filter(row => row[0] === role || row[0] === 'All');

        // 2. Fetch Files from Drive for each folder
        const modules = [];

        for (const folder of allowedFolders) {
            const folderId = folder[1];
            const folderName = folder[2];
            const description = folder[3];

            try {
                // List files in folder
                const fileRes = await drive.files.list({
                    q: `'${folderId}' in parents and trashed = false`,
                    fields: 'files(id, name, mimeType, webViewLink, iconLink)',
                });

                modules.push({
                    folderName,
                    description,
                    files: fileRes.data.files || []
                });
            } catch (e) {
                console.warn(`Failed to access folder ${folderId}:`, e);
            }
        }
        return modules;
    } catch (error) {
        console.error('Error fetching modules:', error);
        return [];
    }
}
