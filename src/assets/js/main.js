function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var lang = getCookie("lang");
  if (lang != "") {
    if (lang != "en") {
      window.location = "https://swene.io/" + lang;
    } else {
      window.location = "https://swene.io/";
    }
  } else {
    var fr,ar,de,es,zn,ru,it;
    switch(window.navigator.language.slice(0, 2)) {
      default:
        var lang = "en";
        break;
      case fr:
        var lang = "fr";
        break;
      case ar:
        var lang = "ar";
        break;
      case de:
        var lang = "de";
        break;
      case es:
        var lang = "fr";
        break;
      case zn:
        var lang = "zn";
        break;
      case ru:
        var lang = "ru";
        break;
      case it:
        var lang = "it";
        break;
    }
    if (lang != "" && lang != null) {
      setCookie("lang", lang, 365);
    }
  }
}
