// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Base engine for Durka Game
// Written by Serg S. Rzhevsky (https://github.com/rzhevskyrobotics) and Alexey Fedorov (https://github.com/JinnySh23)

//
// ----------------------------------------------------------------------------------
//
// 								DB - User
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

type User struct {
	gorm.Model
	UserTgID              int64  `json:"user_tg_id"`                                  // ID пользователя в Телеграм
	UserTgLogin           string `json:"user_tg_login"`                               // Логин пользователя в Телеграм
	UserName              string `json:"user_name"`                                   // Имя пользователя в Телеграм
	CoinsBalance          int    `json:"coins_balance"`                               // Текущее кол-во монет игрока
	TotalMinted           int    `json:"total_minted"`                                // Сумма заработанных монет игрока
	RewardInvitingFriends int    `json:"reward_inviting_friends"`                     // Сумма заработанных монет игрока за приглашённых друзей
	CurrentHealth         int    `json:"current_health"`                              // Кол-во текущего здоровья Поши у игрока
	InvitedHash           string `json:"invited_hash"`                                // Хеш приглашения
	InvitedUsers          []User `gorm:"foreignkey:InvitedByID" json:"invited_users"` // Список приглашённых пользователей (ID, name)
	HandsLevel            int    `json:"hands_level"`                                 // Уровень наносимого Поше урона
	DurationLevel         int    `json:"duration_level"`                              // Уровень скорости появления Поши
	InvitedByID           *uint  `json:"invited_by_id"`                               // Пользователь, который пригласил
	LastSync              int64  `json:"last_sync"`                                   // Метка последней синзронизации
	LastCooldown          int64  `json:"last_cooldown"`                               // Метка последней афк Поши
	Language              string `json:"language"`                                    // Язык пользователя
	IsFirstPosha          bool   `json:"is_first_posha"`                              // Скликал первого Пошу?
	IsPremium             bool   `json:"is_premium"`                                  // У пользователя ТГ Премиум?
}

type User_CreateJSON struct {
	UserTgID      int64  `json:"user_tg_id"`
	UserName      string `json:"user_name"`
	UserTgLogin   string `json:"user_tg_login"`
	CurrentHealth int    `json:"current_health"`
	InvitedHash   string `json:"invited_hash"`
}

type User_ReadJSON struct {
	ID                    uint      `json:"id"`
	CreatedAt             time.Time `json:"created_at"`
	UserTgID              int64     `json:"user_tg_id"`
	UserName              string    `json:"user_name"`
	UserTgLogin           string    `json:"user_tg_login"`
	CoinsBalance          int       `json:"coins_balance"`
	TotalMinted           int       `json:"total_minted"`
	RewardInvitingFriends int       `json:"reward_inviting_friends"`
	CurrentHealth         int       `json:"current_health"`
	InvitedHash           string    `json:"invited_hash"`
	HandsLevel            int       `json:"hands_level"`
	DurationLevel         int       `json:"duration_level"`
	LastSync              int64     `json:"last_sync"`
	LastCooldown          int64     `json:"last_cooldown"`
	InvitedUsers          []User    `gorm:"foreignkey:InvitedByID" json:"invited_users"`
	InvitedByID           *uint     `json:"invited_by_id"`
	InvitedBy             *User     `json:"invited_by"`
	Language              string    `json:"language"`
	IsPremium             bool      `json:"is_premium"`
}

type User_UpdateJSON struct {
	UserTgID      int64  `json:"user_tg_id"`
	UserName      string `json:"user_name"`
	CoinsBalance  int    `json:"coins_balance"`
	TotalMinted   int    `json:"total_minted"`
	CurrentHealth int    `json:"current_health"`
	LastSync      int64  `json:"last_sync"`
	LastCooldown  int64  `json:"last_cooldown"`
	IsFirstPosha  bool   `json:"is_first_posha"`
	IsPremium     bool   `json:"is_premium"`
}

// Добавить пользователя
func DB_CREATE_User(user_to_add *User_CreateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var user User
	db.Where("user_tg_id = ?", user_to_add.UserTgID).First(&user)
	if user.ID != 0 {
		return DB_ANSWER_OBJECT_EXISTS
	}

	user = User{
		UserTgID:              user_to_add.UserTgID,
		UserName:              user_to_add.UserName,
		UserTgLogin:           user_to_add.UserTgLogin,
		CurrentHealth:         user_to_add.CurrentHealth,
		InvitedHash:           user_to_add.InvitedHash,
		CoinsBalance:          0,
		TotalMinted:           0,
		RewardInvitingFriends: 0,
		HandsLevel:            0,
		DurationLevel:         0,
		LastSync:              0,
		LastCooldown:          0,
		Language:              "eng",
		IsFirstPosha:          false,
		IsPremium:             false,
	}

	db.Save(&user)
	return DB_ANSWER_SUCCESS
}

