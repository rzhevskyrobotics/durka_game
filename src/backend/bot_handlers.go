// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 											Bot Handlers
//
// ----------------------------------------------------------------------------------
//

package main

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"
	"rr/agavadurkatestbot/db"
	"rr/agavadurkatestbot/keyboards"
	"rr/agavadurkatestbot/rr_debug"

	//Сторонние библиотеки
	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"

	//Системные пакеты
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// ====================================================================================
//
//	COMMAND
//
// ====================================================================================
// /start
func BotHandler_Command_Start(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		message_text string
		full_name    string
		language     string
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
	} else {
		language = user.Language
	}

	file_data, file_name, err := GetFile("./bot_media/images/start_img.png")
	if err != nil {
		rr_debug.PrintLOG("main.go", "BotHandler_Command_Start", "GetFile", "Ошибка загрузки картинки", err.Error())
	}

	if language == "eng" {
		message_text = "Welcome to DURKA!" + "\n" +
			"Now is the best time to <b>start shaking</b> Posha. <b>Tap</b> on the screen and earn points.\n" +
			"<b>Upgrade</b> characteristics to earn more points.\n" +
			"<b>Invite</b> frens for extra rewards.\n" +
			"Don't waste your time, <b>start shaking!</b>"
	} else {
		message_text = "Добро пожаловать в DURKA!" + "\n" +
			"Сейчас самое лучшее время, чтобы <b>начать трясти</b> Пошу. <b>Нажимайте</b> на экран и зарабатывайте очки.\n" +
			"Улучшайте характеристики, чтобы зарабатывать больше очков.\n" +
			"<b>Приглашайте</b> друзей для получения дополнительных наград\n" +
			"Не теряйте время, <b>начинайте трясти!</b>"
	}

	keyboard_play_game := keyboards.GetInlineKeyboardWebApp("Start shaking")
	params := GetPhotoParams(update, file_name, file_data, message_text, keyboard_play_game)
	b.SendPhoto(ctx, params)
}

// /play
func BotHandler_Command_Play(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		message_text string
		full_name    string
		language     string
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
	} else {
		language = user.Language
	}

	file_data, file_name, err := GetFile("./bot_media/images/Play.png")
	if err != nil {
		rr_debug.PrintLOG("main.go", "BotHandler_Command_Play", "GetFile", "Ошибка загрузки картинки", err.Error())
	}

	if language == "eng" {
		message_text = "Don't waste your time, <b>start shaking</b> Posha!"
	} else {
		message_text = "Не теряйте время, <b>начинайте трясти</b> Пошу!"
	}

	keyboard_play_game := keyboards.GetInlineKeyboardWebApp("Start shaking")

	params := GetPhotoParams(update, file_name, file_data, message_text, keyboard_play_game)
	b.SendPhoto(ctx, params)
}

// /help
func BotHandler_Command_Help(ctx context.Context, b *bot.Bot, update *models.Update) {
	var (
		message_text string
		full_name    string
		language     string
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
	} else {
		language = user.Language
	}

	file_data, file_name, err := GetFile("./bot_media/images/Help.png")
	if err != nil {
		rr_debug.PrintLOG("main.go", "BotHandler_Command_Help", "GetFile", "Ошибка загрузки картинки", err.Error())
	}

	if language == "eng" {
		message_text = "Just <b>tap</b> on the screen and earn points. Get extra points for catching bonuses and after Posha’s pockets are empty. <b>Upgrade</b> characteristics to earn more points. <b>Invite</b> frens to get rewards."
	} else {
		message_text = "Просто <b>нажимайте</b> на экран и зарабатывайте очки! Получайте дополнительные очки за сбор бонусов и после того, как карманы Поши опустеют. <b>Улучшайте</b> характеристики, чтобы зарабатывать больше очков. <b>Приглашайте</b> друзей, чтобы получать награды."
	}

	keyboard_play_game := keyboards.GetInlineKeyboardWebApp("Start shaking")

	params := GetPhotoParams(update, file_name, file_data, message_text, keyboard_play_game)
	b.SendPhoto(ctx, params)
}

