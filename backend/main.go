package main

import (
	"log"
	"net/http"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/config"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/handlers"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/logger"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/middleware"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
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
	r.HandleFunc("/signup", handlers.Signup).Methods("POST")
	r.HandleFunc("/login", handlers.Login).Methods("POST")

	// Subrouter for protected routes
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(middleware.JWTAuth)

	// Profile Routes
	protected.HandleFunc("/me", handlers.GetUser).Methods("GET")

	// Project Routes
	protected.HandleFunc("/projects", handlers.GetProjects).Methods("GET")
	protected.HandleFunc("/projects/{project_id}", handlers.GetProject).Methods("GET")
	protected.HandleFunc("/projects", handlers.CreateProject).Methods("POST")
	protected.HandleFunc("/projects/{project_id}", handlers.UpdateProject).Methods("PUT")
	protected.HandleFunc("/projects/{project_id}", handlers.DeleteProject).Methods("DELETE")
	protected.HandleFunc("/projects/{project_id}/members", handlers.AddMemberToProject).Methods("POST")

	logger.Logger.Info("Starting server...")

	// Start server
	logger.Logger.Info("Listening on port: ", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
