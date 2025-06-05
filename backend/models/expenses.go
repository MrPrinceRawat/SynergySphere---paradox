package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ExpenseCategory string

const (
	ExpenseCategoryMaterial  ExpenseCategory = "material"
	ExpenseCategoryLabor     ExpenseCategory = "labor"
	ExpenseCategoryEquipment ExpenseCategory = "equipment"
	ExpenseCategoryTravel    ExpenseCategory = "travel"
	ExpenseCategoryOther     ExpenseCategory = "other"
)

type ParentType string

const (
	ParentTypeProject ParentType = "project"
	ParentTypeTask    ParentType = "task"
)

type Expense struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Amount      float64            `json:"amount" bson:"amount" validate:"required,gt=0"`
	Currency    string             `json:"currency" bson:"currency" validate:"required,len=3"`
	Description string             `json:"description" bson:"description" validate:"required,max=500"`
	Category    ExpenseCategory    `json:"category" bson:"category" validate:"required"`

	// Parent reference - can be either project or task
	ParentID   string     `json:"parent_id" bson:"parent_id" validate:"required"`
	ParentType ParentType `json:"parent_type" bson:"parent_type" validate:"required"`

	// Optional receipt/document reference
	ReceiptURL string `json:"receipt_url,omitempty" bson:"receipt_url,omitempty"`

	// Timestamps
	ExpenseDate time.Time `json:"expense_date" bson:"expense_date" validate:"required"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`

	// User who created the expense
	CreatedBy string `json:"created_by" bson:"created_by"`
}

// ExpenseCreateRequest represents the request structure for creating an expense
type ExpenseCreateRequest struct {
	Amount      float64         `json:"amount" validate:"required,gt=0"`
	Currency    string          `json:"currency" validate:"required,len=3"`
	Description string          `json:"description" validate:"required,max=500"`
	Category    ExpenseCategory `json:"category" validate:"required"`
	ParentID    string          `json:"parent_id" validate:"required"`
	ParentType  ParentType      `json:"parent_type" validate:"required"`
	ReceiptURL  string          `json:"receipt_url,omitempty"`
	ExpenseDate time.Time       `json:"expense_date" validate:"required"`
}

// ExpenseUpdateRequest represents the request structure for updating an expense
type ExpenseUpdateRequest struct {
	Amount      *float64         `json:"amount,omitempty" validate:"omitempty,gt=0"`
	Currency    *string          `json:"currency,omitempty" validate:"omitempty,len=3"`
	Description *string          `json:"description,omitempty" validate:"omitempty,max=500"`
	Category    *ExpenseCategory `json:"category,omitempty"`
	ReceiptURL  *string          `json:"receipt_url,omitempty"`
	ExpenseDate *time.Time       `json:"expense_date,omitempty"`
}

// ExpenseSummary represents aggregated expense data
type ExpenseSummary struct {
	TotalAmount    float64                     `json:"total_amount" bson:"total_amount"`
	Currency       string                      `json:"currency" bson:"currency"`
	ExpenseCount   int64                       `json:"expense_count" bson:"expense_count"`
	CategoryTotals map[ExpenseCategory]float64 `json:"category_totals" bson:"category_totals"`
	ParentID       primitive.ObjectID          `json:"parent_id" bson:"parent_id"`
	ParentType     ParentType                  `json:"parent_type" bson:"parent_type"`
}
