# CWL to JSON Schema Converter
This library provides an easy way to convert the input definition of a [Common Workflow Language file](http://commonwl.org)
to a [JSON Schema](http://json-schema.org/)

The primary goal of this library is to facilitate the use of [schema-form](http://schemaform.io/).

### CWL:
The following is an example CWL CommandLineDefinition.

```yaml
cwlVersion: v1.0
  class: CommandLineTool
  inputs:
    birth_rate:
      type:
        type: record
        fields:
          - id: mean
            type: double
          - id: median
            type: double
  outputs: []
  baseCommand: echo
```  

### Conversion code:
The following (very abbreviated) example typescript code is what is used to display the page in the demo

```
import { JSONSchema6, CwlToJsonSchemaConverter } from '../lib/cwl-to-jsonschema.converter';

CwlToJsonSchemaConverter.convert('Demo Yaml', <yaml string>);
```

### Schema:
This results in the follow json schema:

```json
{
  "type": "object",
  "title": "Demo Yaml",
  "properties": {
    "birth_rate": {
      "type": "object",
      "required": [
        "mean",
        "median"
      ],
      "properties": {
        "mean": {
          "type": "number",
          "$id": "mean"
        },
        "median": {
          "type": "number",
          "$id": "median"
        }
      },
      "$id": "birth_rate"
    }
  },
  "required": [
    "birth_rate"
  ]
}
```

## Credits

This package was created using the [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter.git).
