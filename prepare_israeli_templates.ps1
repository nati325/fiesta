$dest = "c:\Users\123\Desktop\Fiesta\fiesta-nextjs\public\invitation-templates"
$src  = "C:\Users\123\.gemini\antigravity\brain\33083e1a-a8e6-49eb-b1f7-d14a0680015b"

New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Copy the managed image from this turn
Copy-Item "$src\israeli_invite_floral_blush_1778354519343.png" "$dest\israeli-floral-blush.png" -Force

# Also use some of the best previous ones that fit the "modern Israeli" vibe
Copy-Item "$src\invite_tpl_2_1778352880558.png"  "$dest\israeli-gold-luxury.png"  -Force
Copy-Item "$src\invite_tpl_4_1778352928574.png"  "$dest\israeli-tropical.png"     -Force
Copy-Item "$src\invite_tpl_7_1778352991549.png"  "$dest\israeli-minimal-white.png" -Force

Write-Host "Done! Modern Israeli templates prepared." -ForegroundColor Green
