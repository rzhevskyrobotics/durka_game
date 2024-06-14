// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 											Keyboards
//
// ----------------------------------------------------------------------------------
//

package keyboards

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"

	//Сторонние библиотеки
	"github.com/go-telegram/bot/models"
)

// Получить клавиатуру с игрой
func GetInlineKeyboardWebApp(text_key string) *models.InlineKeyboardMarkup {
	keyboard_play_game := &models.InlineKeyboardMarkup{
		InlineKeyboard: [][]models.InlineKeyboardButton{
			{
				{Text: text_key, WebApp: &models.WebAppInfo{
					URL: config.CONFIG_GAME_LINK,
				}},
			},
		},
	}

	return keyboard_play_game
}

// Получить клавиатуру для приглашения в друзья
func GetInlineKeyboardInviteFriend(text_key string, text_forward string) *models.InlineKeyboardMarkup {
	keyboard_invite_friend := &models.InlineKeyboardMarkup{
		InlineKeyboard: [][]models.InlineKeyboardButton{
			{
				{Text: text_key, SwitchInlineQuery: text_forward},
			},
		},
	}

	return keyboard_invite_friend
}

// Получить клавиатуру для переключения языка
func GetInlineKeyboardChangeLanguage(text_key string) *models.InlineKeyboardMarkup {
	keyboard_change_language := &models.InlineKeyboardMarkup{
		InlineKeyboard: [][]models.InlineKeyboardButton{
			{
				{Text: text_key, CallbackData: "sw_lang"},
			},
		},
	}

	return keyboard_change_language
}