// Получить пользователя по TgID
func DB_GET_User_BY_TgID(user_tg_id int64) (int, *User_ReadJSON) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	user := new(User)
	db.Preload("InvitedUsers").Where("user_tg_id = ?", user_tg_id).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND, nil
	}

	// Загружаем пользователя, который пригласил текущего пользователя
	var invitedBy *User
	if user.InvitedByID != nil {
		invitedBy = &User{}
		if err := db.First(invitedBy, *user.InvitedByID).Error; err != nil {
			return DB_ANSWER_UNEXPECTED_ERROR, nil
		}
	}

	user_read := User_ReadJSON{
		ID:                    user.ID,
		CreatedAt:             user.CreatedAt,
		UserTgID:              user.UserTgID,
		UserName:              user.UserName,
		UserTgLogin:           user.UserTgLogin,
		CoinsBalance:          user.CoinsBalance,
		TotalMinted:           user.TotalMinted,
		RewardInvitingFriends: user.RewardInvitingFriends,
		CurrentHealth:         user.CurrentHealth,
		InvitedHash:           user.InvitedHash,
		HandsLevel:            user.HandsLevel,
		DurationLevel:         user.DurationLevel,
		LastSync:              user.LastSync,
		LastCooldown:          user.LastCooldown,
		InvitedUsers:          user.InvitedUsers,
		InvitedByID:           user.InvitedByID,
		InvitedBy:             invitedBy,
		Language:              user.Language,
		IsPremium:             user.IsPremium,
	}

	return DB_ANSWER_SUCCESS, &user_read
}

// Получить пользователя по InvitedHash
func DB_GET_User_BY_InvitedHash(invited_hash string) (int, *User_ReadJSON) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	user := new(User)
	db.Preload("InvitedUsers").Where("invited_hash = ?", invited_hash).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND, nil
	}

	var invitedBy *User
	if user.InvitedByID != nil {
		invitedBy = &User{}
		if err := db.First(invitedBy, *user.InvitedByID).Error; err != nil {
			return DB_ANSWER_UNEXPECTED_ERROR, nil
		}
	}

	user_read := User_ReadJSON{
		ID:                    user.ID,
		CreatedAt:             user.CreatedAt,
		UserTgID:              user.UserTgID,
		UserName:              user.UserName,
		UserTgLogin:           user.UserTgLogin,
		CoinsBalance:          user.CoinsBalance,
		TotalMinted:           user.TotalMinted,
		RewardInvitingFriends: user.RewardInvitingFriends,
		CurrentHealth:         user.CurrentHealth,
		InvitedHash:           user.InvitedHash,
		HandsLevel:            user.HandsLevel,
		DurationLevel:         user.DurationLevel,
		LastSync:              user.LastSync,
		LastCooldown:          user.LastCooldown,
		InvitedUsers:          user.InvitedUsers,
		InvitedByID:           user.InvitedByID,
		InvitedBy:             invitedBy,
		Language:              user.Language,
		IsPremium:             user.IsPremium,
	}

	return DB_ANSWER_SUCCESS, &user_read
}

// Получить список всех пользователей
func DB_GET_Users() []User_ReadJSON {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var users []User

	// Загружаем связанные сущности InvitedUsers
	db.Preload("InvitedUsers").Find(&users)

	users_list := make([]User_ReadJSON, 0)
	if len(users) <= 0 {
		return users_list
	}

	for _, user := range users {

		// Загружаем пользователя, который пригласил текущего пользователя
		var invitedBy *User
		if user.InvitedByID != nil {
			invitedBy = &User{}
			if err := db.First(invitedBy, *user.InvitedByID).Error; err != nil {
				return users_list
			}
		}

		current_user := User_ReadJSON{
			ID:                    user.ID,
			CreatedAt:             user.CreatedAt,
			UserName:              user.UserName,
			UserTgID:              user.UserTgID,
			UserTgLogin:           user.UserTgLogin,
			CoinsBalance:          user.CoinsBalance,
			TotalMinted:           user.TotalMinted,
			RewardInvitingFriends: user.RewardInvitingFriends,
			CurrentHealth:         user.CurrentHealth,
			InvitedHash:           user.InvitedHash,
			HandsLevel:            user.HandsLevel,
			DurationLevel:         user.DurationLevel,
			LastSync:              user.LastSync,
			LastCooldown:          user.LastCooldown,
			InvitedUsers:          user.InvitedUsers,
			InvitedByID:           user.InvitedByID,
			InvitedBy:             invitedBy,
			Language:              user.Language,
			IsPremium:             user.IsPremium,
		}
		users_list = append(users_list, current_user)
	}

	return users_list
}

