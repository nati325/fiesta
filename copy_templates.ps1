$dest = "c:\Users\123\Desktop\Fiesta\fiesta-nextjs\public\invitation-templates"
$src  = "C:\Users\123\.gemini\antigravity\brain\33083e1a-a8e6-49eb-b1f7-d14a0680015b"

New-Item -ItemType Directory -Force -Path $dest | Out-Null

Copy-Item "$src\invite_tpl_1_1778352855686.png"  "$dest\tpl-1.png"  -Force
Copy-Item "$src\invite_tpl_2_1778352880558.png"  "$dest\tpl-2.png"  -Force
Copy-Item "$src\invite_tpl_3_1778352907172.png"  "$dest\tpl-3.png"  -Force
Copy-Item "$src\invite_tpl_4_1778352928574.png"  "$dest\tpl-4.png"  -Force
Copy-Item "$src\invite_tpl_5_1778352950508.png"  "$dest\tpl-5.png"  -Force
Copy-Item "$src\invite_tpl_6_1778352969633.png"  "$dest\tpl-6.png"  -Force
Copy-Item "$src\invite_tpl_7_1778352991549.png"  "$dest\tpl-7.png"  -Force
Copy-Item "$src\invite_tpl_8_1778353012749.png"  "$dest\tpl-8.png"  -Force

Write-Host "Done! All templates copied." -ForegroundColor Green