// /friends
func BotHandler_Command_Friends(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		message_text            string
		language                string
		full_name               string
		referal_link            string
		invite_text             string
		friends_count           int
		reward_inviting_friends int
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
		referal_link = " отсуствует, выполните команду /friends ещё раз"
		friends_count = 0
		reward_inviting_friends = 0
	} else {
		language = user.Language
		referal_link = config.CONFIG_BOT_LINK + "?start=" + user.InvitedHash
		friends_count = len(user.InvitedUsers)
		reward_inviting_friends = user.RewardInvitingFriends
	}

	friends_count_str := fmt.Sprintf("%d", friends_count)
	reward_inviting_friends_str := fmt.Sprintf("%d", reward_inviting_friends)

	file_data, file_name, err := GetFile("./bot_media/images/Frends.png")
	if err != nil {
		rr_debug.PrintLOG("main.go", "BotHandler_Command_Friends", "GetFile", "Ошибка загрузки картинки", err.Error())
	}

	if language == "eng" {
		message_text = "Get your team together and start earn points with your <b>frens</b>!\n" +
			"Your referal link: " + referal_link + "\n" +
			"Friends invited: " + friends_count_str + "\n" +
			"Reward for inviting friends: " + reward_inviting_friends_str

		invite_text = "Hey! I found an awesome game – DURKA! You can shake Posha and earn points.\n" +
			"Just tap on the screen, upgrade your characteristics, and collect bonuses.\n" +
			"Join me, and we can play together and get extra rewards! Don’t waste time, click the link and start shaking!"
	} else {
		message_text = "Соберите команду и начинайте зарабатывать очки с <b>друзьями</b>!\n" +
			"Ваша реферальная ссылка: " + referal_link + "\n" +
			"Друзей приглашено: " + friends_count_str + "\n" +
			"Ваша награда за приглашение друзей: " + reward_inviting_friends_str

		invite_text = "Привет! Я нашел потрясающую игру - DURKA! Ты можешь трясти Пошу и зарабатывать очки.\n" +
			"Просто жми на экран, улучшай свои характеристики и собирай бонусы.\n" +
			"Присоединяйся ко мне, и мы сможем играть вместе и получать дополнительные награды! Не теряй времени, переходи по ссылке и начинай трясти Пошу!"
	}

	keyboard_invite_friend := keyboards.GetInlineKeyboardInviteFriend("Invite fren!", invite_text+"\n"+referal_link)

	params := GetPhotoParams(update, file_name, file_data, message_text, keyboard_invite_friend)
	b.SendPhoto(ctx, params)
}

// /lang
func BotHandler_Command_Lang(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		message_text string
		button_text  string
		full_name    string
		language     string
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
	} else {
		language = user.Language
	}

	if language == "eng" {
		message_text = "Current lang: English"
		button_text = "RU"
	} else {
		message_text = "Текущий язык: Русский"
		button_text = "EN"
	}

	keyboard_change_language := keyboards.GetInlineKeyboardChangeLanguage(button_text)

	params := GetMessageParams(update, message_text, keyboard_change_language)
	b.SendMessage(ctx, params)
}

// default
func BotHandler_Default(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		language     string
		command      string
		ref_code     string
		full_name    string
		message_text string
	)

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		// Регистрация
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.Message.From.FirstName + " " + update.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.Message.From.LastName
			}
		}

		// Разделяем команду и параметр
		parts := strings.Split(update.Message.Text, " ")
		if len(parts) == 2 {
			command = parts[0]
			if command == "/start" {
				// Считываем реферальный хеш
				ref_code = parts[1]
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, ref_code)
		language = "eng"
	} else {
		language = user.Language
	}

	if language == "eng" {
		message_text = "I don't understand you. To display the list of commands, go to the commands menu using the button at the bottom left."
	} else {
		message_text = "Я не понимаю вас. Для вывода списка команд, перейдите в меню команд по кнопке снизу слева."
	}

	b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: update.Message.Chat.ID,
		Text:   message_text,
	})
}

// ====================================================================================
//
//	CallBack
//
// ====================================================================================
// Callback Handler Inline Keyboard
func BotHandler_Callback_ChangeLanguage(ctx context.Context, b *bot.Bot, update *models.Update) {

	var (
		language     string
		message_text string
		button_text  string
		new_language string
		full_name    string
	)

	b.AnswerCallbackQuery(ctx, &bot.AnswerCallbackQueryParams{
		CallbackQueryID: update.CallbackQuery.ID,
		ShowAlert:       false,
	})

	db_answer_code, user := db.DB_GET_User_BY_TgID(update.CallbackQuery.Message.Message.Chat.ID)
	if db_answer_code == db.DB_ANSWER_OBJECT_NOT_FOUND {
		if update.Message.From.FirstName != "" && update.Message.From.LastName != "" {
			full_name = update.CallbackQuery.Message.Message.From.FirstName + " " + update.CallbackQuery.Message.Message.From.LastName
		} else {
			if update.Message.From.FirstName != "" {
				full_name = update.CallbackQuery.Message.Message.From.FirstName
			}

			if update.Message.From.LastName != "" {
				full_name = update.CallbackQuery.Message.Message.From.LastName
			}
		}

		RegistrationUser(update.Message.Chat.ID, update.Message.From.Username, full_name, "")
		language = "eng"
	} else {
		language = user.Language
	}

	// Логика переключения языка от юзера
	if language == "eng" {
		message_text = "Язык успешно переключен на русский."
		button_text = "EN"
		new_language = "ru"
	} else {
		message_text = "Language successfully switched to English."
		button_text = "RU"
		new_language = "eng"
	}

	db.DB_UPDATE_User_Language(update.CallbackQuery.Message.Message.Chat.ID, new_language)

	keyboard_change_language := keyboards.GetInlineKeyboardChangeLanguage(button_text)
	b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID:      update.CallbackQuery.Message.Message.Chat.ID,
		Text:        message_text,
		ReplyMarkup: keyboard_change_language,
	})
}

