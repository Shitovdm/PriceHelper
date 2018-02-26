//  Вещаем обработчик сообщений.
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        console.log("Popup.js say: " + msg);
        
    });
});
function injectBlock(){
    //  Внедряем свой блок.
    $(".injectBlock").html(""+  
        "<div class='subBlock' id='lowest_price' title='Самая низка цена на предмет на торговой площадке Steam'>"+
            "<small class='priceTitle'>Текущая цена:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='median_price' title='Средняя цена на предмет за последнии сутки на торговой площаде Steam'>"+
            "<small class='priceTitle'>Средняя цена:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='subBlock' id='volume' title='Количество проданных предметов за последнии 24 часа на торговой площадке Steam'>"+
            "<small class='priceTitle'>Объем за 24 часа:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='difference' title='Разница между самой низкой на данный момент ценой, и средней ценой за сутки на торговой площадке Steam'>"+
            "<small class='priceTitle'>Текущая - средняя:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='subBlock' id='percentTMtoSTEAM' title='Процент прибыли/потери при покупке предмета а маркете и его продаже в Steam'>"+
            "<small class='priceTitle'>Маркет &#8658; Стим</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='percentSTEAMtoTM' title='Процент потери при покупке данного предмета в Steam и продаже его на маркете'>"+
            "<small class='priceTitle'>Стим  &#8658;  Маркет</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='steamLink'><a id='linkSteam' href='#' target='_blank'>Страница предмета в Steam</a></div>");
}
function injected_main() {
	console.log("Unject");
}

/**
 * Метод Формирует url из html, который принимается в параметре res.
 * @param {string} res
 * @param {float} TMPrice
 * @param {float} TMOrderPrice
 * @returns {undefined}
 */
