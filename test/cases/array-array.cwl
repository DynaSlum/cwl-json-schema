cwlVersion: v1.0
class: CommandLineTool
inputs:
  birth_rate:
    type:
      type: array
      items:
        type: array
        items:
          type: record
          fields:
            - name: mean
              type: double
            - name: median
              type: double
outputs: []
baseCommand: echo
