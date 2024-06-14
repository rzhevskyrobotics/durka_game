// RR Robotics & IT Solutions
// Made for AGAVA CRYPTO Team
// Initialy 2023

// Telegram App - Clicker DURKA
// PIXI.JS was used for game engine development

// Initialy written by Serg S. Rzhevsky https://github.com/rzhevskyrobotics

window.onload = function(error){

    //Constants
    const IS_DEBUG              = true;
    const IS_DEBUG_NEED_SYNC    = true;
    const DEBUG_MAX_HEALTH      = 500;
    const DEBUG_TG_ID           = 310307903; // CHANGE FOR DEBUG IN BROWSER. ALL TG FUNCTIONS WILL BE UNAVAILABLE IN DEBUG MODE

    //Base screensize for scaling
    const BACKGROUND_WIDTH  = 720;
    const BACKGROUND_HEIGHT = 1280;

    //Default values
    const DEFAULT_HEALTH_CURRENT            = 100;
    const DEFAULT_HEALTH_MAX                = 100;
    const DEFAULT_COOLDOWN_DELAY_SECODNS    = 15;
    const DEFAULT_SERVER_RESPONSE_TIMEOUT   = 30 * 1000;

    //For item spacing in forebs list
    const DEFAULT_FOREBS_ITEMS_Y_PAD        = 15;

    //Menu screens switching
    const GAME_SCENE_ID_PRELOADER = 0;
    const GAME_SCENE_ID_MAIN = 1;
    const GAME_SCENE_ID_BOOSTERS = 2;
    const GAME_SCENE_ID_BUY_HANDS = 3;
    const GAME_SCENE_ID_BUY_DURATION = 4;
    const GAME_SCENE_ID_FRENS = 5;
    const GAME_SCENE_ID_FORBES = 6;
    const GAME_SCENE_ID_WAIT = 7;
    const GAME_SCENE_ID_OK = 8;
    const GAME_SCENE_ID_CONFIRM = 9;

    //Main Char Animations State
    const CHARACTER_STATE_NORMAL = 0;
    const CHARACTER_STATE_HIT = 1;
    const CHARACTER_STATE_COOLDOWN = 2;

    //Animation speed
    const BOOSTERS_ANIMATION_FACTOR = 2;
    const MINTED_COINS_ANIMATION_FACTOR = 5;
    const BKG_COINS_ANIMATION_FACTOR = 5;
    const BKG_CLOUDS_ANIMATION_FACTOR = 3;
    

    //Boosters Appearance 
    const START_BOOSTER_SEC_MIN_DELAY = 10;
    const START_BOOSTER_SEC_MAX_DELAY = 20;
    const START_BOOSTER_BATH_MIN_DELAY = 20;
    const START_BOOSTER_BATH_MAX_DELAY = 40;

    const BOOSTER_SEC_DURATION      =    10 * 1000;
    const BOOSTER_BATH_DURATION     =    10 * 1000;

    //Purchase logic
    const CONFIRM_TYPE_BUY_HANDS    = 0;
    const CONFIRM_TYPE_BUY_DURATION = 1;

    const PURCHASE_TYPE_HANDS = 1;
    const PURCHASE_TYPE_DURATION = 2;

    //XP Bar sprites
    let xp_bar_sprites_list = [
        "scene1/animations/xp_bar/XP_0.png",
        "scene1/animations/xp_bar/XP_1.png",
        "scene1/animations/xp_bar/XP_2.png",
        "scene1/animations/xp_bar/XP_3.png",
        "scene1/animations/xp_bar/XP_4.png",
        "scene1/animations/xp_bar/XP_5.png",
        "scene1/animations/xp_bar/XP_6.png",
        "scene1/animations/xp_bar/XP_7.png",
        "scene1/animations/xp_bar/XP_8.png",
        "scene1/animations/xp_bar/XP_9.png",
        "scene1/animations/xp_bar/XP_10.png",
        "scene1/animations/xp_bar/XP_11.png",
        "scene1/animations/xp_bar/XP_12.png",
        "scene1/animations/xp_bar/XP_13.png",
        "scene1/animations/xp_bar/XP_14.png",
        "scene1/animations/xp_bar/XP_15.png",
        "scene1/animations/xp_bar/XP_16.png",
        "scene1/animations/xp_bar/XP_17.png"
    ];

    //Global Objects and variables
    let TgAppConnector;
    let PixiApp;
    let mainContainer;
    let gameScenePreloader, gameSceneMain, gameSceneBoosters, gameSceneBuyHands, gameSceneBuyDuration, gameSceneFrens, gameSceneForbes, gameSceneWaitMessage, gameSceneOkMessage, gameSceneConfirmMessage;
    let currentGameScene = GAME_SCENE_ID_MAIN;
    let gameSceneMain_secSprite, gameSceneMain_bathSprite, gameSceneMain_timerContainer, gameSceneMain_timerLabel;  
    let gameSceneMain_coinsContainer, gameSceneMain_coinsLabel, gameSceneMain_xpLabel, gameSceneMain_xpLabelBaseX, gameSceneMain_healthBar, gameSceneMain_mainCharacter, gameSceneMain_backgroundWidth;
    let gameSceneMain_cloudPepe, gameSceneMain_cloudDoge, gameSceneMain_cloudShibu;
    let gameSceneMain_bkgCoinsContainer;
    let gameSceneBoosters_coinsContainer, gameSceneBoosters_coinsLabel, gameSceneBoosters_handsPriceLabel, gameSceneBoosters_handsLevelLabel, gameSceneBoosters_durationPriceLabel, gameSceneBoosters_durationLevelLabel;
    let gameSceneForbes_coinsContainer, gameSceneForbes_coinsLabel;
    let gameSceneFrens_frensLabel;
    let gameSceneWait_textLabel, gameSceneWait_boxWidth;
    let gameSceneOk_textLabel, gameSceneOk_boxWidth;
    let gameSceneConfirm_textLabel, gameSceneConfirm_boxWidth;
    let frenslist_container, frenslist_frame_mask;
    let toplist_container, toplist_frame_mask;
    let isAppFirstSync = true;
    let isRequestingPurchase = false;
    let backgroundWidth;
    let backgroundHeight;
    let secSpriteMoveStage = 2;
    let bathSpriteMoveStage = 2;
    let isSecBoosterEnabled = false;
    let isBathBoosterEnabled = false;
    let lastCurrentHealthWithoutBooster = 0;
    let lastMaxHealthWithoutBooster = 0;

    //Sprites array for minted coins value animation
    let mintedCoins = [];
    //For booster animation
    let bkgCoins = [];


    if(!IS_DEBUG){
        //Object to interact with Tg MiniApps API
        TgAppConnector = window.Telegram.WebApp;
    }

    //User Vars
    let tgUserData;
    let tgUser;
    let userTgId = 0;
    let isUserFirstClicked = false;
    let isUserPremium = false;
    
    //From backend
    let userMetaData;

    //Positioning Vars
    let character_sprite_yPos = 0; //For postionig internal logics

    //Game Vars
    let currentHealth = DEFAULT_HEALTH_CURRENT;
    let maxHealth = DEFAULT_HEALTH_MAX;
    let characterStateCurrent = CHARACTER_STATE_NORMAL;
    let characterStateTarget = CHARACTER_STATE_NORMAL;
    let lastCooldownTimestamp = new Date();
    let currentConfirmType = CONFIRM_TYPE_BUY_HANDS;
    let purchaseBalanceHold = 0;

    //Balance
    let currentUserBalance = 0;
    let userBalanceUnregistered = 0;    //for storage, an addition to the balance that has not yet been registered by the back
    let sendBalanceBuffer = 0;

    let currentHitPerClick = 1;
    let currentCooldownDelay = DEFAULT_COOLDOWN_DELAY_SECODNS;
    let currentDurationLevel    = 0;
    let currentHandsLevel       = 0;
    


    //
    //Main Functional
    //


    //Create a Pixi Application
    PixiApp = new PIXI.Application({
        width: 512, 
        height: 512,
        backgroundColor: 0x011005,
        autoResize: true,
        antialias: true,
        resolution: window.devicePixelRatio || 1, //important! Prevents smoothing
        resizeTo: window, 
    });

    // For debug purpose 

    // PIXI.settings.ROUND_PIXELS = true;
    // PIXI.settings.RESOLUTION = window.devicePixelRatio;

    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(PixiApp.view);

    PixiApp.renderer.view.style.position = "absolute";
    PixiApp.renderer.view.style.display = "block";
    PixiApp.renderer.autoDensity = true;
    PixiApp.resizeTo = window;

    //Can check window resize(deprecated now)
    window.addEventListener('resize', handleWindowResize);

    //Can check resources loading
    PIXI.Loader.shared.onProgress.add(loadProgressHandler);

    PIXI.Loader.shared
    .add("/assets/media/preloader.json")
    .add("/assets/media/background.png")
    .add("/assets/media/background_dark.png")
    .load(setup_preloader);


    //Setup-1 - перед прелоадером
    function setup_preloader(){

        //Fix for close app
        const overflow = 100
        document.body.style.overflowY = 'hidden'
        document.body.style.marginTop = `${overflow}px`
        document.body.style.height = window.innerHeight + overflow + "px"
        document.body.style.paddingBottom = `${overflow}px`
        window.scrollTo(0, overflow)

        if(!IS_DEBUG){
            //Получаем данные с тг
            tgUserData = TgAppConnector.initData;
            tgUser = JSON.parse(getValueFromUrlEncodedString(tgUserData, "user"));

            TgAppConnector.expand();
            TgAppConnector.onEvent('viewportChanged', tgViewPortChangeHandler);
            TgAppConnector.ready();

            // Deprecated
            //TgAppConnector.isClosingConfirmationEnabled = true;

            if(tgUser === null){
                userTgId = 0;
            } else {
                userTgId = tgUser.id;
                if(tgUser.is_premium !== undefined){
                    if(tgUser.is_premium){
                        isUserPremium = true;
                    }
                }
            }

        } else{
            userTgId = DEBUG_TG_ID;
        }
        

        //Create Scenes
        mainContainer = new PIXI.Container();
        PixiApp.stage.addChild(mainContainer);

        gameScenePreloader = new PIXI.Container();
        mainContainer.addChild(gameScenePreloader);

        gameSceneMain = new PIXI.Container();
        mainContainer.addChild(gameSceneMain);

        gameSceneBoosters = new PIXI.Container();
        mainContainer.addChild(gameSceneBoosters);

        gameSceneBuyHands = new PIXI.Container();
        mainContainer.addChild(gameSceneBuyHands);

        gameSceneBuyDuration = new PIXI.Container();
        mainContainer.addChild(gameSceneBuyDuration);

        gameSceneFrens = new PIXI.Container();
        mainContainer.addChild(gameSceneFrens);

        gameSceneForbes = new PIXI.Container();
        mainContainer.addChild(gameSceneForbes);

        gameSceneWaitMessage = new PIXI.Container();
        mainContainer.addChild(gameSceneWaitMessage);

        gameSceneOkMessage = new PIXI.Container();
        mainContainer.addChild(gameSceneOkMessage);

        gameSceneConfirmMessage = new PIXI.Container();
        mainContainer.addChild(gameSceneConfirmMessage);

        setupUI_WaitMessage();
        setupUI_Preloader();
        setScene_Preloader();
        
        resizeWindow();
        

        // Create the loader
        let font1 = new FontFaceObserver('Montserrat', {});
        // Start loading the font
        font1.load().then(() => {
            let font2 = new FontFaceObserver('Montserrat-Light', {});
            // Start loading the font
            font2.load().then(() => {
                let data = {
                    "user_tg_id": userTgId,
                }

                let userGetInfoRequest = ajax_GET(CONFIG_APP_URL_BASE+"api/info/get-start-params", data, {});
                handler_getRequest(userGetInfoRequest);

            }, () => {
                // Failed load, log the error or display a message to the user
                alert('General Error: Unable to load required font 2! Please, contact us!');
            });

        }, () => {
            // Failed load, log the error or display a message to the user
            alert('General Error: Unable to load required font 1! Please, contact us!');
        });
    }

    //Setup-2 - после загрузки прелоадера и шрифтов
    function setup_main(){

        setupUI_Main();
        setupUI_Boosters();
        setupUI_BuyHands();
        setupUI_BuyDuration();
        setupUI_Frens();
        setupUI_Forbes();
        // setupUI_WaitMessage();
        setupUI_OkMessage();
        setupUI_ConfirmMessage();


        //setScene_Forbes();
        setScene_Main();
        //setScene_ShowWaitMessage("");
        //setScene_Frens();
        //setScene_Boosters();
        //setScene_ShowOkMessage("");
        //setScene_ShowConfirmMessage("");
        //setScene_Boosters();
        //setScene_BuyHands();
        //setScene_BuyDuration();
        //setScene_Frens();

        updateUI();

        PixiApp.ticker.add((delta) => gameLoop(delta));

        // Return function for timer stopping
        const stopBoosterSecTimer = startRandomBoosterTimer(START_BOOSTER_SEC_MIN_DELAY, START_BOOSTER_SEC_MAX_DELAY, startBooster_SEC);
        const stopBoosterBathTimer = startRandomBoosterTimer(START_BOOSTER_BATH_MIN_DELAY, START_BOOSTER_BATH_MAX_DELAY, startBooster_Bath);

        function startBooster_SEC(){
            if(characterStateCurrent != CHARACTER_STATE_COOLDOWN){
                if((secSpriteMoveStage >= 2) && (bathSpriteMoveStage >= 2)){
                    if((!isSecBoosterEnabled) && (!isBathBoosterEnabled)){
                        gameSceneMain_secSprite.x = 0 - gameSceneMain_secSprite.width - 50;
                        secSpriteMoveStage = 0;
                    }
                }
                
            }
        }

        function startBooster_Bath(){
            if(characterStateCurrent != CHARACTER_STATE_COOLDOWN){
                if((secSpriteMoveStage >= 2) && (bathSpriteMoveStage >= 2)){
                    if((!isSecBoosterEnabled) && (!isBathBoosterEnabled)){
                        gameSceneMain_bathSprite.x = backgroundWidth;
                        bathSpriteMoveStage = 0;
                    }
                }
            }
        }

        
        //Sync timeout
        setInterval(()=> {

            //Cooldown check
            if(characterStateCurrent == CHARACTER_STATE_COOLDOWN){
                let currentTimestamp = Date.now();

                const differenceMilliseconds = Math.abs(currentTimestamp - lastCooldownTimestamp);
                const differenceSeconds = differenceMilliseconds / 1000;
                gameSceneMain_timerLabel.text = "Wait " + formatTimeForCooldownTimer(currentCooldownDelay-differenceSeconds);

                if(differenceSeconds >= currentCooldownDelay){
                    currentHealth = maxHealth;
                    characterStateTarget = CHARACTER_STATE_NORMAL;
                    updateHealthBar();
                    //Убираем таймер
                    gameSceneMain_timerContainer.visible = false;
                }
            }

            //Save State
            if(!isRequestingPurchase){
                sendBalanceBuffer = userBalanceUnregistered;
                userBalanceUnregistered = 0;

                let sendUserHealth;
                if(isBathBoosterEnabled){
                    sendUserHealth = lastCurrentHealthWithoutBooster;
                } else{
                    sendUserHealth = currentHealth;
                }

                const timestamp = new Date().getTime();
                let data = {
                    is_premium: isUserPremium,
                    is_first_posha: isUserFirstClicked,
                    user_tg_id: userTgId,
                    user_name: "",
                    coins_balance: sendBalanceBuffer,
                    current_health: sendUserHealth,
                    last_sync: timestamp,
                    last_cooldown: lastCooldownTimestamp.getTime(),   
                }

                if(IS_DEBUG_NEED_SYNC){
                    let updateUserRequest = ajax_PUT(CONFIG_APP_URL_BASE+"api/users/game-sync", data, {});
                    handler_updateRequest(updateUserRequest);
                }
            }

        }, 1000);
    }

    //Main PIXI game loop
    function gameLoop(delta) {
        gameSceneMain_cloudShibu.x += BKG_CLOUDS_ANIMATION_FACTOR;
        gameSceneMain_cloudPepe.x += BKG_CLOUDS_ANIMATION_FACTOR;
        gameSceneMain_cloudDoge.x += BKG_CLOUDS_ANIMATION_FACTOR;

        if(gameSceneMain_cloudShibu.x >= backgroundWidth){
            gameSceneMain_cloudShibu.x = -gameSceneMain_cloudShibu.width;
        }

        if(gameSceneMain_cloudPepe.x >= backgroundWidth){
            gameSceneMain_cloudPepe.x = -gameSceneMain_cloudPepe.width;
        }

        if(gameSceneMain_cloudDoge.x >= backgroundWidth){
            gameSceneMain_cloudDoge.x = -gameSceneMain_cloudDoge.width;
        }

        //SEC Booster
        if(secSpriteMoveStage == 0){
            if( gameSceneMain_secSprite.x <= 0){
                gameSceneMain_secSprite.x += BOOSTERS_ANIMATION_FACTOR;
            } else {
                secSpriteMoveStage = 1;
            }
        } else if(secSpriteMoveStage == 1){
            if( gameSceneMain_secSprite.x >= -gameSceneMain_secSprite.width){
                gameSceneMain_secSprite.x -= BOOSTERS_ANIMATION_FACTOR;
            } else {
                secSpriteMoveStage = 2;
            }
        }

        //Bath Booster
        if(bathSpriteMoveStage == 0){
            if( gameSceneMain_bathSprite.x >= (backgroundWidth - gameSceneMain_bathSprite.width)){
                gameSceneMain_bathSprite.x -= BOOSTERS_ANIMATION_FACTOR;
            } else {
                bathSpriteMoveStage = 1;
            }
        } else if(bathSpriteMoveStage == 1){
            if( gameSceneMain_bathSprite.x <= backgroundWidth){
                gameSceneMain_bathSprite.x += BOOSTERS_ANIMATION_FACTOR;
            } else {
                bathSpriteMoveStage = 2;
            }
        }

        for (let i = 0; i < mintedCoins.length; i++) {
            mintedCoins[i].object.y -= MINTED_COINS_ANIMATION_FACTOR;
            mintedCoins[i].object.alpha -= 0.02;
            if(mintedCoins[i].object.y < 100){
                gameSceneMain.removeChild(mintedCoins[i].object);
                mintedCoins.splice(i, 1);
            }
        }

        if(isSecBoosterEnabled){
            for (let i = 0; i < bkgCoins.length; i++) {
                bkgCoins[i].y += BKG_COINS_ANIMATION_FACTOR;
    
                if(bkgCoins[i].y >= backgroundHeight){
                    bkgCoins[i].y = -bkgCoins[i].height;
                }
            }
        }
    }

    function setupUI_Preloader(){
        let sheet = PIXI.Loader.shared.resources["/assets/media/preloader.json"].spritesheet;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background.png"].texture);
        gameScenePreloader.addChild(background);

        backgroundWidth = background.width;
        backgroundHeight = background.height;

        //Text "Loading"
        let preloader_loading = new PIXI.AnimatedSprite(sheet.animations["preloader_loading"]);
        preloader_loading.animationSpeed = 1 / 15; 
        preloader_loading.autoUpdate = true;
        preloader_loading.play();

        preloader_loading.x = backgroundWidth / 2 - preloader_loading.width / 2;
        preloader_loading.y = 400;

        gameScenePreloader.addChild(preloader_loading);

        let counter = 0;
        preloader_loading.onLoop = function (){
            counter = 0;
        }
        preloader_loading.onFrameChange = function (){
            counter = counter + 6;
            preloader_loading.x = backgroundWidth / 2 - preloader_loading.width / 2 + counter;
        }

        //ScaleBar
        let scalebar = new PIXI.AnimatedSprite(sheet.animations["preloader_scalebar"]);
        scalebar.animationSpeed = 1 / 30; 
        scalebar.autoUpdate = true;
        scalebar.play();

        scalebar.anchor.set(0.5, 1);
        scalebar.x = backgroundWidth / 2;
        scalebar.y = preloader_loading.y + preloader_loading.height + scalebar.height + 50;

        gameScenePreloader.addChild(scalebar);

    }

    function setupUI_Main() {
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background.png"].texture);
        gameSceneMain.addChild(background);

        backgroundWidth = background.width;

        gameSceneMain_backgroundWidth = backgroundWidth;

        //
        //  Boosters mask
        //

        let background_mask = new PIXI.Graphics();
        background_mask.beginFill(0xffffff);
        background_mask.lineStyle(0);
        background_mask.drawRect(0, 0, background.width, background.height);
        gameSceneMain.addChild(background_mask);


        //
        //  Clouds
        //

        //Shibu
        gameSceneMain_cloudShibu = new PIXI.Sprite(textureAthlas["scene1/shibo_cloud.png"]);
        gameSceneMain_cloudShibu.mask = background_mask;

        gameSceneMain_cloudShibu.x = 94;
        gameSceneMain_cloudShibu.y = 356;

        gameSceneMain.addChild(gameSceneMain_cloudShibu);

        //Doge
        gameSceneMain_cloudDoge = new PIXI.Sprite(textureAthlas["scene1/doge_cloud.png"]);
        gameSceneMain_cloudDoge.mask = background_mask;

        gameSceneMain_cloudDoge.x = 616;
        gameSceneMain_cloudDoge.y = 371;

        gameSceneMain.addChild(gameSceneMain_cloudDoge);

        //Pepe
        gameSceneMain_cloudPepe = new PIXI.Sprite(textureAthlas["scene1/pepe_cloud.png"]);
        gameSceneMain_cloudPepe.mask = background_mask;

        gameSceneMain_cloudPepe.x = 366;
        gameSceneMain_cloudPepe.y = 235;

        gameSceneMain.addChild(gameSceneMain_cloudPepe);

        //Coins
        gameSceneMain_bkgCoinsContainer = new PIXI.Container();
        for(let j = 0; j <= 21; j++){
            for(let i = 0; i <= 10; i++){
                let bkg_coin_sprite = new PIXI.Sprite(textureAthlas["share/Big_coin.png"]);
                bkg_coin_sprite.scale.x = 0.5;
                bkg_coin_sprite.scale.y = 0.5;
    
                bkg_coin_sprite.y = bkg_coin_sprite.height * j + 15 * j;
                bkg_coin_sprite.x += 25 + bkg_coin_sprite.width * i + 15 * i;
    
                gameSceneMain_bkgCoinsContainer.addChild(bkg_coin_sprite);

                bkgCoins.push(bkg_coin_sprite)
            }
        }

        gameSceneMain.addChild(gameSceneMain_bkgCoinsContainer);
        gameSceneMain_bkgCoinsContainer.visible = false;

        //
        // Timer
        //

        gameSceneMain_timerContainer = new PIXI.Container();

        let timer_sprite = new PIXI.Sprite(textureAthlas["scene1/Timer_standalone.png"]);

        const timer_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 6,
        });

        gameSceneMain_timerLabel = new PIXI.Text("Wait 00:00", timer_label_style);

        gameSceneMain_timerContainer.addChild(timer_sprite);
        gameSceneMain_timerContainer.addChild(gameSceneMain_timerLabel);

        gameSceneMain_timerLabel.x = timer_sprite.width + 10;
        gameSceneMain_timerLabel.y = timer_sprite.height / 2 - gameSceneMain_timerLabel.height / 2;

        gameSceneMain_timerContainer.x = backgroundWidth / 2 - gameSceneMain_timerContainer.width / 2;
        gameSceneMain_timerContainer.y = 55;

        gameSceneMain.addChild(gameSceneMain_timerContainer);
        
        gameSceneMain_timerContainer.visible = false;

        //
        // Coins bar
        //
        gameSceneMain_coinsContainer = new PIXI.Container();

        let coins_coin_sprite = new PIXI.Sprite(textureAthlas["share/Big_coin.png"]);

        const coins_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 70,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 8,
        });

        gameSceneMain_coinsLabel = new PIXI.Text(formatNumberWithCommasNoPadding(0), coins_label_style);

        gameSceneMain_coinsContainer.addChild(coins_coin_sprite);
        gameSceneMain_coinsContainer.addChild(gameSceneMain_coinsLabel);

        gameSceneMain_coinsLabel.x = coins_coin_sprite.width + 10;
        gameSceneMain_coinsLabel.y = coins_coin_sprite.height / 2 - gameSceneMain_coinsLabel.height / 2;

        gameSceneMain_coinsContainer.x = backgroundWidth / 2 - gameSceneMain_coinsContainer.width / 2;
        gameSceneMain_coinsContainer.y = 127;

        gameSceneMain.addChild(gameSceneMain_coinsContainer);

        //
        // Main Char
        //

        let sheet = PIXI.Loader.shared.resources["/assets/media/animation_char.json"].spritesheet;

        gameSceneMain_mainCharacter = new PIXI.AnimatedSprite(sheet.animations["char_normal"]);
        gameSceneMain_mainCharacter.animationSpeed = 1 / 6;
        gameSceneMain_mainCharacter.play();

        gameSceneMain_mainCharacter.anchor.set(0, 1);
        gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;

        character_sprite_yPos = 245 + gameSceneMain_mainCharacter.height;

        gameSceneMain_mainCharacter.y = character_sprite_yPos;

        gameSceneMain.addChild(gameSceneMain_mainCharacter);

        //State changin logic
        gameSceneMain_mainCharacter.onLoop = function() {
            if(characterStateCurrent != characterStateTarget){
                if(characterStateTarget == CHARACTER_STATE_NORMAL){
                    if(isBathBoosterEnabled){
                        gameSceneMain_mainCharacter.stop();
                        gameSceneMain_mainCharacter.textures = sheet.animations["char_bath"];
                        gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                        gameSceneMain_mainCharacter.play();
                        characterStateCurrent = CHARACTER_STATE_NORMAL;
                    } else{
                        gameSceneMain_mainCharacter.stop();
                        gameSceneMain_mainCharacter.textures = sheet.animations["char_normal"];
                        gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                        gameSceneMain_mainCharacter.play();
                        characterStateCurrent = CHARACTER_STATE_NORMAL;
                    }
                }
            }
        }

        //Hitbox
        let mainChar_hitbox = new PIXI.Graphics();
        mainChar_hitbox.beginFill(0xffffff);
        mainChar_hitbox.lineStyle(0);
        mainChar_hitbox.drawRoundedRect(0, 0, gameSceneMain_mainCharacter.width-70, gameSceneMain_mainCharacter.height, 55);
        mainChar_hitbox.endFill();
        mainChar_hitbox.alpha = 0;

        mainChar_hitbox.x = backgroundWidth / 2 - mainChar_hitbox.width / 2;
        mainChar_hitbox.y = 245;

        gameSceneMain.addChild(mainChar_hitbox);

        //
        // XP Bar 
        //
        let xp_bar_container = new PIXI.Container();

        gameSceneMain_healthBar = new PIXI.Sprite(textureAthlas[xp_bar_sprites_list[0]]);

        let xp_bar_coin_sprite = new PIXI.Sprite(textureAthlas["scene1/Small_coin_for_XP.png"]);

        xp_bar_container.addChild(gameSceneMain_healthBar);
        xp_bar_container.addChild(xp_bar_coin_sprite);
        
        xp_bar_coin_sprite.x = gameSceneMain_healthBar.x + 20;
        xp_bar_coin_sprite.y = xp_bar_container.height / 2 - xp_bar_coin_sprite.height / 2 - 2;

        const xp_bar_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 23,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 2,
        });

        gameSceneMain_xpLabel = new PIXI.Text("0000/0000", xp_bar_style);
        xp_bar_container.addChild(gameSceneMain_xpLabel);

        //gameSceneMain_xpLabel.anchor.set(1,0);
        gameSceneMain_xpLabel.y = xp_bar_container.height / 2 - gameSceneMain_xpLabel.height / 2 - 4;

        gameSceneMain_xpLabelBaseX = xp_bar_coin_sprite.x + xp_bar_coin_sprite.width + gameSceneMain_xpLabel.width / 2;
        gameSceneMain_xpLabel.x = gameSceneMain_xpLabelBaseX - gameSceneMain_xpLabel.width / 2;

        updateHealthBar();

        xp_bar_container.y = 1019; 
        xp_bar_container.x = backgroundWidth / 2 - xp_bar_container.width / 2;

        gameSceneMain.addChild(xp_bar_container);

        //
        // SEC / Bath Boosters
        //

        gameSceneMain_secSprite = new PIXI.Sprite(textureAthlas["scene1/SEC.png"]);
        gameSceneMain_secSprite.mask = background_mask;

        gameSceneMain_secSprite.y = 391;
        gameSceneMain_secSprite.x = 0 - gameSceneMain_secSprite.width - 50;

        gameSceneMain.addChild(gameSceneMain_secSprite);

        gameSceneMain_bathSprite = new PIXI.Sprite(textureAthlas["scene1/Bath.png"]);
        gameSceneMain_bathSprite.mask = background_mask;

        gameSceneMain_bathSprite.y = 607;
        gameSceneMain_bathSprite.x = backgroundWidth;

        gameSceneMain.addChild(gameSceneMain_bathSprite);


        //
        // Buttons menu
        //

        let navigation_container = new PIXI.Container();
        let navigation_buttons_container = new PIXI.Container();
        let navigation_background_sprite = new PIXI.Sprite(textureAthlas["scene1/Panel_buttons.png"]);

        let navigation_button_boosters = new PIXI.Sprite(textureAthlas["scene1/Boosters_button.png"]);
        navigation_button_boosters.x = 50;
        let navigation_button_forebs = new PIXI.Sprite(textureAthlas["scene1/Forebs_button.png"]);
        navigation_button_forebs.x = navigation_button_boosters.x + navigation_button_boosters.width + 90;
        let navigation_button_frens = new PIXI.Sprite(textureAthlas["scene1/Frens_button.png"]);
        navigation_button_frens.x = navigation_button_forebs.x + navigation_button_forebs.width + 90;

        navigation_container.addChild(navigation_background_sprite); 

        navigation_buttons_container.addChild(navigation_button_boosters);
        navigation_buttons_container.addChild(navigation_button_forebs);
        navigation_buttons_container.addChild(navigation_button_frens);

        navigation_buttons_container.y += 10;

        navigation_container.addChild(navigation_buttons_container);

        navigation_container.x = backgroundWidth / 2 - navigation_container.width / 2;
        navigation_container.y = 1104;

        gameSceneMain.addChild(navigation_container);


        //Button Actions

        //Hitbox
        mainChar_hitbox.interactive = true;
        mainChar_hitbox.buttonMode = true;

        mainChar_hitbox.on('pointerdown', (event) => {
            onCharacterHit_handler(event);
        });
    
        mainChar_hitbox.on('pointerup', () => {
        });
    
        mainChar_hitbox.on('pointerupoutside', () => {
        });

        //Char Hit
        function onCharacterHit_handler(event){
            if(characterStateCurrent != CHARACTER_STATE_COOLDOWN){
                let minted_coins;

                if(isSecBoosterEnabled){
                    minted_coins = currentHitPerClick * 3
                    currentUserBalance += minted_coins;
                    userBalanceUnregistered += minted_coins;
                } else {
                    minted_coins = currentHitPerClick;
                    currentHealth -= currentHitPerClick;
                    currentUserBalance += minted_coins;
                    userBalanceUnregistered += minted_coins;
                }
                updateUIBalance();

                const minted_number_style = new PIXI.TextStyle({
                    fontFamily: "Montserrat",
                    fontStyle: "Bold",
                    fontSize: 40,
                    fill: "white"
                });

                const globalX = event.data.global.x;
                const globalY = event.data.global.y;

                const localPosition = gameSceneMain.toLocal(new PIXI.Point(globalX, globalY));


                let text_label = new PIXI.Text("+ " + minted_coins, minted_number_style);

                let mintedCoinsLabelObj = {
                    event : event,
                    object : text_label,
                };

                text_label.anchor.set(0.5);
                text_label.x = localPosition.x;
                text_label.y = localPosition.y;
                gameSceneMain.addChild(text_label);

                mintedCoins.push(mintedCoinsLabelObj);


                if(currentHealth <= 0){
                    currentHealth = 0;
                    isUserFirstClicked = true;

                    //Now we remove the boosters, if they suddenly appeared
                    if(secSpriteMoveStage < 2){
                        secSpriteMoveStage = 2;
                        gameSceneMain_secSprite.x = -gameSceneMain_secSprite.width;
                    }

                    if(bathSpriteMoveStage < 2){
                        bathSpriteMoveStage = 2;
                        gameSceneMain_bathSprite.x = backgroundWidth;
                    }

                    //If you were in the booster, we remove it and go into normal mode
                    if(isBathBoosterEnabled){
                        currentHealth = lastCurrentHealthWithoutBooster;
                        maxHealth = lastMaxHealthWithoutBooster;
                        updateHealthBar();
                        isBathBoosterEnabled = false;

                        characterStateCurrent = CHARACTER_STATE_NORMAL;
                        characterStateTarget = CHARACTER_STATE_NORMAL;

                        gameSceneMain_mainCharacter.stop();
                        gameSceneMain_mainCharacter.textures = sheet.animations["char_normal"];
                        gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                        gameSceneMain_mainCharacter.play();

                    } else{
                        characterStateCurrent = CHARACTER_STATE_COOLDOWN;
                        characterStateTarget = CHARACTER_STATE_COOLDOWN;

                        gameSceneMain_mainCharacter.stop();
                        gameSceneMain_mainCharacter.textures = sheet.animations["char_cooldown"];
                        gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                        gameSceneMain_mainCharacter.play();

                        lastCooldownTimestamp = new Date();

                        gameSceneMain_timerContainer.visible = true;
                        gameSceneMain_timerLabel.text = "Wait " + formatTimeForCooldownTimer(currentCooldownDelay);
                    }

                    //We charge the balance + write it to the buffer
                    let total_posha_balance = currentHitPerClick * 500;
                    let dropped_balance = getRandomInt(0.5 * total_posha_balance, 2 * total_posha_balance);
                    currentUserBalance += dropped_balance;
                    userBalanceUnregistered += dropped_balance;
                    updateUIBalance();

                } else{
                    if(characterStateCurrent != CHARACTER_STATE_HIT){
                        if(isBathBoosterEnabled){
                            gameSceneMain_mainCharacter.stop();
                            gameSceneMain_mainCharacter.textures = sheet.animations["char_bath_hit"];
                            gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                            gameSceneMain_mainCharacter.play();
                            characterStateCurrent = CHARACTER_STATE_HIT;
                            characterStateTarget = CHARACTER_STATE_NORMAL;
                        } else{
                            gameSceneMain_mainCharacter.stop();
                            gameSceneMain_mainCharacter.textures = sheet.animations["char_hit"];
                            gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                            gameSceneMain_mainCharacter.play();
                            characterStateCurrent = CHARACTER_STATE_HIT;
                            characterStateTarget = CHARACTER_STATE_NORMAL;
                        }
                        
                    }
                }
                updateHealthBar();
            }
        }

        //Boosters - SEC
        gameSceneMain_secSprite.interactive = true;
        gameSceneMain_secSprite.buttonMode = true;

        gameSceneMain_secSprite.on('pointerdown', () => {
            setPressEffect(gameSceneMain_secSprite);
        });
    
        gameSceneMain_secSprite.on('pointerup', () => {
            gameSceneMain_secSprite.filters = [];
            setTimeout(()=> {
                onSecBooster_handler();
            }, 10);
        });
    
        gameSceneMain_secSprite.on('pointerupoutside', () => {
            gameSceneMain_secSprite.filters = [];
            setTimeout(()=> {
                onSecBooster_handler();
            }, 10);
        });

        function onSecBooster_handler(){
            secSpriteMoveStage = 2;
            gameSceneMain_secSprite.x = -gameSceneMain_secSprite.width;
            isSecBoosterEnabled = true;
            gameSceneMain_bkgCoinsContainer.visible = true;
            setTimeout(()=>{
                gameSceneMain_bkgCoinsContainer.visible = false;
                isSecBoosterEnabled = false;
            }, BOOSTER_SEC_DURATION);
        }

        //Boosters - Bath
        gameSceneMain_bathSprite.interactive = true;
        gameSceneMain_bathSprite.buttonMode = true;

        gameSceneMain_bathSprite.on('pointerdown', () => {
            setPressEffect(gameSceneMain_bathSprite);
        });
    
        gameSceneMain_bathSprite.on('pointerup', () => {
            gameSceneMain_bathSprite.filters = [];
            setTimeout(()=> {
                onBathBooster_handler();
            }, 10);
        });
    
        gameSceneMain_bathSprite.on('pointerupoutside', () => {
            gameSceneMain_bathSprite.filters = [];
            setTimeout(()=> {
                onBathBooster_handler();
            }, 10);
        });

        function onBathBooster_handler(){
            bathSpriteMoveStage = 2;
            gameSceneMain_bathSprite.x = backgroundWidth;
            isBathBoosterEnabled = true;

            lastCurrentHealthWithoutBooster = currentHealth;
            lastMaxHealthWithoutBooster = maxHealth;

            maxHealth = maxHealth * 3;
            currentHealth = maxHealth;

            updateHealthBar();

            gameSceneMain_mainCharacter.stop();
            gameSceneMain_mainCharacter.textures = sheet.animations["char_bath"];
            gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
            gameSceneMain_mainCharacter.play();

            setTimeout(()=>{
                if(isBathBoosterEnabled){
                    currentHealth = lastCurrentHealthWithoutBooster;
                    maxHealth = lastMaxHealthWithoutBooster;
                    updateHealthBar();

                    // DEPRECATED
                    // if(characterStateCurrent == CHARACTER_STATE_COOLDOWN){
                    //     gameSceneMain_mainCharacter.stop();
                    //     gameSceneMain_mainCharacter.textures = sheet.animations["char_cooldown"];
                    //     gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                    //     gameSceneMain_mainCharacter.play();

                    // } else{
                    //     gameSceneMain_mainCharacter.stop();
                    //     gameSceneMain_mainCharacter.textures = sheet.animations["char_normal"];
                    //     gameSceneMain_mainCharacter.x = backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                    //     gameSceneMain_mainCharacter.play();
                    // }

                    

                    isBathBoosterEnabled = false;
                }
            }, BOOSTER_BATH_DURATION);
        }

        //Boosters
        navigation_button_boosters.interactive = true;
        navigation_button_boosters.buttonMode = true;

        navigation_button_boosters.on('pointerdown', () => {
            setPressEffect(navigation_button_boosters);
        });
    
        navigation_button_boosters.on('pointerup', () => {
            navigation_button_boosters.filters = [];
            setTimeout(()=> {
                setScene_Boosters();
            }, 10);
        });
    
        navigation_button_boosters.on('pointerupoutside', () => {
            navigation_button_boosters.filters = [];
            setTimeout(()=> {
                setScene_Boosters();
            }, 10);
        });

        //Forebs
        navigation_button_forebs.interactive = true;
        navigation_button_forebs.buttonMode = true;

        navigation_button_forebs.on('pointerdown', () => {
            setPressEffect(navigation_button_forebs);
        });
    
        navigation_button_forebs.on('pointerup', () => {
            navigation_button_forebs.filters = [];
            setTimeout(()=> {
                setScene_Forbes();
            }, 10);
        });
    
        navigation_button_forebs.on('pointerupoutside', () => {
            navigation_button_forebs.filters = [];
            setTimeout(()=> {
                setScene_Forbes();
            }, 10);
        });

        //Frens
        navigation_button_frens.interactive = true;
        navigation_button_frens.buttonMode = true;

        navigation_button_frens.on('pointerdown', () => {
            setPressEffect(navigation_button_frens);
        });
    
        navigation_button_frens.on('pointerup', () => {
            navigation_button_frens.filters = [];
            setTimeout(()=> {
                setScene_Frens();
            }, 10);
        });
    
        navigation_button_frens.on('pointerupoutside', () => {
            navigation_button_frens.filters = [];
            setTimeout(()=> {
                setScene_Frens();
            }, 10);
        });

    }

    function setupUI_Boosters(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background.png"].texture);
        gameSceneBoosters.addChild(background);

        backgroundWidth = background.width;

        //
        // Label "your balance"
        //

        const balance_small_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
        });

        let your_balance_text = new PIXI.Text("YOUR BALANCE", balance_small_label_style);
        your_balance_text.x = backgroundWidth / 2 - your_balance_text.width / 2;
        your_balance_text.y = 126;

        gameSceneBoosters.addChild(your_balance_text);

        //
        // Balance
        //
        gameSceneBoosters_coinsContainer = new PIXI.Container();

        let balance_coin_sprite = new PIXI.Sprite(textureAthlas["share/Big_coin.png"]);

        const coins_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 70,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 8,
        });

        gameSceneBoosters_coinsLabel = new PIXI.Text(formatNumberWithCommas(0), coins_label_style);

        gameSceneBoosters_coinsContainer.addChild(balance_coin_sprite);
        gameSceneBoosters_coinsContainer.addChild(gameSceneBoosters_coinsLabel);

        gameSceneBoosters_coinsLabel.x = balance_coin_sprite.width + 10;
        gameSceneBoosters_coinsLabel.y = balance_coin_sprite.height / 2 - gameSceneBoosters_coinsLabel.height / 2;

        gameSceneBoosters_coinsContainer.x = backgroundWidth / 2 - gameSceneBoosters_coinsContainer.width / 2;
        gameSceneBoosters_coinsContainer.y = 164;

        gameSceneBoosters.addChild(gameSceneBoosters_coinsContainer);

        //
        // Boosters
        //
        let boosters_buttons_container = new PIXI.Container();

        const boosters_small_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 30,
            fill: "white",
        });

        let boosters_buttons_background_sprite = new PIXI.Sprite(textureAthlas["scene2/Panel.png"]);

        boosters_buttons_container.addChild(boosters_buttons_background_sprite);
        boosters_buttons_container.x = backgroundWidth / 2 - boosters_buttons_container.width / 2;
        boosters_buttons_container.y = 322;

        //Button Hands
        let boosters_button_hands_container = new PIXI.Container();

        let boosters_button_hands_sprite = new PIXI.Sprite(textureAthlas["scene2/Panel_HANDS.png"]);
        boosters_button_hands_container.addChild(boosters_button_hands_sprite);

        boosters_button_hands_container.x = boosters_buttons_container.width / 2 - boosters_button_hands_container.width / 2;
        boosters_button_hands_container.y = 110;

        let boosters_button_hands_arrow = new PIXI.Sprite(textureAthlas["scene2/Arrow.png"]);
        boosters_button_hands_arrow.y = boosters_button_hands_container.height / 2 - boosters_button_hands_arrow.height / 2;
        boosters_button_hands_arrow.x = 483;
        boosters_button_hands_container.addChild(boosters_button_hands_arrow);

        //Labels
        gameSceneBoosters_handsPriceLabel = new PIXI.Text("500", boosters_small_label_style);
        gameSceneBoosters_handsPriceLabel.x = 183;
        gameSceneBoosters_handsPriceLabel.y = 63;
        boosters_button_hands_container.addChild(gameSceneBoosters_handsPriceLabel);

        gameSceneBoosters_handsLevelLabel = new PIXI.Text("lvl 1", boosters_small_label_style);
        gameSceneBoosters_handsLevelLabel.x = 400;
        gameSceneBoosters_handsLevelLabel.y = 63;
        boosters_button_hands_container.addChild(gameSceneBoosters_handsLevelLabel);

        boosters_buttons_container.addChild(boosters_button_hands_container);

        //Button Duration
        let boosters_button_duration_container = new PIXI.Container();

        let boosters_button_duration_sprite = new PIXI.Sprite(textureAthlas["scene2/Panel_DURATION.png"]);
        boosters_button_duration_container.addChild(boosters_button_duration_sprite);

        boosters_button_duration_container.x = boosters_buttons_container.width / 2 - boosters_button_duration_container.width / 2;
        boosters_button_duration_container.y = 255;

        let boosters_button_duration_arrow = new PIXI.Sprite(textureAthlas["scene2/Arrow.png"]);
        boosters_button_duration_arrow.y = boosters_button_duration_container.height / 2 - boosters_button_duration_arrow.height / 2;
        boosters_button_duration_arrow.x = 483;
        boosters_button_duration_container.addChild(boosters_button_duration_arrow);

        //Label
        gameSceneBoosters_durationPriceLabel = new PIXI.Text(formatNumberWithCommasNoPadding(10000), boosters_small_label_style);
        gameSceneBoosters_durationPriceLabel.x = 183;
        gameSceneBoosters_durationPriceLabel.y = 63;
        boosters_button_duration_container.addChild(gameSceneBoosters_durationPriceLabel);

        gameSceneBoosters_durationLevelLabel = new PIXI.Text("lvl 1", boosters_small_label_style);
        gameSceneBoosters_durationLevelLabel.x = 400;
        gameSceneBoosters_durationLevelLabel.y = 63;
        boosters_button_duration_container.addChild(gameSceneBoosters_durationLevelLabel);

        boosters_buttons_container.addChild(boosters_button_duration_container);



        gameSceneBoosters.addChild(boosters_buttons_container);

        //
        // Button "back"
        //
        let back_button_sprite = new PIXI.Sprite(textureAthlas["share/back_arrow.png"]);
        back_button_sprite.x = 45;
        back_button_sprite.y = 45;

        gameSceneBoosters.addChild(back_button_sprite);


        //Hands
        boosters_button_hands_container.interactive = true;
        boosters_button_hands_container.buttonMode = true;

        boosters_button_hands_container.on('pointerdown', () => {
            setPressEffect(boosters_button_hands_container);
        });
    
        boosters_button_hands_container.on('pointerup', () => {
            boosters_button_hands_container.filters = [];
            setTimeout(()=> {
                onBuyHandsButton_handler();
            }, 10);
        });
    
        boosters_button_hands_container.on('pointerupoutside', () => {
            boosters_button_hands_container.filters = [];
            setTimeout(()=> {
                onBuyHandsButton_handler();
            }, 10);
        });

        function onBuyHandsButton_handler(){
            if(currentHandsLevel == 10){
                setScene_ShowOkMessage("You've reached the top, fren");
            } else{
                currentConfirmType = CONFIRM_TYPE_BUY_HANDS;

                let buyPrice = 500;

                const handsElement = getElementByNumber(userMetaData.hands_levels_data, currentHandsLevel+1);
                if(handsElement !== undefined){
                    buyPrice = handsElement.price;
                }

                setScene_ShowConfirmMessage(`The price is ${formatNumberWithCommasNoPadding(buyPrice)} coins\nDo we take it, fren?`);
            }
        }

        //Duration
        boosters_button_duration_container.interactive = true;
        boosters_button_duration_container.buttonMode = true;

        boosters_button_duration_container.on('pointerdown', () => {
            setPressEffect(boosters_button_duration_container);
        });
    
        boosters_button_duration_container.on('pointerup', () => {
            boosters_button_duration_container.filters = [];
            setTimeout(()=> {
                onBuyDurationButton_handler();
            }, 10);
        });
    
        boosters_button_duration_container.on('pointerupoutside', () => {
            boosters_button_duration_container.filters = [];
            setTimeout(()=> {
                onBuyDurationButton_handler();
            }, 10);
        });

        function onBuyDurationButton_handler(){
            if(currentDurationLevel == 4){
                setScene_ShowOkMessage("You've reached the top, fren");
            } else{
                currentConfirmType = CONFIRM_TYPE_BUY_DURATION;

                let buyPrice = 10000;

                const durationElement = getElementByNumber(userMetaData.duration_levels_data, currentDurationLevel+1);
                if(durationElement !== undefined){
                    buyPrice = durationElement.price;
                }

                setScene_ShowConfirmMessage(`The price is ${formatNumberWithCommasNoPadding(buyPrice)} coins\nDo we take it, fren?`);
            }
        }
        

        //Back
        back_button_sprite.interactive = true;
        back_button_sprite.buttonMode = true;

        back_button_sprite.on('pointerdown', () => {
            setPressEffect(back_button_sprite);
        });
    
        back_button_sprite.on('pointerup', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
    
        back_button_sprite.on('pointerupoutside', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
    }

    function setupUI_BuyHands(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background_dark.png"].texture);
        gameSceneBuyHands.addChild(background);

        backgroundWidth = background.width;

        //
        // Menu
        //
        let main_box_container = new PIXI.Container();

        let main_box_sprite = new PIXI.Sprite(textureAthlas["scene2/Panel_buy_HANDS.png"]);
        main_box_container.addChild(main_box_sprite);

        //Button GET
        let main_box_buy_button_container = new PIXI.Container();
        let main_box_buy_button_sprite = new PIXI.Sprite(textureAthlas["scene2/Button_get.png"]);
        main_box_buy_button_container.addChild(main_box_buy_button_sprite);
        main_box_buy_button_container.x = main_box_sprite.width / 2 - main_box_buy_button_container.width / 2;
        main_box_buy_button_container.y = 319;
        main_box_container.addChild(main_box_buy_button_container);

        //Button Close
        let main_box_close_button_sprite = new PIXI.Sprite(textureAthlas["scene2/Close_button.png"]);
        main_box_close_button_sprite.x = 535;
        main_box_close_button_sprite.y = 10;
        main_box_container.addChild(main_box_close_button_sprite);

        main_box_container.x = backgroundWidth / 2 - main_box_container.width / 2;
        main_box_container.y = 803;

        gameSceneBuyHands.addChild(main_box_container);
    }

    function setupUI_BuyDuration(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background_dark.png"].texture);
        gameSceneBuyDuration.addChild(background);

        backgroundWidth = background.width;

        //
        // Menu
        //
        let main_box_container = new PIXI.Container();

        let main_box_sprite = new PIXI.Sprite(textureAthlas["scene2/Panel_buy_DURATION.png"]);
        main_box_container.addChild(main_box_sprite);

        //Button GET
        let main_box_buy_button_container = new PIXI.Container();
        let main_box_buy_button_sprite = new PIXI.Sprite(textureAthlas["scene2/Button_get.png"]);
        main_box_buy_button_container.addChild(main_box_buy_button_sprite);
        main_box_buy_button_container.x = main_box_sprite.width / 2 - main_box_buy_button_container.width / 2;
        main_box_buy_button_container.y = 319;
        main_box_container.addChild(main_box_buy_button_container);

        //Button Close
        let main_box_close_button_sprite = new PIXI.Sprite(textureAthlas["scene2/Close_button.png"]);
        main_box_close_button_sprite.x = 535;
        main_box_close_button_sprite.y = 10;
        main_box_container.addChild(main_box_close_button_sprite);

        main_box_container.x = backgroundWidth / 2 - main_box_container.width / 2;
        main_box_container.y = 803;

        gameSceneBuyDuration.addChild(main_box_container);
    }

    function setupUI_Frens(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background.png"].texture);
        gameSceneFrens.addChild(background);

        backgroundWidth = background.width;
        
        //
        // Label
        //
        let title_label_sprite = new PIXI.Sprite(textureAthlas["scene3/Invite_text.png"]);
        title_label_sprite.x = backgroundWidth / 2 - title_label_sprite.width / 2;
        title_label_sprite.y = 131;

        gameSceneFrens.addChild(title_label_sprite);

        //
        // Button invite fren (without premium)
        //
        let invite_fren_button_sprite = new PIXI.Sprite(textureAthlas["scene3/Panel_invite_fren.png"]);
        invite_fren_button_sprite.x = backgroundWidth / 2 - invite_fren_button_sprite.width / 2;
        invite_fren_button_sprite.y = 240;

        gameSceneFrens.addChild(invite_fren_button_sprite);

        //
        // Button invite fren (premium)
        //
        let invite_tgpremium_button_sprite = new PIXI.Sprite(textureAthlas["scene3/Panel_fren_with_tg.png"]);
        invite_tgpremium_button_sprite.x = backgroundWidth / 2 - invite_tgpremium_button_sprite.width / 2;
        invite_tgpremium_button_sprite.y = 370;

        gameSceneFrens.addChild(invite_tgpremium_button_sprite);

        //
        // Label "frens list"
        //
        const frens_list_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 40,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 5,
        });

        gameSceneFrens_frensLabel = new PIXI.Text("FRENS LIST(0)", frens_list_label_style);
        gameSceneFrens_frensLabel.x = backgroundWidth / 2 - gameSceneFrens_frensLabel.width / 2;
        gameSceneFrens_frensLabel.y = 538;

        gameSceneFrens.addChild(gameSceneFrens_frensLabel);

        //
        // Frens list
        //
        let frenslist_box_container = new PIXI.Container();

        let frenslist_box_sprite = new PIXI.Sprite(textureAthlas["scene3/Panel_all_frens.png"]);
        frenslist_box_container.addChild(frenslist_box_sprite);

        let frenslist_box_outline = new PIXI.Sprite(textureAthlas["scene3/Panel_all_frens_outline.png"]);
        frenslist_box_container.addChild(frenslist_box_outline);

        frenslist_frame_mask = new PIXI.Graphics();

        frenslist_frame_mask = new PIXI.Graphics();
        frenslist_frame_mask.beginFill(0xffffff);
        frenslist_frame_mask.lineStyle(0);
        frenslist_frame_mask.drawRoundedRect(0, 0, 620, 620, 55);
        frenslist_box_container.addChild(frenslist_frame_mask);

        frenslist_frame_mask.x = frenslist_box_outline.width / 2 - frenslist_frame_mask.width / 2;
        frenslist_frame_mask.y = frenslist_box_outline.height / 2 - frenslist_frame_mask.height / 2;

        frenslist_container = new PIXI.Container();
        frenslist_container.mask = frenslist_frame_mask;

        for (let index = 0; index < 1; index++) {
            let x_offset = 40;
            let y_offset = 40;
            let y_pad = 30;

            let frens_list_item_container = createFrensListItem("Test", 40000);

            if(index == 0){
                frens_list_item_container.x = x_offset;
                frens_list_item_container.y = y_offset;
            } else{
                frens_list_item_container.x = x_offset;
                frens_list_item_container.y = (frens_list_item_container.height + y_pad) * index + y_offset;
            }

            frenslist_container.addChild(frens_list_item_container);
        }

        frenslist_box_container.addChild(frenslist_container);

        let isFensListMoved = false;
        let frensListTouchY = 0;
        frenslist_frame_mask.interactive = true;

        frenslist_frame_mask.on('pointerdown', (event) => {

            const globalX = event.data.global.x;
            const globalY = event.data.global.y;
            const localPosition = gameSceneFrens.toLocal(new PIXI.Point(globalX, globalY));


            frensListTouchY = localPosition.y - frenslist_container.y;

            isFensListMoved = true;
        });

        frenslist_frame_mask.on('pointerup', () => {
            isFensListMoved = false;
        });

        frenslist_frame_mask.on('pointerupoutside', () => {
            isFensListMoved = false;
        });

        frenslist_frame_mask.on('pointermove', (event) => {

            if(!isFensListMoved){
                return;
            }

            const globalX = event.data.global.x;
            const globalY = event.data.global.y;

            const localPosition = gameSceneFrens.toLocal(new PIXI.Point(globalX, globalY));

            let set_coord = localPosition.y - frensListTouchY;

            if(set_coord > frenslist_box_outline.y){
                return;
            }

            if(set_coord < (frenslist_box_outline.y - frenslist_container.height + 50)){
                return;
            }

            frenslist_container.y = set_coord;
        });


        frenslist_box_container.x = backgroundWidth / 2 - frenslist_box_container.width / 2;
        frenslist_box_container.y = 604;

        gameSceneFrens.addChild(frenslist_box_container);

        //
        // Button bakc
        //
        let back_button_sprite = new PIXI.Sprite(textureAthlas["share/back_arrow.png"]);
        back_button_sprite.x = 45;
        back_button_sprite.y = 45;

        gameSceneFrens.addChild(back_button_sprite);

        //invite fren
        invite_fren_button_sprite.interactive = true;
        invite_fren_button_sprite.buttonMode = true;

        invite_fren_button_sprite.on('pointerdown', () => {
            setPressEffect(invite_fren_button_sprite);
        });
    
        invite_fren_button_sprite.on('pointerup', () => {
            invite_fren_button_sprite.filters = [];
            setTimeout(()=> {
                onInviteFrenButton_handler();
            }, 10);
        });
    
        invite_fren_button_sprite.on('pointerupoutside', () => {
            invite_fren_button_sprite.filters = [];
            setTimeout(()=> {
                onInviteFrenButton_handler();
            }, 10);
        });

        //invite fren premium
        invite_tgpremium_button_sprite.interactive = true;
        invite_tgpremium_button_sprite.buttonMode = true;

        invite_tgpremium_button_sprite.on('pointerdown', () => {
            setPressEffect(invite_tgpremium_button_sprite);
        });
    
        invite_tgpremium_button_sprite.on('pointerup', () => {
            invite_tgpremium_button_sprite.filters = [];
            setTimeout(()=> {
                onInviteFrenButton_handler();
            }, 10);
        });
    
        invite_tgpremium_button_sprite.on('pointerupoutside', () => {
            invite_tgpremium_button_sprite.filters = [];
            setTimeout(()=> {
                onInviteFrenButton_handler();
            }, 10);
        });

        function onInviteFrenButton_handler(){
            let data = {
                "user_tg_id": userTgId, // Строкой, не числом
            }

            let userGetLinkRequest = ajax_GET(CONFIG_APP_URL_BASE+"get_invite_link", data, {});
            handler_getInviteLinkRequest(userGetLinkRequest);
        }

        //Back
        back_button_sprite.interactive = true;
        back_button_sprite.buttonMode = true;

        back_button_sprite.on('pointerdown', () => {
            setPressEffect(back_button_sprite);
        });
    
        back_button_sprite.on('pointerup', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
    
        back_button_sprite.on('pointerupoutside', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
        
    }

    function setupUI_Forbes(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background.png"].texture);
        gameSceneForbes.addChild(background);

        backgroundWidth = background.width;

        //
        // Balance
        //

        gameSceneForbes_coinsContainer = new PIXI.Container();

        let balance_coin_sprite = new PIXI.Sprite(textureAthlas["share/Big_coin.png"]);

        const coins_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 70,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 8,
        });

        gameSceneForbes_coinsLabel = new PIXI.Text(formatNumberWithCommasNoPadding(0), coins_label_style);

        gameSceneForbes_coinsContainer.addChild(balance_coin_sprite);
        gameSceneForbes_coinsContainer.addChild(gameSceneForbes_coinsLabel);

        gameSceneForbes_coinsLabel.x = balance_coin_sprite.width + 10;
        gameSceneForbes_coinsLabel.y = balance_coin_sprite.height / 2 - gameSceneForbes_coinsLabel.height / 2;

        gameSceneForbes_coinsContainer.x = backgroundWidth / 2 - gameSceneForbes_coinsContainer.width / 2;
        gameSceneForbes_coinsContainer.y = 126;

        gameSceneForbes.addChild(gameSceneForbes_coinsContainer);

        //
        // Top 100 players label
        //

        const topplayers_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 33,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 6,
        });

        let top_players_label_text = new PIXI.Text("TOP 100 PLAYERS", topplayers_label_style);
        top_players_label_text.x = backgroundWidth / 2 - top_players_label_text.width / 2;
        top_players_label_text.y = 283;

        gameSceneForbes.addChild(top_players_label_text);

        //
        // Top list
        //
        let toplist_box_container = new PIXI.Container();

        let toplist_box_sprite = new PIXI.Sprite(textureAthlas["scene4/Panel_top_100.png"]);
        toplist_box_container.addChild(toplist_box_sprite);

        let toplist_box_outline = new PIXI.Sprite(textureAthlas["scene4/Panel_top_100_outline.png"]);
        toplist_box_container.addChild(toplist_box_outline);

        toplist_frame_mask = new PIXI.Graphics();

        toplist_frame_mask = new PIXI.Graphics();
        toplist_frame_mask.beginFill(0xffffff);
        toplist_frame_mask.lineStyle(0);
        toplist_frame_mask.drawRoundedRect(0, 0, 620, 1000, 55);
        toplist_box_container.addChild(toplist_frame_mask);

        toplist_frame_mask.x = toplist_box_outline.width / 2 - toplist_frame_mask.width / 2;
        toplist_frame_mask.y = 10;

        toplist_container = new PIXI.Container();
        toplist_container.mask = toplist_frame_mask;

        for (let index = 0; index < 1; index++) {
            let i_number = index + 1;
            let x_offset = 40;
            let y_offset = 40;
            let y_pad = DEFAULT_FOREBS_ITEMS_Y_PAD;

            let top_list_item_container = createTopListItem(i_number, "Alex", 10);

            if(index == 0){
                top_list_item_container.x = x_offset;
                top_list_item_container.y = y_offset;
            } else{
                top_list_item_container.x = x_offset;
                top_list_item_container.y = (top_list_item_container.height + y_pad) * index + y_offset;
            }

            toplist_container.addChild(top_list_item_container);
        }

        toplist_box_container.addChild(toplist_container);

        let isTopListMoved = false;
        let topListTouchY = 0;
        toplist_frame_mask.interactive = true;

        toplist_frame_mask.on('pointerdown', (event) => {

            const globalX = event.data.global.x;
            const globalY = event.data.global.y;
            const localPosition = gameSceneForbes.toLocal(new PIXI.Point(globalX, globalY));


            topListTouchY = localPosition.y - toplist_container.y;

            isTopListMoved = true;
        });

        toplist_frame_mask.on('pointerup', () => {
            isTopListMoved = false;
        });

        toplist_frame_mask.on('pointerupoutside', () => {
            isTopListMoved = false;
        });

        toplist_frame_mask.on('pointermove', (event) => {

            if(!isTopListMoved){
                return;
            }

            const globalX = event.data.global.x;
            const globalY = event.data.global.y;

            const localPosition = gameSceneForbes.toLocal(new PIXI.Point(globalX, globalY));

            let set_coord = localPosition.y - topListTouchY;

            if(set_coord > toplist_box_outline.y){
                return;
            }

            if(set_coord < (toplist_box_outline.y - toplist_container.height + 50)){
                return;
            }

            toplist_container.y = set_coord;
        });

        toplist_box_container.x = backgroundWidth / 2 - toplist_box_container.width / 2;
        toplist_box_container.y = 348;

        gameSceneForbes.addChild(toplist_box_container);

        //
        // Button back
        //

        let back_button_sprite = new PIXI.Sprite(textureAthlas["share/back_arrow.png"]);
        back_button_sprite.x = 45;
        back_button_sprite.y = 45;

        gameSceneForbes.addChild(back_button_sprite);

        //Back
        back_button_sprite.interactive = true;
        back_button_sprite.buttonMode = true;

        back_button_sprite.on('pointerdown', () => {
            setPressEffect(back_button_sprite);
        });
    
        back_button_sprite.on('pointerup', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
    
        back_button_sprite.on('pointerupoutside', () => {
            back_button_sprite.filters = [];
            setTimeout(()=> {
                setScene_Main();
            }, 10);
        });
    }

    function setupUI_WaitMessage(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/preloader.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background_dark.png"].texture);
        gameSceneWaitMessage.addChild(background);

        backgroundWidth = background.width;

        let window_box_container = new PIXI.Container();

        let window_outline_sprite = new PIXI.Sprite(textureAthlas["info/Win_outline.png"]);

        let window_box_sprite = new PIXI.Sprite(textureAthlas["info/Win.png"]);

        window_box_container.addChild(window_box_sprite);
        window_box_container.addChild(window_outline_sprite);

        const info_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 5,
            wordWrap: true,
            align: "center",
            wordWrapWidth: 500,
            lineJoin: 'round',
        });

        gameSceneWait_textLabel = new PIXI.Text("Waiting...", info_label_style);
        gameSceneWait_textLabel.x = window_box_sprite.width / 2 - gameSceneWait_textLabel.width / 2;
        gameSceneWait_textLabel.y = 100;
        gameSceneWait_boxWidth = window_box_sprite.width;     
        
        window_box_container.addChild(gameSceneWait_textLabel);

        window_box_container.x = backgroundWidth / 2 - window_box_container.width / 2;
        window_box_container.y = 477;

        gameSceneWaitMessage.addChild(window_box_container); 
    }

    function setupUI_OkMessage(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background_dark.png"].texture);
        gameSceneOkMessage.addChild(background);

        backgroundWidth = background.width;

        let window_box_container = new PIXI.Container();

        let window_outline_sprite = new PIXI.Sprite(textureAthlas["info/Win_outline.png"]);

        let window_box_sprite = new PIXI.Sprite(textureAthlas["info/Win.png"]);

        window_box_container.addChild(window_box_sprite);
        window_box_container.addChild(window_outline_sprite);

        const info_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 5,
            wordWrap: true,
            align: "center",
            wordWrapWidth: 500,
            lineJoin: 'round',
        });

        gameSceneOk_textLabel = new PIXI.Text("Some interesting info NEW", info_label_style);
        gameSceneOk_textLabel.x = window_box_sprite.width / 2 - gameSceneOk_textLabel.width / 2;
        gameSceneOk_textLabel.y = 100;
        gameSceneOk_boxWidth = window_box_sprite.width;     
        
        window_box_container.addChild(gameSceneOk_textLabel);

        let ok_button_sprite = new PIXI.Sprite(textureAthlas["info/Button_yes.png"]);
        ok_button_sprite.x = window_box_container.width / 2 - ok_button_sprite.width / 2;
        ok_button_sprite.y = 221;

        window_box_container.addChild(ok_button_sprite);

        window_box_container.x = backgroundWidth / 2 - window_box_container.width / 2;
        window_box_container.y = 477;

        gameSceneOkMessage.addChild(window_box_container); 

        ok_button_sprite.interactive = true;
        ok_button_sprite.buttonMode = true;

        ok_button_sprite.on('pointerdown', () => {
            setPressEffect(ok_button_sprite);
        });
    
        ok_button_sprite.on('pointerup', () => {
            ok_button_sprite.filters = [];
            setTimeout(()=> {
                okButtonPressed_handler();
            }, 10);
        });
    
        ok_button_sprite.on('pointerupoutside', () => {
            ok_button_sprite.filters = [];
            setTimeout(()=> {
                okButtonPressed_handler();
            }, 10);
        });

        function okButtonPressed_handler(){
            if(currentGameScene == GAME_SCENE_ID_MAIN){
                setScene_Main();
            } else if(currentGameScene == GAME_SCENE_ID_BOOSTERS){
                setScene_Boosters();
            } else if(currentGameScene == GAME_SCENE_ID_FRENS){
                setScene_Frens();
            } else if(currentGameScene == GAME_SCENE_ID_FORBES){
                setScene_Forbes();
            }
        }
    }

    function setupUI_ConfirmMessage(){
        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let background = new PIXI.Sprite(PIXI.Loader.shared.resources["/assets/media/background_dark.png"].texture);
        gameSceneConfirmMessage.addChild(background);

        backgroundWidth = background.width;

        let window_box_container = new PIXI.Container();

        let window_outline_sprite = new PIXI.Sprite(textureAthlas["info/Win_outline.png"]);

        let window_box_sprite = new PIXI.Sprite(textureAthlas["info/Win.png"]);

        window_box_container.addChild(window_box_sprite);
        window_box_container.addChild(window_outline_sprite);

        const info_label_style = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 5,
            wordWrap: true,
            align: "center",
            wordWrapWidth: 500,
            lineJoin: 'round',
        });

        gameSceneConfirm_textLabel = new PIXI.Text("Some interesting info CONFIRM", info_label_style);
        gameSceneConfirm_textLabel.x = window_box_sprite.width / 2 - gameSceneConfirm_textLabel.width / 2;
        gameSceneConfirm_textLabel.y = 100;
        gameSceneConfirm_boxWidth = window_box_sprite.width; 
        
        window_box_container.addChild(gameSceneConfirm_textLabel);

        let buttons_container = new PIXI.Container();

        let ok_button_sprite = new PIXI.Sprite(textureAthlas["info/Button_yes.png"]);
        let no_button_sprite = new PIXI.Sprite(textureAthlas["info/Button_no.png"]);

        no_button_sprite.x = ok_button_sprite.width + 70;

        buttons_container.addChild(ok_button_sprite);
        buttons_container.addChild(no_button_sprite);

        window_box_container.addChild(buttons_container);
        buttons_container.x = window_box_container.width / 2 - buttons_container.width / 2;
        buttons_container.y = 221;

        window_box_container.x = backgroundWidth / 2 - window_box_container.width / 2;
        window_box_container.y = 477;

        gameSceneConfirmMessage.addChild(window_box_container); 


        ok_button_sprite.interactive = true;
        ok_button_sprite.buttonMode = true;

        ok_button_sprite.on('pointerdown', () => {
            setPressEffect(ok_button_sprite);
        });
    
        ok_button_sprite.on('pointerup', () => {
            ok_button_sprite.filters = [];
            setTimeout(()=> {
                okButtonPressed_handler();
            }, 10);
        });
    
        ok_button_sprite.on('pointerupoutside', () => {
            ok_button_sprite.filters = [];
            setTimeout(()=> {
                okButtonPressed_handler();
            }, 10);
        });

        //NO
        no_button_sprite.interactive = true;
        no_button_sprite.buttonMode = true;

        no_button_sprite.on('pointerdown', () => {
            setPressEffect(no_button_sprite);
        });
    
        no_button_sprite.on('pointerup', () => {
            no_button_sprite.filters = [];
            setTimeout(()=> {
                noButtonPressed_handler();
            }, 10);
        });
    
        no_button_sprite.on('pointerupoutside', () => {
            no_button_sprite.filters = [];
            setTimeout(()=> {
                noButtonPressed_handler();
            }, 10);
        });

        function okButtonPressed_handler(){
            if(currentConfirmType == CONFIRM_TYPE_BUY_HANDS){

                let buyPrice = 500;

                const handsElement = getElementByNumber(userMetaData.hands_levels_data, currentHandsLevel+1);
                if(handsElement !== undefined){
                    buyPrice = handsElement.price;
                }

                if(currentUserBalance < buyPrice){
                    setScene_ShowOkMessage("There are not enough coins\nShake Posha more, fren");
                } else{
                    //Баланс есть, пробуем купить, кидаем в холд
                    purchaseBalanceHold = buyPrice;
                    currentUserBalance -= buyPrice;
                    updateUIBalance();

                    let data = {
                        "user_tg_id" : userTgId.toString(),
                        "purchase_type" : PURCHASE_TYPE_HANDS,
                    };

                    let userBuyRequest = ajax_PUT(CONFIG_APP_URL_BASE+"api/users/purchase", data, {});
                    handler_buyRequest(userBuyRequest);


                    setScene_ShowWaitMessage("Requesting...");
                    isRequestingPurchase = true;

                    setTimeout(()=> {
                        if(isRequestingPurchase){
                            setScene_ShowOkMessage("Oops! Timeout! Try again later, fren!");
                            isRequestingPurchase = false;
                            currentUserBalance += purchaseBalanceHold;
                            purchaseBalanceHold = 0;
                            updateUIBalance();
                        }
                    }, DEFAULT_SERVER_RESPONSE_TIMEOUT);
                }
            } else if(currentConfirmType == CONFIRM_TYPE_BUY_DURATION){
                let buyPrice = 10000;

                const durationElement = getElementByNumber(userMetaData.duration_levels_data, currentDurationLevel+1);
                if(durationElement !== undefined){
                    buyPrice = durationElement.price;
                }

                if(currentUserBalance < buyPrice){
                    setScene_ShowOkMessage("There are not enough coins\nShake Posha more, fren");
                } else{
                    purchaseBalanceHold = buyPrice;
                    currentUserBalance -= buyPrice;
                    updateUIBalance();

                    let data = {
                        "user_tg_id" : userTgId.toString(),
                        "purchase_type" : PURCHASE_TYPE_DURATION,
                    };

                    let userBuyRequest = ajax_PUT(CONFIG_APP_URL_BASE+"api/users/purchase", data, {});
                    handler_buyRequest(userBuyRequest);


                    setScene_ShowWaitMessage("Requesting...");
                    isRequestingPurchase = true;

                    setTimeout(()=> {
                        if(isRequestingPurchase){
                            setScene_ShowOkMessage("Oops! Timeout! Try again later, fren!");
                            isRequestingPurchase = false;
                            currentUserBalance += purchaseBalanceHold;
                            purchaseBalanceHold = 0;
                            updateUIBalance();
                        }
                    }, DEFAULT_SERVER_RESPONSE_TIMEOUT);
                }
            }
        }

        function noButtonPressed_handler(){
            if(currentGameScene == GAME_SCENE_ID_MAIN){
                setScene_Main();
            } else if(currentGameScene == GAME_SCENE_ID_BOOSTERS){
                setScene_Boosters();
            } else if(currentGameScene == GAME_SCENE_ID_FRENS){
                setScene_Frens();
            } else if(currentGameScene == GAME_SCENE_ID_FORBES){
                setScene_Forbes();
            }
        }
    }
    
    function setScene_Preloader(){
        currentGameScene = GAME_SCENE_ID_PRELOADER;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameScenePreloader.visible = true;
        gameScenePreloader.interactive = true;

    }

    function setScene_Main(){
        currentGameScene = GAME_SCENE_ID_MAIN;

        gameScenePreloader.visible = false;
        gameScenePreloader.interactive = false;

        gameSceneBoosters.visible = false;
        gameSceneBoosters.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneFrens.visible = false;
        gameSceneFrens.interactive = false;

        gameSceneForbes.visible = false;
        gameSceneForbes.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneMain.visible = true;
        gameSceneMain.interactive = true;
    }

    function setScene_Boosters(){
        currentGameScene = GAME_SCENE_ID_BOOSTERS;

        gameScenePreloader.visible = false;
        gameScenePreloader.interactive = false;

        gameSceneMain.visible = false;
        gameSceneMain.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneFrens.visible = false;
        gameSceneFrens.interactive = false;

        gameSceneForbes.visible = false;
        gameSceneForbes.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneBoosters.visible = true;
        gameSceneBoosters.interactive = true;
    }

    function setScene_Frens(){
        currentGameScene = GAME_SCENE_ID_FRENS;

        gameScenePreloader.visible = false;
        gameScenePreloader.interactive = false;

        gameSceneMain.visible = false;
        gameSceneMain.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneBoosters.visible = false;
        gameSceneBoosters.interactive = false;

        gameSceneForbes.visible = false;
        gameSceneForbes.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneFrens.visible = true;
        gameSceneFrens.interactive = true;
    }

    function setScene_Forbes(){
        currentGameScene = GAME_SCENE_ID_FORBES;

        gameScenePreloader.visible = false;
        gameScenePreloader.interactive = false;

        gameSceneMain.visible = false;
        gameSceneMain.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneBoosters.visible = false;
        gameSceneBoosters.interactive = false;

        gameSceneFrens.visible = false;
        gameSceneFrens.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneForbes.visible = true;
        gameSceneForbes.interactive = true;
    }

    function setScene_BuyHands(){
        currentGameScene = GAME_SCENE_ID_BUY_HANDS;

        gameScenePreloader.interactive = false;

        gameSceneMain.interactive = false;

        gameSceneBoosters.interactive = false;

        gameSceneFrens.interactive = false;

        gameSceneForbes.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneBuyHands.visible = true;
        gameSceneBuyHands.interactive = true;
    }

    function setScene_BuyDuration(){
        currentGameScene = GAME_SCENE_ID_BUY_DURATION;

        gameScenePreloader.interactive = false;

        gameSceneMain.interactive = false;

        gameSceneBoosters.interactive = false;

        gameSceneFrens.interactive = false;

        gameSceneForbes.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneBuyDuration.visible = true;
        gameSceneBuyDuration.interactive = true;
    }

    function setScene_ShowWaitMessage(message){
        // Deprecated
        // currentGameScene = GAME_SCENE_ID_WAIT;

        gameScenePreloader.interactive = false;

        gameSceneMain.interactive = false;

        gameSceneBoosters.interactive = false;

        gameSceneFrens.interactive = false;

        gameSceneForbes.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneWaitMessage.visible = true;
        gameSceneWaitMessage.interactive = true;

        gameSceneWait_textLabel.text = message;
        gameSceneWait_textLabel.x = gameSceneWait_boxWidth / 2 - gameSceneWait_textLabel.width / 2;
    }

    function setScene_ShowOkMessage(message){
        // Deprecated
        // currentGameScene = GAME_SCENE_ID_OK;

        gameScenePreloader.interactive = false;

        gameSceneMain.interactive = false;

        gameSceneBoosters.interactive = false;

        gameSceneFrens.interactive = false;

        gameSceneForbes.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneConfirmMessage.visible = false;
        gameSceneConfirmMessage.interactive = false;

        gameSceneOkMessage.visible = true;
        gameSceneOkMessage.interactive = true;

        gameSceneOk_textLabel.text = message;
        gameSceneOk_textLabel.x = gameSceneOk_boxWidth / 2 - gameSceneOk_textLabel.width / 2;
        
    }

    function setScene_ShowConfirmMessage(message){
        // Deprecated
        // currentGameScene = GAME_SCENE_ID_CONFIRM;

        gameScenePreloader.interactive = false;

        gameSceneMain.interactive = false;

        gameSceneBoosters.interactive = false;

        gameSceneFrens.interactive = false;

        gameSceneForbes.interactive = false;

        gameSceneBuyHands.visible = false;
        gameSceneBuyHands.interactive = false;

        gameSceneBuyDuration.visible = false;
        gameSceneBuyDuration.interactive = false;

        gameSceneWaitMessage.visible = false;
        gameSceneWaitMessage.interactive = false;

        gameSceneOkMessage.visible = false;
        gameSceneOkMessage.interactive = false;

        gameSceneConfirmMessage.visible = true;
        gameSceneConfirmMessage.interactive = true;

        gameSceneConfirm_textLabel.text = message;
        gameSceneConfirm_textLabel.x = gameSceneConfirm_boxWidth / 2 - gameSceneConfirm_textLabel.width / 2;
        
    }

    function setPressEffect(button){
        let colorMatrix =  [
            1, 0, 0, 0, 0.25, 
            0, 1, 0, 0, 0.25, 
            0, 0, 1, 0, 0.25, 
            0, 0, 0, 1, 0
        ];

        var filter = new PIXI.filters.ColorMatrixFilter();
        filter.matrix = colorMatrix;

        button.filters = [filter];    
    }

    //Timer for calling a random booster
    function startRandomBoosterTimer(min, max, callback) {
        function runTimer() {
            const delay = getRandomInt(min, max) * 1000;
    
            timeoutId = setTimeout(() => {
                callback();
    
                runTimer();
            }, delay);
        }
    
        let timeoutId;
    
        runTimer();
    
        return function stopTimer() {
            clearTimeout(timeoutId);
        };
    }

    //Generating friend list items
    function createFrensListItem(user_name, user_balance){

        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        let frens_list_item_container = new PIXI.Container();

        let frens_list_ico = new PIXI.Sprite(textureAthlas["share/Icon_for_numbers.png"]);
        frens_list_item_container.addChild(frens_list_ico);

        const frens_list_text_style_big = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 37,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 2,
        });

        const frens_list_text_style_small = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 25,
            fill: "white",
        });

        let text_container = new PIXI.Container();
        let label_text_name = new PIXI.Text(user_name, frens_list_text_style_big);
        let label_text_balance = new PIXI.Text(formatNumberWithCommasNoPadding(user_balance), frens_list_text_style_small);
        text_container.addChild(label_text_name);
        text_container.addChild(label_text_balance);

        label_text_balance.y = label_text_name.height + 5;

        text_container.x = frens_list_ico.width + 40;
        text_container.y = frens_list_item_container.height / 2 - text_container.height / 2;

        frens_list_item_container.addChild(text_container);

        let frens_list_line = new PIXI.Sprite(textureAthlas["share/Line.png"]);
        frens_list_item_container.addChild(frens_list_line);
        frens_list_line.x = frens_list_item_container.width / 2 - frens_list_line.width / 2;
        frens_list_line.y = frens_list_ico.height + 30;

        return frens_list_item_container;
    }

    //Generating top list items
    function createTopListItem(number, user_name, user_balance){

        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        const top_list_text_style_number = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 37,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 6,
        });

        const top_list_text_style_big = new PIXI.TextStyle({
            fontFamily: "Montserrat",
            fontStyle: "Bold",
            fontSize: 33,
            fill: "white",
            stroke: "#a04933",
            strokeThickness: 2,
        });

        const top_list_text_style_small = new PIXI.TextStyle({
            fontFamily: "Montserrat-Light",
            fontSize: 28,
            fill: "white",
        });

        let top_list_item_container = new PIXI.Container();

        let top_list_ico_container = new PIXI.Container();

        let top_list_ico = new PIXI.Sprite(textureAthlas["share/Icon_for_numbers.png"]);
        let text_number = new PIXI.Text(number, top_list_text_style_number);

        top_list_ico_container.addChild(top_list_ico);
        top_list_ico_container.addChild(text_number);

        text_number.x = top_list_ico.width / 2 - text_number.width / 2;
        text_number.y = top_list_ico.height / 2 - text_number.height / 2;

        top_list_item_container.addChild(top_list_ico_container);
        

        let text_container = new PIXI.Container();
        let label_text_name = new PIXI.Text(user_name, top_list_text_style_big);
        let label_text_balance = new PIXI.Text(formatNumberWithCommasNoPadding(user_balance), top_list_text_style_small);
        text_container.addChild(label_text_name);
        text_container.addChild(label_text_balance);

        label_text_balance.y = label_text_name.height + 5;

        text_container.x = top_list_ico_container.width + 40;
        text_container.y = top_list_item_container.height / 2 - text_container.height / 2;

        top_list_item_container.addChild(text_container);

        let top_list_line = new PIXI.Sprite(textureAthlas["share/Line.png"]);
        top_list_item_container.addChild(top_list_line);
        top_list_line.x = top_list_item_container.width / 2 - top_list_line.width / 2;
        top_list_line.y = top_list_ico_container.height + DEFAULT_FOREBS_ITEMS_Y_PAD;

        return top_list_item_container;
    }

    //Updating UI after downloading
    function updateUI(){

        let sheet = PIXI.Loader.shared.resources["/assets/media/animation_char.json"].spritesheet;

        console.log(userMetaData);

        currentUserBalance = userMetaData.user_data.coins_balance;
        currentUserBalance += userBalanceUnregistered;

        updateUIBalance();

        currentHealth = userMetaData.user_data.current_health;

        currentDurationLevel = userMetaData.user_data.duration_level;
        currentHandsLevel = userMetaData.user_data.hands_level;

        const durationElement = getElementByNumber(userMetaData.duration_levels_data, currentDurationLevel);

        if(durationElement !== undefined){
            //Seconds
            currentCooldownDelay = durationElement.time_appearance; 
        } else{
            //console.log("Undefined duration level!");
            currentDurationLevel = 0;
            currentCooldownDelay = DEFAULT_COOLDOWN_DELAY_SECODNS;
        }

        const handsElement = getElementByNumber(userMetaData.hands_levels_data, currentHandsLevel);

        if(handsElement !== undefined){
            currentHitPerClick = handsElement.damage_per_click; 
        } else{
            //console.log("Undefined duration level!");
            currentHandsLevel = 0;
            currentHitPerClick = 1;
        }

        lastSyncTimestamp = new Date(userMetaData.user_data.last_sync);
        lastCooldownTimestamp = new Date(userMetaData.user_data.last_cooldown);

        //max health
        if(IS_DEBUG){
            maxHealth = DEBUG_MAX_HEALTH;
        } else {
            maxHealth = userMetaData.system_settings_data.current_health_base * currentHitPerClick;
        }

        //Scam-check
        if(currentHealth > maxHealth){
            currentHealth = maxHealth;
        }

        updateHealthBar();

        if(currentHealth <= 0){

            let currentTimestamp = new Date();
            
            const differenceMilliseconds = Math.abs(currentTimestamp - lastCooldownTimestamp);
            const differenceSeconds = differenceMilliseconds / 1000;

            if(differenceSeconds >= currentCooldownDelay){
                currentHealth = DEFAULT_HEALTH_CURRENT;
                characterStateTarget = CHARACTER_STATE_NORMAL;
                updateHealthBar();

            } else{
                characterStateCurrent = CHARACTER_STATE_COOLDOWN;
                characterStateTarget = CHARACTER_STATE_COOLDOWN;

                gameSceneMain_timerContainer.visible = true;
                gameSceneMain_timerLabel.text = "Wait " + formatTimeForCooldownTimer(currentCooldownDelay-differenceSeconds);

                gameSceneMain_mainCharacter.stop();
                gameSceneMain_mainCharacter.textures = sheet.animations["char_cooldown"];
                gameSceneMain_mainCharacter.x = gameSceneMain_backgroundWidth / 2 - gameSceneMain_mainCharacter.width / 2;
                gameSceneMain_mainCharacter.play();
            }

        }

        //Hands
        let buyHandsLevel = currentHandsLevel + 1;
        let buyHandsPrice = 500;
        if(buyHandsLevel >= 10){
            buyHandsLevel = 10;
        }

        const handsElement2 = getElementByNumber(userMetaData.hands_levels_data, buyHandsLevel);

        if(handsElement2 === undefined){
            buyHandsLevel = 1; 
            buyHandsPrice = 500;
        } else{
            buyHandsPrice = handsElement2.price;
        }

        gameSceneBoosters_handsPriceLabel.text = formatNumberWithCommasNoPadding(buyHandsPrice);
        gameSceneBoosters_handsLevelLabel.text = `lvl ${buyHandsLevel}`;

        //Duration
        let buyDurationLevel = currentDurationLevel + 1;
        let buyDurationPrice = 10000;
        if(buyDurationLevel >= 4){
            buyDurationLevel = 4;
        }

        const durationElement2 = getElementByNumber(userMetaData.duration_levels_data, buyDurationLevel);

        if(durationElement2 === undefined){
            buyDurationLevel = 1; 
            buyDurationPrice = 10000;
        } else{
            buyDurationPrice = durationElement2.price;
        }

        gameSceneBoosters_durationPriceLabel.text = formatNumberWithCommasNoPadding(buyDurationPrice);
        gameSceneBoosters_durationLevelLabel.text = `lvl ${buyDurationLevel}`;

        //Top - Forebs
        let top_users = userMetaData.top_users;

        toplist_container.removeChildren();

        for (let index = 0; index < top_users.length; index++) {
            let i_number = index + 1;
            let x_offset = 40;
            let y_offset = 40;
            let y_pad = DEFAULT_FOREBS_ITEMS_Y_PAD;

            let username = "Anonymous";
            let total_minted = top_users[index].total_minted;
            // deprecated
            //let user_balance = top_users[index].coins_balance;

            if(top_users[index].user_name != ""){
                username = top_users[index].user_name;
            }

            let top_list_item_container = createTopListItem(i_number, username, total_minted);

            if(index == 0){
                top_list_item_container.x = x_offset;
                top_list_item_container.y = y_offset;
            } else{
                top_list_item_container.x = x_offset;
                top_list_item_container.y = (top_list_item_container.height + y_pad) * index + y_offset;
            }

            toplist_container.addChild(top_list_item_container);
        }

        //Frens list
        let frens_list_temp = [];

        if(userMetaData.user_data.invited_by != null){
            if(userMetaData.user_data.invited_by.user_tg_id != 0){
                frens_list_temp.push(userMetaData.user_data.invited_by);
            }
        }

        const frens_list = frens_list_temp.concat(userMetaData.user_data.invited_users);

        gameSceneFrens_frensLabel.text = `FRENS LIST(${frens_list.length})`;

        frenslist_container.removeChildren();

        for (let index = 0; index < frens_list.length; index++) {
            let x_offset = 40;
            let y_offset = 40;
            let y_pad = 30;

            let username = "Anonymous";
            // deprecated
            //let user_balance = frens_list[index].coins_balance;
            let total_minted = frens_list[index].total_minted;

            if(frens_list[index].user_name != ""){
                username = frens_list[index].user_name;
            }

            let frens_list_item_container = createFrensListItem(username, total_minted);

            if(index == 0){
                frens_list_item_container.x = x_offset;
                frens_list_item_container.y = y_offset;
            } else{
                frens_list_item_container.x = x_offset;
                frens_list_item_container.y = (frens_list_item_container.height + y_pad) * index + y_offset;
            }

            frenslist_container.addChild(frens_list_item_container);
        }

    }

    //Getting an item from the list by number
    function getElementByNumber(array, number) {
        return array.find(item => item.number === number);
    }

    function updateUIBalance(){
        gameSceneMain_coinsLabel.text = formatNumberWithCommasNoPadding(currentUserBalance);
        gameSceneMain_coinsContainer.x = backgroundWidth / 2 - gameSceneMain_coinsContainer.width / 2;

        gameSceneForbes_coinsLabel.text = formatNumberWithCommasNoPadding(currentUserBalance);
        gameSceneForbes_coinsContainer.x = backgroundWidth / 2 - gameSceneForbes_coinsContainer.width / 2;

        gameSceneBoosters_coinsLabel.text = formatNumberWithCommasNoPadding(currentUserBalance);
        gameSceneBoosters_coinsContainer.x = backgroundWidth / 2 - gameSceneBoosters_coinsContainer.width / 2;
    }

    function updateHealthBar(){

        let textureAthlas = PIXI.Loader.shared.resources["/assets/media/texture_main.json"].textures;

        gameSceneMain_xpLabel.text = `${currentHealth}/${maxHealth}`;
        gameSceneMain_xpLabel.x = gameSceneMain_xpLabelBaseX - gameSceneMain_xpLabel.width / 2;

        let healthFactor = (currentHealth / maxHealth) * 16.0;

        if (healthFactor <= 0){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[0]];
        } else if(healthFactor > 0 && healthFactor < 1){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[1]];
        } else if(healthFactor >= 1 && healthFactor < 2){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[2]];
        } else if(healthFactor >= 2 && healthFactor < 3){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[3]];
        } else if(healthFactor >= 3 && healthFactor < 4){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[4]];
        } else if(healthFactor >= 4 && healthFactor < 5){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[5]];
        } else if(healthFactor >= 5 && healthFactor < 6){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[6]];
        } else if(healthFactor >= 6 && healthFactor < 7){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[7]];
        } else if(healthFactor >= 7 && healthFactor < 8){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[8]];
        } else if(healthFactor >= 8 && healthFactor < 9){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[9]];
        } else if(healthFactor >= 9 && healthFactor < 10){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[10]];
        } else if(healthFactor >= 10 && healthFactor < 11){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[11]];
        } else if(healthFactor >= 11 && healthFactor < 12){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[12]];
        } else if(healthFactor >= 12 && healthFactor < 13){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[13]];
        } else if(healthFactor >= 13 && healthFactor < 14){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[14]];
        } else if(healthFactor >= 14 && healthFactor < 15){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[15]];
        } else if(healthFactor >= 15 && healthFactor < 16){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[16]];
        } else if(healthFactor >= 16){
            gameSceneMain_healthBar.texture = textureAthlas[xp_bar_sprites_list[17]];
        }
    }

    //Formatting the seconds in time for the timer
    function formatTimeForCooldownTimer(seconds) {
        const totalSeconds = Math.round(seconds);

        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatNumberWithCommasNoPadding(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //Deprected
    // fixed zeros

    function formatNumberWithCommas(number) {
        const numberString = Math.abs(number).toString();
    
        const zerosToAdd = Math.max(0, 9 - numberString.length);
    
        const formattedString = '0'.repeat(zerosToAdd) + numberString;
    
        const result = formattedString.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    
        return (number < 0 ? '-' : '') + result;
    }

    //Tg full screen

    function tgViewPortChangeHandler(object){
        if (!this.isExpanded){
            this.expand()
        }
    }

    //Getting the value from the URL-encoded
    function getValueFromUrlEncodedString(urlEncodedString, key) {
        const keyValuePairs = urlEncodedString.split('&');
    
        for (const pair of keyValuePairs) {
            const [encodedKey, encodedValue] = pair.split('=');
            const decodedKey = decodeURIComponent(encodedKey);
            const decodedValue = decodeURIComponent(encodedValue);
            
            if (decodedKey === key) {
                return decodedValue;
            }
        }
    
        return null;
    }

    //Updating the preloader on download
    function loadProgressHandler(loader, resource) {

        //Display the file `url` currently being loaded
        console.log("loading: " + resource.url); 
      
        //Display the percentage of files currently loaded
        console.log("progress: " + loader.progress + "%"); 
      
        //If you gave your files names as the first argument 
        //of the `add` method, you can access them like this
        //console.log("loading: " + resource.name);
    }

    function resizeWindow(){
        let window_height = window.innerHeight;
        let window_width = window.innerWidth;

        const SCALE_FACTOR = window_height / BACKGROUND_HEIGHT

        mainContainer.scale.x = SCALE_FACTOR;
        mainContainer.scale.y = SCALE_FACTOR;

        mainContainer.x = (window_width / 2) - ((BACKGROUND_WIDTH / 2) * SCALE_FACTOR);
    }

    // DEPRECATED
    // Function for updating the scale of the application
    function handleWindowResize() {
        resizeWindow();
        // let window_height = window.innerHeight;
        // let window_width = window.innerWidth;

        // const SCALE_FACTOR = window_height / BACKGROUND_HEIGHT

        //mainContainer.scale.x = SCALE_FACTOR;
        //mainContainer.scale.y = SCALE_FACTOR;

        //mainContainer.x = (window_width / 2) - ((BACKGROUND_WIDTH / 2) * SCALE_FACTOR);
    }

    // -----------------------------------
    //   BACK API Handlers
    // -----------------------------------

    // GET
    function handler_getRequest(request){
        request.always(function(){
        
            switch(request.status){
                case 200:
                    //request.responseJSON

                    userMetaData = request.responseJSON.data;

                    if(isAppFirstSync){
                        isAppFirstSync = false;
                        //Load further
                        PIXI.Loader.shared
                        .add("/assets/media/texture_main.json")
                        .add("/assets/media/animation_char.json")
                        .load(setup_main);
                    } else{
                        updateUI();
                    }

                    //console.log(userMetaData);   
                    break;

                case 404:
                    setScene_ShowWaitMessage("Oops! It looks like you haven't registered with the bot yet, fren!");

                    console.log("Req error!");
                    console.log(request.responseJSON);
                    break;
                
                case 400:
                    setScene_ShowWaitMessage(`Oops! Something went wrong!\nError: ${request.responseJSON.status.code}`);

                    break;

                default:
                    console.log("Undefined Error");
                    console_RequestError("Error!", request);
                    break;
            }
        });
    }

    // PUT
    function handler_updateRequest(request){
        request.always(function(){
        
            switch(request.status){
                case 200:
                    sendBalanceBuffer = 0;
                    break;

                default:
                    userBalanceUnregistered += sendBalanceBuffer;
                    sendBalanceBuffer = 0;

                    console.log("Undefined Error!");
                    console_RequestError("Error!", request);
                    break;
            }
        });
    }

    function handler_buyRequest(request){
        request.always(function(){
            isRequestingPurchase = false;
        
            switch(request.status){
                case 200:
                    setScene_ShowOkMessage("Success!");
                    
                    //Update metadata
                    let data = {
                        "user_tg_id": userTgId,
                    }
                
                    let userGetInfoRequest = ajax_GET(CONFIG_APP_URL_BASE+"api/info/get-start-params", data, {});
                    handler_getRequest(userGetInfoRequest);

                    break;
                
                case 400:
                    console.log(request.responseJSON.status.code);
                    switch (request.responseJSON.status.code) {
                        case 511:
                            //Not enough money
                            setScene_ShowOkMessage("Oops! There are not enough coins! Shake Posha more, fren!");
                            currentUserBalance += purchaseBalanceHold;
                            purchaseBalanceHold = 0;
                            updateUIBalance();
                            break;
                        default:
                            setScene_ShowOkMessage("Oops! Unexpected error! Try later, fren!");
                            currentUserBalance += purchaseBalanceHold;
                            purchaseBalanceHold = 0;
                            updateUIBalance();
                            break;
                    }
                    break;

                default:
                    setScene_ShowOkMessage("Oops! Request error! Try later, fren!");
                    console.log("Undefined Error");
                    console_RequestError("Error!", request);
                    break;
            }
        });
    }

    // Send invite link
    function handler_getInviteLinkRequest(request){
        request.always(function(){
        
            switch(request.status){
                case 200:
                    if(!IS_DEBUG){
                        TgAppConnector.close();
                    }
                    break;

                default:
                    setScene_ShowOkMessage("Oops! Request error! Try later, fren!");
                    console.log("Undefined Error");
                    console_RequestError("Error!", request);
                    break;
            }
        });
    }
};