// ====================================================================================
//
//	MISC
//
// ====================================================================================
// Регистрация пользователя
func RegistrationUser(user_tg_id int64, user_login string, user_name string, ref_code string) {

	invite_hash := GeneratorHash_By_ReferralLink(user_tg_id)
	var current_health int

	db_answer_code_systemSettings, systemSettings := db.DB_GET_SystemSetting_First()

	if db_answer_code_systemSettings == db.DB_ANSWER_SUCCESS {
		current_health = systemSettings.CurrentHealthBase
	} else {
		current_health = config.CURRENT_HEALTH_DEFAULT
	}

	new_user := db.User_CreateJSON{
		UserTgID:      user_tg_id,
		UserName:      user_name,
		UserTgLogin:   user_login,
		CurrentHealth: current_health,
		InvitedHash:   invite_hash,
	}

	db_answer_code_create_user := db.DB_CREATE_User(&new_user)
	switch db_answer_code_create_user {
	case db.DB_ANSWER_SUCCESS:
		if ref_code != "" {
			InvitationProcess(ref_code, user_tg_id, user_login, user_name)
		}

	default:
		return
	}
}

// Действия по переходу по инвайт ссылке
func InvitationProcess(invite_hash string, user_tg_id int64, user_login string, user_name string) {
	db_answer_code_new_user, new_user := db.DB_GET_User_BY_TgID(user_tg_id)
	if db_answer_code_new_user == db.DB_ANSWER_SUCCESS {
		db_answer_code_old_user, old_user := db.DB_GET_User_BY_InvitedHash(invite_hash)
		if db_answer_code_old_user == db.DB_ANSWER_SUCCESS {
			if new_user.InvitedByID == nil {
				if new_user.ID != old_user.ID {
					err := db.DB_UPDATE_User_Friend(old_user.ID, new_user.ID)
					if err != nil {
						rr_debug.PrintLOG("main.go", "InvitationProcess", "db.DB_UPDATE_User_Friend", "Ошибка БД SQL", err.Error())
					}
				}
			}
		}
	}
}

// Генератор хешей для реферальной ссылки
func GeneratorHash_By_ReferralLink(tg_id int64) string {

	tg_id_str := strconv.FormatInt(tg_id, 10)

	// Получаем хеш md5
	hasher := md5.New()
	hasher.Write([]byte(tg_id_str))
	hash := hasher.Sum(nil)

	// Преобразуем хеш в строку в шестнадцатеричном представлении
	hashString := hex.EncodeToString(hash)

	// Выводим первые 10 символов хеша
	inviteHash := hashString[:20]
	return inviteHash
}

// Получить параметры для отправки сообщения
func GetMessageParams(update *models.Update, message_text string, i_keyboard *models.InlineKeyboardMarkup) *bot.SendMessageParams {
	params := &bot.SendMessageParams{
		ChatID:      update.Message.Chat.ID,
		Text:        message_text,
		ReplyMarkup: i_keyboard,
		ParseMode:   models.ParseModeHTML,
	}

	return params
}

// Получить параметры для отправки сообщения с фото
func GetPhotoParams(update *models.Update, file_name string, file_data []byte, message_text string, i_keyboard *models.InlineKeyboardMarkup) *bot.SendPhotoParams {
	params := &bot.SendPhotoParams{
		ChatID:      update.Message.Chat.ID,
		Photo:       &models.InputFileUpload{Filename: file_name, Data: bytes.NewReader(file_data)},
		Caption:     message_text,
		ReplyMarkup: i_keyboard,
		ParseMode:   models.ParseModeHTML,
	}

	return params
}

// Получить файл
func GetFile(file_path string) ([]byte, string, error) {
	file_data, err := os.ReadFile(file_path)

	file_name := filepath.Base(file_path)

	if err != nil {
		return []byte{}, "", err
	} else {
		return file_data, file_name, nil
	}
}
