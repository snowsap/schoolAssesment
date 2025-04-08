let pair = forge.pki.rsa.generateKeyPair({bits : 2048, e: 0x10001 })

const publicKey = pair.publicKey
const privKey = pair.privateKey

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("static/js/serviceWorker.js")
        .then((res) => console.log("service worker registered"))
        .catch((err) => console.log("service worker not registered", err));
  });
}

function encryptClient(messageToEncrypt) {
  return publicKey.encrypt(messageToEncrypt, "RSA-OAEP", {md: forge.md.sha256.create() });
}

function decryptClient(encryptedData, privateKey) {
  if (!encryptedData || encryptedData.length === 0) {
    console.error('missing info ');
    return;
  }
  let decodedData = forge.util.decode64(encryptedData);
  return privateKey.decrypt(decodedData, "RSA-OAEP", { md: forge.md.sha256.create() });
}

function encryptServer(messageToEncrypt) {
  return encryptedXMLGetRequest('/PublicKey').then(function(pem) {
    let pubKey = forge.pki.publicKeyFromPem(pem);   
    return forge.util.encode64(pubKey.encrypt(messageToEncrypt, "RSA-OAEP", { md: forge.md.sha256.create() }));
  });
}


function encryptedXMLGetRequest(address) {
  return new Promise(function (resolve) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", address, true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        resolve(xhttp.responseText);
      }
    };
    xhttp.send();
  });
}

function encryptedXMLPostRequest(dataName, data, address) {
  return new Promise((resolve, reject) => {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", address, true);
    encryptServer(data).then(encryptedData => {
      let pem = forge.pki.publicKeyToPem(publicKey);
      let formData = new FormData();
      formData.append("publicKey", pem);
      formData.append(dataName, encryptedData);

      xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4) {
          if (xhttp.status === 200) {
            resolve(xhttp.responseText);  
          } else {
            reject("Request failed with  " + xhttp.status);
          }
        }
      };
      xhttp.send(formData);
    }).catch(error => {
      reject(error);
    });
  });
}

async function checkPassword() {
  let password = document.getElementById("passwordSignup").value;
  try {
    let response = await encryptedXMLPostRequest("password", password, "/passwordRequest");
    console.log(response);
    if (response === "returnerror.hasNoError") {
      signInPage();
    } else {
      alert(response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function signInPage() {

  let pem = forge.pki.publicKeyToPem(publicKey);
  let rawPassword = document.getElementById("passwordSignup").value;
  let rawUsername = document.getElementById("usernameSignup").value;
  let rawDob = document.getElementById("dobSignup").value

  let password = await encryptServer(rawPassword);
  let username = await encryptServer(rawUsername);
  let dob = await encryptServer(rawDob)

  let formData = new FormData();
  formData.append("password", password);
  formData.append("username", username);
  formData.append("dob", dob)
  formData.append("publicKey", pem);

  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/signup.html", true);
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      let answer = xhttp.responseText;
      if (answer == "0") {
        window.location.replace("/index.html")
      }
      else {
        window.location.replace("/signup.html")
      }
    }
  };
  xhttp.send(formData);
}

async function logInPage() {

  let pem = forge.pki.publicKeyToPem(publicKey);
  let rawPassword = document.getElementById("password").value;
  let rawUsername = document.getElementById("username").value;

  let password = await encryptServer(rawPassword);
  let username = await encryptServer(rawUsername);

  let formData = new FormData();
  formData.append("password", password);
  formData.append("username", username);
  formData.append("publicKey", pem);

  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/index.html", true);
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      let answer = xhttp.responseText;
      if (answer == "0") {
        window.location.replace("/success.html")
      }
      else {
        window.location.replace("/index.html")
      }
    }
  };
  xhttp.send(formData);
}
