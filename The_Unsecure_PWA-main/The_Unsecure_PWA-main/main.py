from flask import Flask
from flask import render_template
from flask import request
from flask import redirect
import user_management as dbHandler
from enum import Enum


app = Flask(__name__)

pecialCharacterunordedMap = dict()
specialCharacterunordedMap = {
'"' : "&quot;", 
"'" : "&apos;", 
"&" : "&amp;",
"<" : "&lt;", 
">" : "&gt;",
"-" : "&#45;"}

def sanitiseInput(input):
    
    inputList = list(str(input))
    output = list()

    for i in range(0, len(input)):
        tempValue = specialCharacterunordedMap.get(inputList[i], "0")

        if tempValue != '0':
            output.append(tempValue)
        else: 
            output.append(inputList[i])
    return "".join(output)



class returnerror(Enum):
    hasNoError = 0
    noLowerCase = 1
    noUpperCase = 2
    noSpecialCase = 3
    continuousLetters = 4
 
def checkInput(password):

    print(password)

    inputList = list(str(password))
    lastId = False
    
    hasLowerCase = False
    hasUpperCase = False
    hasSpecialCharacter = False
    repeat = 0
    
    for i in range(0, len(password)):
        
        upperCharacter = False
        lowerCharacter = False
        
        tempID = inputList[i]
        ## checking for lowercase
        if (97 <= ord(tempID) <= 122):
            hasLowerCase = True
            lowerCharacter = True

        ## checking for uppercase
        if (65 <= ord(tempID) <= 90):
            hasUpperCase = True
            upperCharacter = True
            
        ## if its neither upper or lowercase than it must be a special chararcter
        if not (upperCharacter or lowerCharacter):
            hasSpecialCharacter = True

        if lastId == tempID:
            repeat += 1
            if repeat > 2:
                return returnerror.continuousLetters
        else:
            repeat = 0

        lastId = tempID

    if (not hasLowerCase):
        return returnerror.noLowerCase
    
    if (not hasUpperCase):
        return returnerror.noUpperCase
    
    if (not hasSpecialCharacter):
        return returnerror.noSpecialCase
    
    return returnerror.hasNoError

@app.route("/success.html", methods=["POST", "GET", "PUT", "PATCH", "DELETE"])
def addFeedback():
    if request.method == "GET" and request.args.get("url"):
        url = request.args.get("url", "")
        return redirect(url, code=302)
    if request.method == "POST":
        feedback = request.form["feedback"]
        dbHandler.insertFeedback(feedback)
        dbHandler.listFeedback()
        return render_template("/success.html", state=True, value="Back")
    else:
        dbHandler.listFeedback()
        return render_template("/success.html", state=True, value="Back")


@app.route("/signup.html", methods=["POST", "GET", "PUT", "PATCH", "DELETE"])
def signup():
    if request.method == "GET" and request.args.get("url"):
        url = request.args.get("url", "")
        return redirect(url, code=302)
    if request.method == "POST":
        username = sanitiseInput(request.form["username"])
        rawpassword = request.form["password"]
        print(str(checkInput(rawpassword)))
        if(str(checkInput(rawpassword)) != 'returnerror.hasNoError'):
            return render_template("/signup.html")
        password = sanitiseInput(rawpassword)
        DoB = request.form["dob"]
        dbHandler.insertUser(username, password, DoB)
        return render_template("/index.html")
    else:
        return render_template("/signup.html")


@app.route("/index.html", methods=["POST", "GET", "PUT", "PATCH", "DELETE"])
@app.route("/", methods=["POST", "GET"])
def home():
    if request.method == "GET" and request.args.get("url"):
        url = request.args.get("url", "")
        return redirect(url, code=302)
    if request.method == "POST":
        username = sanitiseInput(request.form["username"])
        password = sanitiseInput(request.form["password"])
        isLoggedIn = dbHandler.retrieveUsers(username, password)
        if isLoggedIn:
            dbHandler.listFeedback()
            return render_template("/success.html", value=username, state=isLoggedIn)
        else:
            return render_template("/index.html")
    else:
        return render_template("/index.html")


@app.route("/passwordRequest", methods=["POST", "GET", "PUT", "PATCH", "DELETE"])
def passwordValidation():
    password  = request.form.get("password")
    errorCode = checkInput(password)
    print(errorCode)
    return(str(errorCode))



if __name__ == "__main__":
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
    app.run(debug=True, host="0.0.0.0", port=5000)
