// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 								Routes Structures
//
// ----------------------------------------------------------------------------------
//

package routes

import (
	"rr/agavadurkatestbot/db"
)

// ----------------------------------------------
//
//	Служебные структуры
//
// ----------------------------------------------
// ----------------------------------------------
//
//	API USERS
//
// ----------------------------------------------
// =========================================================================
//
//	GetList
//
// =========================================================================
// Ответ на получение списка пользователей
type GetList_Users_Answer struct {
	ListUsers []db.User_ReadJSON `json:"list_users"`
}

type GeneralCoinsBalance_Users_Answer struct {
	GeneralCoinsBalance       int `json:"general_coins_balance"`
	GeneralTotalMintedBalance int `json:"general_total_minted_balance"`
}

// =========================================================================
//
//	UpdateObject
//
// =========================================================================
// Данные для покупки юзера
type Purchase_User_Data struct {
	UserTgID     string `json:"user_tg_id"`
	PurchaseType int    `json:"purchase_type"`
}

// ----------------------------------------------
//
//	API INFO
//
// ----------------------------------------------
type Info_GetStartParams_Answer struct {
	UserData           *db.User_ReadJSON           `json:"user_data"`
	HandsLevelsData    []db.HandsLevel_ReadJSON    `json:"hands_levels_data"`
	DurationLevelsData []db.DurationLevel_ReadJSON `json:"duration_levels_data"`
	TopUsers           []db.User_ReadJSON          `json:"top_users"`
	SystemSettingsData *db.SystemSetting_ReadJSON  `json:"system_settings_data"`
}

// ----------------------------------------------
//
//	API HANDS LEVELS
//
// ----------------------------------------------
// =========================================================================
//
//	GetList
//
// =========================================================================
// Ответ на получение списка уровней
type GetList_HandsLevels_Answer struct {
	ListHandsLevels []db.HandsLevel_ReadJSON `json:"list_hands_levels"`
}

// =========================================================================
//
//	UpdateObject
//
// =========================================================================
// Данные для обновления информации уровня с фронтенда
type UpdateObject_HandsLevel_Data struct {
	Number         int `json:"number"`
	Price          int `json:"price"`
	DamagePerClick int `json:"damage_per_click"`
}

// ----------------------------------------------
//
//	API DURATION LEVEL
//
// ----------------------------------------------
// =========================================================================
//
//	GetList
//
// =========================================================================
// Ответ на получение списка уровней
type GetList_DurationLevels_Answer struct {
	ListDurationLevels []db.DurationLevel_ReadJSON `json:"list_duration_levels"`
}