// Получить список всех топ 100 пользователей, отсортированных по CoinsBalance по убыванию и ограниченных 100 записями
func DB_GET_Users_TOP() []User_ReadJSON {

	// БД
	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	// Сортируем пользователей по TotalMinted по убыванию и ограничиваем их до 100
	var sortedUsers []User
	db.Order("total_minted desc").Limit(100).Find(&sortedUsers)

	var users_list []User_ReadJSON
	for _, user := range sortedUsers {
		var invitedBy *User
		if user.InvitedByID != nil {
			invitedBy = &User{}
			if err := db.First(invitedBy, *user.InvitedByID).Error; err != nil {
				return users_list
			}
		}

		current_user := User_ReadJSON{
			ID:                    user.ID,
			CreatedAt:             user.CreatedAt,
			UserName:              user.UserName,
			UserTgID:              user.UserTgID,
			UserTgLogin:           user.UserTgLogin,
			CoinsBalance:          user.CoinsBalance,
			TotalMinted:           user.TotalMinted,
			RewardInvitingFriends: user.RewardInvitingFriends,
			CurrentHealth:         user.CurrentHealth,
			InvitedHash:           user.InvitedHash,
			HandsLevel:            user.HandsLevel,
			DurationLevel:         user.DurationLevel,
			LastSync:              user.LastSync,
			LastCooldown:          user.LastCooldown,
			InvitedUsers:          user.InvitedUsers,
			InvitedByID:           user.InvitedByID,
			InvitedBy:             invitedBy,
			Language:              user.Language,
			IsPremium:             user.IsPremium,
		}
		users_list = append(users_list, current_user)
	}

	return users_list
}

// Получить сумму всех CoinsBalance всех пользователей
func DB_GET_Users_TotalCoinsBalance() (int, error) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var total_coins_balance int
	err := db.Model(&User{}).Select("sum(coins_balance)").Scan(&total_coins_balance).Error
	if err != nil {
		return 0, err
	}

	return total_coins_balance, nil
}

// Получить сумму всех TotalMinted всех пользователей
func DB_GET_Users_TotalMintedBalance() (int, error) {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var total_minted_balance int
	err := db.Model(&User{}).Select("sum(total_minted)").Scan(&total_minted_balance).Error
	if err != nil {
		return 0, err
	}

	return total_minted_balance, nil
}

// Обновляем пользователя
func DB_UPDATE_User(update_json *User_UpdateJSON) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var user User
	db.Where("user_tg_id = ?", update_json.UserTgID).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	// UserName
	if update_json.UserName != "" {
		user.UserName = update_json.UserName
	}

	// CoinsBalance
	if update_json.CoinsBalance != -1 {
		user.CoinsBalance = user.CoinsBalance + update_json.CoinsBalance
		user.TotalMinted = user.TotalMinted + update_json.CoinsBalance
	}

	// CurrentHealth
	if update_json.CurrentHealth != -1 {
		user.CurrentHealth = update_json.CurrentHealth
	}

	// LastSync
	if update_json.LastSync != -1 {
		user.LastSync = update_json.LastSync
	}

	// LastCooldown
	if update_json.LastCooldown != -1 {
		user.LastCooldown = update_json.LastCooldown
	}

	// IsPremium
	if !user.IsPremium {
		if update_json.IsPremium {
			user.IsPremium = true
		}
	}

	// IsFirstPosha
	if !user.IsFirstPosha {
		if update_json.IsFirstPosha {
			db_answer_code, systemSettings := DB_GET_SystemSetting_First()
			if db_answer_code == DB_ANSWER_SUCCESS {

				if update_json.IsPremium {
					user.CoinsBalance = user.CoinsBalance + systemSettings.NewUserPremiumBonusBase
				} else {
					user.CoinsBalance = user.CoinsBalance + systemSettings.NewUserBonusBase
				}

			}
			user.IsFirstPosha = true

			if user.InvitedByID != nil {

				var old_user User
				db.Where("id = ?", *user.InvitedByID).First(&old_user)
				if old_user.ID != 0 {
					if update_json.IsPremium {
						old_user.CoinsBalance = old_user.CoinsBalance + systemSettings.OldUserPremiumBonusBase
						old_user.RewardInvitingFriends = old_user.RewardInvitingFriends + systemSettings.OldUserPremiumBonusBase
					} else {
						old_user.CoinsBalance = old_user.CoinsBalance + systemSettings.OldUserBonusBase
						old_user.RewardInvitingFriends = old_user.RewardInvitingFriends + systemSettings.OldUserBonusBase
					}

					db.Save(&old_user)
				}
			}
		}
	}

	db.Save(&user)
	return DB_ANSWER_SUCCESS
}

