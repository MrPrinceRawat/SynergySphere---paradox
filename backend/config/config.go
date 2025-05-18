package config

import (
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI  string
	Port      string
	AppName   string
	Debug     bool
	JWTSecret string
}

var (
	config     *Config
	configOnce sync.Once
)

func LoadConfig() *Config {
	configOnce.Do(func() {
		err := godotenv.Load()
		if err != nil {
			log.Println("No .env file found, using system environment variables")
		}

		config = &Config{
			Port:    getEnv("PORT", "8080"),
			AppName: getEnv("APP_NAME", "App"),
			Debug:   getEnv("DEBUG", "false") == "true",
			MongoURI: getEnv(
				"MONGODB_URI",
				"mongodb://localhost:27017/",
			),
			JWTSecret: getEnv("JWT_SECRET", "supersecret"),
		}
	})
	return config
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
