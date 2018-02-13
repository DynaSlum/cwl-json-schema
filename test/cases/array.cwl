cwlVersion: v1.0
class: CommandLineTool
inputs:
  birth_rate:
    type:
      type: array
      items:
        type: record
        fields:
          - name: mean
            type: double
          - name: median
            type: double
  two:
    type:
      type: array
      items:
        type: record
        fields:
          - name: first
            type: double?
          - name: second
            type: int?

outputs: []
baseCommand: echo
