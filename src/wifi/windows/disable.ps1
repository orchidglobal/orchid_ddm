$wifi = Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*Wi-Fi*"}
$wifi | Disable-NetAdapter -Confirm:$false
