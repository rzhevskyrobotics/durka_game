// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 									DB - DurationLevel
//
// ----------------------------------------------------------------------------------
//

package db

import (

	//Внутренние пакеты проекта

	//Сторонние библиотеки
	"gorm.io/gorm"

	//Системные пакеты
	"time"
)

type DurationLevel struct {
	gorm.Model
	Number         int `json:"number"`          // Порядковый номер уровня
	Price          int `json:"price"`           // Цена покупки уровня
	TimeAppearance int `json:"time_appearance"` // Время появления Поши
}

type DurationLevel_CreateJSON struct {
	Number         int `json:"number"`
	Price          int `json:"price"`
	TimeAppearance int `json:"time_appearance"`
}

type DurationLevel_ReadJSON struct {
	ID             uint      `json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	Number         int       `json:"number"`
	Price          int       `json:"price"`
	TimeAppearance int       `json:"time_appearance"`
}

type DurationLevel_UpdateJSON struct {
	Number         int `json:"number"`
	Price          int `json:"price"`
	TimeAppearance int `json:"time_appearance"`
}

// Добавить уровни в БД
func DB_CREATE_DurationLevel(duration_level_to_add *DurationLevel_CreateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var duration_level DurationLevel

	duration_level = DurationLevel{
		Number:         duration_level_to_add.Number,
		Price:          duration_level_to_add.Price,
		TimeAppearance: duration_level_to_add.TimeAppearance,
	}

	db.Save(&duration_level)
	return DB_ANSWER_SUCCESS
}

// Получение уровней по номеру
func DB_GET_DurationLevel_BY_Number(number int) (int, *DurationLevel_ReadJSON) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var duration_level DurationLevel
	db.Where("number = ?", number).First(&duration_level)
	if duration_level.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND, nil
	}

	duration_level_read := DurationLevel_ReadJSON{
		ID:             duration_level.ID,
		CreatedAt:      duration_level.CreatedAt,
		Number:         duration_level.Number,
		Price:          duration_level.Price,
		TimeAppearance: duration_level.TimeAppearance,
	}

	return DB_ANSWER_SUCCESS, &duration_level_read
}

// Получение всех уровней
func DB_GET_DurationLevels() []DurationLevel_ReadJSON {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var duration_levels []DurationLevel
	db.Find(&duration_levels)

	duration_levels_list := make([]DurationLevel_ReadJSON, 0)

	if len(duration_levels) <= 0 {
		return duration_levels_list
	}

	for _, duration_level := range duration_levels {

		current_duration_level := DurationLevel_ReadJSON{
			ID:             duration_level.ID,
			CreatedAt:      duration_level.CreatedAt,
			Number:         duration_level.Number,
			Price:          duration_level.Price,
			TimeAppearance: duration_level.TimeAppearance,
		}
		duration_levels_list = append(duration_levels_list, current_duration_level)
	}

	return duration_levels_list
}

// Обновляем системные настройки
func DB_UPDATE_DurationLevel(update_json *DurationLevel_UpdateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var duration_level DurationLevel

	db.Where("number = ?", update_json.Number).First(&duration_level)
	if duration_level.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	// Price
	if update_json.Price != -1 {
		duration_level.Price = update_json.Price
	}

	// TimeAppearance
	if update_json.TimeAppearance != -1 {
		duration_level.TimeAppearance = update_json.TimeAppearance
	}

	db.Save(&duration_level)
	return DB_ANSWER_SUCCESS
}

// Удалить все уровни
func DB_DELETE_DurationLevels() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	db.Exec("DELETE FROM duration_levels")
	db.Exec("SELECT setval('duration_levels_id_seq', 1, false)")
	return DB_ANSWER_SUCCESS
}
