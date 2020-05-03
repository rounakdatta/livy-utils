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

function test(JsonData) {
    let data = JSON.parse(JsonData);
    var valid = validate(data);

    let validationResults = "Valid!";
    if (!valid) {
        validationResults = 'Invalid: ' + ajv.errorsText(validate.errors);
    }

    document.getElementById("livyValidationResults").innerText = validationResults;
}

window.test = test;