// Добавить друга пользователю
func DB_UPDATE_User_Friend(old_user_id uint, new_user_id uint) error {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	// Находим пользователя и друга
	var old_user User
	var new_user User

	if err := db.First(&old_user, old_user_id).Error; err != nil {
		return err
	}
	if err := db.First(&new_user, new_user_id).Error; err != nil {
		return err
	}

	// Добавляем друга в массив InvitedUsers пользователя
	db.Model(&old_user).Association("InvitedUsers").Append(&new_user)

	new_user.InvitedByID = &old_user_id
	db.Save(&new_user)
	return nil
}

// Покупка бустов пользователя
func DB_UPDATE_User_Purchase(user_tg_id int64, purchase_type int) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	user := new(User)
	db.Preload("InvitedUsers").Where("user_tg_id = ?", user_tg_id).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	current_coin := user.CoinsBalance

	switch purchase_type {
	case config.HANDS_LEVEL_PURCHASE:
		new_level := user.HandsLevel + 1

		db_answer_code, hands_level := DB_GET_HandsLevel_BY_Number(new_level)
		switch db_answer_code {
		case DB_ANSWER_SUCCESS:
			if current_coin >= hands_level.Price {
				user.HandsLevel = new_level
				user.CoinsBalance = current_coin - hands_level.Price

				db.Save(&user)
				return DB_ANSWER_SUCCESS

			} else {
				return DB_ANSWER_INSUFFICIENT_BALANCE
			}

		case DB_ANSWER_OBJECT_NOT_FOUND:
			return DB_ANSWER_OBJECT_NOT_FOUND
		}

	case config.DURATION_LEVEL_PURCHASE:
		new_level := user.DurationLevel + 1

		db_answer_code, duration_level := DB_GET_DurationLevel_BY_Number(new_level)
		switch db_answer_code {
		case DB_ANSWER_SUCCESS:
			if current_coin >= duration_level.Price {
				user.DurationLevel = new_level
				user.CoinsBalance = current_coin - duration_level.Price

				db.Save(&user)
				return DB_ANSWER_SUCCESS

			} else {
				return DB_ANSWER_INSUFFICIENT_BALANCE
			}

		case DB_ANSWER_OBJECT_NOT_FOUND:
			return DB_ANSWER_OBJECT_NOT_FOUND
		}

	}

	return DB_ANSWER_SUCCESS
}

// Обновляем язык пользователя
func DB_UPDATE_User_Language(user_tg_id int64, new_language string) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var user User
	db.Where("user_tg_id = ?", user_tg_id).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	//Language
	if new_language != "" {
		user.Language = new_language
	}

	db.Save(&user)
	return DB_ANSWER_SUCCESS
}

// Обнулить монеты у пользователей
func DB_UPDATE_Users_CoinsBalance_ZERO() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	// Обновляем CoinsBalance всех пользователей, у которых CoinsBalance больше 0, на 0
	db.Model(&User{}).Where("coins_balance > 0").Update("coins_balance", 0)

	return DB_ANSWER_SUCCESS
}

// Удалить пользователя по ID
func DB_DELETE_User_BY_UserTgID(user_tg_id int64) int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	var user User
	db.Where("user_tg_id = ?", user_tg_id).First(&user)
	if user.ID == 0 {
		return DB_ANSWER_OBJECT_NOT_FOUND
	}

	db.Unscoped().Delete(&user)
	return DB_ANSWER_SUCCESS
}

// Удалить всех пользователей
func DB_DELETE_Users() int {

	db := DB_Database()

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	db.Exec("DELETE FROM users")
	db.Exec("SELECT setval('users_id_seq', 1, false)")
	return DB_ANSWER_SUCCESS
}
