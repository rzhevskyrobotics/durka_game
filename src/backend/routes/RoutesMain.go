// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 								Routes (Пути)
//
// ----------------------------------------------------------------------------------
//

package routes

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"
	"rr/agavadurkatestbot/db"
	"rr/agavadurkatestbot/middleware"
	"rr/agavadurkatestbot/rr_debug"
	"strconv"

	//Сторонние библиотеки
	"github.com/gin-gonic/gin"
	"github.com/go-telegram/bot"

	//Системные пакеты
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
)

// Инициализация роутера
func RunRouter() {

	// ЛОГ ФАЙЛ, если у нас не отладка
	if !config.CONFIG_IS_DEBUG {
		// Disable Console Color, you don't need console color when writing the logs to file.
		gin.DisableConsoleColor()

		// Logging to a file.
		f, _ := os.Create("gin_server.log")
		gin.DefaultWriter = io.MultiWriter(f)
	}

	//Создаем роутер для обработки запросов
	r := gin.Default()

	// //Раздача статики для дебаг-версии
	if config.CONFIG_IS_DEBUG_SERVERLESS {
		r.Static("/assets", "./assets") //Для статики в режиме отладки
		//Загружаем HTML
		r.LoadHTMLGlob("assets/html/*")
	} else {
		//Загружаем HTML
		r.LoadHTMLGlob("static/assets/html/*")
	}

	//CORS
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.NoCacheMiddleware())

	//
	// 	   --------- Пути ---------
	// 	Реализацию путей см. routes.go
	//

	//
	// Пути общие
	//

	// Основные пути
	r.GET("/", Handler_Index)
	r.GET("/app-panel", Handler_AdminPanel)
	r.GET("/users-list", Handler_UsersList)
	r.GET("/get_invite_link", Handler_InviteLink_SendBot)

	//
	// Пути API
	//

	api := r.Group("/api")
	{
		// Users - пользователи
		users := api.Group("/users")
		{
			users.GET("/", Handler_API_Users_GetList)
			users.GET("/general-coins-balance", Handler_API_Users_GeneralCoinsBalance)
			users.GET("/object", Handler_API_Users_GetObject)
			users.GET("/top", Handler_API_Users_GetTop)
			users.PUT("/game-sync", Handler_API_Users_UpdateObject)
			users.PUT("/purchase", Handler_API_Users_Purchase)
			users.DELETE("/:tgid", Handler_API_Users_DeleteObject)
			users.DELETE("/all-coins-balance", Handler_API_Users_All_ClearCoinsBalance)
		}

		// HandsLevels - уровни
		hands_levels := api.Group("/hands_levels")
		{
			hands_levels.GET("/", Handler_API_HandsLevels_Get)
			hands_levels.GET("/object", Handler_API_HandsLevels_GetObject)
			hands_levels.PUT("/", Handler_API_HandsLevels_UpdateObject)
		}

		// DurationLevels - уровни
		duration_level := api.Group("/duration_levels")
		{
			duration_level.GET("/", Handler_API_DurationLevels_Get)
			duration_level.GET("/object", Handler_API_DurationLevels_GetObject)
			duration_level.PUT("/", Handler_API_DurationLevels_UpdateObject)
		}

		// SystemSettings - настройки
		system_settings := api.Group("/system_settings")
		{
			system_settings.GET("/", Handler_API_SystemSettings_Get)
			system_settings.PUT("/", Handler_API_SystemSettings_UpdateObject)
			system_settings.GET("/reset", Handler_API_SystemSettings_Reset_Get)
		}

		info := api.Group("/info")
		{
			info.GET("/get-start-params", Handler_API_Info_GetStartParams)
		}
	}

	//Запуск сервера
	if config.CONFIG_IS_DEBUG_SERVERLESS {
		r.Run(":" + config.CONFIG_DEBUG_SERVERLESS_SERVER_PORT)
	} else {
		r.Run(":" + config.CONFIG_RELEASE_SERVER_PORT)
	}
}

// Вывод отладочного сообщения В КОНСОЛЬ, если у нас отладка
func LOG(message string) {
	fmt.Println("[DEBUG]: " + message)
}

func Handler_Index(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{})
}

func Handler_AdminPanel(c *gin.Context) {
	c.HTML(http.StatusOK, "app_panel.html", gin.H{})
}

func Handler_UsersList(c *gin.Context) {
	c.HTML(http.StatusOK, "users_list.html", gin.H{})
}

func Handler_InviteLink_SendBot(c *gin.Context) {

	var message_text string

	user_tg_id := c.Query("user_tg_id")

	tg_id_int64, err := strconv.ParseInt(user_tg_id, 10, 64)
	if err != nil {
		Answer_BadRequest(c, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Code, ANSWER_INVALID_STRING_TO_INT_CONVERSION().Message)
		return
	}

	db_answer_code, user := db.DB_GET_User_BY_TgID(tg_id_int64)
	if db_answer_code == db.DB_ANSWER_SUCCESS {
		ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
		defer cancel()

		opts := []bot.Option{}

		b, err := bot.New(config.CONFIG_BOT_TOKEN, opts...)
		if err != nil {
			rr_debug.PrintLOG("RoutesMain.go", "Handler_InviteLink_SendBot", "gotgbot.NewBot", "Ошибка инициализации бота", err.Error())
		}

		invite_link := config.CONFIG_BOT_LINK + "?start=" + user.InvitedHash

		if user.Language == "eng" {
			message_text = "Your referal link: " + invite_link
		} else {
			message_text = "Ваша реферальная ссылка: " + invite_link
		}

		b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: tg_id_int64,
			Text:   message_text,
		})
	}
}
