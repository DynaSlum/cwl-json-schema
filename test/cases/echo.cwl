cwlVersion: v1.0
class: CommandLineTool
inputs:
  birth_rate:
    type:
      type: record
      fields:
        - name: mean
          type: double
        - name: median
          type: double
  two:
    type: string?
outputs: []
baseCommand: echo
