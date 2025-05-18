package api_handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/config"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/logger"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/models"
	"github.com/MrPrinceRawat/SynergySphere---paradox/backend/utils"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func Signup(w http.ResponseWriter, r *http.Request) {
	var user models.User
	json.NewDecoder(r.Body).Decode(&user)

	// Missing fields check
	if user.Username == "" || user.Password == "" || user.Name == "" || user.Email == "" {
		http.Error(w, "Missing fields", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)

	_, err := utils.UserCollection.InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "User already exists", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func Login(w http.ResponseWriter, r *http.Request) {
	cfg := config.LoadConfig()

	var creds models.Login
	json.NewDecoder(r.Body).Decode(&creds)

	var result models.Login
	err := utils.UserCollection.FindOne(context.Background(), bson.M{"username": creds.Username}).Decode(&result)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": creds.Username,
		"exp":      time.Now().Add(time.Hour * 2).Unix(),
	})

	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		logger.Logger.Error(err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	logger.Logger.Info(tokenString)
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}
