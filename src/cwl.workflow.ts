/**
 * Basic CWL Types
 */
export enum CWLType {
  'none',
  'boolean',
  'int',
  'long',
  'float',
  'double',
  'string',
  'File',
  'Directory',
  'none?',
  'boolean?',
  'int?',
  'long?',
  'float?',
  'double?',
  'string?',
  'File?',
  'Directory?'
}

/**
 * CWLRecordSchema
 */
export interface CwlRecordDefinition {
  type: 'record'
  fields: FieldDefinition[]
  name: string
}

export function instanceOfCwlRecordDefinition(object: any): object is CwlRecordDefinition {
  return object instanceof Object && 'type' in object && object['type'] === 'record'
}

/**
 * CWLEnumSchema
 */
export interface CwlEnumDefinition {
  type: 'enum'
  symbols: string[]
}

export function instanceOfCwlEnumDefinition(object: any): object is CwlEnumDefinition {
  return object instanceof Object && 'type' in object && object['type'] === 'enum'
}

/**
 * CWLArraySchema
 */
export interface CwlArrayDefinition {
  type: 'array'
  items: CwlItemType | CwlItemType[]
}

export function instanceOfCwlArrayDefinition(object: any): object is CwlArrayDefinition {
  return object instanceof Object && 'type' in object && object['type'] === 'array'
}

export type CwlItemType = CWLType | CwlRecordDefinition | CwlEnumDefinition | CwlArrayDefinition

/**
 * Input and Output parameters have very similar definitions
 * and we do not need to differentiate them to convert.
 */
export interface Parameter {
  id: string
  type: CwlItemType | CwlItemType[]
  label?: string
}

export interface FieldDefinition {
  name: string
  type: CwlItemType | CwlItemType[]
  label?: string
}

/**
 * We are only interested in the inputs and outputs of the workflow
 * so the steps are ommitted.
 */
export interface Workflow {
  inputs:
    | {
        [k: string]: Parameter
      }
    | Parameter[]
  outputs:
    | {
        [k: string]: Parameter
      }
    | Parameter[]
}
