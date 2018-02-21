/*chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  alert('Looking on the page' + tab.url + ' element with desired classname');
  chrome.tabs.executeScript({
    code: 'var testElements = document.getElementsByClassName("market_listing_price"); var el = testElements[0]; if (el) {el.style.color = "red";}'
  });
});*/
//  Вещаем обработчик сообщений.
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        console.log("Popup.js say: " + msg);
        //port.postMessage("Hi Popup.js");
        //  Выполняет действие с DOM.
        
    });
});
 
/*
var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20%28Field-Tested%29", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log(xhr.responseText);
                //  Парсим код страницы.
            }
        }
        xhr.send();
        */
