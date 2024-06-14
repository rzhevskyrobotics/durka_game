// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 									Info (Пути)
//
// ----------------------------------------------------------------------------------
//

package routes

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/db"

	//Сторонние библиотеки
	"github.com/gin-gonic/gin"

	//Системные пакеты
	"strconv"
)

// Получить все необходимые данные
func Handler_API_Info_GetStartParams(c *gin.Context) {

	user_tg_id := c.Query("user_tg_id")

	if user_tg_id == "" {
		Answer_BadRequest(c, ANSWER_EMPTY_FIELDS().Code, ANSWER_EMPTY_FIELDS().Message)
	} else {

		tg_id_int64, err := strconv.ParseInt(user_tg_id, 10, 64)
		if err != nil {
			Answer_BadRequest(c, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Code, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Message)
			return
		}

		db_answer_code, user := db.DB_GET_User_BY_TgID(tg_id_int64)

		switch db_answer_code {
		case db.DB_ANSWER_SUCCESS:

			list_duration_levels := db.DB_GET_DurationLevels()
			list_hands_levels := db.DB_GET_HandsLevels()
			_, systemSettings := db.DB_GET_SystemSetting_First()
			list_users_top := db.DB_GET_Users_TOP()

			answer := Info_GetStartParams_Answer{
				UserData:           user,
				HandsLevelsData:    list_hands_levels,
				DurationLevelsData: list_duration_levels,
				TopUsers:           list_users_top,
				SystemSettingsData: systemSettings,
			}

			Answer_SendObject(c, answer)

		case db.DB_ANSWER_OBJECT_NOT_FOUND:
			Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

		default:
			Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
		}
	}
	return
}
