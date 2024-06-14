// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 								SystemSettings (Пути)
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
)

// Получить все настройки
func Handler_API_SystemSettings_Get(c *gin.Context) {

	db_answer_code, systemSettings := db.DB_GET_SystemSetting_First()

	switch db_answer_code {
	case db.DB_ANSWER_SUCCESS:
		Answer_SendObject(c, systemSettings)

	case db.DB_ANSWER_OBJECT_NOT_FOUND:
		Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

	default:
		Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
	}
	return
}

// Обновить настройки
func Handler_API_SystemSettings_UpdateObject(c *gin.Context) {

	json_data := new(db.SystemSetting_UpdateJSON)
	err := c.ShouldBindJSON(&json_data)

	//Проверка, JSON пришел или шляпа
	if err != nil {
		rr_debug.PrintLOG("api_system_settings.go", "Handler_API_SystemSettings_UpdateObject", "c.ShouldBindJSON", "Неверные данные в запросе", err.Error())
		if config.CONFIG_IS_DEBUG {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message+" Error: "+err.Error())
		} else {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message)
		}
		return
	}

	db_answer_code := db.DB_UPDATE_SystemSetting(json_data)

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

// Сбросить настройки
func Handler_API_SystemSettings_Reset_Get(c *gin.Context) {

	db_answer_code_del := db.DB_DELETE_SystemSettings()

	switch db_answer_code_del {
	case db.DB_ANSWER_SUCCESS:
		db_answer_code_create := db.DB_CREATE_SystemSetting()

		switch db_answer_code_create {
		case db.DB_ANSWER_SUCCESS:
			Answer_OK(c)

		default:
			Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
		}

	default:
		Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
	}
	return
}
