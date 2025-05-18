package logger

import (
	"sync"

	"go.uber.org/zap"
)

var (
	Logger *zap.SugaredLogger
	once   sync.Once
)

func Init() {
	once.Do(func() {
		var err error
		raw, _ := zap.NewDevelopment()
		Logger = raw.Sugar()
		if err != nil {
			panic(err)
		}
	})
}
