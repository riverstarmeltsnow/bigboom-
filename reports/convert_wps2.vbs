' 用 WPS COM 转真正的 docx
Dim wps, doc
Set wps = CreateObject("KWps.Application")
wps.Visible = False
wps.DisplayAlerts = False

Set doc = wps.Documents.Open("d:\myclaude\reports\templates\_report4_src.doc")
If Err.Number = 0 Then
    doc.SaveAs2 "d:\myclaude\reports\templates\_report4_real.docx", 16
    If Err.Number = 0 Then
        WScript.Echo "OK"
    Else
        WScript.Echo "SaveAs error: " & Err.Description
    End If
    doc.Close
Else
    WScript.Echo "Open error: " & Err.Description
End If
wps.Quit
