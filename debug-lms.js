
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function debugConnection() {
    let sheetId = process.env.GOOGLE_SHEET_ID_LMS;

    console.log("--- DEBUG ID ---");
    console.log("Raw Value:", `"${sheetId}"`);
    if (sheetId) {
        console.log("Length:", sheetId.length);
        console.log("Char Codes:", sheetId.split('').map(c => c.charCodeAt(0)));
        sheetId = sheetId.trim();
        console.log("Trimmed Value:", `"${sheetId}"`);
    } else {
        console.error("SHEET ID IS EMPTY/UNDEFINED");
        return;
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    try {
        console.log("\n--- REQUEST ---");
        console.log(`Getting Metadata for: ${sheetId}`);
        const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        console.log(`\n✅ SUCCESS!`);
        console.log(`Title: ${response.data.properties.title}`);
        console.log("Tabs:", response.data.sheets.map(s => s.properties.title));

    } catch (error) {
        console.error("\n❌ FAILED:", error.message);
        if (error.code === 404) console.error("Reason: ID Validation Failed (Not Found)");
        if (error.code === 403) console.error("Reason: Permission Denied (Share with Service Account)");
    }
}

debugConnection();
