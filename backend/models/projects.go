package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Project struct {
	ID        primitive.ObjectID `json:"id" bson:"_id"`
	ProjectID string             `json:"project_id" bson:"project_id"`

	Name        string   `json:"name" bson:"name"`
	Description string   `bson:"description,omitempty" json:"description,omitempty"`
	Status      string   `json:"status" bson:"status"`
	CreatedBy   string   `json:"created_by" bson:"created_by"`
	CreatedAt   string   `json:"created_at" bson:"created_at"`
	UpdatedAt   string   `json:"updated_at" bson:"updated_at"`
	Members     []string `bson:"members" json:"members"`
}
