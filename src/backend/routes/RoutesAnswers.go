// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 						JSON Answers (Стандартные ответы)
//
// ----------------------------------------------------------------------------------
//

package routes

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"

	//Сторонние библиотеки
	"github.com/gin-gonic/gin"

	//Системные пакеты
	"net/http"
)

// Структура для ответов движка
type EngineAnswer struct {
	Code    int
	Message string
}

// ----------------------------------
// СТАНДАРТНЫЕ ОТВЕТЫ, версия 11_2020
// ----------------------------------
func ANSWER_OK() EngineAnswer {
	return EngineAnswer{
		Code:    0,
		Message: "OK",
	}
}

func ANSWER_OBJECT_EXISTS() EngineAnswer {
	return EngineAnswer{
		Code:    1,
		Message: "Object exists",
	}
}

func ANSWER_OBJECT_NOT_FOUND() EngineAnswer {
	return EngineAnswer{
		Code:    2,
		Message: "Object not found",
	}
}

func ANSWER_INVALID_JSON() EngineAnswer {
	return EngineAnswer{
		Code:    3,
		Message: "Invalid JSON",
	}
}

func ANSWER_EMPTY_FIELDS() EngineAnswer {
	return EngineAnswer{
		Code:    4,
		Message: "Empty fields",
	}
}

func ANSWER_UNEXPECTED_ERROR() EngineAnswer {
	return EngineAnswer{
		Code:    5,
		Message: "Unexpected error",
	}
}

func ANSWER_INVALID_CREDENTIALS() EngineAnswer {
	return EngineAnswer{
		Code:    6,
		Message: "Invalid credentials",
	}
}

func ANSWER_LOGIN_REQUIRED() EngineAnswer {
	return EngineAnswer{
		Code:    7,
		Message: "Login required",
	}
}

func ANSWER_PERMISSION_DENIED() EngineAnswer {
	return EngineAnswer{
		Code:    8,
		Message: "Permission denied (no authority)",
	}
}

func ANSWER_FILE_ERROR_TOO_LARGE() EngineAnswer {
	return EngineAnswer{
		Code:    9,
		Message: "File too large",
	}
}

func ANSWER_FILE_ERROR_INVALID_TYPE() EngineAnswer {
	return EngineAnswer{
		Code:    10,
		Message: "Invalid file type",
	}
}

// ----------------------------------
// Кастомные ответы
// ----------------------------------
func ANSWER_INVALID_SESSION() EngineAnswer {
	return EngineAnswer{
		Code:    500,
		Message: "Invalid session",
	}
}

// Пользователь не активирован
func ANSWER_USER_IS_NOT_ACTIVATED() EngineAnswer {
	return EngineAnswer{
		Code:    501,
		Message: "The user is not activated",
	}
}

// Ошибка загрузки файла
func ANSWER_INVALID_FILE_UPLOAD() EngineAnswer {
	return EngineAnswer{
		Code:    502,
		Message: "Invalid file upload",
	}
}

// Ошибка конвертации из JSON в строку
func ANSWER_INVALID_JSON_TO_STRING_CONVERSION() EngineAnswer {
	return EngineAnswer{
		Code:    503,
		Message: "Invalid JSON to string conversion",
	}
}

// Ошибка конвертации из строки в JSON
func ANSWER_INVALID_STRING_TO_JSON_CONVERSION() EngineAnswer {
	return EngineAnswer{
		Code:    504,
		Message: "Invalid string to JSON conversion",
	}
}

// Ошибка конвертации из строки в дробь
func ANSWER_INVALID_STRING_TO_FLOAT_CONVERSION() EngineAnswer {
	return EngineAnswer{
		Code:    505,
		Message: "Invalid string to float conversion",
	}
}

// Ошибка конвертации из строки в дату
func ANSWER_INVALID_STRING_TO_DATE_CONVERSION() EngineAnswer {
	return EngineAnswer{
		Code:    506,
		Message: "Invalid string to date conversion",
	}
}

// Ошибка конвертации из строки в число
func ANSWER_INVALID_STRING_TO_INT_CONVERSION() EngineAnswer {
	return EngineAnswer{
		Code:    507,
		Message: "Invalid string to int64 conversion",
	}
}

// Неверная команда
func ANSWER_INVALID_COMMAND() EngineAnswer {
	return EngineAnswer{
		Code:    510,
		Message: "Invalid command",
	}
}

// Недостаточно средств для покупки
func ANSWER_INSUFFICIENT_BALANCE() EngineAnswer {
	return EngineAnswer{
		Code:    511,
		Message: "Insufficient Balance",
	}
}

// Общая ошибка в БД
func ANSWER_DB_GENERAL_ERROR(message string) EngineAnswer {
	return EngineAnswer{
		Code:    602,
		Message: message,
	}
}

//
// Успешные ответы
//

// Успешно создали новый объект
func Answer_SendObjectID(c *gin.Context, new_object_id uint) {
	c.JSON(http.StatusOK, gin.H{
		"status": gin.H{
			"code":    ANSWER_OK().Code,
			"message": ANSWER_OK().Message,
		},
		"data": gin.H{
			"id": new_object_id,
		},
	})
}

// Показать объет
func Answer_SendObject(c *gin.Context, object interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"status": gin.H{
			"code":    ANSWER_OK().Code,
			"message": ANSWER_OK().Message,
		},
		"data": object,
	})
}

// Отдать строку
func Answer_SendString(c *gin.Context, str string) {
	c.JSON(http.StatusOK, gin.H{
		"status": gin.H{
			"code":    ANSWER_OK().Code,
			"message": ANSWER_OK().Message,
		},
		"data": str,
	})
}

// 200 - Успешный запрос
func Answer_OK(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": gin.H{
			"code":    ANSWER_OK().Code,
			"message": ANSWER_OK().Message,
		},
		"data": nil,
	})
}

// Отдать файл
func Answer_File(c *gin.Context, filepath string) {
	if config.CONFIG_IS_DEBUG_SERVERLESS {
		//Отдать через внутренний сервер
		//Убираем / в начале
		// relative_path := filepath[:1]
		// log.Println(filepath[1:])
		c.File(filepath[1:])
	} else {
		//Отдать через NGINX X-Accel
		c.Writer.Header().Set("X-Accel-Redirect", filepath)
		c.String(http.StatusOK, "OK")
	}
}

//
// Ответы с ошибкой
//

// 403 Forbidden - запрещено (не уполномочен)
func Answer_Forbidden(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusForbidden, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}

// 404 Not Found - объект не найден
func Answer_NotFound(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusNotFound, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}

// 400 Bad Request - ошибка в запросе
func Answer_BadRequest(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}

// 401 Unauth - неверная авторизация
func Answer_Unauthorized(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}

// 429 Too Many Requests - множество запросов в единицу времени
func Answer_TooManyRequests(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusTooManyRequests, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}

// 500 Internal Server Error - ошибка на сервере
func Answer_InternalServerError(c *gin.Context, error_code int, error_message string) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"status": gin.H{
			"code":    error_code,
			"message": error_message,
		},
		"data": nil,
	})
}
