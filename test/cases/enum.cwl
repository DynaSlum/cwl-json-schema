cwlVersion: v1.0
class: CommandLineTool
inputs:
  birth_rate:
    type:
      type: enum
      symbols:
        - one
        - two
        - three
        - four
outputs: []
baseCommand: echo
