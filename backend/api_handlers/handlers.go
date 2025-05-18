package api_handlers

import (
	"fmt"
	"net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Test!")
}
