package api_handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/logger"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/models"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateExpense creates a new expense
func CreateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.ExpenseCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value("username").(string)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	if strings.Split(req.ParentID, "_")[0] == "tasks" {
		err := utils.TaskCollection.FindOne(r.Context(), bson.M{"task_id": req.ParentID}).Err()
		if err != nil {
			http.Error(w, "Task not found", http.StatusNotFound)
			return
		}
	} else {
		err := utils.ProjectCollection.FindOne(r.Context(), bson.M{"project_id": req.ParentID}).Err()
		if err != nil {
			logger.Logger.Error(err)
			http.Error(w, "Project not found", http.StatusNotFound)
			return
		}
	}

	expense := models.Expense{
		ID:          primitive.NewObjectID(),
		Amount:      req.Amount,
		Currency:    req.Currency,
		Description: req.Description,
		Category:    req.Category,
		ParentID:    req.ParentID,
		ParentType:  req.ParentType,
		ReceiptURL:  req.ReceiptURL,
		ExpenseDate: req.ExpenseDate,
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := utils.ExpensesCollection.InsertOne(ctx, expense)
	if err != nil {
		http.Error(w, "Failed to create expense", http.StatusInternalServerError)
		return
	}

	// Update the project/task spend
	if strings.Split(expense.ParentID, "_")[0] == "project" {
		projectID := expense.ParentID
		project := models.Project{}
		err = utils.ProjectCollection.FindOne(ctx, bson.M{"project_id": projectID}).Decode(&project)
		if err != nil {
			http.Error(w, "Failed to get project", http.StatusInternalServerError)
			return
		}
		project.Spend += expense.Amount
		_, err = utils.ProjectCollection.UpdateOne(ctx, bson.M{"project_id": projectID}, bson.M{"$set": project})
		if err != nil {
			http.Error(w, "Failed to update project", http.StatusInternalServerError)
			return
		}
	} else {
		taskID := expense.ParentID
		task := models.Task{}
		err = utils.TaskCollection.FindOne(ctx, bson.M{"task_id": taskID}).Decode(&task)
		if err != nil {
			http.Error(w, "Failed to get task", http.StatusInternalServerError)
			return
		}
		task.Spend += expense.Amount
		_, err = utils.TaskCollection.UpdateOne(ctx, bson.M{"task_id": taskID}, bson.M{"$set": task})
		if err != nil {
			http.Error(w, "Failed to update task", http.StatusInternalServerError)
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusCreated, expense)
}

// GetExpense retrieves a specific expense
func GetExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	expenseID := vars["id"]

	objID, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var expense models.Expense
	err = utils.ExpensesCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&expense)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.RespondWithError(w, http.StatusNotFound, "Expense not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expense")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, expense)
}

// UpdateExpense updates an existing expense
func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	expenseID := vars["id"]

	objID, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	var req models.ExpenseUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	username, ok := r.Context().Value("username").(string)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if expense exists and user owns it
	var expense models.Expense
	err = utils.ExpensesCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&expense)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.RespondWithError(w, http.StatusNotFound, "Expense not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expense")
		return
	}

	// Check ownership
	if expense.CreatedBy != username {
		utils.RespondWithError(w, http.StatusForbidden, "Unauthorized to update this expense")
		return
	}

	// Build update document
	update := bson.M{"$set": bson.M{"updated_at": time.Now()}}

	if req.Amount != nil {
		update["$set"].(bson.M)["amount"] = *req.Amount
	}
	if req.Currency != nil {
		update["$set"].(bson.M)["currency"] = *req.Currency
	}
	if req.Description != nil {
		update["$set"].(bson.M)["description"] = *req.Description
	}
	if req.Category != nil {
		update["$set"].(bson.M)["category"] = *req.Category
	}
	if req.ReceiptURL != nil {
		update["$set"].(bson.M)["receipt_url"] = *req.ReceiptURL
	}
	if req.ExpenseDate != nil {
		update["$set"].(bson.M)["expense_date"] = *req.ExpenseDate
	}

	_, err = utils.ExpensesCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to update expense")
		return
	}

	// Get updated expense
	err = utils.ExpensesCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&expense)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get updated expense")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, expense)
}

