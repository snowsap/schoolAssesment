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
  let decryptedData = forge.rsa.decrypt(privateKey, decodedData);
  return decryptedData;
}

function encryptServer(messageToEncrypt) {
  return encryptedXMLGetRequest('/PublicKey').then(function(pem) {
    let pubKey = forge.pki.publicKeyFromPem(pem);   
    return forge.util.encode64(pubKey.encrypt(messageToEncrypt, "RSA-OAEP", { md: forge.md.sha256.create() }));
  });
}

async function encryptAndSendForm(id, keyUrl, address) {
  let form = document.getElementById(id);
  let formData = new FormData(form);
  formData.append("publicKey=", publicKey)
  let formDataObject = {};
  formData.forEach((value, i) => {
    formDataObject[i] = value; });
  let jsonData = JSON.stringify(formDataObject);
  let pem = await encryptedXMLGetRequest(keyUrl);
  let pubKey = forge.pki.publicKeyFromPem(pem);
  let encData = pubKey.encrypt(jsonData, "RSA-OAEP", { md: forge.md.sha256.create() });
  let response = await encryptedXMLPostRequest("encryptedData=" + encData, address);
  return decryptClient(response);
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
            reject("Request failed with status: " + xhttp.status);
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
      document.forms["signupForm"].submit();
    } else {
      alert(response);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.getElementById("signupForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  document.getElementById("result").innerHTML = result;
  location.href(result)
});