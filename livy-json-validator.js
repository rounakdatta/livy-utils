const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, $data: true});

var schemaOld = {
    "properties": {
      "foo": { "type": "string" },
      "bar": { "type": "number", "maximum": 3 }
    }
  };

var schema = {
    "properties": {
        "className": {
            "type": "string"
        },
        "jars": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": ".+.[jar|JAR]$"
            }
        },
        "pyfiles": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": ".+.[py|PY|egg|EGG|zip|ZIP]$"
            }
        },
        "files": {
            "type": "array"
        },
        "driverMemory": {
            "type": "string",
            "pattern": "[0-9]+[k|K|m|M|g|G|t|T]$"
        },
        "driverCores": {
            "type": "integer"
        },
        "executorMemory": {
            "type": "string",
            "pattern": "[0-9]+[k|K|m|M|g|G|t|T]$"
        },
        "executorCores": {
            "type": "integer"
        },
        "numExecutors": {
            "type": "integer"
        },
        "archives": {
            "type": "array"
        },
        "queue": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "conf": {
            "type": "object",
            "if": {
                "properties": {
                    "spark.dynamicAllocation.enabled": {"enum": [true]}
                }
            },
            "then": {
                "dependencies": {
                    "spark.dynamicAllocation.enabled": ["spark.shuffle.service.enabled"]
                },
                "properties": {
                    "spark.dynamicAllocation.minExecutors": {
                        "type": "number",
                        "maximum": {
                            "$data": "1/spark.dynamicAllocation.maxExecutors"
                        }
                    },
                    "spark.dynamicAllocation.maxExecutors": {
                        "type": "number"
                    }
                }
            }
        }
    }
}

var validate = ajv.compile(schema);
  
let payload = '{ "className": "com.example.ClassDriver", "jars": [ "deequ-1.0.2.jar", "myapp-assembly-1.3.jar", "jackson.jar" ], "executorMemory": "4k", "files": [ "payload_data.json" ], "queue": "sandbox", "conf": { "spark.shuffle.service.enabled": true, "spark.yarn.maxAppAttempts": 1, "spark.dynamicAllocation.enabled": true, "spark.dynamicAllocation.minExecutors": 1, "spark.dynamicAllocation.maxExecutors": 100, "spark.yarn.am.nodeLabelExpression": "etl_label" } }'
test(payload);

function test(JsonData) {
    let data = JSON.parse(JsonData);
    var valid = validate(data);
    if (valid) console.log('Valid!');
    else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}