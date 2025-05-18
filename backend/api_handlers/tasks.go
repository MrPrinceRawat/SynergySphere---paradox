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

func GetTasks(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	tasks := []models.Task{}
	cursor, err := utils.TaskCollection.Find(r.Context(), bson.M{"assignees": username})
	if err != nil {
		http.Error(w, "Tasks not found", http.StatusNotFound)
		return
	}

	err = cursor.All(r.Context(), &tasks)
	if err != nil {
		http.Error(w, "Error fetching tasks", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(tasks)
}

func GetTask(w http.ResponseWriter, r *http.Request) {
	taskID := mux.Vars(r)["task_id"]

	task := models.Task{}
	err := utils.TaskCollection.FindOne(r.Context(), bson.M{"task_id": taskID}).Decode(&task)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(task)
}

type TaskRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	Priority    string `json:"priority"`
	Assignees   []string
	Tags        []string
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	var taskRequest TaskRequest
	err := json.NewDecoder(r.Body).Decode(&taskRequest)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	task := models.Task{
		TaskID:      "task_" + uuid.New().String(),
		Name:        taskRequest.Name,
		Description: taskRequest.Description,
		Status:      "active",
		DueDate:     taskRequest.DueDate,
		Priority:    taskRequest.Priority,
		CreatedBy:   r.Context().Value("username").(string),
		CreatedAt:   time.Now().Format(time.RFC3339),
		UpdatedAt:   time.Now().Format(time.RFC3339),
		Assignees:   taskRequest.Assignees,
		Tags:        taskRequest.Tags,
	}

	_, err = utils.TaskCollection.InsertOne(r.Context(), task)
	if err != nil {
		http.Error(w, "Error creating task", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(task)
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	taskID := mux.Vars(r)["task_id"]

	// Decode the request body into a map to handle dynamic fields
	var updateFields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updateFields); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Optionally check if task exists first (optional, can be removed to speed up)
	var existingTask models.Task
	err := utils.TaskCollection.FindOne(r.Context(), bson.M{"task_id": taskID}).Decode(&existingTask)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	// Add/override UpdatedAt field
	updateFields["updated_at"] = time.Now().Format(time.RFC3339)

	// Perform dynamic update using $set
	update := bson.M{"$set": updateFields}
	_, err = utils.TaskCollection.UpdateOne(r.Context(), bson.M{"task_id": taskID}, update)
	if err != nil {
		http.Error(w, "Error updating task", http.StatusInternalServerError)
		return
	}

	// Optionally return the updated task
	var updatedTask models.Task
	err = utils.TaskCollection.FindOne(r.Context(), bson.M{"task_id": taskID}).Decode(&updatedTask)
	if err != nil {
		http.Error(w, "Error fetching updated task", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	taskID := mux.Vars(r)["task_id"]

	res, err := utils.TaskCollection.DeleteOne(r.Context(), bson.M{"task_id": taskID})
	if err != nil {
		http.Error(w, "Error deleting task", http.StatusInternalServerError)
		return
	}
	if res.DeletedCount == 0 {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func AddMemberToTask(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("task_id")
	username := r.Context().Value("username").(string)

	task := models.Task{}
	err := utils.TaskCollection.FindOne(r.Context(), bson.M{"task_id": taskID}).Decode(&task)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	if !utils.Contains(task.Assignees, username) {
		task.Assignees = append(task.Assignees, username)
		task.UpdatedAt = time.Now().Format(time.RFC3339)

		_, err = utils.TaskCollection.UpdateOne(r.Context(), bson.M{"task_id": taskID}, bson.M{"$set": task})
		if err != nil {
			http.Error(w, "Error updating task", http.StatusInternalServerError)
			return
		}
	}
}
