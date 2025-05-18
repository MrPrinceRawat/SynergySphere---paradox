package main

import (
	"log"
	"net/http"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/api_handlers"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/config"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/logger"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/middleware"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	logger.Init()

	// Load config
	logger.Logger.Info("Loading config...")
	cfg := config.LoadConfig()
	logger.Logger.Info("Config loaded")

	// Init MongoDB
	logger.Logger.Info("Initializing MongoDB...")
	utils.InitMongo(cfg)

	// Init router
	r := mux.NewRouter()

	// Register routes
	r.HandleFunc("/signup", api_handlers.Signup).Methods("POST")
	r.HandleFunc("/login", api_handlers.Login).Methods("POST")

	// Subrouter for protected routes
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.JWTAuth)

	// Profile Routes
	protected.HandleFunc("/me", api_handlers.GetUser).Methods("GET")

	// Project Routes
	protected.HandleFunc("/projects", api_handlers.GetProjects).Methods("GET")
	protected.HandleFunc("/projects/{project_id}", api_handlers.GetProject).Methods("GET")
	protected.HandleFunc("/projects", api_handlers.CreateProject).Methods("POST")
	protected.HandleFunc("/projects/{project_id}", api_handlers.UpdateProject).Methods("PUT")
	protected.HandleFunc("/projects/{project_id}", api_handlers.DeleteProject).Methods("DELETE")
	protected.HandleFunc("/projects/{project_id}/members", api_handlers.AddMemberToProject).Methods("POST")

	// Task Routes
	protected.HandleFunc("/tasks", api_handlers.GetTasks).Methods("GET")
	protected.HandleFunc("/tasks/{task_id}", api_handlers.GetTask).Methods("GET")
	protected.HandleFunc("/tasks", api_handlers.CreateTask).Methods("POST")
	protected.HandleFunc("/tasks/{task_id}", api_handlers.UpdateTask).Methods("PUT")
	protected.HandleFunc("/tasks/{task_id}", api_handlers.DeleteTask).Methods("DELETE")
	protected.HandleFunc("/tasks/{task_id}/members", api_handlers.AddMemberToTask).Methods("POST")

	logger.Logger.Info("Starting server...")

	corsMiddleware := handlers.CORS(
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedOrigins([]string{"*"}), // Change "*" to specific domains in production
	)

	// Start server
	logger.Logger.Info("Listening on port: ", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, corsMiddleware(r)))
}
