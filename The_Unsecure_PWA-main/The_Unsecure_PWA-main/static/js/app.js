if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("static/js/serviceWorker.js")
        .then((res) => console.log("service worker registered"))
        .catch((err) => console.log("service worker not registered", err));
    });
  }

function checkPassword() {

  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', "/passwordRequest", true)
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) { 
      var response = xhttp.responseText
      console.log(response)
      if (response === "returnerror.hasNoError") {
        document.forms["signupForm"].submit()
      }
      else {
        alert(response)
        }
      }
    };
    
    xhttp.send("password=" + document.getElementById("passwordSignup").value);   

  }


