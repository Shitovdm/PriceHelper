//  Вещаем обработчик сообщений.
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        console.log("Popup.js say: " + msg);
        //  Получаем исходный код страницы предмета Steam.
        
        //  Выполняет действие с DOM.
        
    });
});

function injected_main() {
	console.log("Unject");
}
function handler(res,TMPrice){
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
    }
    // Необходимо переводить название предметов на русский язык.
    if (/[а-я]+/.test(marketName)) {   //  Если в строке есть русские символы.
        //  Находим соответствие из словаря.
        var itemWeapon = marketName.split('|')[0];
        var itemName = (marketName.split('|')[1]).substring(1);
        var firstChar = itemName[0];
        for(var item in Dicrionary["ru"][firstChar]){
            if( item == itemName){
                itemName = Dicrionary["ru"][firstChar][item];
                //console.log("GET: ",itemName);
                break;
            }
        }
        if(/[а-я]+/.test(itemName)){   //  Если перевода названию не нашлось в словаре.
            Error.state = true;
            Error.desc = "В словаре нет перевода для данного предмета.";
        }
        marketName = itemWeapon + "| " + itemName;  //  Формируем market_name.
    }
    if(!Error.state){   //  Если ошибок не было.
        var marketNameURL = marketName.replace( /\|/g , "%7C" );
        marketNameURL = marketNameURL.replace( /\s/g,"%20" );
        var URL = marketNameURL + "%20%28" + Exterior + "%29";
        //port.postMessage(URL);
        getPageContent(URL,TMPrice);
    }else{  //  Ошибка.
        console.log(Error.desc);
        //port.postMessage(Error.desc);
    }
}   
        
//  Функция получает контент страницы Steam.
function getPageContent(itemURL,TMPrice){   //  Запрашиваем конент для блока и вставляем содержимое ответа.
    var url = "https://steamcommunity.com/market/priceoverview/?country=RU&currency=5&appid=730&market_hash_name=" + itemURL;
    // Получаем и парсим код Steam страницы с предметом
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status === 200) {
            var obj = JSON.parse(xhr.responseText);
            //  Вставляем полученные значения в блок.
            $("#lowest_price b").html(((obj.lowest_price).substring(0,((obj.lowest_price).length) - 5)).replace( /\,/g , "." ) + " &#8381;");
            $("#median_price b").html(((obj.median_price).substring(0,((obj.median_price).length) - 5)).replace( /\,/g , "." ) + " &#8381;");
            if(obj.volume){
                var isThousand = false;
                for(var n = 0; n < obj.volume.length; n++){
                    if(obj.volume[n] == ","){
                        isThousand = true;
                        $("#volume b").html((obj.volume).split(',')[0] + (obj.volume).split(',')[1] + " шт");
                    }
                }
                if(!isThousand){
                    $("#volume b").html(obj.volume + " шт");
                }
            }else{
                $("#volume b").html("-");
            }
            
            if(obj.lowest_price && obj.median_price){
                var lowest = parseFloat(((obj.lowest_price).substring(0,((obj.lowest_price).length) - 5)).replace( /\,/g , "." ));
                var median = parseFloat(((obj.median_price).substring(0,((obj.median_price).length) - 5)).replace( /\,/g , "." ));
                var difference = (lowest - median).toFixed(2);
                if(difference < 0){
                    $("#difference b").css("color","limegreen");
                }else{
                    $("#difference b").css("color","red");
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
            
            //  Вставляем ссылку на предмет.
            document.getElementById("linkSteam").href = "http://steamcommunity.com/market/listings/730/" + itemURL;
            
            
        }
    };
    pasteContent();
}
function pasteContent(){    //  &#8381;
    $(".exchange-link").addClass("injectBlock");
    //  Строим блок.
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
            "<small class='priceTitle'>Маркет &#8658; Стим-15%</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='subBlock' id='percentTMtoST' title='Процент потери при покупке данного предмета в Steam и продаже его на маркете'>"+
            "<small class='priceTitle'>Стим &#8658; Маркет</small>"+
            "<b></b>"+
        "</div>"+
        "<div class='clear'></div>"+
        "<div class='steamLink'><a id='linkSteam' href='#' target='_blank'>Страница предмета в Steam</a></div>");
  
}
$(document).ready(function () {
    $.get(chrome.extension.getURL('/js/dictNEW.js'), 
	function(data) {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = data;
		document.getElementsByTagName("head")[0].appendChild(script);
		document.getElementsByTagName("body")[0].setAttribute("onLoad", "injected_main();");
                
                var testElements = document.getElementsByClassName("item-h1");
                var el = testElements[0];
                //  Получаем цену и ордер со страницы. 
                var TMPrice = parseFloat($(".ip-bestprice").text());
                var TMOrderPriceAll = $(".item-stat .rectanglestat b");
                var TMOrderPrice = parseFloat($(TMOrderPriceAll[5]).text());
                
                handler(el.innerHTML,TMPrice,TMOrderPrice);  //  Обрабатываем содержимое контейнера item-h1
  
	}
    );
    
});