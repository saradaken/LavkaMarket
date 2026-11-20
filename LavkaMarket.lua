--[[
    LavkaMarket.lua  -  own market tracker for Arizona RP / SA-MP  (CEF UI)
    - collects shop data itself from the CEF packets the game sends when you open a stall (no LavkaPrices needed)
    - never calls the arz.market API  ->  cannot be blocked by it
    - UI is a real web page injected into the game (LavkaMarket/web/app.js): Discord login + prices + icons, 3 langs
    - shares MARKET DATA ONLY (price / count / shop name / server / time). never tokens / registry / personal data.
    files (moonloader folder):
      LavkaMarket.lua                 <- the script (MoonLoader loads it from here)
      LavkaMarket/                    <- everything else of ours lives in this one folder
        settings.ini  market_db.json  web/app.js  web/items.json  logs/*.log
    commands:  /market        open / close the market window
               /market key <code> | url <url> | share on|off | lang th|ru|en | sync | reload
]]

script_name('LavkaMarket')
script_author('LavkaMarket')
script_version('0.5.1')

local okEffil, effil = pcall(require, 'effil')
local okFFI, ffi     = pcall(require, 'ffi')

local DISCORD_INVITE = 'https://discord.gg/NUEMsrCT'    -- ลิงก์เชิญเซิร์ฟ LavkaMarket (ถาวร) - แก้ตรงนี้
-- url เซิร์ฟเวอร์กองกลาง: ใส่ตรงนี้ทีเดียว คนที่รับสคริปต์ไปจะต่อได้เลยไม่ต้องพิมพ์ /market url
-- เช่น quick tunnel = 'https://xxxx.trycloudflare.com' (เปลี่ยนทุกครั้ง)  หรือโดเมนตัวเอง = 'https://api.yourdomain.xyz' (คงที่)
local DEFAULT_URL = 'https://arz.lavkamarket.shop'
local GH_RAW = 'https://raw.githubusercontent.com/saradaken/LavkaMarket/main/dist'   -- อัปเดตหลักผ่าน GitHub (ไฟล์เดียว) · ถ้าโหลดไม่ได้ค่อยใช้เซิร์ฟกองกลางเป็นสำรอง
local function openUrl(u)
    if okFFI then
        pcall(function()
            pcall(ffi.cdef, 'int ShellExecuteA(void*, const char*, const char*, const char*, const char*, int);')
            ffi.load('shell32').ShellExecuteA(nil, 'open', u, nil, nil, 1)
        end)
    else
        pcall(os.execute, 'explorer "' .. u .. '"')
    end
end

local DIR   = getWorkingDirectory()
-- ไฟล์ทั้งหมดของเราอยู่ในโฟลเดอร์เดียว: moonloader\LavkaMarket\ (สคริปต์ .lua ต้องอยู่ที่ moonloader เอง)
local BASE  = DIR .. '\\LavkaMarket'
local ITEMS = DIR .. '\\config\\lavka_items.json'   -- (สำรอง อ่านอย่างเดียว) ตารางไอเทมของ LavkaPrices ถ้ามี
local MKDBF = BASE .. '\\market_db.json'
local RES   = BASE .. '\\web\\app.js'
local ITEMS_RES = BASE .. '\\web\\items.json'
local INIF  = BASE .. '\\settings.ini'
local LOGD  = BASE .. '\\logs'

local function fileExists(p) local f = io.open(p, 'rb'); if f then f:close(); return true end; return false end
local function mkdir(p)
    if doesDirectoryExist and doesDirectoryExist(p) then return end
    if createDirectory then pcall(createDirectory, p) else os.execute('mkdir "' .. p .. '" 2>nul') end
end
local function copyFile(a, b)
    local fi = io.open(a, 'rb'); if not fi then return false end
    local data = fi:read('*a'); fi:close()
    local fo = io.open(b, 'wb'); if not fo then return false end
    fo:write(data); fo:close(); return true
end
-- ย้ายไฟล์รุ่นเก่า (config\ / resource\lavkamarket\) เข้าโฟลเดอร์ใหม่ครั้งเดียว
local function migrateOld()
    mkdir(BASE); mkdir(BASE .. '\\web'); mkdir(LOGD)
    local moves = {
        { DIR .. '\\config\\lavka_market.ini', INIF },
        { DIR .. '\\config\\lavka_market_db.json', MKDBF },
        { DIR .. '\\config\\lavka_market_own.log', LOGD .. '\\own.log' },
        { DIR .. '\\config\\lavka_market_dlg.log', LOGD .. '\\dlg.log' },
        { DIR .. '\\config\\lavkamarket_infodiag.txt', LOGD .. '\\infodiag.txt' },
        { DIR .. '\\resource\\lavkamarket\\app.js', RES },
        { DIR .. '\\resource\\lavkamarket\\items.json', ITEMS_RES },
    }
    for _, m in ipairs(moves) do
        if fileExists(m[1]) then
            if not fileExists(m[2]) then
                if not os.rename(m[1], m[2]) and copyFile(m[1], m[2]) then os.remove(m[1]) end
            elseif m[1]:find('\\resource\\lavkamarket\\', 1, true) then
                os.remove(m[1])   -- มีของใหม่ในโฟลเดอร์เราแล้ว: ลบของเก่าทิ้ง
            end
        end
    end
end
pcall(migrateOld)

-- แจกไฟล์เดียว: ตัว release ฝังไฟล์หน้าเว็บไว้ในสคริปต์ (publish.py เติมแทนบรรทัด EMBED ข้างล่าง)
-- เปิดครั้งแรก/เปลี่ยนรุ่น -> เขียนออกไปที่ LavkaMarket\web\ ; ตัวพัฒนา (EMBED = nil) ข้ามไป ใช้ไฟล์ที่มีอยู่
local EMBED = nil --@@EMBED@@
local function extractEmbed()
    if type(EMBED) ~= 'table' or type(EMBED.files) ~= 'table' then return end
    local sf = BASE .. '\\web\\.stamp'
    local f = io.open(sf, 'rb'); local cur = f and f:read('*a') or ''; if f then f:close() end
    if cur == EMBED.stamp and fileExists(RES) then return end
    mkdir(BASE); mkdir(BASE .. '\\web')
    for name, data in pairs(EMBED.files) do
        if tostring(name):match('^[%w_%-]+%.%w+$') then
            local p = BASE .. '\\web\\' .. name
            local fo = io.open(p .. '.new', 'wb')
            if fo then fo:write(data); fo:close(); os.remove(p); os.rename(p .. '.new', p) end
        end
    end
    local fo = io.open(sf, 'wb'); if fo then fo:write(EMBED.stamp); fo:close() end
end
pcall(extractEmbed)
EMBED = nil   -- ไม่ต้องถือข้อมูล ~1 MB ไว้ในหน่วยความจำ

-- ไฟล์ตั้งค่า ini แบบง่าย (มีแค่หมวด [main]) - ไม่พึ่ง inicfg เพราะ inicfg บังคับอยู่ใน moonloader\config
local function iniLoad(path, def)
    local t = {}
    for sec, kv in pairs(def) do t[sec] = {}; for k, v in pairs(kv) do t[sec][k] = v end end
    local f = io.open(path, 'r'); if not f then return t end
    local sec
    for line in f:lines() do
        line = line:gsub('\r', '')
        local sn = line:match('^%s*%[([^%]]+)%]%s*$')
        if sn then sec = sn; t[sec] = t[sec] or {}
        elseif sec then
            local k, v = line:match('^%s*([^=;#%s][^=]-)%s*=%s*(.-)%s*$')
            if k then local n = tonumber(v); t[sec][k] = (n and tostring(n) == v) and n or v end
        end
    end
    f:close(); return t
end
local function iniSave(t, path)
    local f = io.open(path, 'w'); if not f then return false end
    for sec, kv in pairs(t) do
        f:write('[', sec, ']\n')
        for k, v in pairs(kv) do f:write(k, '=', tostring(v), '\n') end
    end
    f:close(); return true
end
local BUY_T, SELL_T = 28, 13

-- ===== config / state =====
local cfg = iniLoad(INIF, { main = { code = '', url = '', share = 0, lang = 'th' } })
local function saveCfg() pcall(iniSave, cfg, INIF) end
-- ติดตั้งใหม่: ยังไม่ดึงข้อมูลกองกลางเอง จนกว่าผู้ใช้กด "เริ่มดึงข้อมูล" ในหน้าแรก
-- (ผู้ใช้เดิมที่ล็อกอินอยู่แล้ว = ถือว่ากดแล้ว ไม่ต้องเห็นหน้านี้)
if cfg.main.pulled == nil then cfg.main.pulled = (tostring(cfg.main.code or '') ~= '') and 1 or 0 end
local function pullOk() return tonumber(cfg.main.pulled) == 1 end
-- แชร์ข้อมูลตลาดเปิดเป็นค่าเริ่มต้น (หน้าล็อกอินแจ้งแล้วว่าเชื่อมต่อ = ยินยอมแชร์เฉพาะข้อมูลตลาด)
-- เว้นแต่ผู้ใช้สั่งปิดเองด้วย /market share off (shareSet=1 = ผู้ใช้เลือกเองแล้ว ไม่ทับ)
if tostring(cfg.main.shareSet or '') ~= '1' then cfg.main.share = 1 end
local lang = ({ th = 1, ru = 1, en = 1 })[tostring(cfg.main.lang)] and tostring(cfg.main.lang) or 'th'

local ITEMNAME = {}
local MKDB     = { shops = {} }
local POOL     = {}
local MARKET   = {}
local dbDirty, uiDirty = false, false
local pending  = nil
local lastUp   = {}   -- ส่งขึ้น pool ล่าสุดเมื่อไร แยกตามเซิร์ฟ
local curSrv   = nil  -- เซิร์ฟที่เห็นล่าสุด (เปลี่ยน = ล้าง POOL)
local openShop = nil  -- ร้านที่เพิ่งเปิด {name, t}
local ownOpenAt = nil -- เวลาที่เปิดหน้าจัดการแผงตัวเองล่าสุด (os.clock)
local lastAnon = nil  -- รายการที่มาโดยยังไม่มีหัวหน้าต่าง (แผงตัวเองส่งรายการมาก่อนหัว)
local ownNote = nil   -- ฟังก์ชันจดบันทึกแผงตัวเอง (ตั้งค่าตอนโหลด samp.events)
local ownMode = 'sell' -- กำลังตั้งขาย / ตั้งรับซื้อ (ดูจากเมนูแผงที่เลือก)
local click    = nil  -- ช่องที่เพิ่งคลิกในร้าน {slot, type, t} (จาก clickOnBlock)
local shopLevels      -- นิยามด้านล่าง
local panelOpen = false
local profile   = { connected = (tostring(cfg.main.code or '') ~= '') }

-- ===== chat i18n (หน้าเว็บมี i18n ของตัวเองใน app.js) =====
local CL = {
    th = { ready = 'พร้อม - /market เปิดหน้าตลาด · เดินเปิดดูร้านเพื่อเก็บข้อมูล', keysaved = 'บันทึกรหัสแล้ว',
           urlset = 'ตั้ง url กองกลาง: %s', shareset = 'แชร์ข้อมูล: %s', langset = 'ภาษา: %s', on = 'เปิด', off = 'ปิด',
           updavail = 'มีเวอร์ชันใหม่ %s - เปิด /market แล้วกด ☰ -> อัปเดต (หรือพิมพ์ /market update)', updnone = 'ใช้เวอร์ชันล่าสุดอยู่แล้ว',
           upddone = 'อัปเดตเป็นเวอร์ชัน %s แล้ว กำลังโหลดสคริปต์ใหม่...', upderr = 'อัปเดตไม่สำเร็จ (%s) ลองใหม่อีกครั้ง',
           reload = 'โหลดใหม่: %d ไอเทม', nores = 'ไม่พบไฟล์ LavkaMarket/web/app.js' },
    ru = { ready = 'Готово - /market открыть рынок · открывайте лавки для сбора', keysaved = 'Код сохранён',
           urlset = 'Сервер пула: %s', shareset = 'Поделиться: %s', langset = 'Язык: %s', on = 'вкл', off = 'выкл',
           updavail = 'Доступна версия %s - /market -> ☰ -> Обновить (или /market update)', updnone = 'У вас последняя версия',
           upddone = 'Обновлено до версии %s, перезагрузка скрипта...', upderr = 'Не удалось обновить (%s), попробуйте ещё раз',
           reload = 'Обновлено: %d предметов', nores = 'Нет файла LavkaMarket/web/app.js' },
    en = { ready = 'ready - /market opens the market · open stalls to collect', keysaved = 'code saved',
           urlset = 'pool server: %s', shareset = 'share: %s', langset = 'language: %s', on = 'on', off = 'off',
           updavail = 'new version %s - open /market, then ☰ -> Update (or /market update)', updnone = 'you already have the latest version',
           upddone = 'updated to version %s, reloading the script...', upderr = 'update failed (%s), please try again',
           reload = 'reloaded: %d items', nores = 'missing LavkaMarket/web/app.js' },
}
local function ct(k) return (CL[lang] and CL[lang][k]) or CL.en[k] or k end
local function msg(k, a)
    local s = ct(k); if a ~= nil then local ok, r = pcall(string.format, s, a); if ok then s = r end end
    sampAddChatMessage('[LavkaMarket] ' .. s, 0x88CCFF)
end

-- ===== helpers =====
local function readJson(path)
    local f = io.open(path, 'r'); if not f then return nil end
    local s = f:read('*a'); f:close()
    local ok, t = pcall(decodeJson, s); return ok and t or nil
end
local function myNick()
    local ok, id = pcall(function() return select(2, sampGetPlayerIdByCharHandle(PLAYER_PED)) end)
    if ok and id then local ok2, nm = pcall(sampGetPlayerNickname, id); if ok2 then return nm end end
    return nil
end
-- ชื่อไอเทม: LavkaMarket/web/items.json  {"id":["ชื่อรัสเซีย","ชื่อไทย"?]} ติดไปกับสคริปต์ (ไม่พึ่งไฟล์สคริปต์อื่น)
-- ถ้าไม่มีไฟล์นี้ ใช้ config/lavka_items.json แทน
-- ช่องที่ 3 = สีพื้นหลังไอเทมของเกม (rarity) เป็น hex 6 หลัก; เรียนรู้เพิ่มจากหน้าต่างกระเป๋า/ร้านเก็บใน MKDB.bg
local ITEMNAME_TH, ITEMBG, ITEMTYPE = {}, {}, {}   -- ITEMTYPE = ประเภทไอเทมของเกม (ITEM_TYPE_*) ช่องที่ 4
local function loadItems()
    ITEMNAME, ITEMNAME_TH, ITEMBG, ITEMTYPE = {}, {}, {}, {}
    local t = readJson(ITEMS_RES)
    if type(t) == 'table' then
        for k, v in pairs(t) do
            if type(v) == 'table' then
                if v[1] and v[1] ~= '' then ITEMNAME[k] = v[1] end
                if v[2] and v[2] ~= '' then ITEMNAME_TH[k] = v[2] end
                if v[3] and v[3] ~= '' then ITEMBG[k] = v[3] end
                if tonumber(v[4]) then ITEMTYPE[k] = tonumber(v[4]) end
            end
        end
    end
    local o = readJson(ITEMS)   -- เติมช่องที่ยังขาด
    if type(o) == 'table' then
        for k, v in pairs(o) do
            local nm = (type(v) == 'table' and v[1]) or (type(v) == 'string' and v) or nil
            if nm and nm ~= '' and not ITEMNAME[k] then ITEMNAME[k] = nm end
        end
    end
end
-- สีตามเกรดก่อน (vid) ถ้ายังไม่เคยเห็นเกรดนั้น ใช้สีของ id หลัก
-- สีพื้นขึ้นกับระดับดาว (ไม่ขึ้นกับตีบวก): 10122~t3e8 -> ใช้สีของ 10122~t3
local function tierKey(vid)
    vid = tostring(vid)
    local base, t = vid:match('^(%d+)~t(%d+)')
    return t and (base .. '~t' .. t) or (vid:match('^(%d+)') or vid)
end
local function bgOf(vid)
    vid = tostring(vid)
    local base, tk = vid:match('^(%d+)') or vid, tierKey(vid)
    local B = (MKDB and MKDB.bg) or {}
    return B[vid] or ITEMBG[vid] or B[tk] or ITEMBG[tk] or B[base] or ITEMBG[base]
end
local function nameOf(id)
    id = tostring(id)
    return (lang == 'th' and ITEMNAME_TH[id]) or ITEMNAME[id] or ('#' .. id)
end

local function makeVid(it)
    local base = tostring(it.item)
    local ench = tonumber(it.enchant); if ench and (ench <= 0 or ench > 20) then ench = nil end
    local tier = tonumber(tostring(it.effect or ''):match('number(%d+)')); if tier and tier <= 0 then tier = nil end
    -- รหัสแยกระดับ: ดาว+ตีบวกพร้อมกันได้ เช่น Shadow Moon ★3 +8 = 10122~t3e8
    if tier and ench then return base .. '~t' .. tier .. 'e' .. ench
    elseif tier then return base .. '~t' .. tier
    elseif ench then return base .. '~e' .. ench end
    return base
end
local function splitVid(vid)
    local base, tag = tostring(vid):match('^(%d+)~?(.*)$'); base = base or tostring(vid)
    local t, e = tag:match('t(%d+)'), tag:match('e(%d+)')
    local parts = {}
    if t then parts[#parts + 1] = '\226\152\133' .. t end   -- ★N
    if e then parts[#parts + 1] = '+' .. e end
    return base, table.concat(parts, ' ')
end

-- เซิร์ฟที่เล่นอยู่ (ip:port) = กุญแจแยกข้อมูลร้านในเครื่องและใน pool
-- เข้าเซิร์ฟด้วย IP หรือชื่อโดเมน = เซิร์ฟเดียวกัน: แปลง IP ของ Arizona เป็นชื่อโดเมนก่อนใช้เป็นคีย์
-- (ไม่งั้น "80.66.82.235:7777" กับ "home.arizona-rp.com:7777" ถูกนับเป็นคนละเซิร์ฟ ข้อมูลแยกกัน)
local ARZ_IP = {
    ['185.169.134.3'] = 'phoenix', ['185.169.134.4'] = 'tucson', ['185.169.134.43'] = 'scottdale',
    ['185.169.134.44'] = 'chandler', ['185.169.134.45'] = 'brainburg', ['185.169.134.5'] = 'saintrose',
    ['185.169.134.59'] = 'mesa', ['185.169.134.61'] = 'redrock', ['185.169.134.107'] = 'yuma',
    ['185.169.134.109'] = 'surprise', ['185.169.134.166'] = 'prescott', ['185.169.134.171'] = 'glendale',
    ['185.169.134.172'] = 'kingman', ['185.169.134.173'] = 'winslow', ['185.169.134.174'] = 'payson',
    ['80.66.82.191'] = 'gilbert', ['80.66.82.190'] = 'showlow', ['80.66.82.188'] = 'casagrande',
    ['80.66.82.168'] = 'page', ['80.66.82.159'] = 'suncity', ['80.66.82.200'] = 'queencreek',
    ['80.66.82.144'] = 'sedona', ['80.66.82.132'] = 'holiday', ['80.66.82.128'] = 'wednesday',
    ['80.66.82.113'] = 'yava', ['80.66.82.82'] = 'faraway', ['80.66.82.87'] = 'bumblebee',
    ['80.66.82.54'] = 'christmas', ['80.66.82.39'] = 'mirage', ['80.66.82.33'] = 'love',
    ['80.66.82.22'] = 'drake', ['80.66.82.199'] = 'space', ['80.66.82.235'] = 'home',
    ['80.66.82.147'] = 'vicecity',
}
local function canonKey(k)
    k = tostring(k or '')
    local ip, rest = k:match('^(%d+%.%d+%.%d+%.%d+)(.*)$')
    if ip and ARZ_IP[ip] then
        local port = rest:match('^:(%d+)$')
        return ARZ_IP[ip] .. '.arizona-rp.com:' .. (port and #port >= 4 and port or '7777')
    end
    return k
end
local function serverKey()
    local ok, ip, port = pcall(sampGetCurrentServerAddress)
    if ok and ip and tostring(ip) ~= '' then return canonKey(tostring(ip) .. ':' .. tostring(port)) end
    return '?'
end
-- ร้านที่จำไว้ในเครื่อง แยกตามเซิร์ฟ: MKDB.srv["ip:port"] = { [ชื่อร้าน] = {...} } (ไม่รวมกันข้ามเซิร์ฟ)
local viewSrv = nil
local function viewKey() return viewSrv or serverKey() end
local function myShops()
    local k = serverKey()
    MKDB.srv = MKDB.srv or {}
    if not MKDB.srv[k] then MKDB.srv[k] = {} end
    return MKDB.srv[k], k
end
local function loadDB()
    local t = readJson(MKDBF)
    if type(t) ~= 'table' then t = {} end
    -- ไฟล์รูปแบบเก่า (shops ก้อนเดียว ไม่รู้ว่ามาจากเซิร์ฟไหน): เก็บแยกไว้เฉย ๆ ไม่แสดง ไม่ส่ง
    if type(t.shops) == 'table' and next(t.shops) and not t.legacy then t.legacy = t.shops end
    t.shops = nil
    if type(t.srv) ~= 'table' then t.srv = {} end
    -- ข้อมูลเก่าที่เก็บด้วยคีย์ IP: ย้ายไปรวมกับคีย์ชื่อโดเมน (ร้านชื่อซ้ำเก็บอันที่ใหม่กว่า)
    for _, tb in ipairs({ 'srv', 'ownq' }) do
        local box = t[tb]
        if type(box) == 'table' then
            local moves = {}
            for k in pairs(box) do local c = canonKey(k); if c ~= k then moves[#moves + 1] = { k, c } end end
            for _, m in ipairs(moves) do
                local from, to = box[m[1]], box[m[2]]
                if type(to) ~= 'table' then box[m[2]] = from
                elseif type(from) == 'table' then
                    for name, s in pairs(from) do
                        local cur = to[name]
                        local ts = type(s) == 'table' and (tonumber(s.t) or 0) or 0
                        local tc = type(cur) == 'table' and (tonumber(cur.t) or 0) or -1
                        if cur == nil or ts > tc then to[name] = s end
                    end
                end
                box[m[1]] = nil; dbDirty = true
            end
        end
    end
    MKDB = t
end
local function saveDB()
    local f = io.open(MKDBF, 'w'); if not f then return end
    f:write(encodeJson(MKDB)); f:close(); dbDirty = false
end

local function mergeInto(out, shops)
    if type(shops) ~= 'table' then return end
    for name, s in pairs(shops) do
        local cur = out[name]
        if not cur or (tonumber(s.t) or 0) > (tonumber(cur.t) or 0) then out[name] = s end
    end
end
local function mergedShops()
    local out = {}; if not viewSrv then mergeInto(out, (myShops())) end; mergeInto(out, POOL); return out
end

local function buildMarket()
    MARKET = {}
    local idx = {}
    for name, s in pairs(mergedShops()) do
        if type(s) == 'table' then
            for id, price in pairs(s.sell or {}) do
                price = tonumber(price)
                if price then
                    local e = idx[id]; if not e then e = {}; idx[id] = e end
                    local cnt = (s.sq and tonumber(s.sq[id])) or 1
                    if not e.sellMin or price < e.sellMin then e.sellMin, e.sellShop, e.sellCnt, e.sellT = price, name, cnt, tonumber(s.t) end
                    e.ns = (e.ns or 0) + 1
                    e.sp = e.sp or {}; e.sp[#e.sp + 1] = price
                end
            end
            for id, price in pairs(s.buy or {}) do
                price = tonumber(price)
                if price then
                    local e = idx[id]; if not e then e = {}; idx[id] = e end
                    local cnt = (s.bq and tonumber(s.bq[id])) or 1
                    if not e.buyMax or price > e.buyMax then e.buyMax, e.buyShop, e.buyCnt, e.buyT = price, name, cnt, tonumber(s.t) end
                    e.nb = (e.nb or 0) + 1
                end
            end
        end
    end
    for id, e in pairs(idx) do
        e.vid = id
        e.base, e.grade = splitVid(id)
        e.name = nameOf(e.base)
        if e.sp and #e.sp >= 3 then   -- ราคากลาง (median) ของร้านที่ขาย
            table.sort(e.sp); e.med = e.sp[math.floor((#e.sp + 1) / 2)]
        end
        e.sp = nil
        MARKET[#MARKET + 1] = e
    end
    table.sort(MARKET, function(a, b) return (a.name or '') < (b.name or '') end)
    uiDirty = true
end
-- เปลี่ยนภาษา = เปลี่ยนชื่อไอเทมตามภาษา แล้วให้ main loop วาดใหม่ (uiDirty)
local function renameMarket()
    for _, e in ipairs(MARKET) do e.name = nameOf(e.base) end
    table.sort(MARKET, function(a, b) return (a.name or '') < (b.name or '') end)
    uiDirty = true
end

-- ===== shop capture from CEF packets =====
local function qtyOf(text)
    local n = tonumber((tostring(text or ''):gsub('[^%d]', '')))
    return (n and n > 0 and n < 100000) and n or nil
end
local function readCefIn(bs)
    raknetBitStreamIgnoreBits(bs, 8)
    local sub = raknetBitStreamReadInt8(bs); if sub ~= 17 then return end
    raknetBitStreamIgnoreBits(bs, 32)
    local len = raknetBitStreamReadInt16(bs); if len < 0 then len = len + 65536 end
    local enc = raknetBitStreamReadInt8(bs)
    if enc ~= 0 then return raknetBitStreamDecodeString(bs, len + enc) end
    return raknetBitStreamReadString(bs, len)
end
-- ทุกราคาที่ร้านวาง: ช่องราคาเดียวกันรวมเป็นขั้นเดียว { {ราคา, จำนวน}, ... } สูงสุด 10 ขั้นต่อไอเทม
-- sell/sq, buy/bq = ขั้นที่ดีที่สุด (ถูกสุด / รับซื้อแพงสุด) ไว้ใช้กับการ์ดและกราฟ (และ client รุ่นเก่า)
-- จำนวนต่อช่อง: it.q (อ่านจากหน้าต่างซื้อ) > ตัวเลขในช่อง > 1
function shopLevels(list, asc, best, bestQ, lv)
    local g = {}
    for _, it in ipairs(list) do
        local k = it.vid
        g[k] = g[k] or {}
        local q = it.q or qtyOf(it.text) or 1
        g[k][it.price] = (g[k][it.price] or 0) + q
    end
    for k, byP in pairs(g) do
        local arr = {}
        for pr, q in pairs(byP) do arr[#arr + 1] = { pr, q } end
        table.sort(arr, function(a, b) if asc then return a[1] < b[1] end return a[1] > b[1] end)
        while #arr > 10 do table.remove(arr) end
        lv[k] = arr; best[k] = arr[1][1]; bestQ[k] = arr[1][2]
    end
end
-- ===== แผงของเราเอง: จำนวนจริงจากกล่อง "Введите количество и цену за один товар ( ชื่อ )" ที่เจ้าของตอบ "8,1370000" =====
-- ownQty[ราคา] = { n = จำนวน, name = ชื่อไอเทม (รัสเซีย) } ใช้ได้ทั้งของที่ตั้งขาย และของที่ตั้งรับซื้อ
-- จำลงไฟล์ (MKDB.ownq["ip:port"]["ราคา"]) เพื่อไม่หายตอนสคริปต์รีโหลด; ไม่ส่งขึ้น pool; เก็บ 14 วัน
local function ownQtyT()
    local k = serverKey()
    MKDB.ownq = MKDB.ownq or {}
    local t = MKDB.ownq[k]
    if type(t) ~= 'table' then t = {}; MKDB.ownq[k] = t end
    for p, m in pairs(t) do
        if type(m) ~= 'table' or os.time() - (tonumber(m.t) or 0) > 14 * 86400 then t[p] = nil end
    end
    return t
end
local function cp2u(str)   -- ข้อความ dialog ของ SAMP เป็น cp1251 -> UTF-8 (เฉพาะซีริลลิก)
    return (tostring(str or ''):gsub('[\128-\255]', function(ch)
        local b = ch:byte()
        local cp = (b >= 192) and (0x410 + b - 192) or (b == 168 and 0x401) or (b == 184 and 0x451) or nil
        if not cp then return '?' end
        return string.char(0xC0 + math.floor(cp / 64), 0x80 + cp % 64)
    end))
end
-- หาช่องที่ตรงกับราคานี้: ชื่อไอเทมตรงก่อน, ถ้าไม่มีชื่อตรงแต่มีช่องราคานี้ช่องเดียว ก็ใช้ช่องนั้น
local function ownSlotsFor(slots, price, name)
    local hit, all = {}, {}
    for sk, e in pairs(slots or {}) do
        if e[2] == price then
            all[#all + 1] = sk
            local base = tostring(e[1]):match('^(%d+)')
            if name and ITEMNAME[base] == name then hit[#hit + 1] = sk end
        end
    end
    if #hit > 0 then return hit end
    if #all == 1 then return all end
    return {}
end
-- force = ตั้งทับ (เพิ่งพิมพ์ใหม่) / ไม่ force = เติมเฉพาะช่องที่ยังไม่รู้จำนวน
local function ownFill(shop, force, price)
    for _, side in ipairs({ { '_sl', '_q' }, { '_bsl', '_qb' } }) do
        local slots = shop[side[1]]
        if slots then
            shop[side[2]] = shop[side[2]] or {}
            local q = shop[side[2]]
            for ps, m in pairs(ownQtyT()) do
                local p = tonumber(ps)
                if p and (not price or p == price) then
                    for _, sk in ipairs(ownSlotsFor(slots, p, m.name)) do
                        if force or not q[sk] then q[sk] = m.n end
                    end
                end
            end
        end
    end
end
-- คิดขั้นราคาของแผงตัวเองใหม่จากช่องที่จำไว้ + จำนวน
local function ownRecalc(shop)
    local sl, bl = {}, {}
    for sk, e in pairs(shop._sl or {}) do sl[#sl + 1] = { vid = e[1], price = e[2], q = (shop._q or {})[sk] } end
    for sk, e in pairs(shop._bsl or {}) do bl[#bl + 1] = { vid = e[1], price = e[2], q = (shop._qb or {})[sk] } end
    -- รายการรับซื้อที่ตั้งผ่านเมนู "Добавить товар на покупку": อยู่ 12 ชม. (ยังไม่รู้ตอนกดยกเลิก)
    for vid, o in pairs(shop._ob or {}) do
        if os.time() - (o.t or 0) < 43200 then bl[#bl + 1] = { vid = vid, price = o.p, q = o.n } else shop._ob[vid] = nil end
    end
    shop.sell, shop.sq, shop.sl, shop.buy, shop.bq, shop.bl = {}, {}, {}, {}, {}, {}
    shopLevels(sl, true, shop.sell, shop.sq, shop.sl)
    shopLevels(bl, false, shop.buy, shop.bq, shop.bl)
    shop.t = os.time()
    dbDirty = true; buildMarket(); uiDirty = true
end
local nameIdCache = {}
local function idByName(name)   -- ชื่อรัสเซีย -> ไอดี (เฉพาะชื่อที่มีไอดีเดียว)
    if not name or name == '' then return nil end
    if nameIdCache[name] ~= nil then return nameIdCache[name] or nil end
    local found
    for id, nm in pairs(ITEMNAME) do
        if nm == name then if found then found = false; break end; found = id end
    end
    nameIdCache[name] = found or false
    return found or nil
end
local function commit()
    local p = pending; pending = nil
    if p and not p.name then
        if next(p.buy) or next(p.sell) then lastAnon = p; lastAnon.at = os.clock() end
        return
    end
    if not p then return end
    -- ร้านชื่อเราเก็บเฉพาะจากหน้าจัดการแผงของเราเอง (p.own) — เจ้าของเห็นรายการของตัวเองครบทุกช่อง
    local mine = myNick(); if mine and p.name == mine and not p.own then return end
    if not (next(p.buy) or next(p.sell)) then return end
    local shop = { t = os.time(), ot = os.time(), buy = {}, sell = {}, sq = {}, bq = {}, sl = {}, bl = {}, _sl = {}, _q = {} }
    -- ช่องที่ร้านขาย (เก็บในเครื่องเท่านั้น ไม่ส่งขึ้น pool): _sl[ช่อง] = {vid, ราคา}, _q[ช่อง] = จำนวนจริงจากหน้าต่าง "В наличии"
    -- เปิดร้านเดิมซ้ำ: จำนวนที่เคยอ่านได้ยังใช้ต่อ ถ้าช่องนั้นยังเป็นของชิ้นเดิมราคาเดิม
    local old = (myShops())[p.name]
    for _, it in ipairs(p.sellL) do
        if it.slot then
            local sk = tostring(it.slot)
            shop._sl[sk] = { it.vid, it.price }
            local o = old and old._sl and old._sl[sk]
            if o and o[1] == it.vid and o[2] == it.price and old._q and old._q[sk] then shop._q[sk] = old._q[sk] end
        end
    end
    if p.own and #p.buyL == 0 and old then
        shop._bsl, shop._qb = old._bsl, old._qb
    else
        shop._bsl, shop._qb = {}, {}
        for _, it in ipairs(p.buyL) do
            if it.slot then
                local sk = tostring(it.slot)
                shop._bsl[sk] = { it.vid, it.price }
                local o = old and old._bsl and old._bsl[sk]
                if o and o[1] == it.vid and o[2] == it.price and old._qb and old._qb[sk] then shop._qb[sk] = old._qb[sk] end
            end
        end
    end
    if p.own then ownFill(shop, false) end   -- จำนวนที่เจ้าของพิมพ์ไว้ (จำในไฟล์) -> ช่องที่ยังไม่รู้จำนวน
    for _, it in ipairs(p.buyL) do if it.slot then it.q = (shop._qb or {})[tostring(it.slot)] end end
    for _, it in ipairs(p.sellL) do if it.slot then it.q = shop._q[tostring(it.slot)] end end
    shopLevels(p.sellL, true, shop.sell, shop.sq, shop.sl)
    shopLevels(p.buyL, false, shop.buy, shop.bq, shop.bl)
    if serverKey() == '?' then return end
    local mine2 = myShops(); mine2[p.name] = shop; dbDirty = true; buildMarket()
    if p.own then
        shop._ob = old and old._ob or nil
        if #p.buyL > 0 then
            shop._qb = shop._qb or {}
            for sk, e in pairs(shop._bsl or {}) do
                local o = shop._ob and shop._ob[tostring(e[1]):match('^(%d+)')]
                if o and o.p == e[2] and not shop._qb[sk] then shop._qb[sk] = o.n end
            end
            shop._ob = nil
        end
        ownRecalc(shop)
    end
    if p.own and ownNote then
        local ns, nb = 0, 0
        for _ in pairs(shop.sell) do ns = ns + 1 end
        for _ in pairs(shop.buy) do nb = nb + 1 end
        pcall(ownNote, ('OWN stored: sell %d items, buy %d items'):format(ns, nb))
    end
    openShop = { name = p.name, t = os.clock() }
end
-- หน้าต่าง "Покупка предмета" บอก "В наличии: N шт." ของช่องที่คลิก -> ตั้งจำนวนจริงของช่องนั้น แล้วคิดขั้นราคาใหม่
local function applyStock(name, slot, n)
    local shop = (myShops())[name]
    local sk = tostring(slot)
    if not shop or not shop._sl or not shop._sl[sk] or not n or n < 1 then return end
    shop._q = shop._q or {}
    if shop._q[sk] == n then return end
    shop._q[sk] = n
    local list = {}
    for k, e in pairs(shop._sl) do list[#list + 1] = { vid = e[1], price = e[2], q = shop._q[k] } end
    shop.sell, shop.sq, shop.sl = {}, {}, {}
    shopLevels(list, true, shop.sell, shop.sq, shop.sl)
    shop.t = os.time()   -- ให้รอบส่งถัดไปส่งร้านนี้ขึ้น pool อีกครั้ง
    dbDirty = true; buildMarket(); uiDirty = true
end
-- หน้าต่าง "Продажа предмета" (กดช่องรับซื้อของแผงคนอื่น) บอกว่าเขารับกี่ชิ้น -> ตั้งจำนวนของช่องนั้น
local function applyBuyStock(name, slot, n)
    local shop = (myShops())[name]
    local sk = tostring(slot)
    if not shop or not shop._bsl or not shop._bsl[sk] or not n or n < 1 then return end
    shop._qb = shop._qb or {}
    if shop._qb[sk] == n then return end
    shop._qb[sk] = n
    local list = {}
    for k, e in pairs(shop._bsl) do list[#list + 1] = { vid = e[1], price = e[2], q = shop._qb[k] } end
    shop.buy, shop.bq, shop.bl = {}, {}, {}
    shopLevels(list, false, shop.buy, shop.bq, shop.bl)
    shop.t = os.time()
    dbDirty = true; buildMarket(); uiDirty = true
end
local function feedInventory(js)
    local ok, arr = pcall(decodeJson, js)
    if not ok or type(arr) ~= 'table' or not arr[1] then return end
    local d = arr[1]; local data = d.data or {}
    -- เรียนสีพื้นหลังไอเทม (สีช่องของเกม) จากทุกหน้าต่างที่มีไอเทม: กระเป๋า แผงร้าน ฯลฯ
    if type(data.items) == 'table' then
        for _, it in ipairs(data.items) do
            local bg = tonumber(it.background)
            if it.item and bg and bg ~= 0 then
                local hex = string.format('%06X', math.floor((bg % 4294967296) / 256))
                -- เก็บตามระดับดาว (557~t2) เพราะสกินดาวต่างกันมีพื้นต่างกัน; ตีบวกไม่เปลี่ยนสี -> ไม่แยก
                local id = tierKey(makeVid(it))
                MKDB.bg = MKDB.bg or {}
                if MKDB.bg[id] ~= hex and ITEMBG[id] ~= hex then MKDB.bg[id] = hex; dbDirty = true; uiDirty = true end
            end
        end
    end
    if d.action == 0 and (data.type == BUY_T or data.type == SELL_T) and type(data.items) == 'table' then
        pending = pending or { buy = {}, sell = {}, buyL = {}, sellL = {} }
        local list = data.type == BUY_T and pending.buyL or pending.sellL
        local seen = data.type == BUY_T and pending.buy or pending.sell
        for _, it in ipairs(data.items) do
            if (it.available or 0) ~= 0 and it.item and it.amount then
                local vid = makeVid(it)
                list[#list + 1] = { vid = vid, price = it.amount, text = it.text, slot = tonumber(it.slot) }
                seen[vid] = true
            end
        end
        pending.t = os.clock()
    elseif d.action == 1 then
        pending = pending or { buy = {}, sell = {}, buyL = {}, sellL = {} }
        local nm, mine = tostring(data.name or ''), myNick()
        if mine and (nm == mine or nm:match('%-%s*([%w_]+)%s*$') == mine) then
            -- หน้าจัดการแผงของเราเอง: รายการขาย (13) / รับซื้อ (28) มาก่อนหัวนี้ -> เก็บเป็นร้านชื่อเรา
            if not (next(pending.buy) or next(pending.sell)) and lastAnon and os.clock() - lastAnon.at < 5 then
                pending = lastAnon
            end
            lastAnon = nil
            pending.name = mine; pending.own = true; ownOpenAt = os.clock(); ownMode = 'sell'
        else
            pending.name = nm:match('%-%s*([%w_]+)%s*$')
        end
        pending.t = os.clock()
    end
end

local doMe   -- forward: panelShow เรียกก่อนนิยาม

-- ===== CEF transport (ฝัง JS เข้าหน้าเกม) =====
local function cefEval(code)
    if #code > 32700 then return end
    local bs = raknetNewBitStream()
    raknetBitStreamWriteInt8(bs, 17); raknetBitStreamWriteInt32(bs, 0)
    raknetBitStreamWriteInt16(bs, #code); raknetBitStreamWriteInt8(bs, 0)
    raknetBitStreamWriteString(bs, code)
    raknetEmulPacketReceiveBitStream(220, bs); raknetDeleteBitStream(bs)
end
local B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
local function b64(data)
    local out = {}
    for i = 1, #data, 3 do
        local a, b, c = data:byte(i, i + 2)
        local n = a * 65536 + (b or 0) * 256 + (c or 0)
        local c1, c2, c3, c4 = math.floor(n / 262144) % 64, math.floor(n / 4096) % 64, math.floor(n / 64) % 64, n % 64
        out[#out + 1] = B64:sub(c1 + 1, c1 + 1) .. B64:sub(c2 + 1, c2 + 1) ..
            (b and B64:sub(c3 + 1, c3 + 1) or '=') .. (c and B64:sub(c4 + 1, c4 + 1) or '=')
    end
    return table.concat(out)
end
local function jsText(str)   -- UTF-8 -> ปลอดภัยใน '...' (non-ASCII -> \uXXXX)
    local out, i, n = {}, 1, #str
    while i <= n do
        local c = str:byte(i); local cp, len
        if c < 0x80 then cp, len = c, 1
        elseif c < 0xE0 then cp, len = (c % 0x20) * 0x40 + (str:byte(i + 1) or 0) % 0x40, 2
        elseif c < 0xF0 then cp, len = (c % 0x10) * 0x1000 + (str:byte(i + 1) or 0) % 0x40 * 0x40 + (str:byte(i + 2) or 0) % 0x40, 3
        else cp, len = 0x3F, 4 end
        if cp < 0x80 then
            local ch = string.char(cp)
            if ch == '\\' then ch = '\\\\' elseif ch == "'" then ch = "\\'" elseif ch == '\n' then ch = '\\n' elseif ch == '\r' then ch = '' end
            out[#out + 1] = ch
        else out[#out + 1] = string.format('\\u%04X', cp) end
        i = i + len
    end
    return table.concat(out)
end
-- ส่งสตริง UTF-8 ก้อนใหญ่ข้ามไปหน้าเว็บผ่าน base64 (ไทย/รัสเซียไม่เพี้ยน) แล้วเรียก applyFn(decoded)
local function sendBig(varName, applyJs, utf8)
    local enc = b64(utf8)
    cefEval('window.' .. varName .. "='';")
    local i = 1
    while i <= #enc do
        local j = math.min(#enc, i + 24000 - 1)
        cefEval('window.' .. varName .. "+='" .. enc:sub(i, j) .. "';")
        i = j + 1
    end
    cefEval('try{var __s=decodeURIComponent(escape(atob(window.' .. varName .. ')));' .. applyJs ..
        '}catch(e){try{cef.SendMessage("lvm|err:"+e.message,0)}catch(x){}}window.' .. varName .. "='';")
end

local function loadPanel()
    local f = io.open(RES, 'rb')
    if not f then msg('nores'); return false end
    local raw = f:read('*a'); f:close()
    -- ล้างของเก่าทิ้งก่อน กันหน้าเกมแคช UI/CSS เวอร์ชันเดิมไว้
    cefEval("try{if(window.LVM&&LVM.hide)LVM.hide();window.LVM=null;var s=document.getElementById('lvmStyle');if(s)s.remove();var r=document.getElementById('lvmRoot');if(r)r.remove();}catch(e){}")
    sendBig('__lvmSrc', '(0,eval)(__s)', raw)
    return true
end
local function pushProfile()
    -- โปรไฟล์ + ค่าที่เมนูในหน้าใช้ (เวอร์ชันสคริปต์ / แชร์ข้อมูลเปิดอยู่ไหม)
    local p = {}; for k, v in pairs(profile) do p[k] = v end
    p.ver = tostring(thisScript().version or ''); p.share = tonumber(cfg.main.share) == 1
    cefEval("if(window.LVM)LVM.profile('" .. jsText(encodeJson(p)) .. "')")
end
-- การ์ดเซิร์ฟเวอร์ในหน้า: ชื่อเซิร์ฟ (hostname, เอาแค่ตัวอักษรละติน) / จำนวนร้านในพูล / ดึงล่าสุดเมื่อไหร่
local lastPullAt = 0
local PULL_EVERY = 600   -- ดึงราคาจาก pool ทุก 10 นาที (หน้าแสดงวงนับถอยหลัง)
local lastSrvJs, lastRowsJson   -- ส่งเข้าหน้าเฉพาะตอนข้อมูลเปลี่ยน (ส่งซ้ำ = หน้ากะพริบ)
local function pushServer()
    local ok, nm = pcall(sampGetCurrentServerName)
    if ok and nm then
        nm = tostring(nm):gsub('[^\32-\126]', ''):gsub('%s+', ' ')
    else
        nm = ''
    end
    local c = 0; for _ in pairs(mergedShops()) do c = c + 1 end   -- ร้านทั้งหมดที่ใช้แสดง (กองกลาง + ที่เครื่องเราเห็นเอง)
    local js = "if(window.LVM&&LVM.server)LVM.server('" .. jsText(encodeJson({ name = viewSrv and '' or nm, key = viewKey(), own = serverKey(),
        view = viewSrv and 1 or 0, shops = c, t = lastPullAt, every = PULL_EVERY, now = os.time(),
        gate = pullOk() and 0 or 1 })) .. "')"
    if js == lastSrvJs then return end
    lastSrvJs = js
    cefEval(js)
end
-- ค่าจากเซิร์ฟเวอร์เรา: ที่อยู่รูป + แก้หมวดรายชิ้น (หน้าเว็บมีค่าเริ่มต้นอยู่แล้ว ถ้ายังไม่ได้ก็ใช้ได้)
local cfgJs, lastCfg, cfgDl = nil, -1e9, nil   -- cfgDl = ลิงก์ดาวน์โหลดเวอร์ชันใหม่ (จาก /config)
local function pushCfg() if cfgJs then cefEval(cfgJs) end end
local function pushStatus(t)
    cefEval("if(window.LVM)LVM.status('" .. jsText(tostring(t or '')) .. "')")
end
-- สถานะการดึงกองกลาง ให้หน้าเล่นอนิเมชัน: run / ok (n ร้าน) / err
local lastManualPull = -1e9
local function pushPull(s, n)
    if panelOpen then cefEval("if(window.LVM&&LVM.pull)LVM.pull('" .. jsText(encodeJson({ s = s, n = n or 0 })) .. "')") end
end
local function pushRows()
    local rows, n = {}, 0
    for _, e in ipairs(MARKET) do
        n = n + 1; if n > 2000 then break end   -- หน้าเว็บแบ่งหน้าเอง (20 ใบ/หน้า)
        rows[#rows + 1] = { vid = e.vid, base = e.base, name = e.name, grade = e.grade ~= '' and e.grade or nil, bg = bgOf(e.vid),
            sell = e.sellMin, sellShop = e.sellShop, sellCnt = e.sellCnt,
            buy = e.buyMax, buyShop = e.buyShop, buyCnt = e.buyCnt,
            ns = e.ns, nb = e.nb, med = e.med, st = e.sellT, bt = e.buyT, ty = ITEMTYPE[tostring(e.base)] }
    end
    local json = encodeJson(rows)
    uiDirty = false
    if json == lastRowsJson then return end   -- เหมือนเดิม = ไม่ต้องวาดการ์ดใหม่
    lastRowsJson = json
    sendBig('__lvmD', 'if(window.LVM)LVM.rows(__s)', json)
end
-- หน้ารายละเอียดไอเทม: ทุกร้านที่ขาย (ถูก->แพง) และรับซื้อ (แพง->ถูก) ของไอเทม vid นี้ (ข้อมูลตลาดล้วน)
local function pushItem(vid)
    vid = tostring(vid)
    -- ทุกร้านของไอเทมนี้ทุกระดับ (ตีบวก +N / ดาว ★N) แต่ละแถวบอก vid ของชิ้นนั้น
    local base = vid:match('^(%d+)') or vid
    local sells, buys = {}, {}
    local function same(k) k = tostring(k); return k == base or k:sub(1, #base + 1) == base .. '~' end
    for name, s in pairs(mergedShops()) do
        if type(s) == 'table' then
            -- 1 แถวต่อราคา (ร้านเดียววางหลายราคาได้); ร้านที่ส่งมาแบบเก่าไม่มี sl/bl = 1 แถวจากราคาดีสุด
            local function add(out, best, bq, lv)
                for k, p in pairs(type(best) == 'table' and best or {}) do
                    if same(k) and tonumber(p) then
                        local L = type(lv) == 'table' and lv[k]
                        if type(L) == 'table' and L[1] then
                            for _, e in ipairs(L) do
                                if type(e) == 'table' and tonumber(e[1]) then
                                    out[#out + 1] = { shop = name, vid = tostring(k), price = tonumber(e[1]), cnt = tonumber(e[2]) or 1, t = tonumber(s.t) }
                                end
                            end
                        else
                            out[#out + 1] = { shop = name, vid = tostring(k), price = tonumber(p), cnt = (bq and tonumber(bq[k])) or 1, t = tonumber(s.t) }
                        end
                    end
                end
            end
            add(sells, s.sell, s.sq, s.sl)
            add(buys, s.buy, s.bq, s.bl)
        end
    end
    -- ราคาเท่ากัน: เรียงตามชื่อร้าน (ลำดับนิ่ง ไม่สลับไปมาทุกครั้งที่เปิด)
    table.sort(sells, function(a, b) if a.price ~= b.price then return a.price < b.price end return a.shop < b.shop end)
    table.sort(buys, function(a, b) if a.price ~= b.price then return a.price > b.price end return a.shop < b.shop end)
    sendBig('__lvmI', 'if(window.LVM)LVM.item(__s)', encodeJson({ vid = vid, sell = sells, buy = buys }))
end

local function setCursor(on)
    -- Arizona CEF: window.executeEvent('cef.toggleServerCursor', `[แสดง, ล็อกกล้อง]`)  (arg เป็น backtick JSON)
    local a = on and '[true, true]' or '[false, false]'
    cefEval("try{window.executeEvent('cef.toggleServerCursor', `" .. a .. "`)}catch(e){}")
end
local function panelShow()
    if not loadPanel() then return end
    lastSrvJs, lastRowsJson = nil, nil   -- เปิดใหม่ = หน้าว่าง ต้องส่งให้ครบ
    pushProfile()   -- ตั้งโปรไฟล์ก่อน show จะได้เรนเดอร์หน้าถูกเลย (ล็อกอินค้าง=เข้าตลาดเลย ไม่แว้บหน้าล็อกอิน)
    cefEval("if(window.LVM)LVM.show('" .. lang .. "')")
    pushCfg(); pushRows(); pushServer()
    panelOpen = true
    setCursor(true)
    if profile.connected and tostring(cfg.main.code or '') ~= '' then doMe() end   -- ตรวจรหัสซ้ำเงียบๆ (ยังใช้ได้=อยู่ต่อ, โดนแบน=เด้งออก)
end
local function panelHide()
    cefEval('if(window.LVM)LVM.hide()'); panelOpen = false
    setCursor(false)
end
local function panelToggle() if panelOpen then panelHide() else panelShow() end end

-- ===== central pool over HTTP =====
local netBusy = false
local wantItem = nil     -- หน้าเว็บขอรายการร้านของไอเทม (ให้ main loop ส่ง ไม่ส่งจากใน hook)
local wantHist = nil     -- ขอประวัติราคา (ยิงจาก main loop ตอนเน็ตว่าง)
local wantPull = false   -- หลัง login สำเร็จ ให้ main loop ดึง pool (กันเรียก httpCall ซ้อนใน callback = coroutine crash)
local function srvUrl()   -- url กองกลาง: ใช้ที่ตั้งเองก่อน ถ้าไม่มีใช้ DEFAULT_URL ที่ฝังไว้
    local u = tostring(cfg.main.url or '')
    if u == '' then u = DEFAULT_URL or '' end
    return (u:gsub('/+$', ''))
end
-- url /me พร้อมชื่อตัวละคร (nick = handle สาธารณะ ไม่ใช่โทเคน) เพื่อผูกคีย์กับตัวละคร กันแชร์คีย์
local function meUrl(url, code)
    local nk = (myNick() or ''):gsub('[^%w_]', ''):sub(1, 24)
    return url .. '/me?nick=' .. nk
end
local function httpWorker()
    return effil.thread(function(method, url, body, key)
        local requests = require('requests')
        -- UA แบบเบราว์เซอร์: กัน Cloudflare Browser Integrity Check (error 1010) บล็อก client
        local opt = { headers = { ['content-type'] = 'application/json',
            ['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } }
        if key and key ~= '' then opt.headers['x-lvm-key'] = key end   -- รหัสอยู่ใน header ไม่อยู่ใน URL = ไม่ติดล็อกใคร
        if body then opt.data = body end
        local ok, r = pcall(requests.request, method, url, opt)
        if ok then return true, r.status_code, r.text end
        return false, 0, tostring(r)
    end)
end
local function httpCall(method, url, body, cb)
    if netBusy or not okEffil then return end
    netBusy = true
    -- แนบรหัสเฉพาะคำขอที่ไปเซิร์ฟเวอร์ของเราเท่านั้น
    local base, key = srvUrl(), tostring(cfg.main.code or '')
    if base == '' or url:sub(1, #base + 1) ~= base .. '/' then key = '' end
    local th = httpWorker()(method, url, body, key)
    lua_thread.create(function()
        local t0 = os.clock()
        while th:status() == 'running' do wait(50); if os.clock() - t0 > 25 then pcall(function() th:cancel() end); break end end
        netBusy = false
        local ok, codeN, text = th:get()
        pcall(cb, ok, codeN, text)
    end)
end
function doMe()
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    httpCall('GET', meUrl(url, code), nil, function(ok, codeN, text)
        if ok and codeN == 200 and text then
            local okj, d = pcall(decodeJson, text)
            if okj and type(d) == 'table' and d.connected then
                profile.name = d.name; profile.avatar = d.avatar; profile.connected = true
                if panelOpen then pushProfile() end
            end
        elseif ok and codeN == 403 then
            -- รหัสโดนแบน/ไม่ถูกต้องแล้ว: เด้งออกไปหน้าล็อกอินเอง (ไม่เตะคนที่เน็ตหลุดชั่วคราว)
            cfg.main.code = ''; profile = { connected = false }
            saveCfg()
            if panelOpen then pushProfile() end
        end
    end)
end
local function doSubmit()
    if tonumber(cfg.main.share) ~= 1 then return end
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    -- ส่งเฉพาะร้านของเซิร์ฟที่เล่นอยู่ ติดป้ายเซิร์ฟเดียวกับที่เก็บมา
    local mine, srv = myShops()
    if srv == '?' then return end
    local since = lastUp[srv] or 0
    local shops, n = {}, 0
    for name, s in pairs(mine) do
        if (tonumber(s.t) or 0) > since then
            shops[name] = { t = s.t, buy = s.buy, sell = s.sell, sq = s.sq, bq = s.bq, sl = s.sl, bl = s.bl }
            n = n + 1; if n >= 400 then break end
        end
    end
    if n == 0 then return end
    httpCall('POST', url .. '/submit', encodeJson({ server = srv, nick = myNick() or '', shops = shops }), function(ok, codeN)
        if ok and codeN == 200 then lastUp[srv] = os.time(); if panelOpen then pushStatus(('sent %d / shared'):format(n)) end end
    end)
end
-- ประวัติราคารายวันของไอเทม (หน้ารายละเอียด) -> LVM.hist(json)
local function doHist(vid)
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    httpCall('GET', url .. '/history?server=' .. viewKey() .. '&vid=' .. vid .. '&days=90&all=1', nil, function(ok, codeN, text)
        if ok and codeN == 200 and text and panelOpen then
            sendBig('__lvmH', 'if(window.LVM)LVM.hist(__s)', text)
        end
    end)
end
-- ===== ข้อมูลไอเทมจากหน้าต่าง "ИНФОРМАЦИЯ О ПРЕДМЕТЕ" ของเกม (อ่านอย่างเดียว ไม่กดอะไรแทน) =====
-- หน้าเกมส่งข้อความกลับมาเป็น lvm|inf:k/N:<urlencoded> ; ตัดบรรทัดของผู้เล่นทิ้งตั้งแต่ในหน้า แล้วตัดซ้ำที่นี่และที่ server
local INFO_JS = [[(function(){if(window.__lvmInf6)return;window.__lvmInf6=1;
var cId='',cT=0,hId='',cC='',hC='',tile=null,last='',tm=0,K='на сервере';
function cols(el){var o=[],q=[el],d=0;while(q.length&&o.length<8&&d<40){var e=q.shift();d++;try{var s=getComputedStyle(e),t=(s.backgroundColor||'')+' '+(s.backgroundImage||''),m,re=/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g;while(m=re.exec(t)){if(m[4]===undefined||+m[4]>0.3)o.push(m[1]+'.'+m[2]+'.'+m[3]);}}catch(x){}for(var i=0;i<e.children.length&&i<6;i++)if(e.children[i].tagName!=='IMG')q.push(e.children[i]);}return o.join(',');}
var DROP=/^(Покупка предмета|Продажа предмета|Введите|В наличии|У вас|Стоимость|Осталось|Уровень улучшения|Улучшение|Установлен|Принадлежн|Верность|Класс качества|Владел|Срок|Прочност|Характеристики|Цена|Ваш|Вы )/i;
var HEAD={'ИНФОРМАЦИЯ О ПРЕДМЕТЕ':1,'ВЫХОД':1,'ЗАКРЫТЬ':1};
function idAt(t){tile=null;var n=t;for(var i=0;i<6&&n&&n.querySelectorAll;i++,n=n.parentElement){if(n.id==='lvmRoot')return '';var a=n.getAttribute&&n.getAttribute('alt'),m=a&&/ID:(\d+)/.exec(a);if(m){tile=n.parentElement;return m[1];}var im=n.querySelectorAll('img[alt*="ID:"]');if(im.length===1){m=/ID:(\d+)/.exec(im[0].getAttribute('alt')||'');tile=n;return m?m[1]:'';}if(im.length>1)return '';}return '';}
document.addEventListener('mousedown',function(e){var v=idAt(e.target);if(v){cId=v;cT=Date.now();cC=tile?cols(tile):'';}},true);
document.addEventListener('mouseover',function(e){var v=idAt(e.target);if(v!==hId){hId=v;hC=v&&tile?cols(tile):'';}},true);
function scan(){var w=document.createTreeWalker(document.body,4),n,hit=null;
while(n=w.nextNode()){if(n.nodeValue&&n.nodeValue.indexOf(K)>=0){var p=n.parentElement;if(p&&p.tagName!=='SCRIPT'&&p.tagName!=='STYLE'&&p.getClientRects().length&&!(p.closest&&p.closest('#lvmRoot'))){hit=p;break;}}}
if(!hit)return;var box=hit;
for(var i=0;i<12&&box.parentElement&&box.parentElement!==document.body;i++){var q=box.parentElement;if(q.querySelectorAll('img').length>2||(q.innerText||'').length>6000)break;box=q;}
var t=box.innerText||'';if(t===last)return;last=t;
var L=t.split('\n'),out=[];
for(var j=0;j<L.length;j++){var s=L[j].replace(/\s+/g,' ').trim(),b=s.replace(/^[-–—•\s]+/,'');if(HEAD[s.toUpperCase()])continue;var um=/^Улучшение:\s*\d+\s*\/\s*(\d+)/.exec(b);if(um){out.push('#upmax:'+um[1]);continue;}var ul=/Уровень улучшения:\s*\+?(\d+)\s*\/\s*(\d+)/.exec(b);if(ul){out.push('#lvl:'+ul[1]);out.push('#upmax:'+ul[2]);continue;}if(b&&(DROP.test(b)||/^\d+\.\s/.test(b)))continue;out.push(s);}
var fresh=Date.now()-cT<15000,c=fresh?cId:'';
var msg=encodeURIComponent(c+'\u0001'+hId+'\u0001'+(fresh?cC:'')+'\u0001'+hC+'\u0001'+out.join('\n')),N=Math.ceil(msg.length/3000);
for(var k=0;k<N;k++){try{window.cef.SendMessage('lvm|inf:'+(k+1)+'/'+N+':'+msg.substr(k*3000,3000),0);}catch(e){}}}
new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,300);}).observe(document.body,{childList:true,subtree:true,characterData:true});})();]]
local function asciiJs(str)   -- เฉพาะตัวอักษร non-ASCII -> \uXXXX (ตัวโค้ดเหมือนเดิม)
    return (str:gsub('[\192-\247][\128-\191]*', function(ch)
        local c, n = ch:byte(1), #ch
        local cp = n == 2 and (c % 0x20) * 0x40 + ch:byte(2) % 0x40
            or n == 3 and (c % 0x10) * 0x1000 + ch:byte(2) % 0x40 * 0x40 + ch:byte(3) % 0x40 or 0x3F
        return string.format('\\u%04X', cp)
    end):gsub('\n', ''))
end
local INFO_JS_A = asciiJs(INFO_JS)
local infBuf, wantInfo, infoSent = {}, nil, {}
local function urlDecode(s) return (s:gsub('%%(%x%x)', function(h) return string.char(tonumber(h, 16)) end)) end
local INFO_DROP = { 'ПОКУПКА ПРЕДМЕТА', 'ПРОДАЖА ПРЕДМЕТА', 'Покупка предмета', 'Продажа предмета', 'Введите','В наличии', 'У вас', 'Стоимость', 'Осталось', 'Уровень улучшения', 'Улучшение', 'Установлен', 'Принадлежн', 'Верность', 'Класс качества', 'Владел', 'Срок', 'Прочност', 'Характеристики', 'Цена', 'Ваш' }
local function doInfo(raw)
    if tonumber(cfg.main.share) ~= 1 then return end
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    local cId, hId, cC, hC, text = raw:match('^(%d*)\1(%d*)\1([%d.,]*)\1([%d.,]*)\1(.*)$')
    if not text then return end
    local nick = myNick() or ''
    local lines, name, en = {}, nil, nil
    for ln in (text .. '\n'):gmatch('(.-)\n') do
        local el = ln:match('^#lvl:(%d+)$')
        if el then en = tonumber(el)   -- ระดับตีบวกของชิ้นนี้: ใช้แยกเกรด ไม่เก็บเป็นคำอธิบาย
        else
            local bare = ln:gsub('^[%s%-–—•]+', '')
            local drop = (nick ~= '' and ln:find(nick, 1, true)) or bare:match('^%d+%.%s')
            if not drop then for _, p in ipairs(INFO_DROP) do if bare:sub(1, #p) == p then drop = true; break end end end
            if not drop then
                lines[#lines + 1] = ln
                -- ชื่อ = บรรทัดแรกที่มีตัวหนังสือ: "Одежда: Cash" -> Cash, หรือ "Shawn Blue" ทั้งบรรทัด
                if not name and ln:match('%S') and ln:sub(1, 1) ~= '#' then name = ln:match(':%s*(.-)%s*$') or ln:match('^%s*(.-)%s*$') end
            end
        end
    end
    -- หาว่าเป็นไอเทมไหน: ชื่อในบรรทัดแรก ("Одежда: Cash" / "Предмет: Ларец") เทียบรายชื่อไอเทม + ช่องที่คลิก/ชี้อยู่
    local cand = {}
    if name and name ~= '' then for id, nm in pairs(ITEMNAME) do if nm == name then cand[#cand + 1] = tostring(id) end end end
    local base
    for _, id in ipairs(cand) do if id == cId or id == hId then base = id end end
    if not base and #cand == 1 then base = cand[1] end
    if not base and #cand == 0 and cId ~= '' and (hId == '' or hId == cId) then base = cId end
    if not base then return end
    -- สกินหลายระดับ (★): ข้อมูลต่างกันตามระดับ แต่ ID เดียวกัน -> ดูสีพื้นช่องที่คลิก/ชี้ เทียบกับสีที่เรียนจากกระเป๋า
    local vid = base
    local tiers = {}
    for _, T in ipairs({ MKDB.bg or {}, ITEMBG }) do
        for k, hex in pairs(T) do
            local b, t = tostring(k):match('^(%d+)~t(%d+)$')
            if b == base and type(hex) == 'string' then tiers[k] = hex end
        end
    end
    if next(tiers) then
        local colStr = (base == cId and cC ~= '' and cC) or (base == hId and hC) or ''
        local plainHex = (MKDB.bg or {})[base] or ITEMBG[base]
        local best, bestD, second = nil, 1e9, 1e9
        local function consider(k, hex)
            local hr, hg, hb = tonumber(hex:sub(1, 2), 16), tonumber(hex:sub(3, 4), 16), tonumber(hex:sub(5, 6), 16)
            if not hb then return end
            for r, g, b in colStr:gmatch('(%d+)%.(%d+)%.(%d+)') do
                local d = math.abs(r - hr) + math.abs(g - hg) + math.abs(b - hb)
                if d < bestD then if best ~= k then second = bestD end; best, bestD = k, d
                elseif d < second and best ~= k then second = d end
            end
        end
        for k, hex in pairs(tiers) do consider(k, hex) end
        if plainHex then consider(base, plainHex) end
        local f = io.open(LOGD .. '\\infodiag.txt', 'a')   -- บันทึกไว้ตรวจว่าจับระดับถูกไหม (มีแค่ id/สี)
        if f then f:write(os.date('%m-%d %H:%M:%S '), base, ' cols=', colStr, ' best=', tostring(best), ' d=', tostring(bestD), ' 2nd=', tostring(second), '\n'); f:close() end
        -- ต้องใกล้พอ และชนะอันดับสองชัดเจน ไม่งั้นไม่เก็บ (กันข้อมูลไปติดผิดระดับ)
        if not best or bestD > 45 or second - bestD < 20 then return end
        vid = best
    end
    -- ตีบวก (+N): แยกคำอธิบายตามระดับ -> ต่อ ~eN เข้ากับ vid (ดาว+ตีบวก = base~tTeN, ตีบวกล้วน = base~eN)
    if en and en > 0 then
        if vid:find('~t', 1, true) then vid = vid .. 'e' .. en else vid = base .. '~e' .. en end
    end
    local key = table.concat(lines, '\n')
    local prev = infoSent[vid]
    if prev and prev.k == key and os.clock() - prev.t < 1800 then return end   -- ส่งไปแล้ว ไม่ยิงซ้ำ
    infoSent[vid] = { k = key, t = os.clock() }
    httpCall('POST', url .. '/info', encodeJson({ server = serverKey(), base = base, vid = vid, lines = lines }), function() end)
end

-- ===== อัปเดตสคริปต์ในตัว (ไฟล์จากเซิร์ฟเวอร์เราเท่านั้น: LavkaMarket.lua + LavkaMarket/web/*) =====
function verNewer(a, b)   -- "0.5" > "0.4.9" ?
    local pa, pb = {}, {}
    for n in tostring(a or ''):gmatch('%d+') do pa[#pa + 1] = tonumber(n) end
    for n in tostring(b or ''):gmatch('%d+') do pb[#pb + 1] = tonumber(n) end
    for i = 1, math.max(#pa, #pb) do
        local x, y = pa[i] or 0, pb[i] or 0
        if x ~= y then return x > y end
    end
    return false
end
updServer, updNotified = false, nil
local function adler32(str)
    local a, b = 1, 0
    for i = 1, #str, 2048 do
        local t = { str:byte(i, math.min(i + 2047, #str)) }
        for j = 1, #t do a = (a + t[j]) % 65521; b = (b + a) % 65521 end
    end
    return b * 65536 + a
end
local function updTarget(path)   -- path จาก manifest -> ไฟล์ในเครื่อง (รับเฉพาะที่อนุญาต)
    path = tostring(path or '')
    if path == 'LavkaMarket.lua' then return DIR .. '\\LavkaMarket.lua' end
    local fn = path:match('^LavkaMarket/web/([%w_%-]+%.%w+)$')
    if fn then return BASE .. '\\web\\' .. fn end
    return nil
end
local upd = nil   -- { stage = 'manifest'|'file'|'apply', ver, files, i, data }
local function updLog(line)   -- LavkaMarket/logs/update.log (ในเครื่องเท่านั้น)
    local f = io.open(LOGD .. '\\update.log', 'a')
    if f then f:write(os.date('%Y-%m-%d %H:%M:%S '), tostring(line), '\n'); f:close() end
end
local updMeta = nil   -- { ver, notes, files = {{path,size}} } จาก manifest (ไว้แสดงในหน้าต่างอัปเดต)
local function updUi(state, a, b)
    pcall(updLog, ('state=%s %s %s'):format(tostring(state), tostring(a), tostring(b)))
    local o = { s = state, a = a, b = b, cur = tostring(thisScript().version or '') }
    if updMeta then o.ver, o.notes, o.files = updMeta.ver, updMeta.notes, updMeta.files end
    if panelOpen then cefEval("if(window.LVM&&LVM.upd)LVM.upd('" .. jsText(encodeJson(o)) .. "')") end
end
local function updFail(why)
    upd = nil; updUi('err', why); msg('upderr', why)
end
local function updStep()
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if not upd or url == '' or code == '' then return end
    if upd.stage == 'manifest' then
        upd.stage = 'wait'
        upd.msrc = upd.msrc or 1   -- แหล่ง manifest: 1 = GitHub (หลัก), 2 = เซิร์ฟกองกลาง (สำรอง)
        local murl = (upd.msrc == 1) and (GH_RAW .. '/manifest.json')
            or (url .. '/update/manifest?v=' .. tostring(thisScript().version or '0'))
        httpCall('GET', murl, nil, function(ok, codeN, text)
            if not upd then return end   -- ผู้ใช้กดยกเลิกระหว่างรอ
            local okj, d = false, nil
            if ok and codeN == 200 and text then okj, d = pcall(decodeJson, text) end
            if not okj or type(d) ~= 'table' or type(d.files) ~= 'table' then
                if upd.msrc == 1 then   -- GitHub ไม่ได้ -> ลองเซิร์ฟกองกลางแทน
                    upd.msrc = 2; upd.stage = 'manifest'; pcall(updLog, 'manifest: github พลาด -> ลองเซิร์ฟสำรอง'); return
                end
                return updFail('manifest')
            end
            if not verNewer(d.version, thisScript().version) then upd = nil; updUi('latest'); msg('updnone'); return end
            for _, f in ipairs(d.files) do
                if not updTarget(f.path) or not tonumber(f.size) or not tonumber(f.adler) then return updFail('bad file ' .. tostring(f.path)) end
            end
            local fl = {}
            for _, f in ipairs(d.files) do fl[#fl + 1] = { path = tostring(f.path), size = tonumber(f.size) } end
            local cur, nn = thisScript().version, {}   -- หน้าต่างอัปเดต: โชว์เฉพาะเวอร์ชันที่ใหม่กว่าของที่มีอยู่ (ไม่ยาว)
            if type(d.notes) == 'table' then for _, e in ipairs(d.notes) do if type(e) == 'table' and e.v and verNewer(tostring(e.v), cur) then nn[#nn + 1] = e end end end
            updMeta = { ver = tostring(d.version), notes = nn, files = fl }
            upd.ver, upd.files, upd.i, upd.data = tostring(d.version), d.files, 1, {}
            if upd.ask then upd.stage = 'ask'; updUi('ask')   -- รอผู้ใช้กด "อัปเดตเลย" ในหน้าต่าง
            else upd.stage = 'file'; updUi('dl', 1, #d.files) end
        end)
    elseif upd.stage == 'file' then
        local f = upd.files[upd.i]
        if not f then upd.stage = 'apply'; updUi('apply', #upd.files, #upd.files); return end
        upd.stage = 'wait'
        -- โหลดไฟล์จาก url ใน manifest ถ้ามี (GitHub) ไม่งั้นจากเซิร์ฟกองกลาง
        local furl = (type(f.url) == 'string' and f.url ~= '') and f.url or (url .. '/update/file?path=' .. f.path)
        httpCall('GET', furl, nil, function(ok, codeN, text)
            if not (ok and codeN == 200 and text) then return updFail('download ' .. f.path) end
            if #text ~= tonumber(f.size) or adler32(text) ~= tonumber(f.adler) then return updFail('checksum ' .. f.path) end
            upd.data[f.path] = text; upd.i = upd.i + 1; upd.stage = 'file'
            updUi('dl', upd.i, #upd.files)   -- a = ไฟล์ที่กำลังโหลด (เกินจำนวน = โหลดครบแล้ว)
        end)
    elseif upd.stage == 'apply' then
        -- เขียนเป็น .new ให้ครบก่อน แล้วค่อยสลับ (ถ้าเขียนไม่ได้ = ไฟล์เดิมไม่เสีย)
        for _, f in ipairs(upd.files) do
            local fo = io.open(updTarget(f.path) .. '.new', 'wb')
            if not fo then return updFail('write ' .. f.path) end
            fo:write(upd.data[f.path]); fo:close()
        end
        if dbDirty then pcall(saveDB) end
        for _, f in ipairs(upd.files) do
            local t = updTarget(f.path)
            os.remove(t .. '.old'); os.rename(t, t .. '.old')
            if not os.rename(t .. '.new', t) then os.rename(t .. '.old', t); return updFail('replace ' .. f.path) end
            os.remove(t .. '.old')
        end
        local v = upd.ver; upd = nil
        msg('upddone', v); updUi('done', #updMeta.files, #updMeta.files)
        lua_thread.create(function() wait(1600); thisScript():reload() end)   -- ให้เห็นหน้าต่าง "เสร็จแล้ว" ครู่หนึ่ง
    end
end
-- ตารางไอเทม (web/items.json) ไม่ฝังในสคริปต์: โหลดผ่าน GitHub เป็นหลัก (เหมือนตัวสคริปต์) เซิร์ฟ /items เป็นสำรอง
-- ทริกเกอร์: ไม่มีไฟล์ หรือ /config บอกว่ามีรุ่นใหม่ (adler ไม่ตรง) · ไฟล์บน GitHub = ไฟล์เดียวกับที่เซิร์ฟแจก adler จึงตรงกัน
local wantItems, itemsReload, lastItemsTry, itemsAdler, itemsSrc = false, false, -1e9, nil, 1   -- itemsSrc: 1=GitHub, 2=เซิร์ฟสำรอง
local function readAll(p) local f = io.open(p, 'rb'); if not f then return nil end; local s = f:read('*a'); f:close(); return s end
local function doItems()
    local url = srvUrl()
    local src = itemsSrc
    if src == 2 and url == '' then itemsSrc = 1; return end         -- ไม่มีเซิร์ฟสำรอง: กลับไปใช้ GitHub
    local iurl = (src == 1) and (GH_RAW .. '/items.json') or (url .. '/items')
    local expect = wantItems
    httpCall('GET', iurl, nil, function(ok, codeN, text)
        local bad = not (ok and codeN == 200 and text and #text > 1000 and text:sub(1, 1) == '{')
        if not bad and type(expect) == 'number' and adler32(text) ~= expect then bad = true end   -- โหลดมาไม่ครบ/เพี้ยน
        if bad then
            if src == 1 then itemsSrc = 2; lastItemsTry = -1e9 else itemsSrc = 1 end   -- GitHub พลาด -> ลองเซิร์ฟทันที
            return
        end
        local okj, t = pcall(decodeJson, text)
        if not okj or type(t) ~= 'table' then return end
        mkdir(BASE); mkdir(BASE .. '\\web')
        local fo = io.open(ITEMS_RES .. '.new', 'wb'); if not fo then return end
        fo:write(text); fo:close(); os.remove(ITEMS_RES); os.rename(ITEMS_RES .. '.new', ITEMS_RES)
        wantItems = false; itemsReload = true; itemsSrc = 1
    end)
end
local function doConfig()
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    httpCall('GET', url .. '/config?platform=pc', nil, function(ok, codeN, text)
        if ok and codeN == 200 and text and text:sub(1, 1) == '{' then
            local okj, d = pcall(decodeJson, text)
            local dl = okj and type(d) == 'table' and tostring(d.dl or '') or ''
            -- เปิดได้เฉพาะลิงก์ของเราเอง (Discord เชิญ / โดเมนเรา)
            cfgDl = (dl:find('^https://discord%.gg/') or dl:find('^https://arz%.lavkamarket%.shop/')) and dl or nil
            local latest = okj and type(d) == 'table' and tostring(d.latest or '') or ''
            updServer = okj and type(d) == 'table' and tonumber(d.upd) == 1
            if latest ~= '' and verNewer(latest, thisScript().version) and updNotified ~= latest then
                updNotified = latest; msg('updavail', latest)
            end
            local it = okj and type(d) == 'table' and type(d.items) == 'table' and tonumber(d.items.adler)
            if it then
                if not itemsAdler then local raw = readAll(ITEMS_RES); itemsAdler = raw and adler32(raw) or -1 end
                if itemsAdler ~= it then wantItems = it end
            end
            local js = "if(window.LVM&&LVM.cfg)LVM.cfg('" .. jsText(text) .. "')"
            if js ~= cfgJs then cfgJs = js; if panelOpen then pushCfg() end end
        end
    end)
end
local function doServers()
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    httpCall('GET', url .. '/servers', nil, function(ok, codeN, text)
        local list = '[]'
        if ok and codeN == 200 and text then
            local okj, d = pcall(decodeJson, text)
            if okj and type(d) == 'table' and type(d.servers) == 'table' then list = encodeJson(d.servers) end
        end
        if panelOpen then cefEval("if(window.LVM&&LVM.srvList)LVM.srvList('" .. jsText(list) .. "')") end
    end)
end
local wantServers = false
-- เก็บข้อมูลกองกลางล่าสุด + เวลาที่ดึงลงไฟล์: รีโหลดสคริปต์แล้วไม่ต้องดึงใหม่ วงนับถอยหลังนับต่อจากเดิม
local POOLC = BASE .. '\\pool_cache.json'
local poolMem = {}   -- [key] = { shops, t }: สลับเซิร์ฟไป-กลับภายใน 10 นาทีไม่ต้องดึงใหม่ วงนับไม่เริ่มใหม่
local function savePoolCache(key)
    local f = io.open(POOLC, 'w'); if not f then return end
    f:write(encodeJson({ key = key, t = lastPullAt, shops = POOL })); f:close()
end
local function loadPoolCache(key)
    local c = readJson(POOLC)
    if type(c) ~= 'table' or c.key ~= key or type(c.shops) ~= 'table' then return false end
    local t = tonumber(c.t) or 0
    if os.time() - t >= PULL_EVERY or t > os.time() + 60 then return false end
    POOL = c.shops; lastPullAt = t; pcall(buildMarket); uiDirty = true
    return true
end
local function doPull()
    local url, code = srvUrl(), tostring(cfg.main.code or '')
    if url == '' or code == '' then return end
    if netBusy or not okEffil then wantPull = true; return end   -- เน็ตยังไม่ว่าง: รอรอบหน้า (ไม่ค้างสถานะ "กำลังดึง")
    local want = viewKey()
    pushPull('run')
    httpCall('GET', url .. '/pool?server=' .. want, nil, function(ok, codeN, text)
        if ok and codeN == 200 and text then
            local okj, d = pcall(decodeJson, text)
            if okj and type(d) == 'table' and type(d.shops) == 'table' and want == viewKey() then
                POOL = d.shops; buildMarket(); lastPullAt = os.time()
                poolMem[want] = { shops = POOL, t = lastPullAt }
                if not viewSrv then pcall(savePoolCache, want) end   -- ไฟล์เก็บเฉพาะเซิร์ฟตัวเอง (รีโหลดแล้วกลับมาที่เซิร์ฟตัวเองเสมอ)
                local c = 0; for _ in pairs(mergedShops()) do c = c + 1 end
                if panelOpen then pushRows(); pushStatus(('pool %d shops'):format(c)); pushServer() end
                pushPull('ok', c)
                return
            end
        end
        pushPull('err')
    end)
end

-- ===== Discord OAuth (ล็อกอินด้วย Discord ตัวเอง -> ได้คีย์อัตโนมัติ) =====
-- สำคัญ: poll ขับจาก main loop (ไม่สร้าง lua_thread ซ้อนใน callback ของ httpCall
--        ไม่งั้น MoonLoader เออเรอร์ "cannot resume non-suspended coroutine" แล้วสคริปต์ตาย)
local oauthState, oauthUrl, oauthN, oauthNextAt, oauthJoinOpened
local function oauthPollOnce()
    if not oauthState then return end
    httpCall('GET', oauthUrl .. '/oauth/poll?state=' .. oauthState, nil, function(ok, codeN, text)
        if not oauthState then return end
        local d
        if ok and text then local okj; okj, d = pcall(decodeJson, text); if not okj then d = nil end end
        if type(d) == 'table' and d.connected == true and d.code then
            oauthState = nil
            cfg.main.code = d.code
            profile = { connected = true, name = d.name, avatar = d.avatar }
            saveCfg()
            if panelOpen then pushProfile(); pushRows() end
            wantPull = true            -- ให้ main loop ดึง pool (ไม่เรียกซ้อนใน callback)
        elseif type(d) == 'table' and d.connected == false then
            oauthState = nil
            if d.reason == 'banned' then cefEval("if(window.LVM)LVM.loginError('err_bad')")
            elseif d.reason == 'timeout' then cefEval("if(window.LVM)LVM.loginError('err_member')")
            else cefEval("if(window.LVM)LVM.loginError('err_oauth')") end
        elseif type(d) == 'table' and d.status == 'join' then
            if not oauthJoinOpened then oauthJoinOpened = true; openUrl(DISCORD_INVITE) end   -- เปิดลิงก์เชิญครั้งเดียว
            cefEval("if(window.LVM)LVM.loginWait('err_join')")    -- โชว์ "เข้าร่วมแล้วรอ" (คง spinner ไว้)
            oauthN = 0                                           -- ไม่นับ timeout ฝั่ง client (server คุม deadline เอง)
            oauthNextAt = os.clock() + 3
        else
            oauthN = (oauthN or 0) + 1
            if oauthN > 60 then oauthState = nil; cefEval("if(window.LVM)LVM.loginError('err_oauth')")
            else oauthNextAt = os.clock() + 2 end
        end
    end)
end
local function doOAuth()
    if oauthState then return end          -- กำลังล็อกอินอยู่แล้ว ไม่เริ่มซ้ำ (กัน state ชนตอนเปลี่ยนภาษา/กดซ้ำ)
    local url = srvUrl()
    if url == '' then cefEval("if(window.LVM)LVM.loginError('err_server')"); return end
    httpCall('GET', url .. '/oauth/start', nil, function(ok, codeN, text)
        local d
        if ok and codeN == 200 and text then local okj; okj, d = pcall(decodeJson, text); if not okj then d = nil end end
        if type(d) == 'table' and d.url and d.state then
            oauthUrl = url; oauthState = d.state; oauthN = 0; oauthNextAt = os.clock() + 1; oauthJoinOpened = false
            openUrl(d.url)          -- main loop จะ poll เองหลังจากนี้
        else
            cefEval("if(window.LVM)LVM.loginError('err_oauth_off')")   -- เซิร์ฟเวอร์ยังไม่ตั้ง OAuth
        end
    end)
end

-- ===== page -> script (cef.SendMessage('lvm|...')) =====
function onSendPacket(id, bs)
    if id ~= 220 then return end
    local ok, str = pcall(function()
        local n = raknetBitStreamGetNumberOfBytesUsed(bs)
        if n <= 2 or n > 8000 then return nil end
        local raw = raknetBitStreamReadString(bs, n)
        -- คลิกช่องในร้าน: เกมส่ง clickOnBlock {"slot":N,"type":T} (อ่านอย่างเดียว ไม่ได้ส่งอะไรแทน)
        if raw:find('clickOnBlock', 1, true) then
            click = { slot = tonumber(raw:match('"slot"%s*:%s*(%d+)')), type = tonumber(raw:match('"type"%s*:%s*(%d+)')), t = os.clock() }
        end
        local at = raw:find('lvm|', 1, true)
        return at and (raw:sub(at):gsub('%z.*$', '')) or nil
    end)
    pcall(raknetBitStreamResetReadPointer, bs)
    if not ok or not str then return end
    if str:sub(1, 12) == 'lvm|connect:' then
        -- บังคับต้องมีคีย์ถูกต้องจากบอทเราเท่านั้น: ตรวจกับเซิร์ฟเวอร์ /me ก่อน ผ่านถึงเข้าได้
        local code = str:sub(13):gsub('%s+$', '')
        local url = srvUrl()
        if url == '' or code == '' then
            cefEval("if(window.LVM)LVM.loginError('" .. (url == '' and 'err_server' or 'err_bad') .. "')")
            return false
        end
        httpCall('GET', meUrl(url, code), nil, function(ok, codeN, text)
            local good = false
            if ok and codeN == 200 and text then
                local okj, d = pcall(decodeJson, text)
                if okj and type(d) == 'table' and d.connected then
                    good = true
                    cfg.main.code = code
                    profile = { connected = true, name = d.name, avatar = d.avatar }
                    saveCfg()
                    pushProfile(); pushRows(); pushServer(); wantPull = true
                end
            end
            if not good then
                local ek = 'err_bad'
                if text then local okj, d = pcall(decodeJson, text); if okj and type(d) == 'table' and d.err == 'full' then ek = 'err_full' end end
                cefEval("if(window.LVM)LVM.loginError('" .. ek .. "')")
            end
        end)
        return false
    elseif str == 'lvm|oauth' then
        doOAuth()                      -- ล็อกอินด้วย Discord (OAuth) -> ได้คีย์อัตโนมัติ
        return false
    elseif str == 'lvm|discord' then
        openUrl(DISCORD_INVITE)
        return false
    elseif str == 'lvm|logout' then
        cfg.main.code = ''; profile = { connected = false }
        saveCfg()
        return false
    elseif str == 'lvm|close' then panelOpen = false; setCursor(false); return false
    elseif str:sub(1, 10) == 'lvm|share:' then   -- เมนู: เปิด/ปิดแชร์ข้อมูลตลาด
        cfg.main.share = str:sub(11) == '1' and 1 or 0; cfg.main.shareSet = 1
        saveCfg()
        return false
    elseif str == 'lvm|update' then
        if updServer then
            if not upd then upd = { stage = 'manifest', ask = true }; updMeta = nil; updUi('check')
            elseif upd.stage == 'ask' then updUi('ask') end
        else openUrl(cfgDl or DISCORD_INVITE) end
        return false
    elseif str == 'lvm|updgo' then
        if upd and upd.stage == 'ask' then upd.stage = 'file'; updUi('dl', 1, #upd.files) end
        return false
    elseif str == 'lvm|updno' then
        if upd and (upd.stage == 'ask' or upd.stage == 'manifest') then upd = nil end
        return false
    elseif str:sub(1, 9) == 'lvm|lang:' then
        local c = str:sub(10); if CL[c] then lang = c; cfg.main.lang = c; saveCfg(); renameMarket() end
        return false
    elseif str == 'lvm|sync' then
        if not pullOk() then cfg.main.pulled = 1; saveCfg() end
        doPull(); doSubmit(); return false
    elseif str == 'lvm|pull' then   -- ปุ่ม "เริ่มดึงข้อมูล" (หน้าแรก) / กดวงนับถอยหลัง = ดึงตอนนี้
        if not pullOk() then cfg.main.pulled = 1; saveCfg(); lastSrvJs = nil end
        if lastPullAt == 0 or os.clock() - lastManualPull > 10 then lastManualPull = os.clock(); wantPull = true
        else local c = 0; for _ in pairs(mergedShops()) do c = c + 1 end; pushPull('ok', c) end   -- กดรัว: ไม่ยิงซ้ำ
        return false
    elseif str == 'lvm|srvlist' then wantServers = true; return false
    elseif str == 'lvm|cfgcheck' then lastCfg = -1e9; return false   -- เปิดเมนู: บังคับเช็กเวอร์ชันรอบถัดไปทันที (ไม่เพิ่ม upvalue ให้ main)

    elseif str:sub(1, 8) == 'lvm|srv:' then
        local k = str:sub(9):gsub('[^%w%.:%-]', ''):sub(1, 32)
        local own = serverKey()
        if k == '' or k == own or k == own:sub(1, 16) then k = nil end
        if k ~= viewSrv then
            if lastPullAt > 0 then poolMem[viewKey()] = { shops = POOL, t = lastPullAt } end
            viewSrv = k
            local m = poolMem[viewKey()]
            if m and os.time() - m.t < PULL_EVERY then POOL = m.shops; lastPullAt = m.t   -- ยังสด: ใช้ของเดิม
            else POOL = {}; lastPullAt = 0; wantPull = true end
            pcall(buildMarket); uiDirty = true
            lastSrvJs = nil; pcall(pushServer)
        end
        return false
    elseif str:sub(1, 9) == 'lvm|item:' then wantItem = str:sub(10); wantHist = str:sub(10); return false
    elseif str:sub(1, 8) == 'lvm|inf:' then
        local k, n, part = str:match('^lvm|inf:(%d+)/(%d+):(.*)$')
        k, n = tonumber(k), tonumber(n)
        if k and n and n <= 12 then
            if k == 1 then infBuf = {} end
            infBuf[k] = part
            if k == n and #infBuf == n then wantInfo = urlDecode(table.concat(infBuf)); infBuf = {} end
        end
        return false
    elseif str:sub(1, 8) == 'lvm|err:' then print('[LavkaMarket] page: ' .. str:sub(9)); return false
    end
end

-- หน้าต่าง "Покупка предмета ЗА ..." ตอนคลิกของในร้านคนอื่น: "В наличии: N шт." = จำนวนที่ร้านมีในช่องนั้น
-- (ข้อความ SAMP dialog เป็น cp1251; รูปแบบเดียวกับที่ LavkaPrices ใช้)
local CP_POKUPKA = '\207\238\234\243\239\234\224'                        -- "Покупка"
local CP_NALICH  = '\194 \237\224\235\232\247\232\232:%s*(%d+)'          -- "В наличии: N"
local CP_PRODAET = '\207\240\238\228\224\229\242:[^%d\n]-(%d+)%s*\248\242' -- "Продает: N шт"
local CP_KOLVO   = '\202\238\235\232\247\229\241\242\226\238:[^%d\n]-(%d+)%s*\248\242' -- "Количество: N шт"
local function stockOf(text)
    local t = tostring(text or ''):gsub('(%d)[%.,](%d%d%d)', '%1%2'):gsub('(%d)[%.,](%d%d%d)', '%1%2')
    return tonumber(t:match(CP_NALICH)) or tonumber(t:match(CP_PRODAET)) or tonumber(t:match(CP_KOLVO))
end
local dlgSamples = 0
local okEv, sampev = pcall(require, 'samp.events')
if okEv and sampev then
    local OWNLOG = LOGD .. '\\own.log'
    local function ownLog(line)
        if not ownOpenAt or os.clock() - ownOpenAt > 600 then return end   -- เฉพาะ 10 นาทีหลังเปิดแผงตัวเอง
        local f = io.open(OWNLOG, 'a'); if not f then return end
        if f:seek('end') < 300000 then f:write(os.date('%H:%M:%S '), line, '\n') end
        f:close()
    end
    local ownAsk = nil   -- กล่องตั้งราคา/จำนวนที่กำลังเปิดอยู่ { name, single, id, t }
    ownMode = 'sell'     -- (ค่าเริ่ม) เมนูแผง: "Добавить товар на покупку" = ตั้งรับซื้อ / อย่างอื่น = ตั้งขาย
    local function ownAnswer(input)
        local a = ownAsk; ownAsk = nil
        local s2 = tostring(input or ''):gsub('%s', '')
        local n, pr = s2:match('^(%d+),([%d%.]+)$')
        if not n and a.single then n, pr = 1, s2:match('^([%d%.]+)$') end
        n, pr = tonumber(n), tonumber((tostring(pr or ''):gsub('%.', '')))
        if not n or not pr or n < 1 or n > 100000 then return end
        ownQtyT()[tostring(pr)] = { n = n, name = a.name, t = os.time() }; dbDirty = true
        pcall(ownLog, ('QTY %s x%d @ %d'):format(tostring(a.name), n, pr))
        local mine = myNick(); local shop = mine and (myShops())[mine]
        if ownMode == 'buy' then
            local id = idByName(a.name)
            pcall(ownLog, ('BUYORDER %s -> id %s'):format(tostring(a.name), tostring(id)))
            if not id or not mine or serverKey() == '?' then return end
            if not shop then
                shop = { t = os.time(), ot = os.time(), buy = {}, sell = {}, sq = {}, bq = {}, sl = {}, bl = {}, _sl = {}, _q = {} }
                local ms = myShops(); ms[mine] = shop
            end
            shop._ob = shop._ob or {}
            shop._ob[id] = { p = pr, n = n, t = os.time() }
            for sk, e in pairs(shop._bsl or {}) do
                if tostring(e[1]):match('^(%d+)') == id then shop._bsl[sk] = nil; if shop._qb then shop._qb[sk] = nil end end
            end
            ownRecalc(shop)
            return
        end
        if shop then ownFill(shop, true, pr); ownRecalc(shop) end   -- ใส่ให้ช่องที่มีอยู่แล้วทันที (ช่องใหม่ได้ตอนเปิดแผงรอบหน้า)
    end
    ownNote = ownLog
    local ownCancel = nil   -- กล่องยืนยันยกเลิกรับซื้อที่เปิดอยู่ { id, name, price, t }
    local function ownBuySlots(shop, name, price)   -- ช่องรับซื้อของไอเทมนี้ (ชื่อ + ราคา)
        local out = {}
        for _, sk in ipairs(ownSlotsFor(shop._bsl, price, name)) do out[#out + 1] = sk end
        return out
    end
    local function ownCancelShow(id, text)
        local u = cp2u(text):gsub('{%x%x%x%x%x%x}', '')
        local name = u:match('Предмет:%s*([^\n]-)%s*\n')
        local n = tonumber(u:match('Игрок покупает:%s*(%d+)'))
        local pr = tonumber(((u:match('Стоимость:%s*:CASH:([%d%.]+)') or ''):gsub('%.', '')))
        if not name or not pr then return end
        ownCancel = { id = id, name = name, price = pr, t = os.clock() }
        pcall(ownLog, ('CANCEL? %s x%s @ %d'):format(name, tostring(n), pr))
        local mine = myNick(); local shop = mine and (myShops())[mine]
        if not shop or not n then return end
        local hit = ownBuySlots(shop, name, pr)
        if #hit == 0 then return end
        shop._qb = shop._qb or {}
        for _, sk in ipairs(hit) do shop._qb[sk] = n end   -- จำนวนรับซื้อจริงจากกล่องนี้
        ownRecalc(shop)
    end
    local function ownCancelDo()
        local c = ownCancel; ownCancel = nil
        local mine = myNick(); local shop = mine and (myShops())[mine]
        if not shop then return end
        for _, sk in ipairs(ownBuySlots(shop, c.name, c.price)) do shop._bsl[sk] = nil; if shop._qb then shop._qb[sk] = nil end end
        local id = idByName(c.name)
        if id and shop._ob then shop._ob[id] = nil end
        pcall(ownLog, ('CANCELLED %s @ %d'):format(c.name, c.price))
        ownRecalc(shop)
    end
    sampev.onSendDialogResponse = function(id, button, list, input)
        pcall(ownLog, ('RESP id=%s btn=%s list=%s input=%s'):format(tostring(id), tostring(button), tostring(list), tostring(input)))
        if ownCancel and ownCancel.id == id then
            if button == 1 and os.clock() - ownCancel.t < 300 then pcall(ownCancelDo) else ownCancel = nil end
        end
        if button == 1 then
            local u = cp2u(input)
            if u:find('Добавить товар на покупку', 1, true) then ownMode = 'buy'
            elseif u:find('Управление продажей', 1, true) then ownMode = 'sell' end
        end
        if ownAsk and ownAsk.id == id and button == 1 and os.clock() - ownAsk.t < 300 then pcall(ownAnswer, input)
        elseif ownAsk and ownAsk.id == id then ownAsk = nil end
    end
    sampev.onShowDialog = function(id, style, title, b1, b2, text)
        pcall(ownLog, ('DLG id=%s style=%s title=%s | %s'):format(tostring(id), tostring(style), tostring(title), tostring(text):gsub('\n', ' / ')))
        if cp2u(text):find('Управление продажей товаров', 1, true) then ownOpenAt = os.clock() end
        if cp2u(title):find('Снятие со скупки', 1, true) then pcall(ownCancelShow, id, text) end
        if ownOpenAt and os.clock() - ownOpenAt < 600 then
            local u = cp2u(text):gsub('{%x%x%x%x%x%x}', '')
            local nm = u:match('%(%s*(.-)%s*%)')
            if u:find('Введите количество и цену', 1, true) then ownAsk = { name = nm, id = id, t = os.clock() }
            elseif u:find('Введите цену за товар', 1, true) then ownAsk = { name = nm, id = id, single = true, t = os.clock() } end
        end
        if click and openShop and click.type == BUY_T and os.clock() - click.t < 3 and cp2u(title):find('Продажа предмета', 1, true) then
            local u = cp2u(text):gsub('{%x%x%x%x%x%x}', ''):gsub('(%d)[%.,](%d%d%d)', '%1%2'):gsub('(%d)[%.,](%d%d%d)', '%1%2')
            local n = tonumber(u:match('купает:[^%d\n]-(%d+)'))   -- "Игрок покупает:" / "Скупает:"
            -- เก็บหน้าตากล่องไว้ดูในเครื่อง 5 อันแรก (ข้อความไอเทม/จำนวน/ราคาเท่านั้น)
            if dlgSamples < 5 then
                dlgSamples = dlgSamples + 1
                local f = io.open(LOGD .. '\\dlg.log', 'a')
                if f then f:write(os.date('%H:%M:%S '), 'n=', tostring(n), ' | ', (u:gsub('\n', ' / ')), '\n'); f:close() end
            end
            if n then pcall(applyBuyStock, openShop.name, click.slot, n) end
            return
        end
        if not (click and openShop and click.type == SELL_T and os.clock() - click.t < 3) then return end
        if not tostring(title):find(CP_POKUPKA, 1, true) then return end
        local n = stockOf(text)
        if not n and style == 0 then n = 1 end   -- กล่องข้อความไม่มีช่องใส่จำนวน = มีชิ้นเดียว
        if n then pcall(applyStock, openShop.name, click.slot, n) end
    end
end

function onReceivePacket(id, bs)
    local ok, str = pcall(readCefIn, bs)
    pcall(raknetBitStreamResetReadPointer, bs)
    if not ok or not str then return end
    local js = str:match("event%.inventory%.playerInventory'%s*,%s*`(.-)`%s*%)")
    if js then pcall(feedInventory, js) end
end

-- ===== main =====
function main()
    while not isSampAvailable() do wait(100) end
    loadItems(); loadDB(); buildMarket()
    if not fileExists(ITEMS_RES) then wantItems = true end   -- ติดตั้งใหม่: โหลดตารางไอเทมจากเซิร์ฟ

    sampRegisterChatCommand('market', function(arg)
        arg = tostring(arg or ''):gsub('^%s+', ''):gsub('%s+$', '')
        local cmd, rest = arg:match('^(%S+)%s*(.*)$')
        if cmd == 'reload' then loadItems(); loadDB(); buildMarket(); if panelOpen then pushRows() end; msg('reload', #MARKET)
        elseif cmd == 'key' and rest ~= '' then cfg.main.code = rest; profile.connected = true
            saveCfg(); doMe(); if panelOpen then pushProfile() end; msg('keysaved')
        elseif cmd == 'url' and rest ~= '' then cfg.main.url = rest:gsub('/+$', '')
            saveCfg(); msg('urlset', cfg.main.url)
        elseif cmd == 'share' then cfg.main.share = (rest == 'off' or rest == '0') and 0 or 1; cfg.main.shareSet = 1
            saveCfg(); msg('shareset', tonumber(cfg.main.share) == 1 and ct('on') or ct('off'))
        elseif cmd == 'lang' and CL[rest] then lang = rest; cfg.main.lang = rest; renameMarket()
            saveCfg(); if panelOpen then cefEval("if(window.LVM)LVM.lang('" .. rest .. "')") end; msg('langset', rest)
        elseif cmd == 'sync' then doPull(); doSubmit()
        elseif cmd == 'update' then if not upd then upd = { stage = 'manifest' } end
        else panelToggle() end
    end)

    msg('ready')

    local lastSave, lastPull, lastSub, lastInj = os.clock(), 0, 0, -100
    local lastSrvPush = 0
    while true do
        wait(200)
        -- ตัวอ่านหน้าต่างข้อมูลไอเทม: ฝังซ้ำทุก 20 วิ (หน้าเกมโหลดใหม่ได้; ตัว JS กันฝังซ้อนเอง)
        if os.clock() - lastInj > 20 then lastInj = os.clock(); pcall(cefEval, INFO_JS_A) end
        -- ย้ายเซิร์ฟ: ล้างราคาของเซิร์ฟเก่าออกจากจอ แล้วดึง pool ของเซิร์ฟใหม่
        local sk = serverKey()
        if sk ~= '?' and sk ~= curSrv then
            if curSrv then viewSrv = nil; POOL = {}; lastPullAt = 0; pcall(buildMarket); uiDirty = true; wantPull = true
            elseif tonumber(cfg.main.pulled) == 1 then pcall(loadPoolCache, sk) end   -- เพิ่งโหลดสคริปต์: ใช้ข้อมูลที่ดึงไว้ถ้ายังไม่ครบรอบ
            curSrv = sk
        end
        if wantInfo and not netBusy then local v = wantInfo; wantInfo = nil; pcall(doInfo, v) end
        if pending and os.clock() - pending.t > 0.8 then pcall(commit) end
        if dbDirty and os.clock() - lastSave > 10 then pcall(saveDB); lastSave = os.clock() end
        if panelOpen and uiDirty then pcall(pushRows) end
        if wantItem then local v = wantItem; wantItem = nil; if panelOpen then pcall(pushItem, v) end end
        if wantHist and not netBusy then local v = wantHist; wantHist = nil; if panelOpen and v:match('^[%d~et]+$') then pcall(doHist, v) end end
        if oauthState and oauthNextAt and os.clock() >= oauthNextAt and not netBusy then
            oauthNextAt = os.clock() + 3      -- กันยิงซ้ำระหว่างรอผล
            pcall(oauthPollOnce)
        end
        if wantPull and not netBusy and tonumber(cfg.main.pulled) == 1 then wantPull = false; lastPull = os.clock(); pcall(doPull) end
        if wantServers and not netBusy then wantServers = false; pcall(doServers) end
        if wantItems and not netBusy and os.clock() - lastItemsTry > 120 then lastItemsTry = os.clock(); pcall(doItems) end
        if itemsReload then itemsReload = false; itemsAdler = nil; pcall(loadItems); pcall(buildMarket); uiDirty = true end
        if upd and upd.stage ~= 'wait' and not netBusy then local okU, e = pcall(updStep); if not okU then updFail(tostring(e)) end end
        if srvUrl() ~= '' and tostring(cfg.main.code or '') ~= '' then
            if tonumber(cfg.main.pulled) == 1 and os.time() - lastPullAt >= PULL_EVERY and os.clock() - lastPull > 30 then lastPull = os.clock(); pcall(doPull) end
            if not netBusy and os.clock() - lastCfg > 1800 then lastCfg = os.clock(); pcall(doConfig) end
            if panelOpen and os.clock() - (lastSrvPush or 0) > 5 then lastSrvPush = os.clock(); pcall(pushServer) end   -- การ์ดเซิร์ฟ (หน้าเพิ่งโหลดก็ได้ข้อมูล)
            if os.clock() - lastSub > 90 then lastSub = os.clock(); pcall(doSubmit) end
        end
    end
end

function onScriptTerminate(s)
    if s == thisScript() then
        if panelOpen then pcall(panelHide) end
        if dbDirty then pcall(saveDB) end
    end
end
