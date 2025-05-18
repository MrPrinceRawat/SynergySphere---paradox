package api_handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/models"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
)

func GetProjects(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	projects := []models.Project{}
	cursor, err := utils.ProjectCollection.Find(r.Context(), bson.M{"members": username})
	if err != nil {
		http.Error(w, "Projects not found", http.StatusNotFound)
		return
	}

	err = cursor.All(r.Context(), &projects)
	if err != nil {
		http.Error(w, "Error fetching projects", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(projects)
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	project := models.Project{}
	err := utils.ProjectCollection.FindOne(r.Context(), bson.M{"project_id": projectID}).Decode(&project)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(project)
}

type ProjectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func CreateProject(w http.ResponseWriter, r *http.Request) {
	var projectRequest ProjectRequest
	err := json.NewDecoder(r.Body).Decode(&projectRequest)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	project := models.Project{
		ProjectID:   "project_" + uuid.New().String(),
		Name:        projectRequest.Name,
		Description: projectRequest.Description,
		Status:      "active",
		CreatedBy:   r.Context().Value("username").(string),
		CreatedAt:   time.Now().Format(time.RFC3339),
		UpdatedAt:   time.Now().Format(time.RFC3339),
		Members:     []string{r.Context().Value("username").(string)},
	}

	_, err = utils.ProjectCollection.InsertOne(r.Context(), project)
	if err != nil {
		http.Error(w, "Error creating project", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(project)
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	// Decode the request body into a map to handle dynamic fields
	var updateFields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateFields); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Optionally check if project exists first (optional, can be removed to speed up)
	var existingProject models.Project
	err := utils.ProjectCollection.FindOne(r.Context(), bson.M{"project_id": projectID}).Decode(&existingProject)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	// Add/override UpdatedAt field
	updateFields["updated_at"] = time.Now().Format(time.RFC3339)

	// Perform dynamic update using $set
	update := bson.M{"$set": updateFields}
	_, err = utils.ProjectCollection.UpdateOne(r.Context(), bson.M{"project_id": projectID}, update)
	if err != nil {
		http.Error(w, "Error updating project", http.StatusInternalServerError)
		return
	}

	// Optionally return the updated project
	var updatedProject models.Project
	err = utils.ProjectCollection.FindOne(r.Context(), bson.M{"project_id": projectID}).Decode(&updatedProject)
	if err != nil {
		http.Error(w, "Error fetching updated project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedProject)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["project_id"]

	res, err := utils.ProjectCollection.DeleteOne(r.Context(), bson.M{"project_id": projectID})
	if err != nil {
		http.Error(w, "Error deleting project", http.StatusInternalServerError)
		return
	}
	if res.DeletedCount == 0 {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func AddMemberToProject(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("project_id")
	username := r.Context().Value("username").(string)

	project := models.Project{}
	err := utils.ProjectCollection.FindOne(r.Context(), bson.M{"project_id": projectID}).Decode(&project)
	if err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	if !utils.Contains(project.Members, username) {
		project.Members = append(project.Members, username)
		project.UpdatedAt = time.Now().Format(time.RFC3339)

		_, err = utils.ProjectCollection.UpdateOne(r.Context(), bson.M{"project_id": projectID}, bson.M{"$set": project})
		if err != nil {
			http.Error(w, "Error updating project", http.StatusInternalServerError)
			return
		}
	}
}
