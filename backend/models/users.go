package models

type Login struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	// Auth
	Username string `bson:"username"`
	Password string `bson:"password"`

	// Profile
	Name   string `bson:"name"`
	Email  string `bson:"email"`
	Avatar string `bson:"avatar"`
}
