var port = chrome.extension.connect({
      name: "Sample Communication"
 });
 port.onMessage.addListener(function(msg) {
      console.log("Xer say: " + msg);
 });
$(document).ready(function(){
    //window.onload = function() {
        //  Составляем url страницы.
        //  <h1 style="color: #000000">CZ75-Auto | Polymer</h1>
        // Достаем все необходимые DOM.
        
        // Обработчик url на предмет в Staam.
        function handler(res){
            var Error = {   //  Ошибка.
                state:false, 
                desc:"" 
            };   
            $("#tmPrice").append(res);
            //port.postMessage(res);
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
                var i = 1;
                while( Dicrionary["ru"][i] ){   //  Пока не достигли конца массива.
                    if( Dicrionary["ru"][i] == itemName ){    //  Если нашлось имя.
                        itemName = Dicrionary["en"][i];  //  Записываем английский вариант имени.
                        console.log("GET: ",itemName);
                        break;  //  Выходим из while.
                    }else{
                        i++;
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
                
                port.postMessage(URL);
            }else{  //  Ошибка.
                port.postMessage(Error.desc);
            }
            
            
        }   
        
        chrome.tabs.executeScript(null, {
            code: 'var testElements = document.getElementsByClassName("item-h1");' +
                ' var el = testElements[0]; ' +
                ' ' +
                ' if (el) {el.style.color = "red";}' +
                ' el.innerHTML'
        }, function (results) {
            handler(results);
        });
        
        
        /*chrome.tabs.executeScript({
            code: 'var testElements = document.getElementsByClassName("ip-bestprice");'+
            ' var el = testElements[0]; '+
            ' console.log(el.innerHTML);'+
            ' $("#tmPrice").append(el.innerHTML);'+
            ' if (el) {el.style.color = "red";}'
        });*/
        
        //  Составляем url страницы.
        var text = '<h1 style="color: #000000">CZ75-Auto | Polymer</h1>';
        var regEx = /<h1.*?>.*?<\/h1>/ig;
        var match = regEx.exec(text);
        var matchParse = match[0].substring(27).substring(0,match[0].length - 5);
        
        var matchReplace = matchParse.replace( /\|/g , "%7C" );  //    AK-47%20%7C%20Redline%20%28Field-Tested%29
        matchReplace = matchReplace.replace(/\s/g,"%20");
        //matchReplace = matchReplace.replace(/\(/g,"%28");
        //matchReplace = matchReplace.replace(/\)/g,"%29");
        var url = "http://steamcommunity.com/market/listings/730/" + matchReplace; 
        
        $("#tmPrice").append(matchReplace);
        /*
         * // Получаем и парсим код Steam страницы с предметом
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20%28Field-Tested%29", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                $("#tmPrice").append(xhr.responseText);
                //  Парсим код страницы.
            }
        }
        xhr.send();
        */
    //};
});

