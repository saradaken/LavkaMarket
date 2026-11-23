# LavkaMarket

เครื่องมือดูราคาตลาด (แผงร้าน) สำหรับ Arizona RP — สคริปต์ MoonLoader ที่รวมราคาจากผู้เล่นที่ใช้ร่วมกันไว้ในกองกลาง เพื่อให้รู้ว่าของชิ้นไหนขาย/รับซื้อที่ราคาเท่าไหร่ ร้านไหน เซิร์ฟไหน

> A crowdsourced market-price viewer for Arizona RP. A MoonLoader (Lua + in-game CEF web UI) script that pools shop prices from players so you can see what each item sells/buys for, in which shop, on which server.

## สคริปต์นี้ส่งข้อมูลอะไรบ้าง (สำคัญ)

สคริปต์นี้ **เปิดซอร์สก็เพื่อให้ตรวจสอบได้ว่ามันปลอดภัย** — อ่านโค้ดได้เองทุกบรรทัด

**ส่ง (ไปยังกองกลาง):** เฉพาะ **ข้อมูลตลาด** เท่านั้น — ราคา, จำนวนชิ้น, ชื่อร้าน, ชื่อเซิร์ฟเวอร์, เวลา

**ไม่ส่ง / ไม่เก็บเด็ดขาด:** โทเคน, รหัสผ่าน, ข้อมูลในเรจิสทรี, แชท, พิกัดตัวละคร, ข้อมูลส่วนตัว หรือ HWID ใด ๆ

การเข้าสู่ระบบใช้ **Discord OAuth** (ต้องเป็นสมาชิกดิสคอร์ดของโปรเจกต์) การควบคุมผู้ใช้ทำผ่านการแบน "รหัสเข้าใช้" ไม่ใช่การเก็บตัวตนของใคร

> **What it shares:** market data only — price, count, shop name, server, time. **Never** tokens, registry, chat, coordinates, personal data, or HWID. Login is Discord OAuth; access is controlled by banning an access code, not by harvesting identities. This repo is open **so you can verify that yourself.**

## ติดตั้ง / Install

1. โหลดไฟล์ `LavkaMarket.lua` (ไฟล์เดียว) — จาก [dist/LavkaMarket.lua](dist/LavkaMarket.lua) หรือหน้า Releases
2. วางไว้ในโฟลเดอร์ `moonloader` ของเกม
3. เข้าเกม เปิดด้วยคำสั่ง `/lm` (หรือ `/lavka`) แล้วล็อกอินด้วย Discord

สคริปต์จะดาวน์โหลดตารางไอเทม (`items.json`) และหน้าตา UI เองอัตโนมัติเมื่อเปิดครั้งแรก และอัปเดตในเกมได้ผ่าน ☰ → อัปเดต

## เลือกไฟล์ให้ถูก: ตัวอัปเดตอัตโนมัติ / ตัวแมนนวล (Auto-update vs Manual)

| | ตัวอัปเดตอัตโนมัติ (Auto-update) | ตัวแมนนวล (Manual / static) |
|---|---|---|
| ไฟล์ | [`dist/LavkaMarket.lua`](dist/LavkaMarket.lua) | [`dist/LavkaMarket_static.lua`](dist/LavkaMarket_static.lua) |
| อัปเดต | ในเกม: `/lm` → ☰ → **Update** (หรือ `/lm update`) | ไม่มีตัวอัปเดตในไฟล์ — โหลดไฟล์ใหม่มาวางทับใน `moonloader` เอง แล้วรีสตาร์ทเกมหรือกด `Ctrl+R` |
| เลขเวอร์ชัน | เท่ากันทุกรุ่นที่ปล่อย (เช่น v0.5.6) | เท่ากันกับตัวอัตโนมัติเสมอ |
| ใช้เมื่อ | ต้องการให้สคริปต์ดึงรุ่นใหม่ให้ | ต้องการไฟล์เดียวที่ไม่ดาวน์โหลดอะไรเพิ่ม (เช่นเว็บฟอรัมที่ไม่รับสคริปต์ที่มีตัวอัปเดต) |

ประกาศอัปเดตแต่ละรุ่นในดิสคอร์ดจะระบุเวอร์ชันของทั้งสองไฟล์ รายการที่เปลี่ยน และลิงก์ดาวน์โหลดของแต่ละตัว

## โครงสร้างในรีโป / Repo layout

| path | คืออะไร |
|------|---------|
| `LavkaMarket.lua` | ซอร์สโค้ดฝั่งไคลเอนต์ (อ่านได้ มีมาร์ก `--@@EMBED@@` สำหรับฝัง UI ตอน build) |
| `LavkaMarket/web/app.js` | หน้าตา UI (CEF web) — `window.LVM` |
| `LavkaMarket/web/items.json` | ตารางไอเทม (ชื่อ/สี/ประเภท) — ข้อมูลของเกม ไม่มีข้อมูลผู้เล่น |
| `dist/LavkaMarket.lua` | ไฟล์แจกจ่ายจริง (ไฟล์เดียว ฝัง UI ไว้ในตัว) — ใช้อันนี้ติดตั้ง |
| `dist/items.json` | ตารางไอเทมที่คู่กับไฟล์แจก |

> ฝั่ง **เซิร์ฟเวอร์กองกลาง** (pool server + Discord bot) อยู่คนละที่และ **ไม่อยู่ในรีโปนี้** เพราะมีความลับ (client secret / โทเคนบอท)

## Build (สำหรับผู้พัฒนา)

ไฟล์ `dist/LavkaMarket.lua` สร้างจากซอร์สด้วยสคริปต์ `publish.py` (ฝั่งเซิร์ฟเวอร์) ซึ่งจะฝัง `LavkaMarket/web/app.js` ลงในมาร์ก `local EMBED = nil --@@EMBED@@` แล้วเขียนออกเป็นไฟล์เดียว ส่วน `items.json` ไม่ฝัง — สคริปต์โหลดเองตอนรัน

## License

[MIT](LICENSE)
