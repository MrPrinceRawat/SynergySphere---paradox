package utils

import (
	"context"
	"log"
	"time"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var UserCollection *mongo.Collection
var ProjectCollection *mongo.Collection
var TaskCollection *mongo.Collection
var ExpensesCollection *mongo.Collection

func InitMongo(cfg *config.Config) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(cfg.MongoURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal(err)
	}

	UserCollection = client.Database("SYSPH").Collection("users")
	ProjectCollection = client.Database("SYSPH").Collection("projects")
	TaskCollection = client.Database("SYSPH").Collection("tasks")
	ExpensesCollection = client.Database("SYSPH").Collection("expenses")
}
