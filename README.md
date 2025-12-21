# Gamma Tara Learning Centre Website

This is the modern, high-converting website for Gamma Tara Learning Centre, built with Next.js 15, Tailwind CSS, and Google Sheets integration.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the result.

## Deployment (Git -> Vercel)

To set up the automatic deployment pipeline requested:

1.  **Create a Repository on GitHub:**
    - Go to [GitHub.com/new](https://github.ne) and create a new repository named `gamma-tara-web`.

2.  **Push your code:**
    Run these commands in your terminal:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/gamma-tara-web.git
    git branch -M main
    git push -u origin main
    ```

3.  **Connect in Vercel:**
    - Go to your Vercel Dashboard.
    - Click "Add New..." -> "Project".
    - Import the `gamma-tara-web` repository you just created.
    - **Important:** Add your Environment Variables (`GOOGLE_SHEETS_...`) in the Vercel Project Settings.

## Environment Variables

To enable the dynamic data features (Hall of Fame, Schedules), you need to set these in `.env.local` (local) and Vercel Settings (production):

- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`

See `src/lib/googleSheets.ts` for details on how to get these keys.
