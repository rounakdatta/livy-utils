### Livy Utilities

#### Converting spark-submit commands to Livy-based JSONs
- Uses the package [bash-parser](https://github.com/vorpaljs/bash-parser) for producing AST out of a shell command

For example:
```bash
spark-submit  --queue  primq  --class  com.example.ClassDriver  --jars  pkg1.jar,myapp-assembly-1.0.jar,  pkg2.jar  --files  payload_data.json  --conf  spark.shuffle.service.enabled=true  --conf  spark.yarn.maxAppAttempts=1  --conf  spark.dynamicAllocation.enabled=true  --conf  spark.dynamicAllocation.minExecutors=1  --conf  spark.dynamicAllocation.maxExecutors=100  --conf  spark.yarn.am.nodeLabelExpression=etl_label  myapp-assembly-1.0.jar  payload_data  payload_data.json  "{\"personal_info\":{}  }"  "{  \"official_info\":  {}  }"
```
produces
```json
{
  "className": "com.example.ClassDriver",
  "args": [
    "payload_data",
    "payload_data.json",
    "{\"personal_info\":{}  }",
    "{  \"official_info\":  {}  }"
  ],
  "jars": [
    "pkg1.jar",
    "myapp-assembly-1.0.jar",
    "pkg2.jar"
  ],
  "files": [
    "payload_data.json"
  ],
  "queue": "primq",
  "conf": {
    "spark.shuffle.service.enabled": true,
    "spark.yarn.maxAppAttempts": 1,
    "spark.dynamicAllocation.enabled": true,
    "spark.dynamicAllocation.minExecutors": 1,
    "spark.dynamicAllocation.maxExecutors": 100,
    "spark.yarn.am.nodeLabelExpression": "etl_label"
  }
}
```

#### Validating Livy JSON based on standard rules
- Uses the package [ajv](https://github.com/epoberezkin/ajv) for defining JSON schema -based rules and validations
