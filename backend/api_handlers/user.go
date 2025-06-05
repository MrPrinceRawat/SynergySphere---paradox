package api_handlers

import (
	"encoding/json"
	"net/http"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/models"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetUser(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	user := models.User{}
	err := utils.UserCollection.FindOne(r.Context(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	user.Password = ""

	json.NewEncoder(w).Encode(user)
}

// Filter Users by partial username
func FindUser(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	// Project only the username field
	projection := bson.M{
		"username": 1,
		"_id":      0, // Optionally exclude the _id field
	}

	// Find users matching the username regex, only returning usernames
	cursor, err := utils.UserCollection.Find(
		r.Context(),
		bson.M{"username": bson.M{"$regex": username}},
		options.Find().SetProjection(projection),
	)
	if err != nil {
		http.Error(w, "Users not found", http.StatusNotFound)
		return
	}
	defer cursor.Close(r.Context())

	// Temporary struct to decode username only
	var results []struct {
		Username string `bson:"username" json:"username"`
	}

	if err := cursor.All(r.Context(), &results); err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}

	// Extract usernames into a simple string slice
	usernames := make([]string, len(results))
	for i, u := range results {
		usernames[i] = u.Username
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usernames)
}
