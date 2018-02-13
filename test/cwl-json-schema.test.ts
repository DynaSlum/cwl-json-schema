import { CwlToJsonSchemaConverter } from '../src/cwl-json-schema'
import * as fs from 'fs'
import * as path from 'path'

interface ExampleCase {
  cwl: string
  json: Object
}

interface ExampleLibrary {
  [id: string]: ExampleCase
}

function cwlFilter(element) {
  const extName = path.extname(element)
  return extName === '.cwl'
}

function jsonFilter(element) {
  const extName = path.extname(element)
  return extName === '.json'
}

function replaceExt(npath, ext) {
  if (typeof npath !== 'string') {
    return npath
  }

  if (npath.length === 0) {
    return npath
  }

  const nFileName = path.basename(npath, path.extname(npath)) + ext
  return path.join(path.dirname(npath), nFileName)
}

function initializeExampleCases(): ExampleLibrary {
  const currentDir = path.dirname(module.parent.filename)
  const caseDir = path.join(currentDir, 'cases')
  const exampleCases: ExampleLibrary = {}

  const items = fs.readdirSync(caseDir)
  const cwlFiles = items.filter(cwlFilter)
  const jsonFiles = items.filter(jsonFilter)

  for (let i = 0; i < cwlFiles.length; i++) {
    const fileName = cwlFiles[i]
    const jsonFile = jsonFiles.find(value => {
      return replaceExt(fileName, '.json') === value
    })

    if (!jsonFile) {
      console.error('Could not find json file corresponding to: ' + fileName)
      continue
    }
    const example: ExampleCase = {
      cwl: fs.readFileSync(path.join(caseDir, fileName)).toString(),
      json: JSON.parse(fs.readFileSync(path.join(caseDir, jsonFile)).toString())
    }

    exampleCases[fileName] = example
  }

  return exampleCases
}

/**
 * CWL Conversion test
 */
describe('Conversion Tests', () => {
  const exampleCases: ExampleLibrary = initializeExampleCases()

  for (const key of Object.keys(exampleCases)) {
    it(key + ' Conversion', () => {
      expect(CwlToJsonSchemaConverter.convert(replaceExt(key, ''), exampleCases[key].cwl)).toEqual(
        exampleCases[key].json
      )
    })
  }
})
