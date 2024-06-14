// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 								DurationLevels (Пути)
//
// ----------------------------------------------------------------------------------
//

package routes

import (

	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"
	"rr/agavadurkatestbot/db"
	"rr/agavadurkatestbot/rr_debug"

	//Сторонние библиотеки
	"github.com/gin-gonic/gin"

	//Системные пакеты
	"strconv"
)

// Получить все уровни DurationLevels
func Handler_API_DurationLevels_Get(c *gin.Context) {

	list_duration_levels := db.DB_GET_DurationLevels()
	answer := GetList_DurationLevels_Answer{
		ListDurationLevels: list_duration_levels,
	}
	Answer_SendObject(c, answer)
	return
}

// Получить уровень по номеру
func Handler_API_DurationLevels_GetObject(c *gin.Context) {

	number := c.Query("number")

	if number == "" {
		Answer_BadRequest(c, ANSWER_EMPTY_FIELDS().Code, ANSWER_EMPTY_FIELDS().Message)
	} else {
		number_int64, err := strconv.ParseInt(number, 10, 64)
		if err != nil {
			Answer_BadRequest(c, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Code, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Message)
			return
		}

		db_answer_code, duration_level := db.DB_GET_DurationLevel_BY_Number(int(number_int64))

		switch db_answer_code {
		case db.DB_ANSWER_SUCCESS:
			Answer_SendObject(c, duration_level)

		case db.DB_ANSWER_OBJECT_NOT_FOUND:
			Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

		default:
			Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
		}
	}
	return
}

// Обновить данные уровня
func Handler_API_DurationLevels_UpdateObject(c *gin.Context) {

	json_data := new(db.DurationLevel_UpdateJSON)
	err := c.ShouldBindJSON(&json_data)

	//Проверка, JSON пришел или шляпа
	if err != nil {
		rr_debug.PrintLOG("api_duration_levels.go", "Handler_API_DurationLevels_UpdateObject", "c.ShouldBindJSON", "Неверные данные в запросе", err.Error())
		if config.CONFIG_IS_DEBUG {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message+" Error: "+err.Error())
		} else {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message)
		}
		return
	}

	db_answer_code := db.DB_UPDATE_DurationLevel(json_data)

	switch db_answer_code {
	case db.DB_ANSWER_SUCCESS:
		Answer_OK(c)

	case db.DB_ANSWER_OBJECT_NOT_FOUND:
		Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

	default:
		Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
	}
	return
}
