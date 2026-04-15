# Bookmark Manager

A full-stack web application for saving, organizing, and retrieving web resources through bookmarks with metadata (title, description, tags).

## 📚 Documentation

- [Main Documentation](README.md)
- [Backend Documentation](src/backend/README.md)
- [Frontend Documentation](src/frontend/README.md)

## 🚀 Quick Start

### Prerequisites

- Go 1.22+
- Node.js 20+
- Docker & Docker Compose (optional)

### Running Locally

1. **Start the Backend:**
   ```bash
   cd src/backend
   go mod download
   go run cmd/main.go
   ```
   The API will be available at `http://localhost:8080`

2. **Start the Frontend:**
   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Running with Docker

```bash
docker-compose up --build
```

Both services will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 📁 Project Structure

```
.
├── src/
│   ├── backend/          # Go REST API
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── handler/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── model/
│   │   │   ├── middleware/
│   │   │   └── server/
│   │   └── README.md
│   └── frontend/         # React TypeScript app
│       └── src/
│           ├── components/
│           ├── hooks/
│           ├── pages/
│           ├── services/
│           └── styles/
├── docker-compose.yml
├── .env.example
├── api-collection.json   # Postman collection
└── README.md
```

## 🎯 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Create Bookmark | ✅ | Save URLs with title, description, and tags |
| View Bookmarks | ✅ | Paginated list view with 20 items per page |
| Edit Bookmark | ✅ | Update existing bookmark details |
| Delete Bookmark | ✅ | Remove bookmarks with confirmation |
| Search | ✅ | Full-text search across title, description, URL |
| Tag Filtering | ✅ | Filter by individual tags |
| Tag Management | ✅ | Automatic tag counting and display |
| Responsive UI | ✅ | Mobile-friendly design |
| Health Checks | ✅ | `/health` endpoint for monitoring |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookmarks` | List all bookmarks (paginated) |
| GET | `/api/v1/bookmarks/{id}` | Get a specific bookmark |
| POST | `/api/v1/bookmarks` | Create a new bookmark |
| PUT | `/api/v1/bookmarks/{id}` | Update a bookmark |
| DELETE | `/api/v1/bookmarks/{id}` | Delete a bookmark |
| GET | `/api/v1/bookmarks/search?q=` | Search bookmarks |
| GET | `/api/v1/bookmarks/tag/{tag}` | Filter by tag |
| GET | `/api/v1/tags` | Get all tags with counts |
| GET | `/health` | Health check |

## 🧪 Testing

### Backend
```bash
cd src/backend
go test -v ./...
```

### Frontend
```bash
cd src/frontend
npm test
```

## 📊 Technology Stack

### Backend
- **Go 1.22** - High-performance compiled language
- **Gorilla Mux** - HTTP routing
- **In-Memory Storage** - Zero-dependency data storage

### Frontend
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **React Hook Form** - Form handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

*This project is managed by the SDLC Pipeline. Implementation tasks are tracked as GitHub/GitLab issues.*