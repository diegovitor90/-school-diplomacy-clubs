# School Diplomacy Clubs · SDC Portal

An educational operations portal developed in the context of IEMA's School Diplomacy Clubs participation in Maranhão, Brazil.

The project brings student continuity, document tracking and pedagogical support into a shared administrative interface. Its key workflow distinguishes receiving a file, confirming the student's document link and manually reviewing a signature.

**Repository status:** recovered version 2.2 frontend, an isolated synthetic-data demo and technical documentation. The complete institutional Apps Script backend has not yet been imported. This is not a deployable copy of the production system.

## Explore

Open `demo/index.html` locally. No installation is required. The dashboard and filters work with 24 fictional participants across three fictional schools. Review actions, assessments and document generation are disabled. No requests are sent to Google services.

The institutional architecture combines HTML, CSS and JavaScript with Google Apps Script, Sheets, Drive and Docs. The lesson-plan generator described in the project history uses structured templates; it does not require a paid AI API.

## Validate

With Node.js 22 or newer:

```sh
npm run build:demo
npm run check
npm test
```

These checks cover the portfolio package only. They do not validate institutional permissions, signatures or Google Workspace integrations.

## Author and context

Diego Vitor Lopes Gonçalves Souza — education, software development and process automation. Developed in the context of work at IEMA's English Language Unit. This portfolio is not an official application channel. Real student records and production credentials are excluded. A redistribution license has not yet been selected.

[Português](../README.md) · [Architecture](ARCHITECTURE.md) · [Recovery checklist](RECOVERY.md)
