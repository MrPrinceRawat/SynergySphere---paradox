package models

type Task struct {
	TaskID      string `json:"task_id" bson:"task_id"`
	ProjectID   string `json:"project_id" bson:"project_id"`
	Name        string `json:"name" bson:"name"`
	Description string `json:"description" bson:"description"`
	Status      string `json:"status" bson:"status"`
	CreatedBy   string `json:"created_by" bson:"created_by"`
	CreatedAt   string `json:"created_at" bson:"created_at"`
	UpdatedAt   string `json:"updated_at" bson:"updated_at"`
	DueDate     string `json:"due_date" bson:"due_date"`
	Priority    string `json:"priority" bson:"priority"`

	// Relationships
	Assignees []string `json:"assignees" bson:"assignees"`
	Comments  []string `json:"comments" bson:"comments"`
	Tags      []string `json:"tags" bson:"tags"`
	DependsOn []string `json:"depends_on" bson:"depends_on"` // new field for dependency tracking

	// Estimates
	EstimatedEffort int `json:"estimated_effort" bson:"estimated_effort"` // new field

	// Expenses
	Budget float64 `json:"budget" bson:"budget"`
	Spend  float64 `json:"spend" bson:"spend"`
}
