
//  Вещаем обработчик сообщений.
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        console.log("Popup.js say: " + msg);
        //  Получаем исходный код страницы предмета Steam.
        
        //  Выполняет действие с DOM.
        
    });
});

/*
 chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.executeScript({
            code: ' var block = document.getElementsByClassName("ip-bestprice");' +
                  ' var re = block[0];' +
                  ' re.style.backgroundColor = "#3f5999"; '
      });
      console.log("qqqq");
});*/
function injected_main() {
	console.log("Unject");
}
function pasteContent(){
    $(".exchange-link").addClass("injectBlock");
    $(".injectBlock").html("<b>ТЫ ПИДОР!!!</b>");
   // $(".injectBlock").css("background-color","red");
    console.log("work");
}
$(document).ready(function () {
    $.get(chrome.extension.getURL('/js/injected.js'), 
	function(data) {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.innerHTML = data;
		document.getElementsByTagName("head")[0].appendChild(script);
		document.getElementsByTagName("body")[0].setAttribute("onLoad", "injected_main();");
                
                
                pasteContent();
                
                
	}
    );
});