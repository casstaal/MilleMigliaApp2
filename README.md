
# Mille Miglia

Mille Miglia is a web application developed using Nuxt 3, Vue 3, and TypeScript. The application allows users to explore and manage Mille Miglia images on an interactive map.

The project was developed to gain experience with full-stack web development, including frontend development, API endpoints, database management, and external services such as MinIO for image storage.

## Features

- **Interactive map:** Displays car-related locations using Leaflet and OpenStreetMap.
- **Map markers:** Users can add, view, edit, and delete markers containing information about cars and their locations.
- **Image uploads:** Users can upload images associated with markers, which are stored using MinIO.
- **Image gallery:** Multiple images can be associated with a marker and displayed in a gallery.
- **User authentication:** Authentication and user sessions are handled using Nuxt Auth.
- **Form validation:** Forms are validated using VeeValidate.

## Technologies

| Category | Technologies |
|---|---|
| Frontend | Vue 3, Nuxt 3, TypeScript |
| Styling | Bootstrap |
| Maps | Leaflet, OpenStreetMap |
| Backend | Nuxt Server API Routes |
| Database | PostgreSQL, Prisma |
| Object Storage | MinIO |
| Authentication | Nuxt Auth |
| Validation | VeeValidate |

## Architecture

The application uses Nuxt 3 for both frontend and backend functionality.

- **Frontend:** Vue components provide the user interface and interactive map functionality.
- **Backend:** Nuxt server API routes handle requests related to markers, images, and application data.
- **Database:** PostgreSQL stores application data, accessed through Prisma ORM.
- **Object Storage:** MinIO is used to store images uploaded by users.
- **Maps:** Leaflet and OpenStreetMap provide interactive map functionality and location markers.

## Installation

### Prerequisites

- Node.js
- npm
- PostgreSQL
- MinIO (or a compatible object storage service)

### 1. Clone the repository

```powershell
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure environment variables

The application requires configuration for its database, authentication, and object storage.

Create a `.env` file and configure the required environment variables according to the project's configuration.

### 4. Set up the database

Configure PostgreSQL and apply the existing Prisma database migrations.

### 5. Start the development server

```powershell
npm run dev
```

The application should be available at:

http://localhost:3000

> **Note:** The installation steps describe the intended development setup. They have not been recently verified, and additional configuration or dependency updates may be required.

## Project Status

This is an older educational project that is no longer actively maintained.

The application previously ran on a personal server, but it has not been tested with the latest versions of its dependencies or services.

In particular, the project relies on a MinIO-based object storage setup that has not been updated or verified recently. Changes in dependencies, service availability, or configuration may affect the application's ability to run without modifications.

The repository is primarily shared as a portfolio project to demonstrate experience with Vue, Nuxt, TypeScript, full-stack development, database integration, and interactive maps.

## Possible Improvements

If development were resumed, possible improvements would include:

- Updating dependencies and checking compatibility with current versions.
- Reviewing the MinIO integration and object storage configuration.
- Improving error handling and validation.
- Adding automated tests.
- Reviewing authentication and security configurations.
- Improving documentation and deployment configuration.

## Project Context

Mille Miglia was developed as a learning project to explore full-stack development using Nuxt 3 and Vue 3.

It demonstrates practical experience with interactive maps, API development, database operations, authentication, and image storage.

Although the application is no longer actively maintained, the source code remains available as an example of my earlier development work.
