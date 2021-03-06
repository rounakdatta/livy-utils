const parse = require('bash-parser');
var assert = require('assert');

const livyMappings = {
    "--class": "className",
    "args": "args",
    "--jars": "jars",
    "--py-files": "pyFiles",
    "--files": "files",
    "--driver-memory": "driverMemory",
    "--driver-cores": "driverCores",
    "--executor-memory": "executorMemory",
    "--executor-cores": "executorCores",
    "--num-executors": "numExecutors",
    "--archives": "archives",
    "--queue": "queue",
    "--name": "name",
    "--conf": "conf"
}

class Livy {
    constructor() {
        this.kind = null;
        this.proxyUser = null;
        this.className = null;
        this.args = [];
        this.jars = [];
        this.pyFiles = [];
        this.files = [];
        this.driverMemory = null;
        this.driverCores = null;
        this.executorMemory = null;
        this.executorCores = null;
        this.numExecutors = null;
        this.archives = [];
        this.queue = null;
        this.name = null;
        this.conf = {};
        this.heartbeatTimeoutInSecond = null;
    }

    setPrimitiveProperty(propertyName, propertyValue) {
        if (!propertyValue) {
            return
        }
        this[propertyName] = propertyValue;
    }

    setArrayProperty(propertyName, propertyValue) {
        if (!propertyValue) {
            return
        }
        this[propertyName].push(propertyValue);
    }

    setMapProperty(propertyName, propertyKey, propertyValue) {
        if (!propertyValue) {
            return
        }
        this[propertyName][propertyKey] = correctDataType(propertyValue);
    }
}

function correctDataType(inputData) {
    switch(inputData) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            if (!isNaN(inputData)) {
                return +inputData;
            }

            return inputData;
    }
}

function getJsonObjectFromCommand(shellCommand) {
    let ast = parse(shellCommand, {mode: 'bash'});
    return ast;
}

function populateLivyObject(livyObject, paramArray) {
    let paramLength = paramArray.length;
    for (i = 0; i < paramLength;) {
        let param = paramArray[i];
        
        switch(param.text) {
            case "--class":
            case "--driver-memory":
            case "--driver-cores":
            case "--executor-memory":
            case "--executor-cores":
            case "--num-executors":
            case "--queue":
            case "--name":
                livyObject.setPrimitiveProperty(livyMappings[param.text], paramArray[++i].text);
                break;
            case "--jars":
            case "--py-files":
            case "--files":
                i++;
                while (i < paramLength && !paramArray[i].text.startsWith("--")) {
                    let csv = paramArray[i++].text;
                    for (let v of csv.split(",")) {
                        livyObject.setArrayProperty(livyMappings[param.text], v);
                    }
                }
                break;
            case "--conf":
                i++;
                while (i < paramLength && !paramArray[i].text.startsWith("--") && !paramArray[i].text.toLowerCase().endsWith(".jar")) {
                    let csv = paramArray[i++].text;
                    for (let v of csv.split(",")) {
                        let [key, value] = v.split("=");
                        livyObject.setMapProperty(livyMappings[param.text], key, value);
                    }
                }
                break;
            default:
                if (param.text.toLowerCase().endsWith(".jar")) {
                    while (++i < paramLength) {
                        let arg = paramArray[i].text;
                        livyObject.setArrayProperty(livyMappings["args"], arg);
                    }
                } else {
                    i++;
                }
        }
    }

    return livyObject;
}

function parseCommand(commands) {
    assert(commands.length == 1);
    let payloadCommand = commands[0];
    assert(Object.keys(payloadCommand).length <= 4);

    assert(payloadCommand.name.text == "spark-submit");
    let suffixArray = payloadCommand.suffix;

    let livyObject = new Livy();
    livyObject = populateLivyObject(livyObject, suffixArray);
    return JSON.stringify(livyObject, (_, value) => {
        if (value !== null && ((typeof value === "string" && value.length !== 0) || (typeof value === "object" && Object.keys(value).length !== 0) || (typeof value === "boolean" || typeof value === "number"))) return value
    }, 2);
}

function makeConversion(shellCommand, editorLivy) {
    let jsonObject = getJsonObjectFromCommand(shellCommand);

    let commandArray = jsonObject.commands;
    let outputJson = parseCommand(commandArray);
    editorLivy.getDoc().setValue(outputJson);
}

window.makeConversion = makeConversion;