function handler(res,TMPrice,TMOrderPrice){
    var Error = {   //  Ошибка.
        state:false, 
        desc:"" 
    };   
    //  Парсим название предмета.
    var NameregEx = /<h1.*?>.*?<\/h1>/ig;
    var nameContainer = NameregEx.exec(res);
    var marketName = nameContainer[0].substring(27);   //  Обрезаем начало строки.
    marketName = marketName.substring(0,marketName.length - 5); //  Обрезаем конец строки.
    
    
    
    
    //  Парсим качество.
    var QualityregEx = /<span.*?>.*?<\/span>/;
    var qualityContainer = QualityregEx.exec(res);
    var quality = qualityContainer[0].substring(6);   //  Обрезаем начало строки.
    quality = quality.substring(0,quality.length - 7); //  Обрезаем конец строки.
    //  Перевод качества, для составления url.
    var Exterior;
    switch(quality.length){
        case 10:    //  Поношенное.
            Exterior = "Well-Worn";
            break;
        case 17:    //  Закаленное в боях.
            Exterior = "Battle-Scarred";
            break;
        case 23:    //  После полевых испытаний.
            Exterior = "Field-Tested";
            break;
        case 18:    //  Немного поношеное.
            Exterior = "Minimal Wear";
            break;
        case 14:    //  Прямо с завода.
            Exterior = "Factory New";
            break;
        default:    //  Качество не указано.
            Exterior = "none";
            break;
    }
    console.log(Exterior,marketName); //  Если качество не указано.
    //  Если у предмета отсутствует качество.
    if(Exterior == "none"){ //  Это либо ключ, либо коробка/капсула, либо наклейка, значок.
        if( marketName.split('|').length == 1){ //  В названии нет символов "|";
            console.log("Кейс, капсула");
            if (/[а-я]+/.test(marketName)) {   //  Если в строке есть русские символы.
                //  Переводим.
            }
            var URL = marketName.replace( /\s/g,"%20" );
            //console.log(marketName.split('|').length);
        }else{  //  В названии есть символы "|".
            //  Наклейка.
            if(marketName.split('|').length == 3){  //  Автограф/Команда.   Sticker%20%7C%20MSL%20%7C%20Atlanta%202017
                var name = marketName.split('|')[1].substring(1);
                //  Находим тип наклейки(если есть). металлическая/голографическая.
                if(name.split('(').length == 1){  //  Тип не указан (обычная).
                    var type = "";
                }else{  //  Тип указан.
                    var type = (name.split('(')[1]).split(')')[0];
                    //  Переводим тип.
                    if(type == "металлическая"){
                        type = "%20%28Foil%29";
                    }else{
                        if(type == "голографическая"){
                            type = "%20%28Holo%29";
                        }else{  type = ""; }
                    }
                }
                name = name.split('(')[0];
                name = name.substring(0,name.length - 1);
                
                var place = marketName.split('|')[2];
                var year = place.substr(place.length - 4);
                place = place.substr(1,place.length - 6);
                //  Переводим место.
                for(var city in OtherDicrionary["ru"]["place"]){
                    if( city == place){
                        place = OtherDicrionary["ru"]["place"][city];
                        break;
                    }
                }
                if(marketName.split('|')[0] == "Запечатанный граффити "){
                    console.log("Запечатанный граффити");
                    var URL = "Sealed%20Graffiti%20%7C%20" + name + type + "%20%7C%20" + place + "%20" + year;
                }else{
                    console.log("Автограф/Команда");
                    var URL = "Sticker%20%7C%20" + name + type + "%20%7C%20" + place + "%20" + year;
                }
                
            }else{  //  Наклейка.    Sticker%20%7C%20Welcome%20to%20the%20Clutch
                console.log("Наклейка");
                var name = marketName.split('|')[1];
                var URL = "Sticker%20%7C%20" + name;
                
            }
            //console.log(URL);
        }
    }else{
        // Необходимо переводить название предметов на русский язык.
        console.log("Оружие");
        if (/[а-я]+/.test(marketName)) {   //  Если в строке есть русские символы.
            //  Единичные исправления.
            var itemWeapon = marketName.split('|')[0];
            if( itemWeapon == "ПП-19 Бизон "){  //  Бизон.
                itemWeapon = "PP-Bizon%20";
            } 
            if( itemWeapon == "StatTrak™ ПП-19 Бизон "){  //  Бизон StatTrak.
                itemWeapon = "StatTrak™%20PP-Bizon%20";
            }
            if( itemWeapon == "Револьвер R8 "){
                itemWeapon = "R8%20Revolver%20";
            }
            var itemName = (marketName.split('|')[1]).substring(1); //  Имя предмета.
            //  Находим соответствие из словаря. Поиск по имени.
            var firstChar = itemName[0];
            for(var item in WeaponDicrionary["ru"][firstChar]){
                if( item == itemName){
                    itemName = WeaponDicrionary["ru"][firstChar][item];
                    break;
                }
            }
            if(/[а-я]+/.test(itemName)){   //  Если перевода названию не нашлось в словаре.
                Error.state = true;
                Error.desc = "В словаре нет перевода для данного предмета.";
            }
            marketName = itemWeapon + "| " + itemName;  //  Формируем market_name.
        }
        //  Формируем url.
        var marketNameURL = marketName.replace( /\|/g , "%7C" );
        marketNameURL = marketNameURL.replace( /\s/g,"%20" );
        var URL = marketNameURL + "%20%28" + Exterior + "%29";
    }
    
    if(!Error.state){   //  Если ошибок не было.
        /*var marketNameURL = marketName.replace( /\|/g , "%7C" );
        marketNameURL = marketNameURL.replace( /\s/g,"%20" );
        var URL = marketNameURL + "%20%28" + Exterior + "%29";*/
        getPageContent(URL,TMPrice,TMOrderPrice);
    }else{  //  Ошибка.
        console.log(Error.desc);
    }
}   
        
/**
 * Метод делает запрос на страницу, парсит контент и помещает его в каркас вставленного блока.
 * @param {string} itemURL
 * @param {float} TMPrice
 * @param {float} TMOrderPrice
 * @returns {undefined}
 */
