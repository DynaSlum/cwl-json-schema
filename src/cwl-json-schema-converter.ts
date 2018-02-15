import {
  Parameter,
  Workflow,
  instanceOfCwlRecordDefinition,
  CwlEnumDefinition,
  instanceOfCwlEnumDefinition,
  instanceOfCwlArrayDefinition,
  CWLType,
  CwlRecordDefinition,
  CwlArrayDefinition,
  FieldDefinition
} from './cwl.workflow'
import yaml from 'js-yaml'
import { JSONSchema6 } from 'json-schema'

/**
 * Re-export JSONSchema6 for ease of use
 */
export { JSONSchema6 } from 'json-schema'

/**
 * Map for converting basic CWL types to basic JsonSchema types
 */
export const cwlToJsonSchemaTypeMap = {
  none: 'null',
  boolean: 'boolean',
  int: 'integer',
  long: 'number',
  float: 'number',
  double: 'number',
  string: 'string',
  File: 'object',
  Directory: 'object'
}

/**
 * Helper interface for the conversion
 */
interface CwlConversion {
  schema?: JSONSchema6
  required?: boolean
}

/**
 * Converter to convert a CWL definition file to a JsonSchema
 * especially for use in a json-schema-form form.
 *
 * example:
 * cwlVersion: v1.0
 * class: CommandLineTool
 * inputs:
 *   birth_rate:
 *     type:
 *       type: record
 *       fields:
 *         - name: mean
 *           type: double
 *         - name: median
 *           type: double
 * outputs: []
 * baseCommand: echo
 *
 * will be converted to:
 * {
 *   "type": "object",
 *   "title": "Example",
 *   "properties": {
 *     "birth_rate": {
 *       "type": "object",
 *       "required": [
 *         "mean",
 *         "median"
 *       ],
 *       "properties": {
 *         "mean": {
 *           "type": "number",
 *           "$id": "mean"
 *         },
 *         "median": {
 *           "type": "number",
 *           "$id": "median"
 *         }
 *       },
 *       "$id": "birth_rate"
 *     }
 *   },
 *   "required": [
 *     "birth_rate"
 *   ]
 * }
 *
 */
export class CwlToJsonSchemaConverter {
  /**
   * This function converts the specified cwl file into a json-schema
   * The yaml file is parsed using js-yaml
   *
   * @param title The title of the form
   * @param fileContents  The contents of the yaml file as a string
   */
  public static convert(title: string, fileContents: string): JSONSchema6 {
    const yml = yaml.safeLoadAll(fileContents)
    const workflow = yml[0]

    const schema: JSONSchema6 = {
      type: 'object',
      title: title,
      properties: {},
      required: []
    }

    if (workflow.inputs instanceof Array) {
      workflow.inputs.forEach((value: Parameter, index: number, array: Parameter[]) => {
        const conversion = this.convertDefinition(value.id, value)

        if (conversion.required) {
          schema.required.push(value.id)
        }
        schema.properties[value.id] = conversion.schema
      })
    } else if (workflow.inputs instanceof Object) {
      Object.keys(workflow.inputs).forEach((key: string) => {
        const value: Parameter = workflow.inputs[key]
        const conversion = this.convertDefinition(key, value)

        if (conversion.required) {
          schema.required.push(key)
        }
        schema.properties[key] = conversion.schema
      })
    }

    return schema
  }

  /**
   * Converts the definition of a parameter
   *
   * @param key The id of the parameter
   * @param value The definition
   */
  private static convertDefinition(key: string, value: Parameter | FieldDefinition): CwlConversion {
    let conversion: CwlConversion = {}
    conversion.schema = {}

    const type = value.type
    if (type instanceof Array) {
      // Decide what to do here
    } else if (instanceOfCwlRecordDefinition(type)) {
      conversion = this.convertCwlRecordDefinition(type)
    } else if (instanceOfCwlEnumDefinition(type)) {
      conversion = this.convertCwlEnumDefinition(type)
    } else if (instanceOfCwlArrayDefinition(type)) {
      conversion = this.convertCwlArrayDefinition(type)
    } else {
      let theType = type.toString()
      if (theType.substr(-1) !== '?') {
        conversion.required = true
      } else {
        theType = theType.substr(0, theType.length - 1)
      }
      conversion.schema.type = cwlToJsonSchemaTypeMap[theType]
    }

    conversion.schema.$id = key
    if (value.label) {
      conversion.schema.title = value.label
    }

    return conversion
  }

  /**
   * Converts a cwl type definition that is a record
   *
   * example:
   * inputs:
   * birth_rate:
   *   type:
   *     type: record
   *     fields:
   *       - name: mean
   *         type: double
   *       - name: median
   *         type: double
   * @param type The type definition
   */
  private static convertCwlRecordDefinition(type: CwlRecordDefinition): CwlConversion {
    const conversion: CwlConversion = {
      required: true,
      schema: {
        type: 'object',
        required: [],
        properties: {}
      }
    }
    type.fields.forEach(fieldValue => {
      const fieldConv = this.convertDefinition(fieldValue.name, fieldValue)

      if (fieldConv.required) {
        conversion.schema.required.push(fieldValue.name)
      }
      conversion.schema.properties[fieldValue.name] = fieldConv.schema
    })

    return conversion
  }

  /**
   * Converts a cwl type definition that is an enum
   *
   * example:
   * inputs:
   * birth_rate:
   *   type:
   *     type: enum
   *     symbols:
   *        - A
   *        - B
   *        - C
   * @param type The type definition
   */
  private static convertCwlEnumDefinition(type: CwlEnumDefinition): CwlConversion {
    const conversion: CwlConversion = {
      schema: {
        type: 'string',
        enum: []
      },
      required: true
    }
    type.symbols.forEach(symbolValue => {
      conversion.schema.enum.push(symbolValue)
    })
    return conversion
  }

  /**
   * Converts a cwl type definition that is an array
   *
   * example:
   * inputs:
   * birth_rate:
   *   type:
   *     type: array
   *     items:
   *        type: record
   *        fields:
   *            - name: mean
   *              type: double
   *            - name: median
   *              type: double
   * @param type The type definition
   */
  private static convertCwlArrayDefinition(type: CwlArrayDefinition): CwlConversion {
    const conversion: CwlConversion = {
      schema: {
        type: 'array'
      },
      required: true
    }
    if (type.items instanceof Array) {
      conversion.schema.items = []
      for (const item of type.items) {
        const itemSchema: JSONSchema6 = this.convertItem(item)
        conversion.schema.items.push(itemSchema)
      }
    } else if (type.items instanceof Object) {
      conversion.schema.items = this.convertItem(type.items)
    } else {
      conversion.schema.items = cwlToJsonSchemaTypeMap[type.items]
    }
    return conversion
  }

  /**
   * Convert a single item based on its type
   *
   * @param item The item to convert
   */
  private static convertItem(item): JSONSchema6 {
    if (instanceOfCwlRecordDefinition(item)) {
      const itemConv = this.convertCwlRecordDefinition(item)
      return itemConv.schema
    } else if (instanceOfCwlEnumDefinition(item)) {
      const itemConv = this.convertCwlEnumDefinition(item)
      return itemConv.schema
    } else if (instanceOfCwlArrayDefinition(item)) {
      const itemConv = this.convertCwlArrayDefinition(item)
      return itemConv.schema
    } else {
      return cwlToJsonSchemaTypeMap[item]
    }
  }
}
