# Foundation To Future Academy Website

Minimal Express + EJS website for Foundation To Future Academy.

## Local setup

1. Copy `.env.example` to `.env` and fill in your Gmail credentials:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
4. Open http://localhost:3000

> Note: `.env` is listed in `.gitignore`, so secret credentials are not committed.

## Deploying

This project is ready for Node hosting. Recommended platforms:

- Render
- Railway
- Fly.io
- Heroku
- DigitalOcean App Platform

### Render / Railway

1. Push this repo to GitHub.
2. Create a new Node service and connect your repo.
3. Set the build command to:
   ```bash
   npm install
   ```
4. Set the start command to:
   ```bash
   npm start
   ```
5. Make sure `PORT` is allowed by the host. The app uses `process.env.PORT || 3000`.

### Heroku

If you want Heroku, use the provided `Procfile`.

## Project structure

- `server.js` — Express server
- `views/index.ejs` — EJS template
- `public/` — static assets
- `data/siteData.json` — content loaded by the app

## Editing content

The site is now editable through a simple browser editor.

- Run the app locally with `npm start`
- Open `http://localhost:3000/admin`
- Update the values in the form and save

This allows you to change the site copy without editing code directly.

## Notes

- Keep `views/index.ejs` as the main template.
- If you add new static assets, put them in `public/`.
