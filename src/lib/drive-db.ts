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

        // Email is col 0. Compare safely (trim + lowercase)
        const userRow = rows.find((row) => {
            const sheetEmail = row[0]?.trim().toLowerCase();
            const inputEmail = email?.trim().toLowerCase();
            return sheetEmail === inputEmail;
        });
        if (!userRow) return null;

        return {
            email: userRow[0]?.trim(),
            passwordHash: userRow[1]?.trim(),
            name: userRow[2]?.trim(),
            role: userRow[3]?.trim(),
            phone: userRow[4]?.trim(),
            status: userRow[5]?.trim(),
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

        // Find row with case-insensitive email match (trim both sides)
        const inputEmail = email?.trim().toLowerCase();
        const rowIndex = rows.findIndex(row => {
            const sheetEmail = row[0]?.trim().toLowerCase();
            return sheetEmail === inputEmail;
        });

        if (rowIndex === -1) {
            console.error(`Email not found in sheet: ${email}`);
            return false;
        }

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

        console.log(`Successfully updated status for ${email} to ${status}`);
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        return false;
    }
}

export async function deleteUser(email: string) {
    try {
        // 1. Find row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A:A',
        });

        const rows = response.data.values;
        if (!rows) return false;

        const inputEmail = email?.trim().toLowerCase();
        const rowIndex = rows.findIndex(row => {
            const sheetEmail = row[0]?.trim().toLowerCase();
            return sheetEmail === inputEmail;
        });

        if (rowIndex === -1) {
            console.error(`Email not found in sheet for deletion: ${email}`);
            return false;
        }

        // 2. Delete the row
        // startIndex is inclusive, endIndex is exclusive.
        // If rowIndex is 1 (Row 2), we want to delete index 1.
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // Assuming 'Users' is the first sheet (GID 0). If not, we need to fetch sheetId.
                                dimension: "ROWS",
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }
                ]
            }
        });

        console.log(`Successfully deleted user ${email} from Sheet`);
        return true;

    } catch (error) {
        console.error('Error deleting user from sheet:', error);
        return false;
    }
}

export async function getModulesForUser(email: string, role: string) {
    try {
        // 1. Get Access Rules
        const accessResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'AccessControl!A2:D',
        });

        const rows = accessResponse.data.values;
        if (!rows) return [];

        // Filter folders for this user (Match Email OR Role OR 'All')
        // We assume Column A (row[0]) can contain either an Email or a Role.
        const allowedFolders = rows.filter(row => {
            const accessKey = (row[0] || "").toString().trim().toLowerCase();
            const userEmail = email.toLowerCase().trim();
            const userRole = role.toLowerCase().trim();
            return accessKey === userEmail || accessKey === userRole || accessKey === 'all';
        });

        // 2. Fetch Files from Drive for each folder
        const modules = [];

        for (const folder of allowedFolders) {
            let folderId = (folder[1] || "").toString().trim();
            const folderName = folder[2];
            const description = folder[3];

            if (!folderId) continue;

            // Auto-extract ID if user pasted a full URL
            if (folderId.includes("drive.google.com")) {
                const parts = folderId.split("/");
                folderId = parts[parts.length - 1].split("?")[0]; // Handle query params
            }

            try {
                // List files in folder
                const fileRes = await drive.files.list({
                    q: `'${folderId}' in parents and trashed = false`,
                    fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime)',
                });

                modules.push({
                    id: folderId,
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
// ... (existing exports)

export async function setResetToken(email: string, token: string) {
    try {
        // Find row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A:A',
        });
        const rows = response.data.values;
        if (!rows) return false;

        const rowIndex = rows.findIndex(row => row[0] === email);
        if (rowIndex === -1) return false;

        // Update Reset Token (Col G -> index 6, so G{row})
        const range = `Users!G${rowIndex + 1}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[token]] },
        });
        return true;
    } catch (e) {
        console.error('Error setting reset token:', e);
        return false;
    }
}

export async function getUserByToken(token: string) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A2:G',
        });
        const rows = response.data.values;
        if (!rows) return null;

        // Token is index 6
        const userRow = rows.find(row => row[6] === token);
        if (!userRow) return null;

        // Make sure token matches exactly
        if (userRow[6] !== token) return null;

        return {
            email: userRow[0],
            name: userRow[2],
        };
    } catch (e) {
        console.error('Error getting user by token:', e);
        return null;
    }
}

export async function resetPassword(token: string, newPasswordHash: string) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Users!A:G',
        });
        const rows = response.data.values;
        if (!rows) return false;

        const rowIndex = rows.findIndex(row => row[6] === token);
        if (rowIndex === -1) return false;

        // Update Password (Col B -> index 1) AND Clear Token (Col G -> index 6)
        // We need to do two updates or one batch update.
        // Simpler: Update Password first, then Token. Or verify which columns.
        // Col B is index 1. Col G is index 6.
        // It's B{row} and G{row}.

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Users!B${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newPasswordHash]] },
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Users!G${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['']] }, // Clear token
        });

        return true;
    } catch (e) {
        console.error('Error resetting password:', e);
        return false;
    }
}
