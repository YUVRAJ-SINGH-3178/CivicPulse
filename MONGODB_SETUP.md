# MongoDB setup for CivicPulse reports

The issue report flow writes to MongoDB through `backend/config/mongo.js` using `process.env.MONGO_URI`.

## What you need from the previous owner

Ask them for one of these:

1. A MongoDB Atlas connection string with database access:
   - `mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority`
2. Or an Atlas invite to the project so you can create your own database user.

Also confirm:

- Database name, for example `civicpulse`.
- Database user permissions: read/write on the target database.
- Network access: your IP must be allowed in Atlas Network Access, or use `0.0.0.0/0` only for development.
- Whether existing data should be reused or whether you should create a fresh database.

## Local setup

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/civicpulse?retryWrites=true&w=majority
```

Then start the backend from `backend/`:

```bash
npm run dev
```

When the backend is connected, issue reports created from `src/Pages/ReportIssue.jsx` are saved in the MongoDB `issues` collection.

## Frontend API prerequisite

The frontend currently calls:

```txt
http://localhost:5000/api/issues
```

So the backend must be running on port `5000` while developing locally.
