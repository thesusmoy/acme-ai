# Acme AI Task - Legal Document Search

This project is a full-stack legal document search application powered by AI. It provides a simple and intuitive interface for searching and analyzing legal documents.

## Features

-   **AI-Powered Search:** Utilizes AI to provide intelligent search results and summaries of legal documents.
-   **Document Library:** Browse and explore all available legal documents.
-   **Detailed Document View:** View the full content of a legal document, including metadata and an AI-generated analysis.
-   **PDF Export:** Export search results and individual documents as PDFs.
-   **Dockerized:** The entire application is containerized for easy setup and deployment.

## Tech Stack

### Frontend

-   **Next.js:** A React framework for building server-side rendered and static web applications.
-   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **jsPDF:** A library for generating PDFs in JavaScript.

### Backend

-   **FastAPI:** A modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.
-   **Python:** A high-level, general-purpose programming language.
-   **scikit-learn:** A free software machine learning library for the Python programming language.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   Python (v3.9 or later)
-   Docker

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd acme-ai
    ```

2.  **Install frontend dependencies:**

    ```bash
    cd frontend
    npm install
    ```

3.  **Install backend dependencies:**

    ```bash
    cd ../backend
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the backend server:**

    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```

    The API will be available at `http://localhost:8000/api/documents`

2.  **Start the frontend development server:**

    ```bash
    cd frontend
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Docker

### Building the Images

1.  **Build the frontend image:**

    ```bash
    cd frontend
    ./build.sh
    ```

2.  **Build the backend image:**

    ```bash
    cd ../backend
    ./build.sh
    ```

### Running with Docker Compose

A `docker-compose.yml` file is provided for running the application with Docker Compose.

```bash
docker-compose up -d
```

### Or

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`.

## API Endpoints

-   `GET /`: Root endpoint with API information.
-   `GET /api/documents`: Get all legal documents.
-   `GET /api/documents/{document_id}`: Get a specific document by ID.
-   `POST /generate`: Generate AI-powered search results.
-   `GET /health`: Health check endpoint.