function getPageContent(itemURL,TMPrice,TMOrderPrice){   //  Запрашиваем конент для блока и вставляем содержимое ответа.
    var url = "https://steamcommunity.com/market/priceoverview/?country=RU&currency=5&appid=730&market_hash_name=" + itemURL;
    // Получаем и парсим код Steam страницы с предметом
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status === 200) {    //  Если запрос успешно дал ответ.
            //  Данные получены, убираем прелоадер, вставляем блок.
            $(".preloaderBlock").hide();
            $(".injectBlock").show();
            
            var obj = JSON.parse(xhr.responseText); //  Парсим ответ.
            //  Вставляем полученные значения в блок.
            if(obj.lowest_price){
               $("#lowest_price b").html(((obj.lowest_price).substring(0,((obj.lowest_price).length) - 5)).replace( /\,/g , "." ) + " &#8381;"); 
            }else{
               $("#lowest_price b").html("-"); 
            }
            if(obj.median_price){   //  Если средняя цена получена.
                $("#median_price b").html(((obj.median_price).substring(0,((obj.median_price).length) - 5)).replace( /\,/g , "." ) + " &#8381;");
            }else{  //  Средняя цена не получена.
               $("#median_price b").html("-"); 
            }
            //  Обрабатываем количество.
            if(obj.volume){
                var isThousand = false; //  Флаг тысяч предметов.
                for(var n = 0; n < obj.volume.length; n++){ //  Ищем в количестве предметов разделитель тысяч.
                    if(obj.volume[n] == ","){   //  Если есть разделитель.
                        isThousand = true;  //  Это тысячное число.
                        $("#volume b").html((obj.volume).split(',')[0] + (obj.volume).split(',')[1] + " шт");   //  Несколько тысяч.
                    }
                }
                if(!isThousand){    //  Если количество меньше 1000.   
                    $("#volume b").html(obj.volume + " шт");    //  Просто показываем число.
                }
            }else{  //  Если объем не получен.
                $("#volume b").html("-");   //  Рисуем прочерк на его месте.
            }
            //  Расчитываем разницу цен.
            if(obj.lowest_price && obj.median_price){
                var lowest = parseFloat(((obj.lowest_price).substring(0,((obj.lowest_price).length) - 5)).replace( /\,/g , "." ));
                var median = parseFloat(((obj.median_price).substring(0,((obj.median_price).length) - 5)).replace( /\,/g , "." ));
                var difference = (lowest - median).toFixed(2);
                if(difference > -1 && difference < 1){
                    $("#difference b").css("color","#e5bc13");
                }else{
                    if(difference < -1){    
                        $("#difference b").css("color","limegreen");
                    }else{
                        if(difference > 1){
                            $("#difference b").css("color","red");
                        }
                    }
                }
                $("#difference b").html(difference + " &#8381;");
            }else{
                $("#difference b").html("-");
            }
            //  Расчитавыем проценты выгодности.
            if(TMPrice && obj.lowest_price){
                //  $TmToSteam[$i] = number_format((((($lowest_price_STEAM[$i] / 1.15 )*100)/($min_price_TM[$i]))-100), 2, '.', '');// Профит.
                var persentTMtoSTEAMreal = ((( (lowest / 1.15) / TMPrice) * 100 ) - 100).toFixed(2);  //  Профит.
 
                if(persentTMtoSTEAMreal > 30){  //  Меняем цвет процента выгоды.
                    $("#percentTMtoSTEAM b").css("color","limegreen");
                }else{
                    if(persentTMtoSTEAMreal <= 0){
                        $("#percentTMtoSTEAM b").css("color","red");
                    }else{
                        if(persentTMtoSTEAMreal > 20 && persentTMtoSTEAMreal < 30){
                            $("#percentTMtoSTEAM b").css("color","#e5bc13");
                        }
                    }
                }
                $("#percentTMtoSTEAM b").html(persentTMtoSTEAMreal + " %");
            }
            //  Считаем Steam -> Tm.
            if(TMOrderPrice && obj.lowest_price){
                var persentSTEAMtoTMorder = ((( (TMOrderPrice / 1.10) * 100) / lowest ) - 100 ).toFixed(2);  //  Профит.
                if(persentSTEAMtoTMorder < -20){
                     $("#percentSTEAMtoTM b").css("color","red");
                }else{
                    if(persentSTEAMtoTMorder > -15){
                         $("#percentSTEAMtoTM b").css("color","limegreen");
                    }else{
                        if(persentSTEAMtoTMorder > -20 && persentSTEAMtoTMorder < -15){
                             $("#percentSTEAMtoTM b").css("color","#e5bc13");
                        }
                    }
                }
                $("#percentSTEAMtoTM b").html(persentSTEAMtoTMorder + " %");
            }
            //  Вставляем ссылку на предмет.
            document.getElementById("linkSteam").href = "http://steamcommunity.com/market/listings/730/" + itemURL;
        }
    };
}

