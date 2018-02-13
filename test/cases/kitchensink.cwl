cwlVersion: v1.0
class: CommandLineTool
inputs:
  one:
    type: none
  two:
    type: boolean
  three:
    type: int
  four:
    type: long
  five:
    type: float
  six:
    type: double
  seven:
    type: string
  eight:
    type: File
  nine:
    type: Directory
  ten:
    type: long?
outputs: []
baseCommand: echo
