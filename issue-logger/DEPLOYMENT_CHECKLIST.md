# Deployment Checklist

Follow these steps to deploy the Issue Logger application to production.

## 1. Backend Deployment (Render)

1. **Create a New Blueprint**:
   - Log in to [Render](https://dashboard.render.com/).
   - Click **New** > **Blueprint**.
   - Connect your GitHub repository.
   - Render will detect the `render.yaml` file and suggest creating the `issue-logger-backend` service and `issue-logger-db` database.
2. **Environment Variables**:
   - The Blueprint will automatically set `DATABASE_URL`, `PORT`, and `NODE_ENV`.
   - Once the deployment is complete, note down the URL of your backend (e.g., `https://issue-logger-backend.onrender.com`).
3. **Configure CORS**:
   - After deploying the frontend, go to the `issue-logger-backend` settings in Render.
   - Update the `ALLOWED_ORIGIN` environment variable to your frontend URL (e.g., `https://issue-logger-frontend.vercel.app`).

## 2. Frontend Deployment (Vercel)

1. **Import Project**:
   - Log in to [Vercel](https://vercel.com/).
   - Click **New Project**.
   - Connect your GitHub repository.
   - Select the `client` directory as the **Root Directory**.
2. **Environment Variables**:
   - Add the following environment variable during setup:
     - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://issue-logger-backend.onrender.com`).
3. **Deploy**:
   - Click **Deploy**. Vercel will build and host your React application.
4. **Post-Deployment**:
   - Note your Vercel URL and update the `ALLOWED_ORIGIN` in your Render backend settings.

## 3. Database Migration

- The application is configured to automatically create the required table (`issue_logs`) upon the first successful connection to the database. No manual migration is required.

## 4. Verification

- [ ] Backend is running (check Render logs).
- [ ] Database is connected (check Render logs for "Table 'issue_logs' is ready").
- [ ] Frontend is accessible (check Vercel URL).
- [ ] Submitting an issue works (verifies Frontend -> Backend -> Database flow).
- [ ] Viewing issues works.
