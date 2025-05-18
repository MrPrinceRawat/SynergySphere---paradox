package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	cfg := config.LoadConfig()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB server
	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}
	defer func() {
		if err = client.Disconnect(ctx); err != nil {
			log.Fatal(err)
		}
	}()

	// Ping MongoDB
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Ping failed:", err)
	}
	fmt.Println("Connected to MongoDB")

	// Database name
	db := client.Database("SYSPH")

	// Explicitly create collections
	collectionsToCreate := []string{"users", "projects", "tasks"}

	for _, collName := range collectionsToCreate {
		err := db.CreateCollection(ctx, collName)
		if err != nil {
			// Ignore error if collection exists
			cmdErr, ok := err.(mongo.CommandError)
			if !ok || cmdErr.Code != 48 {
				log.Fatalf("Failed to create collection %s: %v", collName, err)
			}
		} else {
			fmt.Printf("Created collection: %s\n", collName)
		}
	}

	// Create indexes for "users" collection
	usersCol := db.Collection("users")

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}}, // ascending index on username
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}}, // ascending index on email
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "created_at", Value: 1}},
		},
	}

	indexNames, err := usersCol.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		log.Fatalf("Failed to create indexes for users: %v", err)
	}
	fmt.Printf("Created indexes on users: %v\n", indexNames)

	// For "projects", an index on project_id and project_name
	projectsCol := db.Collection("projects")
	projectIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "project_id", Value: 1}}, // ascending index on project_name
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "project_name", Value: 1}}, // ascending index on name
		},
	}

	projIndexNames, err := projectsCol.Indexes().CreateMany(ctx, projectIndexes)
	if err != nil {
		log.Fatalf("Failed to create indexes for projects: %v", err)
	}
	fmt.Printf("Created indexes on projects: %v\n", projIndexNames)

	// For "tasks", an index on task_id and task_name
	tasksCol := db.Collection("tasks")
	taskIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "task_id", Value: 1}}, // ascending index on task_name
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "task_name", Value: 1}}, // ascending index on name
		},
	}

	taskIndexNames, err := tasksCol.Indexes().CreateMany(ctx, taskIndexes)
	if err != nil {
		log.Fatalf("Failed to create indexes for tasks: %v", err)
	}
	fmt.Printf("Created indexes on tasks: %v\n", taskIndexNames)

	fmt.Println("MongoDB setup completed successfully!")
}
