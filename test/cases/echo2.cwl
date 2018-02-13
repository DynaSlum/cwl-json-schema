cwlVersion: v1.0
class: CommandLineTool
inputs:
  - id: birth_rate
    type:
      type: record
      fields:
        - name: mean
          type: double
        - name: median
          type: double
  - id: two
    type: string?
outputs: []
baseCommand: echo
