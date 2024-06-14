// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 								DB (База данных, главный файл)
//
// ----------------------------------------------------------------------------------
//

package db

import (
	//Внутренние пакеты проекта
	"rr/agavadurkatestbot/config"
	"rr/agavadurkatestbot/rr_debug"

	//Сторонние библиотеки
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	//Системные пакеты
	"fmt"
	"log"
	"os"
)

// ----------------------------------------------
//
// 				(Base) Общий функционал
//
// ----------------------------------------------

// Инициализация БД
func DB_Init() {
	db := DB_Database()

	// Миграция (настройка)
	db.AutoMigrate(&User{})
	db.AutoMigrate(&SystemSetting{})
	db.AutoMigrate(&HandsLevel{})
	db.AutoMigrate(&DurationLevel{})
}

// Функция коннекта к базе данных
func DB_Database() *gorm.DB {

	// Установка уровня логирования в GORM
	noErrorLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Silent, // Уровень логирования: Silent, Error, Warn, Info
		},
	)

	// Установка уровня логирования в GORM
	yesErrorLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Error, // Уровень логирования: Silent, Error, Warn, Info
		},
	)

	db_credentials := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", config.CONFIG_DB_HOST, config.CONFIG_DB_PORT, config.CONFIG_DB_USER, config.CONFIG_DB_NAME, config.CONFIG_DB_PASSWORD)

	if config.CONFIG_DB_IS_DEBUG {
		db, err := gorm.Open(postgres.Open(db_credentials), &gorm.Config{
			Logger: yesErrorLogger,
		})

		if err != nil {
			rr_debug.PrintLOG("DB_Main.go", "DB_Database", "gorm.Open", "Ошибка соединения с БД", err.Error())
		}
		return db
	} else {
		db, err := gorm.Open(postgres.Open(db_credentials), &gorm.Config{
			Logger: noErrorLogger,
		})

		if err != nil {
			rr_debug.PrintLOG("DB_Main.go", "DB_Database", "gorm.Open", "Ошибка соединения с БД", err.Error())
		}
		return db
	}
}
