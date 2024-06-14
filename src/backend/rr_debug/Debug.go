// ------------------------------------
// RR IT 2024
//
// ------------------------------------
// Базовый движок для AgavaDurkaTestBot

//
// ----------------------------------------------------------------------------------
//
// 					Debug (Модуль функций для отладки)
//
// ----------------------------------------------------------------------------------
//

package rr_debug

import (
	//Системные пакеты
	"encoding/json"
	"fmt"
	"log"
	"os"
	"regexp"
	"rr/agavadurkatestbot/config"
)

const (
	Reset     = "\033[0m"
	RedBg     = "\033[41m"
	GreenBg   = "\033[42m"
	YellowBg  = "\033[43m"
	BlueBg    = "\033[44m"
	WhiteText = "\033[97m"
	// Добавьте другие цвета по необходимости
)

func ColorBoxText(text string, bgColor string, textColor string) string {
	return fmt.Sprintf("%s%s%s%s%s", bgColor, textColor, " "+text+" ", Reset, WhiteText)
}

// Функция для удаления управляющих символов ANSI из строки
func StripANSI(text string) string {
	re := regexp.MustCompile(`\x1b\[[0-9;]+m`)
	return re.ReplaceAllString(text, "")
}

// Глвный отладочный механизм
func PrintLOG(file_name string, parent_function string, category string, error_type string, error_message string) {
	if config.CONFIG_PRINT_LOG {
		if config.CONFIG_PRINT_LOG_FILE {
			logPrefix := fmt.Sprintf("[FILE: %s]:[PARENT FUNCTION: %s]:[%s]: ", file_name, parent_function, category)

			var coloredErrorType string
			var logMessage string

			coloredErrorType = ColorBoxText(error_type, RedBg, WhiteText)

			if error_message == "" {
				logMessage = coloredErrorType + " " + logPrefix + error_type
			} else {
				logMessage = coloredErrorType + " " + logPrefix + error_type + " | Message: " + error_message
			}

			// Удаляем управляющие символы ANSI перед записью в файл
			logMessageWithoutANSI := StripANSI(logMessage)
			fmt.Println(logMessageWithoutANSI)

		} else {
			logPrefix := fmt.Sprintf("[FILE: %s]:[PARENT FUNCTION: %s]:[%s]: ", file_name, parent_function, category)

			var coloredErrorType string

			coloredErrorType = ColorBoxText(error_type, RedBg, WhiteText)

			if error_message == "" {
				fmt.Println(coloredErrorType + " " + logPrefix + error_type)
			} else {
				fmt.Println(coloredErrorType + " " + logPrefix + error_type + " | Message: " + error_message)
			}
		}
	}
}

// Печать объекта в консоли красиво
func PrintObject(object interface{}) error {

	log.Println("---------------------------------")
	b, err := json.MarshalIndent(object, "", "  ")
	if err != nil {
		return err
	}

	log.Println(string(b))
	log.Println("---------------------------------")
	return nil
}

// Сохранить объект в файл в корень программы
func SaveFileObject(object interface{}) error {

	jsonUpdate, err := json.MarshalIndent(object, "", "    ")
	if err != nil {
		log.Println("Ошибка при маршалинге объекта update:", err)
		return err
	}

	// Открываем файл для записи.
	file, err := os.Create("object_test.json")
	if err != nil {
		log.Println("Ошибка при открытии файла:", err)
		return err
	}
	defer file.Close()

	// Записываем JSON в файл.
	_, err = file.Write(jsonUpdate)
	if err != nil {
		log.Println("Ошибка при записи в файл:", err)
		return err
	}
	log.Println("Объект update сохранен в файл update.json.")
	return nil
}
