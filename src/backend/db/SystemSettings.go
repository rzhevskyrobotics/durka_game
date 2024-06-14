// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 								DB - SystemSetting
//
// ----------------------------------------------------------------------------------
//

package db

import (

	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"

	//Сторонние библиотеки
	"gorm.io/gorm"

	//Системные пакеты
	"time"
)

// Этот объект должен быть ОДИН в БД
type SystemSetting struct {
	gorm.Model
	CurrentHealthBase       int `json:"current_health_base"`         // Базовое здоровье Поши
	OldUserBonusBase        int `json:"old_user_bonus_base"`         // Бонус для давно играющего пользователя
	NewUserBonusBase        int `json:"new_user_bonus_base"`         // Бонус для нового играющего пользователя
	OldUserPremiumBonusBase int `json:"old_user_premium_bonus_base"` // Бонус для давно играющего пользователя с телеграмм Premium
	NewUserPremiumBonusBase int `json:"new_user_premium_bonus_base"` // Бонус для нового играющего пользователя с телеграмм Premium
}

type SystemSetting_ReadJSON struct {
	ID                      uint      `json:"id"`
	CreatedAt               time.Time `json:"created_at"`
	CurrentHealthBase       int       `json:"current_health_base"`
	OldUserBonusBase        int       `json:"old_user_bonus_base"`
	NewUserBonusBase        int       `json:"new_user_bonus_base"`
	OldUserPremiumBonusBase int       `json:"old_user_premium_bonus_base"`
	NewUserPremiumBonusBase int       `json:"new_user_premium_bonus_base"`
}

type SystemSetting_UpdateJSON struct {
	CurrentHealthBase       int `json:"current_health_base"`
	OldUserBonusBase        int `json:"old_user_bonus_base"`
	NewUserBonusBase        int `json:"new_user_bonus_base"`
	OldUserPremiumBonusBase int `json:"old_user_premium_bonus_base"`
	NewUserPremiumBonusBase int `json:"new_user_premium_bonus_base"`
}

// Добавить системные настройки
func DB_CREATE_SystemSetting() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var system_setting SystemSetting

	system_setting = SystemSetting{
		CurrentHealthBase:       config.CURRENT_HEALTH_DEFAULT,
		OldUserBonusBase:        config.INVITED_OLD_USER_BONUS_DEFAULT,
		NewUserBonusBase:        config.INVITED_NEW_USER_BONUS_DEFAULT,
		OldUserPremiumBonusBase: config.INVITED_OLD_USER_PREMIUM_BONUS_DEFAULT,
		NewUserPremiumBonusBase: config.INVITED_NEW_USER_PREMIUM_BONUS_DEFAULT,
	}

	db.Save(&system_setting)
	return DB_ANSWER_SUCCESS
}

// Получение первой записи системных настроек
func DB_GET_SystemSetting_First() (int, *SystemSetting_ReadJSON) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var system_setting SystemSetting
	db.First(&system_setting)
	if system_setting.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND, nil
	}

	system_setting_read := SystemSetting_ReadJSON{
		ID:                      system_setting.ID,
		CreatedAt:               system_setting.CreatedAt,
		CurrentHealthBase:       system_setting.CurrentHealthBase,
		OldUserBonusBase:        system_setting.OldUserBonusBase,
		NewUserBonusBase:        system_setting.NewUserBonusBase,
		OldUserPremiumBonusBase: system_setting.OldUserPremiumBonusBase,
		NewUserPremiumBonusBase: system_setting.NewUserPremiumBonusBase,
	}

	return DB_ANSWER_SUCCESS, &system_setting_read
}

// Обновляем системные настройки
func DB_UPDATE_SystemSetting(update_json *SystemSetting_UpdateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var system_setting SystemSetting

	db.First(&system_setting)
	if system_setting.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	// CurrentHealthBase
	if update_json.CurrentHealthBase != -1 {
		system_setting.CurrentHealthBase = update_json.CurrentHealthBase
	}

	// OldUserBonusBase
	if update_json.OldUserBonusBase != -1 {
		system_setting.OldUserBonusBase = update_json.OldUserBonusBase
	}

	// NewUserBonusBase
	if update_json.NewUserBonusBase != -1 {
		system_setting.NewUserBonusBase = update_json.NewUserBonusBase
	}

	// OldUserPremiumBonusBase
	if update_json.OldUserPremiumBonusBase != -1 {
		system_setting.OldUserPremiumBonusBase = update_json.OldUserPremiumBonusBase
	}

	// NewUserPremiumBonusBase
	if update_json.NewUserPremiumBonusBase != -1 {
		system_setting.NewUserPremiumBonusBase = update_json.NewUserPremiumBonusBase
	}

	db.Save(&system_setting)
	return DB_ANSWER_SUCCESS
}

// Удаляем все системные настройки
func DB_DELETE_SystemSettings() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	db.Exec("DELETE FROM system_settings")
	db.Exec("SELECT setval('system_settings_id_seq', 1, false)")
	return DB_ANSWER_SUCCESS
}
