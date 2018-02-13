cwlVersion: v1.0
class: CommandLineTool
inputs:
  array:
    label: myArray
    type:
      type: array
      items:
        - boolean
        - int
  array2:
    type:
      type: array
      items: File
  enum-array:
    type:
      type: array
      items:
        type: enum
        symbols: [one, two, three, four]
outputs: []
baseCommand: echo
