// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 							NoCache Middleware
//
// ----------------------------------------------------------------------------------
//

package middleware

import (
	//Сторонние библиотеки
	"github.com/gin-gonic/gin"
)

//
// ----------------------------------------------------------------------------------
//
// 											MAIN
//
// ----------------------------------------------------------------------------------
//

func NoCacheMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate") // HTTP 1.1.
		c.Writer.Header().Set("Pragma", "no-cache")                                   // HTTP 1.0.
		c.Writer.Header().Set("Expires", "0")                                         // Proxies.

		c.Next()
	}
}
