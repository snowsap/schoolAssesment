const forge = require("node-forge");

// for reasoning of numbers look at the python encryption function but in short dont touch
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

function checkPassword() {

  var response = encryptedXMLPostRequest(xhttp.send("password=" + document.getElementById("passwordSignup").value), "/passwordRequest")
  if (response === "returnerror.hasNoError") {
    document.forms["signupForm"].submit();
  }
  else {
    alert(response)
    }
  }

function encryptClient(messageToEncrypt) {
  return publicKey.encrypt(messageToEncrypt, "RSA-OAEP", {md: forge.md.sha256.create() });
}

function decryptClient(messageToDecrypt) {
  return decrypted = privateKey.decrypt(forge.util.hexToBytes(messageToDecrypt), "RSA-OAEP", { md: forge.md.sha256.create() }) 
}

function encryptServer(messageToEncrypt) {
  const publicKey = encryptedXMLGetRequest('/PublicKey');
  return publicKey.encrypt(messageToEncrypt, "RSA-OAEP", { md: forge.md.sha256.create() });
}

async function encryptAndSendForm(id, publicKey, address) {

  let form = document.getElementById(id);
  let formData = new FormData(form);
  let formDataObject = {};
  formData.forEach((value, key) => {
    formDataObject[key] = value;
  });
  

  encryptedXMLPostRequest(publicKey.encrypt(formDataObject[i], "RSA-OAEP", { md: forge.md.sha256.create() }), address)
}

function encryptedXMLGetRequest(address) {

  var xhttp = new XMLHttpRequest();
  xhttp.open(typeOfRequest, address, true)
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) { 
      return decryptClient(xhttp.responseText)
    }
  }
} 

function encryptedXMLPostRequest(valuesToPass, address) {
  encryptedValueToPass = encryptServer(valuesToPass)
  var xhttp = new XMLHttpRequest();
  xhttp.open(typeOfRequest, address, true)
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4 && xhttp.status === 200) { 
      return decryptClient(xhttp.responseText)
    }
  }
}

document.getElementById("signupForm").addEventListener("submit", async (event) => {
  event.preventDefault(); 
  await encryptAndSendEntireForm("signupForm", encryptedXMLGetRequest('/PublicKey'), );
});