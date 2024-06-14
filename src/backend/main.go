// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 											MAIN
//
// ----------------------------------------------------------------------------------
//

package main

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"
	"rr/agavadurkatestbot/db"
	"rr/agavadurkatestbot/routes"
	"rr/agavadurkatestbot/rr_debug"

	//Сторонние библиотеки
	"github.com/go-telegram/bot"

	//Системные пакеты
	"context"
	"os"
	"os/signal"
)

func main() {

	db.DB_Init()

	go InitGameLevels()
	go InitGameSystemSettings()
	go routes.RunRouter()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	opts := []bot.Option{
		bot.WithCallbackQueryDataHandler("sw_lang", bot.MatchTypePrefix, BotHandler_Callback_ChangeLanguage),
		bot.WithDefaultHandler(BotHandler_Default),
	}

	b, err := bot.New(config.CONFIG_BOT_TOKEN, opts...)
	if err != nil {
		rr_debug.PrintLOG("main.go", "main()", "bot.New", "Ошибка инициализации бота", err.Error())
	}

	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypeExact, BotHandler_Command_Start)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/play", bot.MatchTypeExact, BotHandler_Command_Play)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/help", bot.MatchTypeExact, BotHandler_Command_Help)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/friends", bot.MatchTypeExact, BotHandler_Command_Friends)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/lang", bot.MatchTypeExact, BotHandler_Command_Lang)
	b.Start(ctx)
}

// Инициализация уровней
func InitGameLevels() {

	hands_level_list := db.DB_GET_HandsLevels()

	if len(hands_level_list) == 0 {

		// =============================== HANDS LEVEL 1 =====================================
		new_hands_level_1 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_1_NUMBER,
			Price:          config.HANDS_LEVEL_1_PRICE,
			DamagePerClick: config.HANDS_LEVEL_1_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_1)

		// =============================== HANDS LEVEL 2 =====================================
		new_hands_level_2 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_2_NUMBER,
			Price:          config.HANDS_LEVEL_2_PRICE,
			DamagePerClick: config.HANDS_LEVEL_2_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_2)

		// =============================== HANDS LEVEL 3 =====================================
		new_hands_level_3 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_3_NUMBER,
			Price:          config.HANDS_LEVEL_3_PRICE,
			DamagePerClick: config.HANDS_LEVEL_3_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_3)

		// =============================== HANDS LEVEL 4 =====================================
		new_hands_level_4 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_4_NUMBER,
			Price:          config.HANDS_LEVEL_4_PRICE,
			DamagePerClick: config.HANDS_LEVEL_4_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_4)

		// =============================== HANDS LEVEL 5 =====================================
		new_hands_level_5 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_5_NUMBER,
			Price:          config.HANDS_LEVEL_5_PRICE,
			DamagePerClick: config.HANDS_LEVEL_5_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_5)

		// =============================== HANDS LEVEL 6 =====================================
		new_hands_level_6 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_6_NUMBER,
			Price:          config.HANDS_LEVEL_6_PRICE,
			DamagePerClick: config.HANDS_LEVEL_6_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_6)

		// =============================== HANDS LEVEL 7 =====================================
		new_hands_level_7 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_7_NUMBER,
			Price:          config.HANDS_LEVEL_7_PRICE,
			DamagePerClick: config.HANDS_LEVEL_7_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_7)

		// =============================== HANDS LEVEL 8 =====================================
		new_hands_level_8 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_8_NUMBER,
			Price:          config.HANDS_LEVEL_8_PRICE,
			DamagePerClick: config.HANDS_LEVEL_8_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_8)

		// =============================== HANDS LEVEL 9 =====================================
		new_hands_level_9 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_9_NUMBER,
			Price:          config.HANDS_LEVEL_9_PRICE,
			DamagePerClick: config.HANDS_LEVEL_9_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_9)

		// =============================== HANDS LEVEL 10 =====================================
		new_hands_level_10 := db.HandsLevel_CreateJSON{
			Number:         config.HANDS_LEVEL_10_NUMBER,
			Price:          config.HANDS_LEVEL_10_PRICE,
			DamagePerClick: config.HANDS_LEVEL_10_DAMAGEPERCLICK,
		}

		db.DB_CREATE_HandsLevel(&new_hands_level_10)
	}

	duration_level_list := db.DB_GET_DurationLevels()

	if len(duration_level_list) == 0 {

		// =============================== DURATION LEVEL 1 =====================================
		new_duration_level_1 := db.DurationLevel_CreateJSON{
			Number:         config.DURATION_LEVEL_1_NUMBER,
			Price:          config.DURATION_LEVEL_1_PRICE,
			TimeAppearance: config.DURATION_LEVEL_1_TIMEAPPEARANCE,
		}

		db.DB_CREATE_DurationLevel(&new_duration_level_1)

		// =============================== DURATION LEVEL 2 =====================================
		new_duration_level_2 := db.DurationLevel_CreateJSON{
			Number:         config.DURATION_LEVEL_2_NUMBER,
			Price:          config.DURATION_LEVEL_2_PRICE,
			TimeAppearance: config.DURATION_LEVEL_2_TIMEAPPEARANCE,
		}

		db.DB_CREATE_DurationLevel(&new_duration_level_2)

		// =============================== DURATION LEVEL 3 =====================================
		new_duration_level_3 := db.DurationLevel_CreateJSON{
			Number:         config.DURATION_LEVEL_3_NUMBER,
			Price:          config.DURATION_LEVEL_3_PRICE,
			TimeAppearance: config.DURATION_LEVEL_3_TIMEAPPEARANCE,
		}

		db.DB_CREATE_DurationLevel(&new_duration_level_3)

		// =============================== DURATION LEVEL 4 =====================================
		new_duration_level_4 := db.DurationLevel_CreateJSON{
			Number:         config.DURATION_LEVEL_4_NUMBER,
			Price:          config.DURATION_LEVEL_4_PRICE,
			TimeAppearance: config.DURATION_LEVEL_4_TIMEAPPEARANCE,
		}

		db.DB_CREATE_DurationLevel(&new_duration_level_4)
	}
	return
}

// Инициализация системных настроек
func InitGameSystemSettings() {
	db_answer_code, _ := db.DB_GET_SystemSetting_First()
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		db.DB_CREATE_SystemSetting()
	}
}