// DeleteExpense deletes an expense
func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	expenseID := vars["id"]

	objID, err := primitive.ObjectIDFromHex(expenseID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid expense ID")
		return
	}

	username, ok := r.Context().Value("username").(string)
	if !ok {
		utils.RespondWithError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if expense exists and user owns it
	var expense models.Expense
	err = utils.ExpensesCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&expense)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.RespondWithError(w, http.StatusNotFound, "Expense not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expense")
		return
	}

	// Check ownership
	if expense.CreatedBy != username {
		utils.RespondWithError(w, http.StatusForbidden, "Unauthorized to delete this expense")
		return
	}

	_, err = utils.ExpensesCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to delete expense")
		return
	}

	// Update the project/task spend
	if strings.Split(expense.ParentID, "_")[0] == "project" {
		projectID := expense.ParentID
		project := models.Project{}
		err = utils.ProjectCollection.FindOne(ctx, bson.M{"project_id": projectID}).Decode(&project)
		if err != nil {
			http.Error(w, "Failed to get project", http.StatusInternalServerError)
			return
		}
		project.Spend -= expense.Amount
		_, err = utils.ProjectCollection.UpdateOne(ctx, bson.M{"project_id": projectID}, bson.M{"$set": project})
		if err != nil {
			http.Error(w, "Failed to update project", http.StatusInternalServerError)
			return
		}
	} else {
		taskID := expense.ParentID
		task := models.Task{}
		err = utils.TaskCollection.FindOne(ctx, bson.M{"task_id": taskID}).Decode(&task)
		if err != nil {
			http.Error(w, "Failed to get task", http.StatusInternalServerError)
			return
		}
		task.Spend -= expense.Amount
		_, err = utils.TaskCollection.UpdateOne(ctx, bson.M{"task_id": taskID}, bson.M{"$set": task})
		if err != nil {
			http.Error(w, "Failed to update task", http.StatusInternalServerError)
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Expense deleted successfully"})
}

// GetExpenses retrieves expenses with filtering and pagination
func GetExpenses(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	query := r.URL.Query()
	filter := bson.M{}

	if parentID := query.Get("parent_id"); parentID != "" {
		filter["parent_id"] = parentID
	}

	if parentType := query.Get("parent_type"); parentType != "" {
		filter["parent_type"] = parentType
	}

	if category := query.Get("category"); category != "" {
		filter["category"] = category
	}

	if currency := query.Get("currency"); currency != "" {
		filter["currency"] = currency
	}

	if minAmount := query.Get("min_amount"); minAmount != "" {
		if amount, err := strconv.ParseFloat(minAmount, 64); err == nil {
			if filter["amount"] == nil {
				filter["amount"] = bson.M{}
			}
			filter["amount"].(bson.M)["$gte"] = amount
		}
	}

	if maxAmount := query.Get("max_amount"); maxAmount != "" {
		if amount, err := strconv.ParseFloat(maxAmount, 64); err == nil {
			if filter["amount"] == nil {
				filter["amount"] = bson.M{}
			}
			filter["amount"].(bson.M)["$lte"] = amount
		}
	}

	// Parse pagination
	page := 1
	if p := query.Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	limit := 20
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total count
	total, err := utils.ExpensesCollection.CountDocuments(ctx, filter)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to count expenses")
		return
	}

	// Get expenses with pagination
	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{"expense_date", -1}, {"created_at", -1}})

	cursor, err := utils.ExpensesCollection.Find(ctx, filter, opts)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expenses")
		return
	}
	defer cursor.Close(ctx)

	var expenses []models.Expense
	if err = cursor.All(ctx, &expenses); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode expenses")
		return
	}

	response := map[string]interface{}{
		"data": expenses,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	}

	utils.RespondWithJSON(w, http.StatusOK, response)
}

