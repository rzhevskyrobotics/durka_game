// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 											CONFIG
//
// ----------------------------------------------------------------------------------
//

package config

const (

	// ===========================================================
	// 							TELEGRAM CONFIG
	// ===========================================================
	// 				Бот Durka Game
	//	Токен
	CONFIG_BOT_TOKEN = "CHANGE_ME"

	//Ссылка на бота
	CONFIG_BOT_LINK = "CHANGE_ME"

	// Ссылка на игру (WebApp)
	CONFIG_GAME_LINK = "CHANGE_ME"

	// ===========================================================
	// 							ROUTER CONFIG
	// ===========================================================

	// Режим отладки
	CONFIG_IS_DEBUG = false

	CONFIG_IS_DEBUG_SERVERLESS = true

	// Сервер
	CONFIG_RELEASE_SERVER_PORT          = "CHANGE_ME"
	CONFIG_DEBUG_SERVERLESS_SERVER_PORT = "CHANGE_ME"

	// Печать отладки
	CONFIG_PRINT_LOG      = true
	CONFIG_PRINT_LOG_FILE = true

	// ===========================================================
	// 							DB POSTGRE_SQL CONFIG
	// ===========================================================
	CONFIG_DB_HOST     = "CHANGE_ME"
	CONFIG_DB_PORT     = "CHANGE_ME"
	CONFIG_DB_USER     = "CHANGE_ME"
	CONFIG_DB_NAME     = "CHANGE_ME"
	CONFIG_DB_PASSWORD = "CHANGE_ME"

	CONFIG_DB_IS_DEBUG = false
)
