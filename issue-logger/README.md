# Issue Logging Application

A full-stack application built with React, Node.js, Express, and PostgreSQL for logging and tracking issues.

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL
- Database credentials (configured in `.env`)

## Project Structure

- `server/`: Backend API Node.js application.
- `client/`: Frontend React application.

## Setup Instructions

### 1. Database Setup

The application is configured to connect to the provided PostgreSQL database.
The table `issue_logs` will be automatically created on server startup if it does not exist.

### 2. Backend Setup

 Navigate to the `server` directory:
   ```bash
   cd server
   ```

 Install dependencies:
   ```bash
   npm install
   ```

 Start the server:
   ```bash
   npm start
   ```
   The server will run on port **5000**.

### 3. Frontend Setup

 Navigate to the `client` directory:
   ```bash
   cd client
   ```

 Install dependencies:
   ```bash
   npm install
   ```
   *(Note: If strict peer dependency issues occur, use `npm install --legacy-peer-deps`)*

 Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at the URL provided in the terminal (usually `http://localhost:5173`).

## Features

- **Log Issues**: Submit issues via a clean, validated form.
- **View Issues**: See a list of recently submitted issues.
- **Responsive Design**: Works on mobile and desktop.