// GetExpenseSummary retrieves expense summary for a parent
func GetExpenseSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	query := r.URL.Query()
	parentIDStr := query.Get("parent_id")
	parentType := query.Get("parent_type")

	if parentIDStr == "" || parentType == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "parent_id and parent_type are required")
		return
	}

	parentID, err := primitive.ObjectIDFromHex(parentIDStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid parent_id")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Aggregation pipeline for summary
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"parent_id":   parentID,
				"parent_type": parentType,
			},
		},
		{
			"$group": bson.M{
				"_id": bson.M{
					"parent_id":   "$parent_id",
					"parent_type": "$parent_type",
					"currency":    "$currency",
				},
				"total_amount":  bson.M{"$sum": "$amount"},
				"expense_count": bson.M{"$sum": 1},
				"category_totals": bson.M{
					"$push": bson.M{
						"category": "$category",
						"amount":   "$amount",
					},
				},
			},
		},
	}

	cursor, err := utils.ExpensesCollection.Aggregate(ctx, pipeline)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expense summary")
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode summary")
		return
	}

	if len(results) == 0 {
		summary := models.ExpenseSummary{
			TotalAmount:    0,
			Currency:       "USD",
			ExpenseCount:   0,
			CategoryTotals: make(map[models.ExpenseCategory]float64),
			ParentID:       parentID,
			ParentType:     models.ParentType(parentType),
		}
		utils.RespondWithJSON(w, http.StatusOK, summary)
		return
	}

	result := results[0]

	// Process category totals
	categoryTotals := make(map[models.ExpenseCategory]float64)
	if categories, ok := result["category_totals"].([]interface{}); ok {
		for _, cat := range categories {
			if catMap, ok := cat.(bson.M); ok {
				category := models.ExpenseCategory(catMap["category"].(string))
				amount := catMap["amount"].(float64)
				categoryTotals[category] += amount
			}
		}
	}

	summary := models.ExpenseSummary{
		TotalAmount:    result["total_amount"].(float64),
		Currency:       result["_id"].(bson.M)["currency"].(string),
		ExpenseCount:   result["expense_count"].(int64),
		CategoryTotals: categoryTotals,
		ParentID:       parentID,
		ParentType:     models.ParentType(parentType),
	}

	utils.RespondWithJSON(w, http.StatusOK, summary)
}

// GetExpensesByProject retrieves all expenses for a specific project
func GetExpensesByProject(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	projectID := vars["project_id"]

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"parent_id": projectID,
	}

	cursor, err := utils.ExpensesCollection.Find(ctx, filter, options.Find().SetSort(bson.D{{"expense_date", -1}}))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get project expenses")
		return
	}
	defer cursor.Close(ctx)

	var expenses []models.Expense
	if err = cursor.All(ctx, &expenses); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode expenses")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, expenses)
}

// GetExpensesByTask retrieves all expenses for a specific task
func GetExpensesByTask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	taskID := vars["task_id"]

	objID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"parent_id":   objID,
		"parent_type": "task",
	}

	cursor, err := utils.ExpensesCollection.Find(ctx, filter, options.Find().SetSort(bson.D{{"expense_date", -1}}))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get task expenses")
		return
	}
	defer cursor.Close(ctx)

	var expenses []models.Expense
	if err = cursor.All(ctx, &expenses); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode expenses")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, expenses)
}

func GetExpensesForUserProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get userID from context, header, or query (depends on your auth setup)
	userID := r.Context().Value("username").(string)
	// example, adapt as needed
	if userID == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "User ID missing")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Step 1: Fetch all project IDs the user is part of
	var userProjectIDs []string
	projectFilter := bson.M{"members": userID} // assuming 'members' is a field listing user IDs
	cursor, err := utils.ProjectCollection.Find(ctx, projectFilter)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get user projects")
		return
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var project models.Project
		if err := cursor.Decode(&project); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode project")
			return
		}
		userProjectIDs = append(userProjectIDs, project.ProjectID) // assuming project.ID is an ObjectID
	}

	if len(userProjectIDs) == 0 {
		// No projects found, return empty list
		utils.RespondWithJSON(w, http.StatusOK, []models.Expense{})
		return
	}

	// Step 2: Find expenses for those projects
	expenseFilter := bson.M{
		"parent_id": bson.M{"$in": userProjectIDs},
	}

	expenseCursor, err := utils.ExpensesCollection.Find(ctx, expenseFilter, options.Find().SetSort(bson.D{{"expense_date", -1}}))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to get expenses")
		return
	}
	defer expenseCursor.Close(ctx)

	var expenses []models.Expense
	if err := expenseCursor.All(ctx, &expenses); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to decode expenses")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, expenses)
}
