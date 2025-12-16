# MYCDAR Desktop App - Project Overview

## Introduction
MYCDAR (Muhanga Youth Daily Attendance Records Control) is a desktop application for managing daily attendance records. It consists of a React-based frontend wrapped in Electron and an Express.js backend.

## Architecture

The project follows a full-stack architecture:

### 1. Frontend (Root & `src/`)
- **Framework**: React 19 (Vite)
- **Desktop Wrapper**: Electron
- **Router**: react-router-dom
- **Styling**: Vanilla CSS
- **Entry Point**: `src/main.jsx`
- **Electron Main**: `main.js` (Root)

### 2. Backend (`backend/`)
- **Framework**: Express.js
- **Database**: MongoDB (Local or Atlas Cloud)
- **Authentication**: JWT & Custom Password Management
- **Real-time**: Socket.io (present in dependencies)
- **Entry Point**: `backend/index.js`
- **Documentation**: `backend/ACCOUNT_MANAGEMENT.md`

## Key Directories

- `src/`: React source code (components, pages, api).
- `backend/`: Node.js server code.
- `backend/controllers/`: API logic.
- `backend/models/`: (Implicit in controllers/DB calls).
- `backend/routes/`: API route definitions.

## Configuration
- **Backend Port**: 2025
- **Frontend Port**: 5173
- **Database Config**: `backend/constants.js`
