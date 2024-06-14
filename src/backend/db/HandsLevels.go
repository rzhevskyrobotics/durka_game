// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 									DB - HandsLevel
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

type HandsLevel struct {
	gorm.Model
	Number         int `json:"number"`           // Порядковый номер уровня
	Price          int `json:"price"`            // Цена покупки уровня
	DamagePerClick int `json:"damage_per_click"` // Кол-во урона за клик
}

type HandsLevel_CreateJSON struct {
	Number         int `json:"number"`
	Price          int `json:"price"`
	DamagePerClick int `json:"damage_per_click"`
}

type HandsLevel_ReadJSON struct {
	ID             uint      `json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	Number         int       `json:"number"`
	Price          int       `json:"price"`
	DamagePerClick int       `json:"damage_per_click"`
}

type HandsLevel_UpdateJSON struct {
	Number         int `json:"number"`
	Price          int `json:"price"`
	DamagePerClick int `json:"damage_per_click"`
}

// Добавить уровни в БД
func DB_CREATE_HandsLevel(hands_level_to_add *HandsLevel_CreateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var hands_level HandsLevel

	hands_level = HandsLevel{
		Number:         hands_level_to_add.Number,
		Price:          hands_level_to_add.Price,
		DamagePerClick: hands_level_to_add.DamagePerClick,
	}

	db.Save(&hands_level)
	return DB_ANSWER_SUCCESS
}

// Получение уровней по номеру
func DB_GET_HandsLevel_BY_Number(number int) (int, *HandsLevel_ReadJSON) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var hands_level HandsLevel
	db.Where("number = ?", number).First(&hands_level)
	if hands_level.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND, nil
	}

	hands_level_read := HandsLevel_ReadJSON{
		ID:             hands_level.ID,
		CreatedAt:      hands_level.CreatedAt,
		Number:         hands_level.Number,
		Price:          hands_level.Price,
		DamagePerClick: hands_level.DamagePerClick,
	}

	return DB_ANSWER_SUCCESS, &hands_level_read
}

// Получение всех уровней
func DB_GET_HandsLevels() []HandsLevel_ReadJSON {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var hands_levels []HandsLevel
	db.Find(&hands_levels)

	hands_levels_list := make([]HandsLevel_ReadJSON, 0)

	//Если список пустой, не нужно брать данные
	if len(hands_levels) <= 0 {
		return hands_levels_list
	}

	for _, hands_level := range hands_levels {

		current_hands_level := HandsLevel_ReadJSON{
			ID:             hands_level.ID,
			CreatedAt:      hands_level.CreatedAt,
			Number:         hands_level.Number,
			Price:          hands_level.Price,
			DamagePerClick: hands_level.DamagePerClick,
		}
		hands_levels_list = append(hands_levels_list, current_hands_level)
	}

	return hands_levels_list
}

// Обновляем системные настройки
func DB_UPDATE_HandsLevel(update_json *HandsLevel_UpdateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var hands_level HandsLevel

	db.Where("number = ?", update_json.Number).First(&hands_level)
	if hands_level.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	// Price
	if update_json.Price != -1 {
		hands_level.Price = update_json.Price
	}

	// DamagePerClick
	if update_json.DamagePerClick != -1 {
		hands_level.DamagePerClick = update_json.DamagePerClick
	}

	db.Save(&hands_level)
	return DB_ANSWER_SUCCESS
}

// Удалить все уровни
func DB_DELETE_HandsLevels() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	db.Exec("DELETE FROM hands_levels")
	db.Exec("SELECT setval('hands_levels_id_seq', 1, false)")
	return DB_ANSWER_SUCCESS
}
