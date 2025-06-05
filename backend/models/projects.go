package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tags struct {
	Tag   string `json:"tag" bson:"tag"`
	Color string `json:"color" bson:"color"`
}

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
	ImageURL    string   `json:"image_url" bson:"image_url"`
	Deadline    string   `json:"deadline" bson:"deadline"`
	Budget      float32  `json:"budget" bson:"budget"`
	Spend       float64  `json:"spend" bson:"spend"`
	Tags        []Tags   `bson:"tags" json:"tags"`
	TaskCount   int64    `json:"task_count" bson:"task_count"`
}

type CreateProject struct {
	ProjectID   string   `json:"project_id" bson:"project_id"`
	Name        string   `json:"name" bson:"name"`
	Description string   `bson:"description,omitempty" json:"description,omitempty"`
	Status      string   `json:"status" bson:"status"`
	CreatedBy   string   `json:"created_by" bson:"created_by"`
	CreatedAt   string   `json:"created_at" bson:"created_at"`
	UpdatedAt   string   `json:"updated_at" bson:"updated_at"`
	Members     []string `bson:"members" json:"members"`
	ImageURL    string   `json:"image_url" bson:"image_url"`
	Deadline    string   `json:"deadline" bson:"deadline"`
	Budget      float32  `json:"budget" bson:"budget"`
	Spend       float64  `json:"spend" bson:"spend"`
	Tags        []Tags   `bson:"tags" json:"tags"`
}
