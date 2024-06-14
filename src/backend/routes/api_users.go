// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 								Users (Пути)
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

// Получить всех зарегистрированных пользователей
func Handler_API_Users_GetList(c *gin.Context) {

	list_users := db.DB_GET_Users()

	answer := GetList_Users_Answer{
		ListUsers: list_users,
	}
	Answer_SendObject(c, answer)
	return
}

// Получить общее количество монет в системе
func Handler_API_Users_GeneralCoinsBalance(c *gin.Context) {

	general_coins_balance, _ := db.DB_GET_Users_TotalCoinsBalance()
	general_total_minted_balance, _ := db.DB_GET_Users_TotalMintedBalance()

	answer := GeneralCoinsBalance_Users_Answer{
		GeneralCoinsBalance:       general_coins_balance,
		GeneralTotalMintedBalance: general_total_minted_balance,
	}

	Answer_SendObject(c, answer)
	return
}

// Получить пользователя по Tg ID
func Handler_API_Users_GetObject(c *gin.Context) {

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
			Answer_SendObject(c, user)

		case db.DB_ANSWER_OBJECT_NOT_FOUND:
			Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

		default:
			Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
		}
	}
	return
}

// Получить ТОП игроков
func Handler_API_Users_GetTop(c *gin.Context) {

	list_users_top := db.DB_GET_Users_TOP()
	answer := GetList_Users_Answer{
		ListUsers: list_users_top,
	}

	Answer_SendObject(c, answer)
	return
}

// Обновить данные пользователя
func Handler_API_Users_UpdateObject(c *gin.Context) {

	json_data := new(db.User_UpdateJSON)
	err := c.ShouldBindJSON(&json_data)

	//Проверка, JSON пришел или шляпа
	if err != nil {
		rr_debug.PrintLOG("api_users.go", "Handler_API_Users_UpdateObject", "c.ShouldBindJSON", "Неверные данные в запросе", err.Error())
		if config.CONFIG_IS_DEBUG {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message+" Error: "+err.Error())
		} else {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message)
		}
		return
	}

	db_answer_code := db.DB_UPDATE_User(json_data)
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

// Покупка бустов пользователя
func Handler_API_Users_Purchase(c *gin.Context) {
	json_data := new(Purchase_User_Data)
	err := c.ShouldBindJSON(&json_data)

	//Проверка, JSON пришел или шляпа
	if err != nil {
		rr_debug.PrintLOG("api_users.go", "Handler_API_Users_Purchase", "c.ShouldBindJSON", "Неверные данные в запросе", err.Error())
		if config.CONFIG_IS_DEBUG {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message+" Error: "+err.Error())
		} else {
			Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message)
		}
		return
	}

	user_tg_id, err_convert := strconv.ParseInt(json_data.UserTgID, 10, 64)
	if err_convert != nil {
		rr_debug.PrintLOG("api_users.go", "Handler_API_Users_Purchase", "strconv.ParseInt", "Ошибка конвертации строки в int64", err_convert.Error())
		Answer_BadRequest(c, ANSWER_INVALID_JSON().Code, ANSWER_INVALID_JSON().Message+" Error: "+err_convert.Error())
		return
	}

	db_answer_code := db.DB_UPDATE_User_Purchase(user_tg_id, json_data.PurchaseType)
	switch db_answer_code {
	case db.DB_ANSWER_SUCCESS:
		Answer_OK(c)

	case db.DB_ANSWER_OBJECT_NOT_FOUND:
		Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

	case db.DB_ANSWER_INSUFFICIENT_BALANCE:
		Answer_BadRequest(c, ANSWER_INSUFFICIENT_BALANCE().Code, ANSWER_INSUFFICIENT_BALANCE().Message)

	default:
		Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("general error").Code, ANSWER_DB_GENERAL_ERROR("general error").Message)
	}
	return
}

// Удалить пользователей
func Handler_API_Users_DeleteObject(c *gin.Context) {
	tg_id := c.Param("tgid")

	if tg_id != "-1" {

		tg_id_int64, err := strconv.ParseInt(tg_id, 10, 64)
		if err != nil {
			Answer_BadRequest(c, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Code, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Message)
			return
		}

		db_answer_code := db.DB_DELETE_User_BY_UserTgID(tg_id_int64)

		switch db_answer_code {
		case db.DB_ANSWER_SUCCESS:
			Answer_OK(c)

		case db.DB_ANSWER_OBJECT_NOT_FOUND:
			Answer_NotFound(c, ANSWER_OBJECT_NOT_FOUND().Code, ANSWER_OBJECT_NOT_FOUND().Message)

		default:
			Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("").Code, ANSWER_DB_GENERAL_ERROR("").Message)
		}
	} else {
		db.DB_DELETE_Users()
		Answer_OK(c)
	}
	return
}

// Обнулить монеты пользователей
func Handler_API_Users_All_ClearCoinsBalance(c *gin.Context) {

	db_answer_code := db.DB_UPDATE_Users_CoinsBalance_ZERO()

	switch db_answer_code {
	case db.DB_ANSWER_SUCCESS:
		Answer_OK(c)
	default:
		Answer_BadRequest(c, ANSWER_DB_GENERAL_ERROR("").Code, ANSWER_DB_GENERAL_ERROR("").Message)
	}
	return
}
