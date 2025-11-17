
' Test-Persistence.vbs - A SAFE SCRIPT
MsgBox "Hello There! This is the benign test script executing.", 0, "Benign Test Script"
Set fso = CreateObject("Scripting.FileSystemObject")
Set wshShell = CreateObject("WScript.Shell")
startupPath = wshShell.SpecialFolders("Startup")
currentScriptPath = WScript.ScriptFullName
destinationPath = startupPath & "\" & "Harmless-Startup-Test.vbs"
fso.CopyFile currentScriptPath, destinationPath, True
MsgBox "SUCCESS (Maybe?): The script has attempted to copy itself to: " & destinationPath, 0, "Persistence Test"

