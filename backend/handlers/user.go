package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/models"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
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
