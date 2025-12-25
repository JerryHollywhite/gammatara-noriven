# How to Fix Google Drive Uploads (OAuth2 Setup)

Because you are using a **Personal Gmail Account**, you cannot use the "Service Account" method for file uploads (Google blocks this with a 0GB quota). You must use **OAuth2**, which allows the system to upload files *as you*.

Follow these steps carefully.

## Step 0: Configure Consent Screen (First Time Only)
If you see a warning saying **"To create an OAuth client ID, you must first configure your consent screen"**, do this:

1.  Click the **"configure your consent screen"** link (or go to **APIs & Services > OAuth consent screen**).
2.  **User Type**: Select **External**. (This allows any Gmail account, including yours, to log in).
3.  Click **CREATE**.
4.  **App Information**:
    *   **App name**: Enter `Gama Tara Web`.
    *   **User support email**: Select your email.
    *   **Developer contact information**: Enter your email again.
5.  Click **SAVE AND CONTINUE**.
6.  **Scopes**: Click **SAVE AND CONTINUE** (skip for now).
7.  **Test users**:
    *   **IMPORTANT**: Click **+ ADD USERS**.
    *   Enter your email address (e.g., `jerry.otomasikan@gmail.com`).
    *   Click **ADD** and then **SAVE AND CONTINUE**.
8.  Once done, go back to **Credentials** (on the left menu) and proceed to Step 1 below.

## Step 1: Get Google credentials
1.  Go to **APIs & Services > Credentials**.
2.  Click **+ CREATE CREDENTIALS** (at the top) -> **OAuth client ID**.
5.  **Application Type**: Select **Web application**.
6.  **Name**: Enter `Gama Tara Web`.
7.  **Authorized redirect URIs**:
    *   Click **ADD URI**.
    *   Paste: `http://localhost:3000/oauth2callback`
8.  Click **CREATE**.
9.  A popup will show your **Client ID** and **Client Secret**. Copy these!

## Step 2: Generate the Refresh Token
We have prepared a script to do this for you.

1.  Open your terminal in VS Code.
2.  Run the following command (replace `YOUR_ID` and `YOUR_SECRET` with the codes you just copied):

    ```bash
    GOOGLE_CLIENT_ID=paste_client_id_here GOOGLE_CLIENT_SECRET=paste_client_secret_here node scripts/get-refresh-token.js
    ```

    *Example:*
    `GOOGLE_CLIENT_ID=12345.apps.google.com GOOGLE_CLIENT_SECRET=abc-123 node scripts/get-refresh-token.js`

3.  The script will generate a **URL**. Command-click (or copy-paste) that URL into your browser.
4.  **Log in** with your Gmail account.
5.  Click **Continue** (if it says "App not verified").
6.  Click **Allow/Trust** to grant permission.
7.  The browser will say "Authentication successful!".
8.  Look back at your **VS Code Terminal**. It will print your `GOOGLE_REFRESH_TOKEN`.

## Step 3: Save to Environment
1.  Open your `.env.local` file.
2.  Add (or update) these 3 lines:

    ```env
    GOOGLE_CLIENT_ID=your_client_id_from_step_1
    GOOGLE_CLIENT_SECRET=your_client_secret_from_step_1
    GOOGLE_REFRESH_TOKEN=your_token_from_step_2
    ```

3.  **Important:** Also add these 3 variables to your **Vercel Project Settings** > **Environment Variables** for the live site.

---
Once done, your file uploads will work perfectly using your own personal Google Drive storage!
