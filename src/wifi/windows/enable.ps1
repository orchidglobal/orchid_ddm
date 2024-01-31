$wifi = Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*Wi-Fi*"}
$wifi | Enable-NetAdapter -Confirm:$false
