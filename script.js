const parse = require('bash-parser');
var assert = require('assert');

const livyMappings = {
    "--queue": "queue",
    "--class": "className",
    "--jars": "jars",
    "--py-files": "pyFiles",
    "--files": "files" 
}

class Livy {
    constructor() {
        this.kind = null;
        this.proxyUser = null;
        this.className = null;
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
}

function getJsonStringFromCommand(shellCommand) {
    let ast = parse(shellCommand, {mode: 'bash'});
    return JSON.stringify(ast, null, 2);
}

function getJsonObjectFromCommand(shellCommand) {
    let ast = parse(shellCommand, {mode: 'bash'});
    return ast;
}

function populateLivyObject(livyObject, paramArray) {
    for (i = 0; i < paramArray.length;) {
        let param = paramArray[i];
        
        switch(param.text) {
            case "--queue":
            case "--class":
                livyObject.setPrimitiveProperty(livyMappings[param.text], paramArray[++i].text);
                break;
            case "--jars":
            case "--py-files":
            case "--files":
                i++;
                while (!paramArray[i].text.startsWith("--")) {
                    let csv = paramArray[i++].text;
                    for (let v of csv.split(",")) {
                        livyObject.setArrayProperty(livyMappings[param.text], v);
                    }
                }
                break;
            default:
                i++;
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
    return JSON.stringify(livyObject, (key, value) => {
        if (value !== null && value.length != 0 && Object.keys(value).length !== 0) return value
    }, 2);
}

let shellCommand = 'SPARK_MAJOR_VERSION=2 HADOOP_USER_NAME=admin spark-submit --queue sandbox  --class com.example.ClassDriver   --jars deequ-1.0.2.jar,myapp-assembly-1.3.jar, jackson.jar  --files payload_data.json --conf spark.shuffle.service.enabled=true --conf spark.yarn.maxAppAttempts=1 --conf spark.dynamicAllocation.enabled=true --conf spark.dynamicAllocation.minExecutors=1 --conf spark.dynamicAllocation.maxExecutors=100 --conf spark.yarn.am.nodeLabelExpression=etl_label  myapp-assembly-1.3.jar payload_data payload_data.json "{\"personal_info\":{} }" "{ \"official_info\": {} }"'
let jsonObject = getJsonObjectFromCommand(shellCommand);

let commandArray = jsonObject.commands;
let outputJson = parseCommand(commandArray);
console.log(outputJson);