/**
 * Формирует каркас блока, добавляемого на страницу.
 * @returns {undefined}
 */
function pasteContent(){    //  &#8381;
    $(".exchange-link").addClass("workspaceBlock");    // Помечаем блок, в который в дальнейшем будм помещать контент.
    //  Создаем блок ссылки обмена.
    var exchange_link_Content = $(".exchange-link").html(); //  Запоминает собержимое блока, который переопределим в дальнейшем.
    var exchange_link_Block = document.createElement("div");    //  Создаем новый блок.
    exchange_link_Block.setAttribute("class", "exchange-link"); //  Добавляем оригинальный класс.
    exchange_link_Block.innerHTML = exchange_link_Content;  //  Наполняем содержимым.
    $(".item-page-left").append(exchange_link_Block);   //  Помещаем в конец родительского блока.
    
    //  Создаем два блока, один для контента, второй для прелоадера.
    var preloaderBlock = document.createElement("div");
    var injectBlock = document.createElement("div");
    preloaderBlock.setAttribute("class", "preloaderBlock");
    injectBlock.setAttribute("class", "injectBlock");
    $(".workspaceBlock").html(preloaderBlock);
    $(".workspaceBlock").append(injectBlock);
    
    $(".preloaderBlock").html('<div class="banter-loader"><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div><div class="banter-loader__box"></div></div>'); 
            
    //  Внедряем свой блок.
    $(".injectBlock").html(""+  
        "<div class='subBlock' id='lowest_price' title='Самая низка цена на предмет на торговой площадке Steam'>"+
            "<small class='priceTitle'>Текущая цена:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='median_price' title='Средняя цена на предмет за последнии сутки на торговой площаде Steam'>"+
            "<small class='priceTitle'>Средняя цена:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='subBlock' id='volume' title='Количество проданных предметов за последнии 24 часа на торговой площадке Steam'>"+
            "<small class='priceTitle'>Объем за 24 часа:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='difference' title='Разница между самой низкой на данный момент ценой, и средней ценой за сутки на торговой площадке Steam'>"+
            "<small class='priceTitle'>Текущая - средняя:</small>"+
            "<div class='clear'></div>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='subBlock' id='percentTMtoSTEAM' title='Процент прибыли/потери при покупке предмета а маркете и его продаже в Steam'>"+
            "<small class='priceTitle'>Маркет &#8658; Стим</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='percentSTEAMtoTM' title='Процент потери при покупке данного предмета в Steam и продаже его на маркете'>"+
            "<small class='priceTitle'>Стим  &#8658;  Маркет</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='steamLink'><a id='linkSteam' href='#' target='_blank'>Страница предмета в Steam</a></div>");

        $(".injectBlock").hide();
}



/**
 * Выполняется при загрузке страницы, работает с DOM текущей вкладки, вызывает обработчик handler(res,TMPrice,TMOrderPrice).
 * 
 */
$(document).ready(function () {
    $.get(chrome.extension.getURL('/lib/Dictionary.js'), 
	function(data){
                //  Подключаем стили.
                var preloaderUrl = chrome.extension.getURL("css/preloader.css");
                var link = document.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                link.setAttribute("href", preloaderUrl);
                document.getElementsByTagName("head")[0].appendChild(link);
                //  js.
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = data;
		document.getElementsByTagName("head")[0].appendChild(script);
		document.getElementsByTagName("body")[0].setAttribute("onLoad", "injected_main();");
                
                var testElements = document.getElementsByClassName("item-h1");
                var el = testElements[0];   //  Получили содержание item-h1.
                //  Получаем цену и ордер со страницы. 
                var TMPrice = parseFloat($(".ip-bestprice").text());    //  Текущая цена на маркете.
                var TMOrderPriceAll = $(".item-stat .rectanglestat b");
                var TMOrderPrice = parseFloat($(TMOrderPriceAll[5]).text());    //  Текущий наивысший ордер на маркете.
                console.log(window.location.href);  //  Так можно получить TAB URL.
                pasteContent(); //  Инжектим в страницу сформированный каркас.
                handler(el.innerHTML,TMPrice,TMOrderPrice);  //  Обрабатываем содержимое контейнера item-h1
	}
    );
    
});