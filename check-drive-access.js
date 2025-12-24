
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function checkDrive() {
    console.log("--- CHECKING DRIVE ACCESS ---");
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !key) {
        console.error("Missing Credentials in .env.local");
        return;
    }

    console.log("Service Account:", email);

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    try {
        console.log("\n1. Listing Folders visible to Service Account...");
        const res = await drive.files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id, name, driveId, owners)",
            pageSize: 10
        });

        const folders = res.data.files;
        if (folders.length === 0) {
            console.log("❌ NO FOLDERS FOUND.");
            console.log("The Service Account cannot see any folders. It has nowhere to upload files.");
            console.log("\nSOLUTION:");
            console.log("1. Go to your Google Drive.");
            console.log("2. Create a folder named 'Teacher Uploads'.");
            console.log(`3. Share it with: ${email} (Editor).`);
        } else {
            console.log(`✅ Found ${folders.length} folders:`);
            folders.forEach(f => {
                const type = f.driveId ? "SHARED DRIVE (OK)" : "REGULAR FOLDER (QUOTA ERROR)";
                console.log(`- [${f.name}] (ID: ${f.id}) [${type}]`);
            });
            console.log("\nIf you see 'REGULAR FOLDER', Service Accounts CANNOT upload files there due to 0 quota.");
            console.log("You MUST use a 'Shared Drive' (Team Drive) or switch to OAuth2 authorization.");
        }

        console.log("\n2. Checking Storage Quota...");
        const about = await drive.about.get({
            fields: "storageQuota, user"
        });
        console.log("Storage Quota:", about.data.storageQuota);
        console.log("User:", about.data.user.emailAddress);

    } catch (error) {
        console.error("API Error:", error.message);
    }
}

checkDrive();
