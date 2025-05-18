package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	TaskID      string             `json:"task_id" bson:"task_id"`
	ProjectID   string             `json:"project_id" bson:"project_id"`
	Name        string             `json:"name" bson:"name"`
	Description string             `json:"description" bson:"description"`
	Status      string             `json:"status" bson:"status"`
	CreatedBy   string             `json:"created_by" bson:"created_by"`
	CreatedAt   string             `json:"created_at" bson:"created_at"`
	UpdatedAt   string             `json:"updated_at" bson:"updated_at"`
	DueDate     string             `json:"due_date" bson:"due_date"`
	Priority    string             `json:"priority" bson:"priority"`

	// Relationships
	Assignees []string `json:"assignees" bson:"assignees"`
	Comments  []string `json:"comments" bson:"comments"`
	Tags      []string `json:"tags" bson:"tags"`
}
