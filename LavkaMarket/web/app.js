/* LavkaMarket CEF UI  (window.LVM)
   หน้าเว็บที่ฝังเข้า CEF ของเกม: หน้าล็อกอิน Discord + หน้าราคา
   Lua -> page:  LVM.show(lang) / LVM.hide() / LVM.lang(c) / LVM.profile(json) / LVM.chunk(s)+LVM.recv() / LVM.status(t)
   page -> Lua:  cef.SendMessage('lvm|connect:<code>' | 'lvm|close' | 'lvm|lang:<c>' | 'lvm|sync')               */
(function () {
  var ICON = 'https://cdn.azresources.cloud/projects/arizona-rp/assets/images/donate/128/';
  var S = { rows: [], lang: 'th', profile: null, query: '', buf: '', status: '', fav: {}, page: 0 };
  var LOGO = 'data:image/png;base64,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';
  var PAGE = 15;   // การ์ดต่อหน้า (5 ต่อแถว x 3 แถว พอดีกล่อง)
  try { S.fav = JSON.parse(localStorage.getItem('lvmFav') || '{}') || {}; } catch (e) {}
  function saveFav() { try { localStorage.setItem('lvmFav', JSON.stringify(S.fav)); } catch (e) {} }
  // โหมด: 'buy' = ฉันจะซื้อ (เห็นแค่ร้านขาย) / 'sell' = ฉันจะขาย (เห็นแค่ร้านรับซื้อ)
  // ไม่มีหน้าไหนวางสองฝั่งคู่กัน = ไม่เป็นเครื่องมือล่าส่วนต่างราคา
  S.mode = 'buy';
  // ฝั่งร้านรับซื้อ: ปิดไว้ก่อน (ยังรับ/เก็บข้อมูลตามปกติที่หลังบ้าน แค่ไม่แสดง) — เปิดกลับ = true
  var SELL_ON = false;
  var BUY_FEE = 0.02;   // ค่าธรรมเนียมฝั่งรับซื้อ 2% (ตามจริงของเซิร์ฟ) — เส้นเขียว = ราคารับซื้อ × 0.98
  // หมวดไอเทมตามประเภทของเกม (ITEM_TYPE_* จากหน้า UI ของเกม) รวมเป็นกลุ่มแบบในเกม
  var CATS = [
    { id: 'acc', ico: 'acc', ty: [3, 6, 73, 75], n: { th: 'อุปกรณ์เสริม', ru: 'Аксессуары', en: 'Accessories' } },
    { id: 'skin', ico: 'skin', ty: [10, 30, 71, 19], n: { th: 'สกิน', ru: 'Скины', en: 'Skins' } },
    { id: 'clothes', ico: 'clothes', ty: [12], n: { th: 'เสื้อผ้า', ru: 'Одежда', en: 'Clothes' } },
    { id: 'veh', ico: 'veh', ty: [2, 68], n: { th: 'ยานพาหนะ', ru: 'Транспорт', en: 'Vehicles' } },
    { id: 'tuning', ico: 'tuning', ty: [4, 7, 23, 24, 49, 55, 57, 77, 81], n: { th: 'จูนรถ', ru: 'Тюнинг', en: 'Tuning' } },
    { id: 'gun', ico: 'gun', ty: [9, 38, 41, 44, 50, 78, 79], n: { th: 'อาวุธ', ru: 'Оружие', en: 'Weapons' } },
    { id: 'improv', ico: 'improv', ty: [8, 20, 22, 32, 48, 59, 65, 66, 67], n: { th: 'อัปเกรด/ตีบวก', ru: 'Улучшения', en: 'Upgrades' } },
    { id: 'box', ico: 'box', ty: [0, 1, 25, 27, 33, 60, 74, 76], n: { th: 'กล่อง/รูเล็ต', ru: 'Ящики и рулетки', en: 'Boxes & roulettes' } },
    { id: 'food', ico: 'food', ty: [14, 31, 35, 36, 37, 40, 42, 51, 70, 72], n: { th: 'อาหาร/ยา', ru: 'Еда и аптечки', en: 'Food & meds' } },
    { id: 'prop', ico: 'prop', ty: [21], n: { th: 'อสังหา/แต่งบ้าน', ru: 'Недвижимость', en: 'Property' } },
    { id: 'other', ico: 'other', ty: [], n: { th: 'อื่น ๆ', ru: 'Другое', en: 'Other' } }
  ];
  var CAT_OF = {};
  for (var ci0 = 0; ci0 < CATS.length; ci0++) for (var cj0 = 0; cj0 < CATS[ci0].ty.length; cj0++) CAT_OF[CATS[ci0].ty[cj0]] = CATS[ci0].id;
  S.catOv = {};   // แก้หมวดรายชิ้นจากเซิร์ฟเวอร์ (/config)
  function catOf(r) { return (r && S.catOv[r.base]) || (r && r.ty != null && CAT_OF[r.ty]) || 'other'; }
  function catName(c) { return c.n[S.lang] || c.n.en; }
  S.cat = 'all'; S.catOpen = true;
  try { if (localStorage.getItem('lvmCatOpen') === '0') S.catOpen = false; } catch (e) {}
  try { var sc0 = localStorage.getItem('lvmCat'); if (sc0) S.cat = sc0; } catch (e) {}
  try { if (SELL_ON && localStorage.getItem('lvmMode') === 'sell') S.mode = 'sell'; } catch (e) {}
  function sideOf(r) { return S.mode === 'sell' ? (r.buy ? r.nb || 1 : 0) : (r.sell ? r.ns || 1 : 0); }

  var T = {
    th: { title: 'LavkaMarket', sub: 'ตลาดกลางของผู้เล่น', login_h: 'เข้าสู่ระบบด้วย Discord',
          login_t: 'รับรหัสจากบอทในดิสคอร์ดของเรา แล้ววางด้านล่าง',
          code_ph: 'วางรหัสจากบอท เช่น LVKA-XXXX-XXXX', connect: 'เชื่อมต่อ', connecting: 'กำลังเชื่อม...',
          consent: 'เมื่อเชื่อมต่อ = ยินยอมแชร์เฉพาะข้อมูลตลาด (ราคา/จำนวน/ชื่อร้าน) ไม่ส่งข้อมูลส่วนตัว',
          search: 'ค้นหาไอเทม...', buy: 'ซื้อถูกสุด', sell: 'รับซื้อแพงสุด', none: 'ยังไม่มีข้อมูล เดินเปิดดูร้านในตลาด',
          logout: 'ออก', count: 'ไอเทม', empty_price: '-', buy_s: 'ซื้อ', sell_s: 'ขาย', profit: 'กำไร', nosell: 'ไม่มีขาย',
          srv_old: 'ข้อมูลเก่า', n_sell: 'ร้านขาย', n_buy2: 'ร้านรับซื้อ', view_all: 'ดูร้านทั้งหมด', loading: 'กำลังโหลด…', no_sellers: 'ยังไม่เห็นร้านขาย', no_buyers: 'ยังไม่เห็นร้านรับซื้อ', col_shop: 'ร้าน', col_price: 'ราคา', col_qty: 'จำนวน', col_seen: 'เห็นล่าสุด', n_buy: 'ร้านรับ', med: 'กลาง', only_buy: 'ไม่มีคนขาย · ร้านรับซื้อราคานี้', shops: 'ร้าน',
          pull_t: 'ดึงข้อมูลตลาดจากกองกลาง', pull_h: 'ราคาจากผู้เล่น LavkaMarket ในเซิร์ฟนี้ แชร์เฉพาะข้อมูลตลาด (ราคา จำนวน ชื่อร้าน) ไม่มีข้อมูลส่วนตัว', pull_btn: 'เริ่มดึงข้อมูล', pull_run: 'กำลังดึงข้อมูลจากกองกลาง…', pull_ok: 'ได้ข้อมูลแล้ว', pull_shops: 'ร้าน', pull_err: 'ดึงไม่สำเร็จ ลองใหม่อีกครั้ง', pull_retry: 'ลองใหม่', pull_now: 'กดเพื่อดึงข้อมูลตอนนี้', pull_busy: 'กำลังดึง…', pull_wait: 'ยังไม่ได้ดึง', ago_now: 'เมื่อกี้', ago_m: 'นาทีที่แล้ว', ago_h: 'ชม.ที่แล้ว', ago_d: 'วันที่แล้ว', st_sell: 'มีคนขาย', st_buy: 'มีร้านรับซื้อ', mode_buy: 'ฉันจะซื้อ', tab_home: 'หน้าแรก', tab_market: 'ตลาด', hello: 'สวัสดี', home_sub: 'วันนี้จะซื้อหรือจะขาย? เลือกด้านล่างได้เลย', recent: 'เพิ่งเห็นล่าสุด', updated: 'อัปเดต', home_tip: 'ราคาทั้งหมดมาจากผู้เล่นที่ใช้ LavkaMarket เดินเปิดดูแผงร้านในเกม แชร์เฉพาะข้อมูลตลาด (ราคา จำนวน ชื่อร้าน) ไม่มีข้อมูลส่วนตัว ยิ่งคนเปิดร้านเยอะ ราคายิ่งสด', hist_title: 'ประวัติราคา 30 วัน', hist_none: 'ยังไม่มีประวัติราคาของไอเทมนี้', hist_low: 'ต่ำสุด', hist_high: 'สูงสุด', hist_last: 'ล่าสุด', hist_lo_s: 'ราคาขายถูกสุด', hist_hi_b: 'ราคารับซื้อสูงสุด', hist_hi_b_fee: 'ราคารับซื้อสูงสุด (หลังหักค่าธรรมเนียม)', k_best_s: 'ขายถูกสุดตอนนี้', k_best_b: 'รับซื้อสูงสุดตอนนี้', k_srv: 'มีในเซิร์ฟ', info_title: 'ข้อมูลไอเทม', info_none: 'ยังไม่มีข้อมูลของไอเทมนี้ — เปิดหน้าต่าง "ข้อมูลไอเทม" ในเกมหนึ่งครั้ง แล้วจะแสดงที่นี่', info_bonus: 'ใส่แล้วได้', info_up: 'เมื่ออัปเกรด', info_desc: 'รายละเอียด', col_lvl: 'ตีบวก/ระดับ', n_lvls: 'ระดับ', brand_sub: 'ตลาดแผงร้าน', sec_main: 'หน้าหลัก', sec_mkt: 'ข้อมูลตลาด', sec_buy: 'ซื้อ', sec_market: 'มาร์เก็ต', cat_all: 'ทั้งหมด', m_disc: 'เชื่อมต่อผ่าน Discord', m_sec_app: 'แอป', m_sec_set: 'ตั้งค่า', m_ver: 'เวอร์ชัน', m_latest: 'เป็นเวอร์ชันล่าสุดแล้ว', m_new: 'มีเวอร์ชันใหม่', m_get: 'อัปเดต', m_sync: 'ดึงข้อมูลตลาดตอนนี้', m_sync_h: 'ปกติดึงเองทุก 10 นาที', u_check: 'กำลังตรวจเวอร์ชัน…', u_dl: 'กำลังดาวน์โหลด', u_done: 'อัปเดตแล้ว กำลังโหลดใหม่…', u_err: 'อัปเดตไม่สำเร็จ กดเพื่อลองใหม่', m_share: 'แชร์ข้อมูลตลาด', m_share_h: 'ส่งราคา/จำนวน/ชื่อร้านที่คุณเปิดดู เข้ากองกลาง', m_discord: 'Discord ของ LavkaMarket', m_logout: 'ออกจากระบบ', m_logout_q: 'ออกจากระบบใช่ไหม?', m_logout_h: 'ต้องเข้าสู่ระบบด้วย Discord ใหม่อีกครั้ง', m_cancel: 'ยกเลิก', sec_sell: 'ขาย', nav_buy: 'ร้านที่ขาย', nav_sell: 'ร้านรับซื้อ', srv_next: 'อัปเดตถัดไป', srv_upd: 'อัปเดตข้อมูลล่าสุด', srv_last: 'ล่าสุด', srv_shops: 'ร้านในพูล', min_u: 'นาที', uw_title: 'อัปเดต LavkaMarket', uw_new: 'มีอะไรใหม่', uw_files: 'ไฟล์ที่จะอัปเดต', uw_go: 'อัปเดตเลย', uw_later: 'ไว้ทีหลัง', uw_close: 'ปิด', uw_retry: 'ลองใหม่', uw_wait: 'รอคิว', uw_dl: 'กำลังดาวน์โหลด…', uw_ok: 'ตรวจแล้ว', uw_inst: 'กำลังติดตั้ง…', uw_done_f: 'เสร็จ', uw_done: 'อัปเดตเสร็จแล้ว กำลังโหลดสคริปต์ใหม่…', uw_err: 'อัปเดตไม่สำเร็จ', uw_latest: 'คุณใช้เวอร์ชันล่าสุดแล้ว', uw_nonotes: 'ปรับปรุงและแก้ไขเล็กน้อย', m_history: 'ประวัติเวอร์ชัน', clog_title: 'ประวัติเวอร์ชัน', clog_sub: 'การเปลี่ยนแปลงทุกเวอร์ชัน', clog_load: 'กำลังโหลด…', srv_n: 'ร้าน', srv_pick: 'ดูตลาดเซิร์ฟเวอร์', srv_mine: 'เซิร์ฟคุณ', srv_back: 'กลับตลาดเซิร์ฟของฉัน', srv_load: 'กำลังโหลด…', srv_none: 'ยังไม่มีเซิร์ฟอื่นที่มีข้อมูล', srv_viewing: 'กำลังดูตลาดเซิร์ฟอื่น', srv_wait: 'รอข้อมูลเซิร์ฟเวอร์…', sort_by: 'เรียง:', sort_shops: 'ร้านเยอะสุด', sort_new: 'อัปเดตล่าสุด', sort_name: 'ชื่อ A–Z', by_lvl: 'แยกตามระดับ', rng_h: '3 วัน (รายชั่วโมง)', rng_d: '90 วัน (รายวัน)', hist: 'ประวัติราคา', more: 'เพิ่มเติม ▾', less: 'ย่อ ▴', hist_none_h: 'ยังไม่มีข้อมูลรายชั่วโมง (เริ่มเก็บแล้ว)', lv_hint: 'กดชิปด้านบนเพื่อเน้นเส้น', lv_avg: 'กลาง', lv_avg30: 'กลาง 30 วัน', piece_s: 'ชิ้นที่ร้านนี้ขาย ·', piece_b: 'ร้านนี้รับซื้อ ·', mode_buy_h: 'ดูร้านที่ขาย', mode_sell: 'ฉันจะขาย', mode_sell_h: 'ดูร้านที่รับซื้อ', of: 'จาก', shown: 'แสดง',
          err_server: 'ยังไม่ได้ตั้งเซิร์ฟเวอร์ (พิมพ์ /lm url <ที่อยู่> ในเกม)', err_bad: 'รหัสไม่ถูกต้องหรือถูกแบน', err_full: 'คีย์นี้ถูกใช้กับตัวละครครบจำนวนแล้ว (กันแชร์คีย์)', checking: 'กำลังตรวจรหัส...',
          need_login: 'ต้องเข้าสู่ระบบก่อน', need_sub: 'เข้าสู่ระบบเพื่อเปิดตลาดกลาง LavkaMarket', code_title: 'ใส่รหัสเข้าใช้', back: 'ย้อนกลับ', opening: 'กำลังเปิด Discord...', have_key: 'มีคีย์อยู่แล้ว? ใส่คีย์', or: 'หรือ', waiting: 'กำลังรอยืนยันใน Discord…', err_oauth: 'ยืนยัน Discord ไม่สำเร็จ ลองใหม่', err_member: 'ยังไม่ได้เข้าเซิร์ฟเวอร์ Discord — เปิดลิงก์เชิญให้แล้ว', err_oauth_off: 'เซิร์ฟเวอร์ยังไม่เปิด OAuth ใช้คีย์แทน', err_join: 'เปิดลิงก์เชิญให้แล้ว — เข้าร่วมเซิร์ฟ แล้วรอสักครู่ จะเข้าเองอัตโนมัติ' },
    ru: { title: 'LavkaMarket', sub: 'общий рынок игроков', login_h: 'Вход через Discord',
          login_t: 'Получите код у бота в нашем Discord и вставьте ниже',
          code_ph: 'Вставьте код, напр. LVKA-XXXX-XXXX', connect: 'Подключить', connecting: 'Подключение...',
          consent: 'Подключаясь = согласие делиться только рыночными данными (цена/кол-во/лавка). Личные данные не отправляются',
          search: 'Поиск предмета...', buy: 'дешевле всего', sell: 'скупка дороже', none: 'Нет данных. Откройте лавки на рынке',
          logout: 'Выход', count: 'предметов', empty_price: '-', buy_s: 'купить', sell_s: 'продать', profit: 'профит', nosell: 'нет в продаже',
          srv_old: 'данные устарели', n_sell: 'продают', n_buy2: 'скупают', view_all: 'все лавки', loading: 'загрузка…', no_sellers: 'продавцов не видно', no_buyers: 'скупщиков не видно', col_shop: 'лавка', col_price: 'цена', col_qty: 'кол-во', col_seen: 'видели', n_buy: 'скупка', med: 'медиана', only_buy: 'никто не продаёт · скупают по этой цене', shops: 'лавок',
          pull_t: 'Загрузить рынок из общей базы', pull_h: 'Цены от игроков LavkaMarket на этом сервере. Только рыночные данные (цена, кол-во, лавка), без личных данных', pull_btn: 'Загрузить данные', pull_run: 'Загружаем данные из общей базы…', pull_ok: 'Готово', pull_shops: 'лавок', pull_err: 'Не удалось загрузить. Попробуйте снова', pull_retry: 'Повторить', pull_now: 'Нажмите, чтобы обновить сейчас', pull_busy: 'загрузка…', pull_wait: 'не загружено', ago_now: 'только что', ago_m: 'мин назад', ago_h: 'ч назад', ago_d: 'дн назад', st_sell: 'в продаже', st_buy: 'есть скупка', mode_buy: 'Хочу купить', tab_home: 'Главная', tab_market: 'Рынок', hello: 'Привет', home_sub: 'Покупаете или продаёте? Выберите ниже', recent: 'Недавно замечено', updated: 'обновлено', home_tip: 'Все цены собирают игроки LavkaMarket, открывая лавки в игре. Передаются только рыночные данные (цена, кол-во, лавка), без личных данных. Чем больше лавок открыто, тем свежее цены', hist_title: 'История цены за 30 дней', hist_none: 'Истории цены пока нет', hist_low: 'мин', hist_high: 'макс', hist_last: 'последняя', hist_lo_s: 'мин. цена продажи', hist_hi_b: 'макс. цена скупки', hist_hi_b_fee: 'макс. скупка (после комиссии)', k_best_s: 'Мин. цена сейчас', k_best_b: 'Макс. скупка сейчас', k_srv: 'На сервере', info_title: 'О предмете', info_none: 'Нет данных о предмете — откройте «Информация о предмете» в игре один раз, и она появится здесь', info_bonus: 'Даёт при надевании', info_up: 'При улучшении', info_desc: 'Описание', col_lvl: 'Улучш./ур.', n_lvls: 'уровн.', brand_sub: 'рынок лавок', sec_main: 'Главное', sec_mkt: 'Рынок', sec_buy: 'Покупка', sec_market: 'Маркет', cat_all: 'Все товары', m_disc: 'Вход через Discord', m_sec_app: 'Приложение', m_sec_set: 'Настройки', m_ver: 'Версия', m_latest: 'Последняя версия', m_new: 'Доступна версия', m_get: 'Обновить', m_sync: 'Обновить рынок сейчас', m_sync_h: 'Автоматически каждые 10 минут', u_check: 'Проверка версии…', u_dl: 'Загрузка', u_done: 'Обновлено, перезагрузка…', u_err: 'Ошибка обновления, нажмите ещё раз', m_share: 'Делиться данными рынка', m_share_h: 'Цены/кол-во/лавки, которые вы открыли, уходят в общий пул', m_discord: 'Discord LavkaMarket', m_logout: 'Выйти', m_logout_q: 'Выйти из аккаунта?', m_logout_h: 'Нужно будет снова войти через Discord', m_cancel: 'Отмена', sec_sell: 'Продажа', nav_buy: 'Продают', nav_sell: 'Скупают', srv_next: 'Обновление через', srv_upd: 'Данные обновлены', srv_last: 'последнее', srv_shops: 'Лавок в базе', min_u: 'мин', uw_title: 'Обновление LavkaMarket', uw_new: 'Что нового', uw_files: 'Файлы обновления', uw_go: 'Обновить', uw_later: 'Позже', uw_close: 'Закрыть', uw_retry: 'Повторить', uw_wait: 'в очереди', uw_dl: 'загрузка…', uw_ok: 'проверено', uw_inst: 'установка…', uw_done_f: 'готово', uw_done: 'Обновлено, перезагрузка скрипта…', uw_err: 'Не удалось обновить', uw_latest: 'У вас последняя версия', uw_nonotes: 'Улучшения и исправления', m_history: 'История версий', clog_title: 'История версий', clog_sub: 'Изменения по всем версиям', clog_load: 'Загрузка…', srv_n: 'лавок', srv_pick: 'Рынок сервера', srv_mine: 'Ваш сервер', srv_back: 'Вернуться к своему серверу', srv_load: 'Загрузка…', srv_none: 'Других серверов с данными пока нет', srv_viewing: 'Вы смотрите рынок другого сервера', srv_wait: 'Ожидание данных…', sort_by: 'Сортировка:', sort_shops: 'Больше лавок', sort_new: 'Недавние', sort_name: 'Имя A–Я', by_lvl: 'По уровням', rng_h: '3 дня (по часам)', rng_d: '90 дней (по дням)', hist: 'История цены', more: 'ещё ▾', less: 'свернуть ▴', hist_none_h: 'Почасовых данных пока нет (сбор начат)', lv_hint: 'нажмите уровень сверху, чтобы выделить линию', lv_avg: 'медиана', lv_avg30: 'медиана 30 дн.', piece_s: 'Предмет в лавке ·', piece_b: 'Скупка в лавке ·', mode_buy_h: 'лавки, которые продают', mode_sell: 'Хочу продать', mode_sell_h: 'лавки, которые скупают', of: 'из', shown: 'показано',
          err_server: 'Сервер не задан (в игре: /lm url <адрес>)', err_bad: 'Неверный или заблокированный код', err_full: 'Ключ уже используется на максимуме персонажей', checking: 'Проверка кода...',
          need_login: 'Требуется вход', need_sub: 'Войдите, чтобы открыть рынок LavkaMarket', code_title: 'Введите код доступа', back: 'назад', opening: 'Открываю Discord...', have_key: 'Уже есть код? Ввести', or: 'или', waiting: 'Ожидание подтверждения в Discord…', err_oauth: 'Вход через Discord не удался', err_member: 'Вы не в нашем Discord — открываю приглашение', err_oauth_off: 'OAuth выключен — введите код', err_join: 'Приглашение открыто — вступите на сервер, вход произойдёт сам' },
    en: { title: 'LavkaMarket', sub: 'players’ shared market', login_h: 'Sign in with Discord',
          login_t: 'Get a code from the bot in our Discord and paste it below',
          code_ph: 'Paste your code, e.g. LVKA-XXXX-XXXX', connect: 'Connect', connecting: 'Connecting...',
          consent: 'Connecting = you agree to share market data only (price/count/shop). No personal data is sent',
          search: 'Search item...', buy: 'cheapest', sell: 'highest buy', none: 'No data yet. Open stalls in the market',
          logout: 'Sign out', count: 'items', empty_price: '-', buy_s: 'buy', sell_s: 'sell', profit: 'profit', nosell: 'no sellers',
          srv_old: 'stale data', n_sell: 'selling', n_buy2: 'buying', view_all: 'all shops', loading: 'loading…', no_sellers: 'no sellers seen', no_buyers: 'no buyers seen', col_shop: 'shop', col_price: 'price', col_qty: 'qty', col_seen: 'seen', n_buy: 'buyer', med: 'median', only_buy: 'no sellers · buyers pay this', shops: 'shops',
          pull_t: 'Load market data from the pool', pull_h: 'Prices from LavkaMarket players on this server. Market data only (price, amount, shop name), nothing personal', pull_btn: 'Load data', pull_run: 'Loading data from the pool…', pull_ok: 'Done', pull_shops: 'shops', pull_err: "Couldn't load. Try again", pull_retry: 'Try again', pull_now: 'Click to refresh now', pull_busy: 'loading…', pull_wait: 'not loaded', ago_now: 'just now', ago_m: 'min ago', ago_h: 'h ago', ago_d: 'd ago', st_sell: 'on sale', st_buy: 'has buyers', mode_buy: 'I want to buy', tab_home: 'Home', tab_market: 'Market', hello: 'Hello', home_sub: 'Buying or selling today? Pick below', recent: 'Recently seen', updated: 'updated', home_tip: 'All prices come from LavkaMarket players opening stalls in game. Only market data is shared (price, qty, shop name), no personal data. The more stalls opened, the fresher the prices', hist_title: '30-day price history', hist_none: 'No price history for this item yet', hist_low: 'low', hist_high: 'high', hist_last: 'latest', hist_lo_s: 'lowest sell price', hist_hi_b: 'highest buy price', hist_hi_b_fee: 'highest buy (after fee)', k_best_s: 'Lowest price now', k_best_b: 'Highest buy now', k_srv: 'On server', info_title: 'Item info', info_none: 'No info for this item yet — open the in-game "Item info" window once and it will show here', info_bonus: 'Gives when worn', info_up: 'When upgraded', info_desc: 'Description', col_lvl: 'Upgrade/tier', n_lvls: 'levels', brand_sub: 'shop market', sec_main: 'Main', sec_mkt: 'Market', sec_buy: 'Buy', sec_market: 'Market', cat_all: 'All items', m_disc: 'Signed in with Discord', m_sec_app: 'App', m_sec_set: 'Settings', m_ver: 'Version', m_latest: 'You are up to date', m_new: 'New version', m_get: 'Update', m_sync: 'Refresh market now', m_sync_h: 'Refreshes every 10 minutes by itself', u_check: 'Checking version…', u_dl: 'Downloading', u_done: 'Updated, reloading…', u_err: 'Update failed, tap to retry', m_share: 'Share market data', m_share_h: 'Prices/counts/shop names you open go to the shared pool', m_discord: 'LavkaMarket Discord', m_logout: 'Log out', m_logout_q: 'Log out?', m_logout_h: 'You will need to sign in with Discord again', m_cancel: 'Cancel', sec_sell: 'Sell', nav_buy: 'Sellers', nav_sell: 'Buyers', srv_next: 'Next update', srv_upd: 'Data updated', srv_last: 'last', srv_shops: 'Shops in pool', min_u: 'min', uw_title: 'Update LavkaMarket', uw_new: "What's new", uw_files: 'Files to update', uw_go: 'Update now', uw_later: 'Later', uw_close: 'Close', uw_retry: 'Retry', uw_wait: 'waiting', uw_dl: 'downloading…', uw_ok: 'verified', uw_inst: 'installing…', uw_done_f: 'done', uw_done: 'Updated, reloading the script…', uw_err: 'Update failed', uw_latest: 'You have the latest version', uw_nonotes: 'Improvements and fixes', m_history: 'Version history', clog_title: 'Version history', clog_sub: 'Changes across all versions', clog_load: 'Loading…', srv_n: 'shops', srv_pick: 'Server market', srv_mine: 'Your server', srv_back: 'Back to my server', srv_load: 'Loading…', srv_none: 'No other servers with data yet', srv_viewing: 'Viewing another server', srv_wait: 'Waiting for server…', sort_by: 'Sort:', sort_shops: 'Most shops', sort_new: 'Recently updated', sort_name: 'Name A–Z', by_lvl: 'By level', rng_h: '3 days (hourly)', rng_d: '90 days (daily)', hist: 'Price history', more: 'more ▾', less: 'less ▴', hist_none_h: 'No hourly data yet (now collecting)', lv_hint: 'click a level above to highlight its line', lv_avg: 'median', lv_avg30: '30-day median', piece_s: 'Piece sold by ·', piece_b: 'Bought by ·', mode_buy_h: 'shops selling', mode_sell: 'I want to sell', mode_sell_h: 'shops buying', of: 'of', shown: 'shown',
          err_server: 'Server not set (in game: /lm url <address>)', err_bad: 'Invalid or banned code', err_full: 'This key is used on the max number of characters', checking: 'Checking code...',
          need_login: 'Login required', need_sub: 'Sign in to open the LavkaMarket', code_title: 'Enter your access code', back: 'back', opening: 'Opening Discord...', have_key: 'Already have a key? Enter it', or: 'or', waiting: 'Waiting for Discord confirmation…', err_oauth: 'Discord sign-in failed, try again', err_member: 'You are not in our Discord — opening invite', err_oauth_off: 'OAuth is off — use a key instead', err_join: 'Invite opened — join the server, you will be logged in automatically' }
  };
  function tr(k) { return (T[S.lang] && T[S.lang][k]) || T.en[k] || k; }
  function send(m) { try { window.cef.SendMessage(m, 0); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { n = Math.floor(+n || 0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function shortK(n) { n = +n || 0; if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'b'; if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'm'; if (n >= 1e3) return Math.round(n / 1e3) + 'k'; return String(n); }

  var DPATH = 'M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5a14 14 0 0 1 4.3 2.1A14 14 0 0 0 4.6 5.6 14 14 0 0 1 9 3.5L8.7 3a19.8 19.8 0 0 0-5 1.4A20.4 20.4 0 0 0 .1 18a19.9 19.9 0 0 0 6 3l.8-1.1a13 13 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4a13 13 0 0 1-2 1l.8 1.1a19.9 19.9 0 0 0 6-3 20.4 20.4 0 0 0-3.4-13.6zM8.3 14.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z';
  function discordSvg(color) { return '<svg viewBox="0 0 24 24" width="22" height="22" fill="' + color + '"><path d="' + DPATH + '"/></svg>'; }
  var DISCORD_SVG = discordSvg('#fff');
  var LOCK_SVG = '<svg class="lvmLock" viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#7b8498" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><circle cx="12" cy="15.5" r="1.3" fill="#7b8498" stroke="none"/></svg>';

  function css() {
    return '#lvmRoot,#lvmRoot *{box-sizing:border-box;margin:0;font-family:"Segoe UI",Tahoma,Arial,sans-serif}' +
      '#lvmRoot{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(6,8,14,.86);color:#e7ecf3}' +   /* ไม่ใช้ backdrop-filter:blur - เกมเรนเดอร์สดข้างหลังทำให้กระพริบทุกเฟรม */
      '#lvmRoot.lvmIntro{animation:lvmFade .18s ease}' +
      '@keyframes lvmFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes lvmIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}' +
      '@keyframes lvmMenuIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}' +
      '@keyframes lvmSpin{to{transform:rotate(360deg)}}' +
      '.lvmSpin{width:17px;height:17px;border-radius:50%;border:2.5px solid rgba(88,101,242,.3);border-top-color:#5865F2;animation:lvmSpin .7s linear infinite;flex:none}' +
      '.lvmDWhite.busy{cursor:default;opacity:.92}' +
      '#lvmRoot.lvmIntro .lvmCard,#lvmRoot.lvmIntro .lvmPanel{animation:lvmIn .24s cubic-bezier(.2,.75,.3,1)}' +
      '#lvmRoot.lvmIntro .lvmLogin2{animation:lvmFade .22s ease}' +
      '.lvmCard{position:relative;width:420px;max-width:92vw;background:#111521;border:1px solid #232a3a;border-radius:18px;' +
      'box-shadow:0 24px 70px rgba(0,0,0,.6)}' +
      '.lvmLogin{padding:30px 28px;text-align:center}' +
      '#lvmRoot .lvmCard{width:440px;overflow:visible;background:#0e121b;border-color:#222a3a}' +
      '.lvmLHead{display:flex;align-items:center;gap:11px;padding:14px 16px;border-bottom:1px solid #1d2432;background:#0c1018;border-radius:18px 18px 0 0}' +
      '.lvmLHead>img{width:38px;height:38px;border-radius:10px;flex:none}' +
      '.lvmLBrand{flex:1;min-width:0;text-align:left}.lvmLBrand b{display:block;font-size:17px;font-weight:800;color:#eef1f6;letter-spacing:.2px}.lvmLBrand b span{color:#00b4d8}.lvmLBrand small{display:block;font-size:11.5px;color:#5d6578;margin-top:1px}' +
      '#lvmRoot .lvmLHead .lvmLoginLang{position:static}' +
      '.lvmLogin2{padding:30px 34px 22px;text-align:center;display:flex;flex-direction:column;align-items:center}' +
      '.lvmLock{width:64px;height:64px;padding:16px;border-radius:50%;background:rgba(88,101,242,.12);box-shadow:0 0 0 1px rgba(88,101,242,.25);margin:0 0 16px;box-sizing:border-box}' +
      '.lvmLock rect,.lvmLock path{stroke:#8f99ff}.lvmLock circle{fill:#8f99ff}' +
      '.lvmLTitle{font-size:19px;font-weight:800;color:#eef1f6}' +
      '.lvmLSub{font-size:13px;color:#8a93a6;margin-top:7px;line-height:1.55;max-width:320px}#lvmRoot .lvmLogin2 .lvmDWhite,#lvmRoot .lvmLogin2 .lvmIn{margin-top:22px}#lvmRoot .lvmLogin2 .lvmGo{margin-top:10px}' +
      '.lvmDWhite{margin-top:24px;background:#5865F2;color:#fff;border:0;width:100%;padding:13px;border-radius:12px;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-shadow:0 6px 18px rgba(88,101,242,.3)}' +
      '.lvmDWhite:hover{background:#6873f5}.lvmDWhite.busy{background:#2a2f55;box-shadow:none;cursor:default}' +
      '.lvmDWhite .lvmSpin{border-color:rgba(255,255,255,.3);border-top-color:#fff}' +
      '.lvmOr{width:100%;display:flex;align-items:center;gap:10px;margin:6px 0 12px;color:#5d6578;font-size:11.5px}.lvmOr:before,.lvmOr:after{content:"";flex:1;height:1px;background:#1f2636}' +
      '.lvmBack{margin-top:14px;color:#8b93a4;font-size:13px;cursor:pointer}.lvmBack:hover{color:#cfd6e2}' +
      '.lvmHaveKey{width:100%;box-sizing:border-box;padding:11px;border-radius:12px;border:1px solid #2b3346;background:#121722;color:#cfd6e2;font-size:13.5px;font-weight:600;cursor:pointer}.lvmHaveKey:hover{border-color:#00b4d8;color:#fff}' +
      '.lvmLogo{font-size:24px;font-weight:800;letter-spacing:.5px}.lvmLogo span{color:#00b4d8}' +
      '.lvmSub{color:#8b93a4;font-size:13px;margin-top:4px}' +
      '.lvmDbtn{margin:20px 0 10px;background:#5865F2;border:0;color:#fff;width:100%;padding:12px;border-radius:11px;' +
      'font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:default}' +
      '.lvmHint{color:#9aa3b4;font-size:12.5px;line-height:1.5;margin:6px 2px 14px}' +
      '.lvmIn{width:100%;padding:12px 13px;border-radius:11px;border:1px solid #2b3346;background:#0c1017;color:#fff;font-size:14px;outline:0}' +
      '.lvmIn:focus{border-color:#00b4d8}' +
      '.lvmGo{margin-top:12px;width:100%;padding:12px;border:0;border-radius:11px;background:#00b4d8;color:#04121a;font-weight:800;font-size:15px;cursor:pointer;transition:background .12s,transform .08s}' +
      '.lvmGo:hover{background:#28c6e8}.lvmGo:active{transform:scale(.98)}.lvmDWhite:active{transform:scale(.98)}' +
      '.lvmDWhite{transition:background .12s,transform .08s}.lvmX{transition:color .1s}.lvmProf{transition:background .12s}.lvmStar{transition:color .1s}' +
      '.lvmErr{color:#e24b4a;font-size:12.5px;margin-top:9px;min-height:15px;text-align:center}' +
      '.lvmConsent{display:flex;align-items:flex-start;gap:9px;text-align:left;color:#6f7a8c;font-size:11.5px;line-height:1.5;padding:12px 18px;border-top:1px solid #1d2432;background:#0c1018;border-radius:0 0 18px 18px}.lvmConsent svg{flex:none;margin-top:1px}' +
      '.lvmLangDd{position:relative;user-select:none}' +
      '.lvmLangCur{display:flex;align-items:center;gap:9px;padding:6px 11px;border-radius:10px;border:1px solid #2b3346;background:#0c1017;cursor:pointer;color:#e7ecf3}' +
      '.lvmLangCur:hover{border-color:#3a4458}.lvmLangCur b{font-size:13px;font-weight:700;letter-spacing:.5px}' +
      '.lvmCaret{font-size:9px;color:#8b93a4;margin-left:1px}' +
      '.lvmFlag{width:24px;height:18px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.08)}' +
      '.lvmLangMenu{position:absolute;top:calc(100% + 7px);right:0;background:#141a27;border:1px solid #2b3346;border-radius:12px;padding:6px;min-width:168px;box-shadow:0 14px 34px rgba(0,0,0,.55);display:none;z-index:20}' +
      '.lvmLangMenu.open{display:block;animation:lvmMenuIn .15s ease}' +
      '.lvmLangOpt{transition:background .1s}' +
      '.lvmLangOpt{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:9px;cursor:pointer;white-space:nowrap}' +
      '.lvmLangOpt b{font-size:13px;font-weight:700;letter-spacing:.5px;min-width:24px;color:#e7ecf3}' +
      '.lvmLName{font-size:13px;color:#8b93a4}' +
      '.lvmLangOpt:hover{background:#1b2230}.lvmLangOpt.on{background:#13324a}.lvmLangOpt.on b,.lvmLangOpt.on .lvmLName{color:#7fd3ff}' +
      '.lvmLoginLang{position:absolute;top:14px;right:14px;z-index:5}' +
      /* market */
      '.lvmPanel{position:relative;width:1240px;max-width:96vw;height:88vh;background:#0e121b;border:1px solid #222a3a;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.6)}' +
      '.lvmTop{display:flex;align-items:center;gap:10px;padding:0 14px 0 0;height:62px;flex:none;border-bottom:1px solid #1d2432;background:#0c1018}' +
      '.lvmSearch{flex:1;min-width:0;max-width:520px;margin-left:16px;margin-right:auto}#lvmRoot .lvmTop .lvmIn{padding:9px 13px}' +
      '#lvmRoot .lvmTop .lvmBrand{width:214px;box-sizing:border-box;height:62px;padding:0 16px;border-right:1px solid #1d2432;flex:none}' +
      '#lvmRoot .lvmChips{display:flex;gap:8px;flex:none}#lvmRoot .lvmChip{display:flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:9px;background:#121620;border:1px solid rgba(255,255,255,.07);font-size:12px;color:#8a93a6;white-space:nowrap}#lvmRoot .lvmChip b{color:#eef1f6}#lvmRoot .lvmChip .dot{width:7px;height:7px;border-radius:50%;background:#2fd18b;box-shadow:0 0 6px #2fd18b}#lvmRoot .lvmChip .dot.off{background:#5d6578;box-shadow:none}' +
      '.lvmProf{display:flex;align-items:center;gap:8px;font-size:13px;color:#cfd6e2;cursor:pointer;padding:4px 6px 4px 5px;border-radius:11px;border:1px solid transparent}.lvmProf:hover{background:#1b2230}' +
      '#lvmRoot .lvmAcc{position:relative}#lvmRoot .lvmAcc.open .lvmProf{background:#1b2230;border-color:#2b3346}' +
      '#lvmRoot .lvmBurger{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#141a26;color:#8a93a6;font-style:normal;margin-left:2px}#lvmRoot .lvmProf:hover .lvmBurger,#lvmRoot .lvmAcc.open .lvmBurger{color:#eef1f6;background:#232b3b}' +
      '#lvmRoot .lvmMenu{display:none;position:absolute;top:calc(100% + 8px);right:0;width:290px;background:#121722;border:1px solid #2b3346;border-radius:14px;padding:8px;box-shadow:0 18px 44px rgba(0,0,0,.6);z-index:30}' +
      '#lvmRoot .lvmAcc.open .lvmMenu{display:block;animation:lvmMenuIn .15s ease}' +
      '#lvmRoot .lvmMHead{display:flex;align-items:center;gap:11px;padding:8px 8px 12px;border-bottom:1px solid #1f2636;margin-bottom:4px}#lvmRoot .lvmMHead .lvmAv,#lvmRoot .lvmMHead img{width:40px;height:40px}' +
      '#lvmRoot .lvmMHead b{display:block;font-size:14.5px;color:#eef1f6}#lvmRoot .lvmMHead small{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#8f99ff;margin-top:2px}#lvmRoot .lvmMHead small svg{width:14px;height:14px}' +
      '#lvmRoot .lvmMSec{font-size:10.5px;color:#5d6578;padding:9px 10px 4px;letter-spacing:.3px}' +
      '#lvmRoot .lvmMI{display:flex;align-items:center;gap:11px;padding:8px 10px;border-radius:10px;color:#cfd6e2;font-size:13.5px;cursor:pointer}#lvmRoot .lvmMI:hover{background:#1b2230}' +
      '#lvmRoot .lvmMI i{display:flex;width:20px;justify-content:center;color:#8a93a6;font-style:normal}#lvmRoot .lvmMI i svg{width:18px;height:18px}' +
      '#lvmRoot .lvmMI span{flex:1;min-width:0}#lvmRoot .lvmMI small{display:block;font-size:11px;color:#6f7a8c;margin-top:1px;line-height:1.35}' +
      '#lvmRoot .lvmMI em{font-style:normal;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;background:#00b4d8;color:#04121a}#lvmRoot .lvmMI em.ok{background:transparent;color:#3ccf8e;font-size:14px;padding:0 4px}#lvmRoot .lvmMI em.arr{background:transparent;color:#5d6578;font-size:16px;padding:0 4px}' +
      '#lvmRoot .lvmMI.hot{background:rgba(0,180,216,.08)}#lvmRoot .lvmMI.hot i{color:#00b4d8}' +
      '#lvmRoot .lvmMI.busy i{animation:lvmSpin .8s linear infinite}' +
      '#lvmRoot .lvmMI.red{color:#ff6b6b}#lvmRoot .lvmMI.red i{color:#ff6b6b}#lvmRoot .lvmMI.red:hover{background:rgba(255,80,80,.1)}' +
      '#lvmRoot .lvmMSep{height:1px;background:#1f2636;margin:6px 4px}' +
      '#lvmRoot .lvmSw{flex:none;width:34px;height:20px;border-radius:999px;background:#2b3346;position:relative;transition:background .15s}#lvmRoot .lvmSw:after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#8a93a6;transition:left .15s,background .15s}' +
      '#lvmRoot .lvmSw.on{background:#1f9d6b}#lvmRoot .lvmSw.on:after{left:17px;background:#fff}' +
      '#lvmRoot .lvmMAsk{padding:14px 10px 8px;text-align:center}#lvmRoot .lvmMAsk b{display:block;font-size:15px;color:#eef1f6}#lvmRoot .lvmMAsk small{display:block;font-size:12px;color:#8a93a6;margin-top:5px}' +
      '#lvmRoot .lvmMBtns{display:flex;gap:8px;margin-top:14px}#lvmRoot .lvmMB{flex:1;padding:9px;border-radius:10px;background:#1b2230;border:1px solid #2b3346;color:#cfd6e2;font-size:13px;font-weight:700;cursor:pointer}#lvmRoot .lvmMB:hover{background:#232b3b}' +
      '#lvmRoot .lvmMB.red{background:#e5484d;border-color:#e5484d;color:#fff}#lvmRoot .lvmMB.red:hover{background:#f05a5f}' +
      '.lvmLogout{color:#6f7a8c;font-size:13px;margin-left:2px}.lvmProf:hover .lvmLogout{color:#e24b4a}' +
      '.lvmAv{width:30px;height:30px;border-radius:50%;background:#5865F2;object-fit:cover}' +
      '.lvmX{cursor:pointer;color:#8b93a4;font-size:20px;padding:0 4px}.lvmX:hover{color:#fff}' +
      /* stats row + product cards: ยกดีไซน์จากการ์ด LavkaPrices (ui.html .lvStat / .lvqC) */
      '#lvmRoot .lvmSort{display:flex;align-items:center;gap:6px;padding:10px 14px 0;flex:none}#lvmRoot .lvmSortL{font-size:12px;color:#5d6578;margin-right:4px}' +
      '#lvmRoot .lvmSortB{padding:6px 13px;border-radius:999px;background:#151a24;border:1px solid rgba(255,255,255,.07);color:#8a93a6;font-size:12px;font-weight:700;cursor:pointer}#lvmRoot .lvmSortB.on{background:#eef1f6;color:#10141d}' +
      '.lvmStatbar{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;padding:12px 14px 2px}' +
      '.lvmTile{min-width:0;padding:11px 15px;border-radius:16px;background:#161a23;border:1px solid rgba(255,255,255,.07)}' +
      '.lvmTile small{color:#8a93a6;font-size:11.5px;display:block}.lvmTile b{display:block;font-size:21px;font-weight:800;margin-top:5px;color:#eef1f6;font-variant-numeric:tabular-nums}' +
      '.lvmTile em{font-style:normal;font-size:11.5px;color:#8a93a6;font-weight:400;margin-left:4px}' +
      '.lvmList{flex:1;overflow:auto;padding:14px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;align-content:start;grid-auto-rows:max-content}' +
      '.lvqC{border-radius:16px;min-height:190px;flex-shrink:0;background:#161a23;border:1px solid rgba(255,255,255,.07);overflow:hidden;display:flex;flex-direction:column;transition:transform .15s,border-color .15s}' +
      '.lvqC:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.13)}' +
      '.lvqImg{height:112px;display:flex;align-items:center;justify-content:center;position:relative;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.07),transparent 65%),#1c2130}' +
      '.lvqIco{width:78px;height:78px;border-radius:18px;background:#1c2130;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
      '.lvqIco img{width:64px;height:64px;object-fit:contain;transition:transform .3s cubic-bezier(.2,.9,.3,1)}' +
      '.lvqC:hover .lvqIco img{transform:translateY(-3px) scale(1.06);filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))}' +
      '.lvqBd{position:absolute;top:8px;left:8px;z-index:2;font-size:10.5px;font-weight:800;padding:3px 7px;border-radius:8px;max-width:55%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.lvqBd.lvqG{background:#2fd18b;color:#052}.lvqBd.lvqY{background:#ffd23f;color:#331}.lvqBd.lvqM{background:rgba(255,255,255,.12);color:#eef1f6}' +
      '.lvmStar{position:absolute;top:7px;right:9px;z-index:2;font-size:17px;line-height:1;color:#5d6578;cursor:pointer}.lvmStar:hover{color:#eef1f6}.lvmStar.on{color:#ffd23f}' +
      '.lvqB{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}' +
      '.lvqN{font-size:13px;font-weight:600;color:#eef1f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lvmGi{color:#b88cff;font-weight:800}' +
      '.lvqId{font-size:11px;color:#5d6578;font-variant-numeric:tabular-nums;margin-top:-2px}' +
      '.lvqP{font-size:19px;font-weight:800;color:#eef1f6;font-variant-numeric:tabular-nums}.lvqP.lvqMute{color:#8a93a6}' +
      '.lvqM{font-size:11.5px;color:#8a93a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.lvqF{display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:8px}' +
      '.lvqF .lvqDist{font-size:11px;color:#8a93a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}' +
      /* rarity tile (สีช่องของเกม + แสงวิ่ง) ยกจาก LavkaPrices ui.html .lvIcon.rar */
      '.lvqIco.rar{position:relative;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.30),rgba(255,255,255,0) 60%),linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.38)),var(--rc);box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 4px 14px rgba(0,0,0,.35)}' +
      '.lvqIco.rar::after{content:"";position:absolute;top:-20%;left:-60%;width:45%;height:140%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent);transform:translateX(0) rotate(12deg);animation:lvqShine 4.5s ease-in-out infinite;pointer-events:none}' +
      '.lvqIco.rar img{position:relative;z-index:1;filter:drop-shadow(0 3px 5px rgba(0,0,0,.45))}' +
      '@keyframes lvqShine{0%,62%{transform:translateX(0) rotate(12deg)}88%,100%{transform:translateX(420%) rotate(12deg)}}' +
      '.lvqIco.big{width:64px;height:64px;border-radius:16px;flex:none}.lvqIco.big img{width:54px;height:54px}' +
      '.lvqC{cursor:pointer}' +
      '.lvqPills{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;min-height:22px}' +
      '.lvqPill{font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;white-space:nowrap}' +
      '.lvqPill.s{background:rgba(255,210,63,.13);color:#ffd23f}.lvqPill.b{background:rgba(47,209,139,.13);color:#2fd18b}' +
      '.lvqMore{font-size:11.5px;color:#8a93a6;margin-left:auto;transition:color .12s}.lvqC:hover .lvqMore{color:#ffd23f}' +
      /* detail view */
      
      '.lvdTop{display:flex;align-items:center;gap:14px;padding:4px 2px 14px;border-bottom:1px solid #1d2432;margin-bottom:14px}' +
      '.lvdBack{padding:8px 13px;border-radius:10px;background:#161a23;border:1px solid rgba(255,255,255,.07);color:#cfd6e2;font-size:13px;font-weight:700;cursor:pointer;flex:none}.lvdBack:hover{background:#1c2130}' +
      '.lvdTitle{min-width:0}.lvdTitle b{display:block;font-size:18px;color:#eef1f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lvdTitle small{color:#5d6578;font-size:12px}' +
      '.lvmMode{display:flex;align-items:center;gap:12px;min-width:0;padding:11px 15px;border-radius:16px;background:#161a23;border:1px solid rgba(255,255,255,.07);cursor:pointer;transition:background .12s,border-color .12s;opacity:.62}' +
      '.lvmMode:hover{opacity:.9;background:#1a1f2b}.lvmMode.on{opacity:1;cursor:default}' +
      '.lvmMode i{font-style:normal;font-size:22px;flex:none}.lvmMode b{display:block;font-size:16px;color:#eef1f6}.lvmMode small{display:block;color:#8a93a6;font-size:11.5px;margin-top:2px}' +
      '.lvmMode.s.on{border-color:rgba(255,210,63,.55);background:rgba(255,210,63,.07)}.lvmMode.s.on b{color:#ffd23f}' +
      '.lvmMode.b.on{border-color:rgba(47,209,139,.55);background:rgba(47,209,139,.07)}.lvmMode.b.on b{color:#2fd18b}' +
      /* layout: sidebar tabs + main */
      '.lvmBody{flex:1;display:flex;min-height:0}' +
      '.lvmDetail{flex:1;overflow:auto;padding:14px 16px}' +
      '.lvmSide{width:214px;flex:none;padding:14px 10px;border-right:1px solid #1d2432;display:flex;flex-direction:column;gap:4px;background:#0c1018}' +
      '#lvmRoot .lvmBrand{display:flex;align-items:center;gap:10px}#lvmRoot .lvmBrand img{width:40px;height:40px;border-radius:11px;flex:none}' +
      '#lvmRoot .lvmBrand b{display:block;font-size:16px;font-weight:800;color:#eef1f6}#lvmRoot .lvmBrand b span{color:#00b4d8}#lvmRoot .lvmBrand small{display:block;font-size:11px;color:#5d6578}' +
      '#lvmRoot .lvmSideH{font-size:11px;color:#5d6578;padding:12px 12px 4px}#lvmRoot .lvmSideH:first-child{padding-top:2px}' +
      '#lvmRoot .lvmSideF{margin-top:auto}' +
      '#lvmRoot .lvmSrvC{background:#121620;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:11px;font-size:11.5px;color:#8a93a6}' +
      '#lvmRoot .lvmSrvH{display:flex;align-items:center;gap:9px;margin-bottom:10px}#lvmRoot .lvmSrvH b{display:block;font-size:13.5px;color:#eef1f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lvmRoot .lvmSrvH small{display:block;font-size:10.5px;color:#5d6578;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#lvmRoot .lvmSrvNo{width:36px;height:36px;flex:none;border-radius:50%;background:radial-gradient(circle at 35% 30%,#33d1f0,#0a6e8a);color:#fff;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px rgba(0,180,216,.25);position:relative;overflow:hidden}#lvmRoot .lvmSrvNo img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;border-radius:50%}' +
      '#lvmRoot .lvmSrvT{display:flex;align-items:center;gap:10px;background:#0e121b;border-radius:11px;padding:8px 10px;margin-bottom:8px}#lvmRoot .lvmSrvT svg{flex:none}#lvmRoot .lvmSrvT b{display:block;font-size:18px;color:#eef1f6;font-variant-numeric:tabular-nums}#lvmRoot .lvmSrvT i{display:block;font-style:normal;font-size:10.5px;color:#5d6578}' +
      '#lvmRoot .lvmSrvL b{color:#eef1f6}#lvmRoot .lvmSrvL{display:flex;align-items:center;gap:6px}#lvmRoot .lvmSrvL svg{width:14px;height:14px;color:#8a93a6}' +
      '#lvmRoot .lvmUw{position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(5,8,14,.62);display:flex;align-items:center;justify-content:center;z-index:60}#lvmRoot .lvmUw.intro{animation:lvmFade .18s ease}@keyframes lvmFade{from{opacity:0}to{opacity:1}}' +
      '#lvmRoot .lvmUwC{width:440px;max-width:92%;max-height:86%;overflow-y:auto;background:#121722;border:1px solid #2b3346;border-radius:16px;padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.6)}#lvmRoot .lvmUw.intro .lvmUwC{animation:lvmPop .22s cubic-bezier(.2,1.3,.4,1)}@keyframes lvmPop{from{opacity:0;transform:translateY(10px) scale(.96)}to{opacity:1;transform:none}}' +
      '#lvmRoot .lvmUwH{display:flex;align-items:center;gap:12px;margin-bottom:14px}#lvmRoot .lvmUwH img{width:40px;height:40px;border-radius:10px}#lvmRoot .lvmUwH b{display:block;font-size:16px;color:#eef1f6}#lvmRoot .lvmUwH small{display:block;font-size:12px;color:#8a93a6;margin-top:2px}#lvmRoot .lvmUwH small em{font-style:normal;color:#33d1f0;font-weight:700}' +
      '#lvmRoot .lvmUwS{font-size:11px;color:#6f7a8c;text-transform:uppercase;letter-spacing:.4px;margin:12px 0 6px}' +
      '#lvmRoot .lvmUwN{background:#0e121b;border-radius:11px;padding:10px 12px}#lvmRoot .lvmUwN h4{margin:0 0 5px;font-size:12px;color:#33d1f0}#lvmRoot .lvmUwN h4 span{color:#5d6578;font-weight:400;margin-left:6px}#lvmRoot .lvmUwN ul{margin:0 0 8px;padding-left:18px}#lvmRoot .lvmUwN ul:last-child{margin-bottom:0}#lvmRoot .lvmUwN li{font-size:12.5px;color:#cfd6e2;line-height:1.5;margin:2px 0}' +
      '#lvmRoot .lvmUwF{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:10px;background:#0e121b;margin-bottom:5px;font-size:12.5px;color:#cfd6e2;position:relative;overflow:hidden}#lvmRoot .lvmUwF .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:Consolas,monospace;font-size:12px}#lvmRoot .lvmUwF .sz{color:#5d6578;font-size:11px}#lvmRoot .lvmUwF .st{font-size:11px;color:#6f7a8c;min-width:86px;text-align:right}' +
      '#lvmRoot .lvmUwF .ic{width:18px;height:18px;flex:none;border-radius:50%;border:2px solid #2b3346}#lvmRoot .lvmUwF.run .ic{border-color:#33d1f0 transparent #33d1f0 transparent;animation:lvmSpin .8s linear infinite}@keyframes lvmSpin{to{transform:rotate(360deg)}}' +
      '#lvmRoot .lvmUwF.ok .ic,#lvmRoot .lvmUwF.done .ic{border:none;background:#2fd18b;position:relative;animation:lvmPopIc .25s ease}#lvmRoot .lvmUwF.ok .ic:after,#lvmRoot .lvmUwF.done .ic:after{content:"";position:absolute;left:6px;top:3px;width:4px;height:8px;border:solid #0b0f17;border-width:0 2px 2px 0;transform:rotate(45deg)}@keyframes lvmPopIc{from{transform:scale(.3)}to{transform:scale(1)}}' +
      '#lvmRoot .lvmUwF.run .st{color:#33d1f0}#lvmRoot .lvmUwF.ok .st,#lvmRoot .lvmUwF.done .st{color:#2fd18b}#lvmRoot .lvmUwF.run:after{content:"";position:absolute;left:0;bottom:0;height:2px;width:40%;background:linear-gradient(90deg,transparent,#33d1f0,transparent);animation:lvmScan 1.1s ease-in-out infinite}@keyframes lvmScan{from{left:-40%}to{left:100%}}' +
      '#lvmRoot .lvmUwP{height:6px;border-radius:4px;background:#1b2230;overflow:hidden;margin:12px 0 4px}#lvmRoot .lvmUwP i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#0a6e8a,#33d1f0);transition:width .5s ease;background-size:200% 100%;animation:lvmBar 1.4s linear infinite}@keyframes lvmBar{from{background-position:200% 0}to{background-position:0 0}}' +
      '#lvmRoot .lvmUwM{font-size:12.5px;color:#8a93a6;margin-top:6px;display:flex;align-items:center;gap:8px}#lvmRoot .lvmUwM.ok{color:#2fd18b}#lvmRoot .lvmUwM.bad{color:#ff6b6b}#lvmRoot .lvmUwM .sp{width:14px;height:14px;border-radius:50%;border:2px solid #33d1f0;border-right-color:transparent;animation:lvmSpin .8s linear infinite;flex:none}' +
      '#lvmRoot .lvmUwB{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}#lvmRoot .lvmUwB div{padding:9px 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;background:#1b2230;color:#cfd6e2}#lvmRoot .lvmUwB div:hover{background:#232c3d}#lvmRoot .lvmUwB .go{background:#00b4d8;color:#04121a}#lvmRoot .lvmUwB .go:hover{background:#33d1f0}' +
      '#lvmRoot .lvmRing{position:relative;width:42px;height:42px;flex:none}#lvmRoot .lvmRing svg{width:42px;height:42px;-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}' +
      '#lvmRoot .lvmRing circle{fill:none;stroke-width:3.5}#lvmRoot .lvmRing .bg{stroke:#232a38}#lvmRoot .lvmRing .fg{stroke:#00b4d8;stroke-linecap:round;stroke-dasharray:100.53;stroke-dashoffset:0;-webkit-animation:lvmRing 600s linear forwards;animation:lvmRing 600s linear forwards}' +
      '@-webkit-keyframes lvmRing{to{stroke-dashoffset:100.53}}@keyframes lvmRing{to{stroke-dashoffset:100.53}}' +
      '#lvmRoot .lvmSrvT .lvmRing b{position:absolute;left:0;top:0;right:0;bottom:4px;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1}#lvmRoot .lvmSrvT .lvmRing small{position:absolute;left:0;right:0;bottom:7px;text-align:center;font-size:8px;color:#5d6578;line-height:1}' +
      '#lvmRoot .lvmSrvBack{margin-top:8px;padding:7px 9px;border-radius:9px;background:rgba(0,180,216,.1);border:1px solid rgba(0,180,216,.3);color:#33d1f0;font-size:11.5px;cursor:pointer;text-align:center}#lvmRoot .lvmSrvBack:hover{background:rgba(0,180,216,.18)}' +
      '#lvmRoot .lvmChipW{position:relative;flex:none}#lvmRoot .lvmChip.pick{cursor:pointer}#lvmRoot .lvmChip.pick:hover{border-color:rgba(255,255,255,.18)}#lvmRoot .lvmChip.pick.view{border-color:rgba(0,180,216,.55);background:rgba(0,180,216,.08)}#lvmRoot .lvmChip .cv{display:flex;color:#5d6578}#lvmRoot .lvmChip .cv svg{width:13px;height:13px}#lvmRoot .lvmChip>svg{width:14px;height:14px;color:#8a93a6}' +
      '#lvmRoot .lvmChipW .lvmMenu{left:0;right:auto;width:300px;max-height:420px;overflow-y:auto}#lvmRoot .lvmChipW.open .lvmMenu{display:block;animation:lvmMenuIn .15s ease}' +
      '#lvmRoot .lvmSH{padding:6px 8px 8px;font-size:11px;color:#6f7a8c;text-transform:uppercase;letter-spacing:.4px}#lvmRoot .lvmSE{padding:12px 10px;font-size:12px;color:#6f7a8c}' +
      '#lvmRoot .lvmSI{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:10px;cursor:pointer;color:#cfd6e2}#lvmRoot .lvmSI:hover{background:#1b2230}#lvmRoot .lvmSI.on{background:rgba(0,180,216,.1)}' +
      '#lvmRoot .lvmSI .lvmSrvNo{width:30px;height:30px;font-size:12px}#lvmRoot .lvmSI .tx{flex:1;min-width:0}#lvmRoot .lvmSI b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lvmRoot .lvmSI b i{font-style:normal;color:#5d6578;font-weight:600}' +
      '#lvmRoot .lvmSI small{display:block;font-size:11px;color:#6f7a8c}#lvmRoot .lvmSI em{font-style:normal;font-size:10px;padding:2px 6px;border-radius:6px;background:rgba(47,209,139,.12);color:#2fd18b;white-space:nowrap}#lvmRoot .lvmSI .ck{color:#33d1f0;font-weight:800}' +
      '.lvmNav{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;color:#8a93a6;font-size:14px;cursor:pointer;position:relative;transition:background .12s,color .12s}' +
      '#lvmRoot .lvmNav i{display:flex;align-items:center;justify-content:center}#lvmRoot .lvmNav span{flex:1}' +
      '#lvmRoot .lvmBadge{font-style:normal;min-width:22px;padding:1px 7px;border-radius:999px;background:#1f9d6b;color:#eafff5;font-size:11px;font-weight:800;text-align:center}' +
      '.lvmNav i{font-style:normal;font-size:17px;width:22px;text-align:center}.lvmNav:hover{background:#161a23;color:#eef1f6}' +
      '.lvmNav.on{background:rgba(255,210,63,.12);color:#ffd23f;font-weight:700}' +
      '#lvmRoot .lvmCats{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:2px;margin:0 -4px 8px;padding:0 4px}' +
      '#lvmRoot .lvmCats::-webkit-scrollbar{width:4px}#lvmRoot .lvmCats::-webkit-scrollbar-thumb{background:#262d3d;border-radius:4px}' +
      '#lvmRoot .lvmNav.sub{padding:6px 10px 6px 12px;font-size:13px;gap:10px;margin-left:14px}#lvmRoot .lvmNav.sub svg{width:16px;height:16px}' +
      '#lvmRoot .lvmCats{border-left:1px solid #1f2636;margin-left:16px !important;padding-left:3px !important;margin-right:-6px !important}#lvmRoot .lvmNav.sub span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}#lvmRoot .lvmNav.sub{gap:8px !important;padding-left:9px !important}#lvmRoot .lvmCats .lvmNav.sub{margin-left:0}' +
      '#lvmRoot .lvmCats.shut{display:none}#lvmRoot .lvmSideGap{height:10px;flex:none}' +
      '#lvmRoot .lvmCaret2{display:flex;align-items:center;justify-content:center;width:22px;height:22px;margin:-4px -6px -4px 0;border-radius:6px;color:#5d6578;transition:transform .15s,background .12s}' +
      '#lvmRoot .lvmCaret2:hover{background:#1d2432;color:#eef1f6}#lvmRoot .lvmNav.par:not(.open) .lvmCaret2{transform:rotate(-90deg)}' +
      '#lvmRoot .lvmBadge.n{background:#1a2030;color:#8a93a6;font-weight:700}#lvmRoot .lvmNav.on .lvmBadge.n{background:rgba(255,210,63,.18);color:#ffd23f}' +
      '#lvmRoot .lvmNav.zero{opacity:.45}' +
      '.lvmNav.on:before{content:"";position:absolute;left:0;top:22%;bottom:22%;width:3px;border-radius:3px;background:#ffd23f;box-shadow:0 0 10px #ffd23f}' +
      '.lvmMain{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column}' +
      '.lvmMkt{flex:1;min-height:0;display:flex;flex-direction:column}' +
      '#lvmRoot .lvmList{min-height:0;align-content:stretch}' +
      '#lvmRoot .lvqImg{flex:1;min-height:88px;height:auto}' +
      /* home */
      '.lvmHome{flex:1;overflow:auto;padding:22px 26px}' +
      '.lvhHello b{display:block;font-size:22px;color:#eef1f6}.lvhHello small{color:#8a93a6;font-size:13px}' +
      '#lvmRoot .lvhGo{display:grid;grid-template-columns:' + (SELL_ON ? '1fr 1fr' : '1fr') + ';gap:14px;margin:18px 0 24px}' +
      '.lvhBig{display:flex;align-items:center;gap:16px;padding:20px 22px;border-radius:18px;background:#161a23;border:1px solid rgba(255,255,255,.07);cursor:pointer;transition:transform .15s,border-color .15s,background .15s}' +
      '.lvhBig:hover{transform:translateY(-3px)}.lvhBig i{font-style:normal;font-size:34px}.lvhBig div{flex:1;min-width:0}' +
      '.lvhBig b{display:block;font-size:19px}.lvhBig small{color:#8a93a6;font-size:12.5px}.lvhBig em{font-style:normal;font-size:26px;color:#5d6578}' +
      '.lvhBig.s b{color:#ffd23f}.lvhBig.s:hover{border-color:rgba(255,210,63,.5);background:rgba(255,210,63,.06)}' +
      '.lvhBig.b b{color:#2fd18b}.lvhBig.b:hover{border-color:rgba(47,209,139,.5);background:rgba(47,209,139,.06)}' +
      '#lvmRoot .lvhSec{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}.lvhSec b{font-size:15px;color:#eef1f6}.lvhSec small{color:#5d6578;font-size:12px}' +
      '.lvhRecent{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}' +
      '.lvhItem{display:flex;align-items:center;gap:10px;padding:9px;border-radius:13px;background:#161a23;border:1px solid rgba(255,255,255,.06);cursor:pointer;min-width:0}.lvhItem:hover{border-color:rgba(255,255,255,.16)}' +
      '.lvhItem .lvqIco{width:44px;height:44px;border-radius:11px;flex:none}.lvhItem .lvqIco img{width:38px;height:38px}' +
      '.lvhTx{min-width:0}.lvhTx b{display:block;font-size:12.5px;color:#eef1f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lvhTx small{color:#5d6578;font-size:11px}' +
      '#lvmRoot .lvhTip{margin-top:24px;padding:12px 14px;border-radius:12px;background:#121620;border:1px solid rgba(255,255,255,.05);color:#8a93a6;font-size:12.5px;line-height:1.55}' +
      /* การ์ดเริ่มดึงข้อมูล (ติดตั้งใหม่) + อนิเมชันระหว่างดึง */
      '#lvmRoot .lvhStart{margin:18px 0 24px;padding:30px 24px 26px;border-radius:16px;background:#121620;border:1px solid rgba(0,180,216,.18);display:flex;flex-direction:column;align-items:center;text-align:center;-webkit-animation:lvhIn .35s ease-out both;animation:lvhIn .35s ease-out both}' +
      '#lvmRoot .lvhStart .t{display:block;margin-top:14px;font-size:17px;font-weight:700;color:#eef1f6}#lvmRoot .lvhStart small{display:block;max-width:470px;margin-top:6px;color:#8a93a6;font-size:12.5px;line-height:1.55}' +
      '#lvmRoot .lvhPullBtn{margin-top:16px;padding:10px 22px;border-radius:11px;background:#00b4d8;color:#05222b;font-weight:700;font-size:13.5px;cursor:pointer;border:0;transition:transform .15s,filter .15s}#lvmRoot .lvhPullBtn:hover{-webkit-filter:brightness(1.12);filter:brightness(1.12);transform:translateY(-1px)}' +
      '#lvmRoot .lvhOrb{position:relative;width:66px;height:66px;display:flex;align-items:center;justify-content:center;color:#00b4d8}#lvmRoot .lvhOrb svg{position:relative;width:30px;height:30px}' +
      '#lvmRoot .lvhOrb:before{content:"";position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;background:rgba(0,180,216,.1)}' +
      '#lvmRoot .lvhOrb.run:after{content:"";position:absolute;left:-6px;top:-6px;right:-6px;bottom:-6px;border-radius:50%;border:2px solid transparent;border-top-color:#00b4d8;border-right-color:rgba(0,180,216,.35);-webkit-animation:lvhSpin .9s linear infinite;animation:lvhSpin .9s linear infinite}' +
      '#lvmRoot .lvhOrb .p{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(0,180,216,.55);-webkit-animation:lvhPing 1.4s ease-out infinite;animation:lvhPing 1.4s ease-out infinite}' +
      '#lvmRoot .lvhOrb.run svg{-webkit-animation:lvhBob 1.1s ease-in-out infinite;animation:lvhBob 1.1s ease-in-out infinite}' +
      '#lvmRoot .lvhOrb.ok{color:#2ecc71}#lvmRoot .lvhOrb.ok:before{background:rgba(46,204,113,.13)}#lvmRoot .lvhOrb.ok svg{-webkit-animation:lvhPop .5s cubic-bezier(.2,1.6,.4,1) both;animation:lvhPop .5s cubic-bezier(.2,1.6,.4,1) both}' +
      '#lvmRoot .lvhOrb.err{color:#ff6b6b}#lvmRoot .lvhOrb.err:before{background:rgba(255,107,107,.12)}' +
      '#lvmRoot .lvhBar{width:240px;height:4px;margin-top:16px;border-radius:2px;background:#232a38;overflow:hidden}#lvmRoot .lvhBar i{display:block;width:40%;height:100%;border-radius:2px;background:#00b4d8;-webkit-animation:lvhBar 1.1s ease-in-out infinite;animation:lvhBar 1.1s ease-in-out infinite}' +
      '#lvmRoot .lvhCnt{display:block;margin-top:12px;font-size:32px;font-weight:800;line-height:1;color:#eef1f6;font-variant-numeric:tabular-nums}#lvmRoot .lvhCnt em{font-style:normal;font-size:14px;font-weight:600;color:#8a93a6;margin-left:6px}' +
      '@-webkit-keyframes lvhSpin{to{-webkit-transform:rotate(360deg)}}@keyframes lvhSpin{to{transform:rotate(360deg)}}' +
      '@-webkit-keyframes lvhPing{from{-webkit-transform:scale(1);opacity:.8}to{-webkit-transform:scale(1.7);opacity:0}}@keyframes lvhPing{from{transform:scale(1);opacity:.8}to{transform:scale(1.7);opacity:0}}' +
      '@-webkit-keyframes lvhBob{0%,100%{-webkit-transform:translateY(-2px)}50%{-webkit-transform:translateY(3px)}}@keyframes lvhBob{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}' +
      '@-webkit-keyframes lvhBar{from{-webkit-transform:translateX(-100%)}to{-webkit-transform:translateX(250%)}}@keyframes lvhBar{from{transform:translateX(-100%)}to{transform:translateX(250%)}}' +
      '@-webkit-keyframes lvhPop{from{-webkit-transform:scale(.3);opacity:0}to{-webkit-transform:none;opacity:1}}@keyframes lvhPop{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}' +
      '@-webkit-keyframes lvhIn{from{opacity:0;-webkit-transform:translateY(6px)}to{opacity:1;-webkit-transform:none}}@keyframes lvhIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
      /* วงนับถอยหลัง: กดเพื่อดึงตอนนี้ / หมุนระหว่างดึง */
      '#lvmRoot .lvmRing{cursor:pointer}#lvmRoot .lvmRing:hover .bg{stroke:#2c3546}#lvmRoot .lvmRing.busy svg{-webkit-animation:lvhSpinR 1s linear infinite;animation:lvhSpinR 1s linear infinite}#lvmRoot .lvmRing.busy .fg{-webkit-animation:none;animation:none;stroke-dasharray:24 77}' +
      '@-webkit-keyframes lvhSpinR{from{-webkit-transform:rotate(-90deg)}to{-webkit-transform:rotate(270deg)}}@keyframes lvhSpinR{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}' +
      /* price history chart */
      '.lvdSvg{display:block;width:100%;height:auto}' +
      '.lvdSum{display:flex;flex-wrap:wrap;gap:6px 18px;padding:8px 6px 2px;font-size:12px;color:#8a93a6}.lvdSum b{color:#eef1f6;font-variant-numeric:tabular-nums}.lvdSum i{font-style:normal;color:#5d6578}' +
      '#lvmRoot .lvdLeg{margin-left:auto}#lvmRoot .lvdLeg em{display:inline-block;width:16px;border-top:2px solid;vertical-align:middle;margin:0 5px 0 8px}.lvdLeg em.dash{border-top-style:dashed;opacity:.6}' +
      /* detail = dashboard เต็มพื้นที่: ซ้าย กราฟ+ร้าน / ขวา ข้อมูลไอเทม */
      '#lvmRoot .lvmDetail{display:flex;flex-direction:column;overflow:hidden;padding:12px 16px 14px}' +
      '#lvmRoot .lvdTop{flex:none;margin-bottom:12px;padding-bottom:12px}' +
      '#lvmRoot .lvdKpis{margin-left:auto;display:flex;gap:8px;flex:none}' +
      '.lvdKpi{min-width:112px;padding:7px 12px;border-radius:11px;background:#121620;border:1px solid rgba(255,255,255,.06)}' +
      '.lvdKpi small{display:block;font-size:10.5px;color:#5d6578}.lvdKpi b{display:block;font-size:14.5px;color:#eef1f6;font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.lvdKpi b.s{color:#ffd23f}.lvdKpi b.b{color:#2fd18b}' +
      '.lvdGrid{flex:1;min-height:0;display:flex;gap:14px}' +
      '.lvdLeft{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:12px}' +
      '.lvdCol{background:#121620;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:10px;min-height:0}' +
      '#lvmRoot .lvdHist{flex:1.25;display:flex;flex-direction:column;min-height:190px}' +
      '#lvmRoot .lvdShops{flex:1;overflow:auto;min-height:120px}' +
      '.lvdChart{flex:1;min-height:120px;position:relative;overflow:hidden}' +
      '#lvmRoot .lvdInfo{width:330px;flex:none;overflow:auto;padding:12px 14px}' +
      '.lviKind{display:inline-block;padding:3px 9px;border-radius:8px;background:rgba(255,255,255,.06);font-size:11.5px;color:#cfd6e2;margin-bottom:8px}' +
      '.lviCnt{display:flex;align-items:baseline;justify-content:space-between;padding:9px 11px;border-radius:11px;background:rgba(56,140,255,.08);border:1px solid rgba(56,140,255,.22);margin-bottom:10px;font-size:12px;color:#8a93a6}' +
      '.lviCnt b{font-size:16px;color:#7fb4ff;font-variant-numeric:tabular-nums}' +
      '.lviH{font-size:11.5px;font-weight:800;color:#8a93a6;text-transform:uppercase;letter-spacing:.04em;margin:10px 0 6px}' +
      '.lviBon{display:flex;gap:8px;align-items:flex-start;padding:7px 10px;border-radius:9px;background:rgba(255,210,63,.07);margin-bottom:5px;font-size:12.5px;color:#ffe27a;line-height:1.35}' +
      '.lviBon:before{content:"+";font-weight:900;color:#ffd23f}' +
      '.lviUp{font-size:12px;color:#aeb6c6;padding:2px 0 2px 12px;position:relative;line-height:1.4}.lviUp:before{content:"";position:absolute;left:2px;top:8px;width:4px;height:4px;border-radius:2px;background:#5d6578}' +
      '.lviTx{font-size:12px;color:#aeb6c6;line-height:1.5;margin-bottom:6px}' +
      '.lviOk{margin-top:8px;font-size:12px;color:#2fd18b}' +
      '#lvmRoot .lviKind{margin-bottom:8px}#lvmRoot .lviCnt{margin-bottom:6px}#lvmRoot .lviH{margin:14px 0 7px}#lvmRoot .lviBon{margin-bottom:5px}#lvmRoot .lviTx{margin-bottom:7px}#lvmRoot .lviOk{margin-top:10px}' +
      '#lvmRoot .lvdInfo::-webkit-scrollbar,#lvmRoot .lvdShops::-webkit-scrollbar{width:6px}#lvmRoot .lvdInfo::-webkit-scrollbar-track,#lvmRoot .lvdShops::-webkit-scrollbar-track{background:transparent}' +
      '#lvmRoot .lvdInfo::-webkit-scrollbar-thumb,#lvmRoot .lvdShops::-webkit-scrollbar-thumb{background:#2a3242;border-radius:3px}' +
      '#lvmRoot .lvdHead.lv,#lvmRoot .lvdRow.lv{grid-template-columns:minmax(0,1fr) 70px 120px 52px 96px}#lvmRoot .lv>*:nth-child(2){text-align:center}' +
      '#lvmRoot .lvdRow{cursor:pointer;transition:background .12s}#lvmRoot .lvdRow:hover{background:rgba(255,255,255,.07)}' +
      '#lvmRoot .lvdRow.pick{background:rgba(56,140,255,.12);box-shadow:inset 0 0 0 1px rgba(56,140,255,.55)}' +
      '#lvmRoot .lvdRow.curlv{background:rgba(255,255,255,.035)}' +
      '#lvmRoot .lvdLvls{display:flex;flex-wrap:wrap;gap:6px;padding:0 6px 8px;flex:none}' +
      '#lvmRoot .lvdLvc{flex:1 1 130px;min-width:0;padding:6px 9px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);cursor:pointer;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}' +
      '#lvmRoot .lvdLvc:hover{background:rgba(255,255,255,.08)}' +
      '#lvmRoot .lvdLvc.on{border-color:rgba(56,140,255,.7);background:rgba(56,140,255,.13)}' +
      '#lvmRoot .lvdLvc b{font-size:14px;font-weight:800}#lvmRoot .lvdLvc b.s{color:#ffd23f}#lvmRoot .lvdLvc b.b{color:#2fd18b}' +
      '#lvmRoot .lvdLvc small{flex-basis:100%;font-size:11px;color:#8a93a6}' +
      '.lvdLv{display:inline-block;min-width:38px;padding:2px 7px;border-radius:7px;font-style:normal;font-size:11.5px;font-weight:800;background:rgba(255,255,255,.06);color:#8a93a6}' +
      '.lvdLv.e{background:rgba(185,120,255,.16);color:#c79bff}.lvdLv.t{background:rgba(255,170,60,.16);color:#ffb54a}.lvdLv.z{color:#aeb6c6}' +
      '#lvmRoot .lvdSub{font-size:11.5px;font-weight:800;color:#8a93a6;padding:12px 10px 6px;border-top:1px solid #1d2432;margin-top:6px}.lvdSub i{font-style:normal;color:#5d6578;margin-left:4px}' +
      '#lvmRoot .lviPiece{padding:10px 11px;border-radius:12px;background:rgba(56,140,255,.07);border:1px solid rgba(56,140,255,.25);margin-bottom:12px}' +
      '.lviPh{font-size:11.5px;color:#8a93a6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lviPh b{color:#eef1f6}' +
      '#lvmRoot .lviPg{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin-top:8px}' +
      '.lviPg small{display:block;font-size:10.5px;color:#5d6578}.lviPg b{font-size:13.5px;color:#eef1f6;font-variant-numeric:tabular-nums}' +
      '.lviPg b.lv{font-size:17px;color:#c79bff}.lviPg b.s{color:#ffd23f}.lviPg b.b{color:#2fd18b}' +
      '.lviNone{color:#5d6578;font-size:12.5px;line-height:1.55;text-align:center;padding:30px 10px}.lviNone i{display:block;font-style:normal;font-size:30px;margin-bottom:8px;opacity:.6}' +
      '.lvdCap{font-size:13.5px;font-weight:800;padding:4px 6px 10px}.lvdCap.s{color:#ffd23f}.lvdCap.b{color:#2fd18b}.lvdCap i{font-style:normal;color:#8a93a6;font-weight:600;margin-left:4px}' +
      '.lvdHead,.lvdRow{display:grid;grid-template-columns:minmax(0,1fr) 120px 52px 96px;gap:8px;align-items:center;padding:7px 10px}' +
      '.lvdHead{font-size:11px;color:#5d6578}.lvdHead span:nth-child(n+2),.lvdRow>*:nth-child(n+2){text-align:right}' +
      '.lvdRow{border-radius:10px;background:rgba(255,255,255,.03);margin-bottom:5px;font-size:12.5px;color:#cfd6e2}' +
      '.lvdRow .sh{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lvdRow b{font-variant-numeric:tabular-nums;color:#eef1f6}' +
      '.lvdRow b.s{color:#ffd23f}.lvdRow b.b{color:#2fd18b}.lvdRow .m{color:#8a93a6;font-size:11.5px}' +
      '.lvdRow.best.s{box-shadow:inset 0 0 0 1px rgba(255,210,63,.35)}.lvdRow.best.b{box-shadow:inset 0 0 0 1px rgba(47,209,139,.35)}' +
      '.lvdEmpty{color:#5d6578;font-size:12.5px;text-align:center;padding:22px 0}' +
      '#lvmRoot .lvmSI.old{opacity:.5}#lvmRoot .lvmSI.old:hover{opacity:.85}' +
      '.lvqTag{flex:none;padding:6px 12px;border-radius:11px;font-size:12.5px;font-weight:800}' +
      '.lvqTag.lvqBuy{background:linear-gradient(135deg,#ffd23f,#ffab1f);color:#151515}' +
      '.lvqTag.lvqSell{background:rgba(47,209,139,.15);color:#2fd18b;border:1px solid rgba(47,209,139,.4)}' +
      '.lvmPager{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 14px;border-top:1px solid #1d2432;user-select:none}' +
      '#lvmRoot .lvmPg.gap{background:transparent;border-color:transparent;color:#5d6578;cursor:default}' +
      '#lvmRoot .lvmPgInfo{display:inline-block;width:150px;text-align:left}' +
      '.lvmPg{width:38px;min-width:38px;height:34px;padding:0;flex:none;border-radius:10px;background:#161a23;border:1px solid rgba(255,255,255,.07);color:#cfd6e2;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .12s,border-color .12s}' +
      '.lvmPg:hover{background:#1c2130;border-color:rgba(255,255,255,.16)}' +
      '.lvmPg.on{background:linear-gradient(135deg,#ffd23f,#ffab1f);color:#151515;border-color:transparent;cursor:default}' +
      '.lvmPg.off{opacity:.35;cursor:default}.lvmPg.off:hover{background:#161a23;border-color:rgba(255,255,255,.07)}' +
      '.lvmPgGap{color:#5d6578;padding:0 2px}' +
      '.lvmPgInfo{color:#8a93a6;font-size:12px;margin-left:10px}' +
      '.lvmEmpty{grid-column:1/-1;color:#6f7a8c;text-align:center;padding:40px}' +
      '.lvmStat{color:#7b8498;font-size:12px;padding:6px 16px;border-top:1px solid #1d2432}';
  }

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  var LNAME = { th: 'ไทย', ru: 'Русский', en: 'English' };
  var CODE2 = { th: 'TH', ru: 'RU', en: 'EN' };
  var FLAG = { th: 'th', ru: 'ru', en: 'gb' };
  function flagImg(c) { return '<img class="lvmFlag" src="https://flagcdn.com/40x30/' + FLAG[c] + '.png" onerror="this.style.visibility=\'hidden\'">'; }
  function langDropdown() {
    var opts = '';
    ['th', 'ru', 'en'].forEach(function (c) {
      opts += '<div class="lvmLangOpt' + (S.lang === c ? ' on' : '') + '" data-l="' + c + '">' +
        flagImg(c) + '<b>' + CODE2[c] + '</b><span class="lvmLName">' + LNAME[c] + '</span></div>';
    });
    return '<div class="lvmLangDd">' +
      '<div class="lvmLangCur">' + flagImg(S.lang) + '<b>' + CODE2[S.lang] + '</b><i class="lvmCaret">▾</i></div>' +
      '<div class="lvmLangMenu">' + opts + '</div></div>';
  }

  function renderLogin(root) {
    root.className = '';
    var step = S.loginStep || 0, inner;
    if (step === 0) {
      inner = LOCK_SVG +
        '<div class="lvmLTitle">' + esc(tr('need_login')) + '</div>' +
        '<div class="lvmLSub">' + esc(tr('need_sub')) + '</div>' +
        '<button class="lvmDWhite' + (S.oauthBusy ? ' busy' : '') + '" id="lvmDiscord">' +
          (S.oauthBusy ? '<span class="lvmSpin"></span><span>' + esc(tr('waiting')) + '</span>'
                       : discordSvg('#fff') + '<span>' + esc(tr('login_h')) + '</span>') + '</button>' +
        '<div class="lvmErr" id="lvmErr"></div>' +
        '<div class="lvmOr"><span>' + esc(tr('or')) + '</span></div>' +
        '<div class="lvmHaveKey" id="lvmHaveKey">' + esc(tr('have_key')) + '</div>';
    } else {
      inner = LOCK_SVG +
        '<div class="lvmLTitle">' + esc(tr('code_title')) + '</div>' +
        '<div class="lvmLSub">' + esc(tr('login_t')) + '</div>' +
        '<input id="lvmCode" class="lvmIn" placeholder="' + esc(tr('code_ph')) + '" autocomplete="off">' +
        '<button id="lvmGo" class="lvmGo">' + esc(tr('connect')) + '</button>' +
        '<div class="lvmErr" id="lvmErr"></div>' +
        '<div class="lvmBack" id="lvmBack">‹ ' + esc(tr('back')) + '</div>';
    }
    root.innerHTML = '<div class="lvmCard">' +
      '<div class="lvmLHead"><img src="' + LOGO + '" alt=""><div class="lvmLBrand"><b>Lavka<span>Market</span></b><small>' + esc(tr('brand_sub')) + '</small></div>' +
        '<div class="lvmLoginLang">' + langDropdown() + '</div></div>' +
      '<div class="lvmLogin2">' + inner + '</div>' +
      '<div class="lvmConsent"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3ccf8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg><span>' + esc(tr('consent')) + '</span></div>' +
    '</div>';
    if (step === 0) {
      root.querySelector('#lvmDiscord').onclick = function () {
        if (this.classList.contains('busy') || S.oauthBusy) return;   // กำลังล็อกอินอยู่ ไม่เริ่มซ้ำ
        S.oauthBusy = true;
        this.classList.add('busy');
        this.innerHTML = '<span class="lvmSpin"></span><span>' + esc(tr('waiting')) + '</span>';
        var e = document.getElementById('lvmErr'); if (e) e.textContent = '';
        send('lvm|oauth');   // ล็อกอินด้วย Discord จริง (Lua เปิดเบราว์เซอร์ + วนเช็กผล)
      };
      root.querySelector('#lvmHaveKey').onclick = function () { S.oauthBusy = false; S.loginStep = 1; renderLogin(root); };
    } else {
      root.querySelector('#lvmGo').onclick = function () {
        var v = (root.querySelector('#lvmCode').value || '').trim(); if (!v) return;
        this.textContent = tr('checking'); send('lvm|connect:' + v);
      };
      root.querySelector('#lvmBack').onclick = function () { S.loginStep = 0; renderLogin(root); };
      var inp = root.querySelector('#lvmCode'); if (inp) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 30);
    }
    bindLangs(root);
  }

  function avatarHtml(p) {
    if (p && p.avatar) return '<img class="lvmAv" src="' + esc(p.avatar) + '" onerror="this.style.visibility=\'hidden\'">';
    return '<div class="lvmAv"></div>';
  }

  function renderMarket(root) {
    root.className = '';
    S.oauthBusy = false;
    var p = S.profile || {};
    var tab = S.tab || 'home';
    function navItem(id, ico, key, m, badge, cat) {
      var on = tab === id && (!m || m === S.mode) && (!cat || cat === S.cat);
      return '<div class="lvmNav' + (on ? ' on' : '') + '" data-tab="' + id + '"' + (m ? ' data-m="' + m + '"' : '') + (cat ? ' data-cat="' + cat + '"' : '') + '><i>' + icon(ico) + '</i><span>' + esc(tr(key)) + '</span>' +
        (badge ? '<em class="lvmBadge" id="' + badge + '">0</em>' : '') + '</div>';
    }
    root.innerHTML = '<div class="lvmPanel">' +
      '<div class="lvmTop">' +
        '<div class="lvmBrand"><img src="' + LOGO + '" alt=""><div><b>Lavka<span>Market</span></b><small>' + esc(tr('brand_sub')) + '</small></div></div>' +
        '<div class="lvmSearch"><input id="lvmSearch" class="lvmIn" placeholder="' + esc(tr('search')) + '" autocomplete="off"></div>' +
        '<div class="lvmChipW" id="lvmChipW"><div class="lvmChips" id="lvmChips">' + chipsHtml() + '</div><div class="lvmMenu" id="lvmSrvMenu"></div></div>' +
        langDropdown() +
        '<div class="lvmAcc" id="lvmAcc"><div class="lvmProf" id="lvmProf">' + avatarHtml(p) + '<span>' + esc(p.name || '') + '</span>' +
          '<i class="lvmBurger">' + icon('menu') + '</i></div><div class="lvmMenu" id="lvmMenu"></div></div>' +
        '<div class="lvmX" id="lvmClose">✕</div>' +
      '</div>' +
      '<div class="lvmBody">' +
        '<div class="lvmSide">' +
          '<div class="lvmSideH">' + esc(tr('sec_main')) + '</div>' + navItem('home', 'home', 'tab_home') +
          '<div class="lvmSideGap"></div>' +
          '<div class="lvmNav par' + (tab === 'market' && S.cat === 'all' ? ' on' : '') + (S.catOpen ? ' open' : '') + '" data-tab="market" data-m="buy" data-cat="all" id="lvmCatPar"><i>' + icon('cart') + '</i><span>' + esc(tr('sec_market')) + '</span>' +
            '<em class="lvmBadge" id="lvmBadgeS">0</em><b class="lvmCaret2" id="lvmCatTog">' + icon('caret') + '</b></div>' +
          '<div class="lvmCats' + (S.catOpen ? '' : ' shut') + '" id="lvmCats">' + catNavs() + '</div>' +
          (SELL_ON ? '<div class="lvmSideH">' + esc(tr('sec_sell')) + '</div>' + navItem('market', 'coin', 'nav_sell', 'sell', 'lvmBadgeB') : '') +
          '<div class="lvmSideF" id="lvmSrv">' + srvHtml() + '</div>' +
        '</div>' +
        '<div class="lvmMain">' +
          '<div class="lvmHome" id="lvmHome"' + (tab === 'home' ? '' : ' style="display:none"') + '></div>' +
          '<div class="lvmMkt" id="lvmMkt"' + (tab === 'market' ? '' : ' style="display:none"') + '>' +
            (!SELL_ON ? '' : '<div class="lvmStatbar">' +
              '<div class="lvmMode s' + (S.mode === 'buy' ? ' on' : '') + '" data-m="buy"><i>🛒</i><div><b>' + esc(tr('mode_buy')) + '</b><small>' + esc(tr('mode_buy_h')) + ' · <span id="lvmNS">0</span> ' + esc(tr('count')) + '</small></div></div>' +
              '<div class="lvmMode b' + (S.mode === 'sell' ? ' on' : '') + '" data-m="sell"><i>💰</i><div><b>' + esc(tr('mode_sell')) + '</b><small>' + esc(tr('mode_sell_h')) + ' · <span id="lvmNP">0</span> ' + esc(tr('count')) + '</small></div></div>' +
            '</div>') +
            '<div class="lvmSort" id="lvmSort"></div>' +
            '<div class="lvmList" id="lvmList"></div>' +
            '<div class="lvmDetail" id="lvmDetail" style="display:none"></div>' +
            '<div class="lvmPager" id="lvmPager"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lvmStat" id="lvmStat">' + esc(S.status) + '</div>' +
      '<div id="lvmUw"></div>' +
    '</div>';
    var tg = root.querySelector('#lvmCatTog');
    if (tg) tg.onmousedown = function () { window.__lvmTogHit = true; };
    var navs = root.querySelectorAll('.lvmNav');
    for (var ni = 0; ni < navs.length; ni++) navs[ni].onclick = function () {
      var m = this.getAttribute('data-m'); if (m) setMode(m);
      var c = this.getAttribute('data-cat');
      if (this.id === 'lvmCatPar') {
        // ลูกศร = พับ/กางอย่างเดียว; กดหัวข้อตอนอยู่หน้า "ทั้งหมด" แล้ว = พับ/กาง, ไม่งั้นไปหน้าทั้งหมด + กางให้เห็นหมวด
        var onAll = S.tab === 'market' && S.cat === 'all' && !S.detail;
        if (window.__lvmTogHit || onAll) { setCatOpen(!S.catOpen); window.__lvmTogHit = false; if (onAll || !S.catOpen) return; }
        else if (!S.catOpen) setCatOpen(true);
      }
      if (c && S.detail) closeDetail();
      if (c && c !== S.cat) { S.cat = c; S.page = 0; try { localStorage.setItem('lvmCat', c); } catch (e) {} paintList(); }
      setTab(this.getAttribute('data-tab'));
    };
    root.querySelector('#lvmHome').onclick = function (e) {
      if (e.target.closest && e.target.closest('[data-pull]')) { startPull(); return; }
      var go = e.target.closest && e.target.closest('[data-go]');
      if (go) { setMode(go.getAttribute('data-go')); setTab('market'); return; }
      var it = e.target.closest && e.target.closest('[data-v]');
      if (it) { setTab('market'); openDetail(it.getAttribute('data-v')); }
    };
    root.querySelector('#lvmClose').onclick = function () { send('lvm|close'); hide(); };
    root.querySelector('#lvmUw').onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-uw]'); if (!b) return;
      var a = b.getAttribute('data-uw');
      if (a === 'go') { send('lvm|updgo'); }
      else if (a === 'retry') { S.upd = { s: 'check' }; paintUpd(); send('lvm|update'); }
      else { if (S.upd && S.upd.s === 'ask') send('lvm|updno'); S.upd = null; S.clog = false; paintUpd(); }
    };
    paintUpd();
    root.querySelector('#lvmProf').onclick = function (e) { e.stopPropagation(); srvMenu(false); toggleMenu(); };
    root.querySelector('#lvmChips').onclick = function (e) {
      var c = e.target.closest && e.target.closest('[data-pick]'); if (!c) return;
      e.stopPropagation(); toggleMenu(false); srvMenu();
    };
    root.querySelector('#lvmSrvMenu').onclick = function (e) {
      e.stopPropagation();
      var it = e.target.closest && e.target.closest('[data-srv]'); if (!it) return;
      pickSrv(it.getAttribute('data-srv')); srvMenu(false);
    };
    root.querySelector('#lvmSrv').onclick = function (e) {
      if (e.target.closest && e.target.closest('[data-srvback]')) pickSrv('');
      if (e.target.closest && e.target.closest('[data-pull]')) startPull();
    };
    root.querySelector('#lvmMenu').onclick = function (e) {
      e.stopPropagation();
      var a = e.target.closest && e.target.closest('[data-act]'); if (!a) return;
      var act = a.getAttribute('data-act'), p = S.profile || {};
      if (act === 'logout') { S.menuAsk = true; paintMenu(); }
      else if (act === 'cancel') { S.menuAsk = false; paintMenu(); }
      else if (act === 'logout2') { toggleMenu(false); send('lvm|logout'); S.profile = null; S.profileJs = null; S.rows = []; S.oauthBusy = false; S.loginStep = 0; render(); }
      else if (act === 'share') { p.share = !p.share; send('lvm|share:' + (p.share ? 1 : 0)); paintMenu(); }
      else if (act === 'sync') { send('lvm|sync'); a.classList.add('busy'); setTimeout(function () { a.classList.remove('busy'); }, 2500); }
      else if (act === 'update') { toggleMenu(false); S.upd = { s: 'check' }; paintUpd(); send('lvm|update'); }
      else if (act === 'discord') send('lvm|discord');
      else if (act === 'changelog') { toggleMenu(false); S.clog = true; send('lvm|cfgcheck'); paintUpd(); }   // เปิดหน้าประวัติเวอร์ชัน (ขอ /config ล่าสุดด้วย)
    };
    if (!window.__lvmMenuDoc) {   // กดนอกเมนู / Esc = ปิด (ผูกครั้งเดียวต่อหน้า)
      window.__lvmMenuDoc = 1;
      document.addEventListener('click', function () { try { if (window.LVM && LVM.__closeMenu) LVM.__closeMenu(); } catch (e) {} });
      document.addEventListener('keydown', function (e) { if (e.keyCode === 27) try { if (window.LVM && LVM.__closeMenu) LVM.__closeMenu(); } catch (x) {} });
    }
    var si = root.querySelector('#lvmSearch');
    si.value = S.query || '';
    si.oninput = function () { S.query = (this.value || '').toLowerCase(); S.page = 0; if (S.tab !== 'market') setTab('market'); paintList(); };
    root.querySelector('#lvmPager').onclick = function (e) {
      var b = e.target.closest && e.target.closest('.lvmPg'); if (!b || b.classList.contains('off') || b.classList.contains('on')) return;
      goPage(+b.getAttribute('data-p'));
    };
    root.querySelector('#lvmSort').onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-sort]'); if (!b) return;
      S.sort = b.getAttribute('data-sort'); S.page = 0; paintList();
    };
    root.querySelector('#lvmList').onclick = function (e) {
      var s = e.target.closest && e.target.closest('.lvmStar');
      if (s) {
        var b = s.getAttribute('data-b'); if (S.fav[b]) delete S.fav[b]; else S.fav[b] = 1;
        saveFav(); paintList(); return;
      }
      var c = e.target.closest && e.target.closest('.lvqC');
      if (c) openDetail(c.getAttribute('data-v'));
    };
    si.addEventListener('input', function () { if (S.detail) closeDetail(); });
    var mbs = root.querySelectorAll('.lvmMode');
    for (var mi = 0; mi < mbs.length; mi++) mbs[mi].onclick = function () { setMode(this.getAttribute('data-m')); };
    bindLangs(root);
    paintList();
    paintHome();
    if (S.detail) { showDetail(true); paintDetail(); }   // เปลี่ยนภาษาระหว่างเปิดรายละเอียด = อยู่หน้าเดิม
  }
  function setMode(m) {
    if (m !== 'buy' && !(SELL_ON && m === 'sell')) return;
    var changed = m !== S.mode;
    S.mode = m; if (changed) S.page = 0;
    try { localStorage.setItem('lvmMode', m); } catch (e) {}
    var mbs = document.querySelectorAll('#lvmRoot .lvmMode');
    for (var j = 0; j < mbs.length; j++) mbs[j].classList.toggle('on', mbs[j].getAttribute('data-m') === m);
    syncNav();
    if (S.detail) paintDetail(); else paintList();
  }
  function setTab(t) {
    S.tab = t;
    syncNav();
    var h = document.getElementById('lvmHome'), m = document.getElementById('lvmMkt');
    if (h) h.style.display = t === 'home' ? '' : 'none';
    if (m) m.style.display = t === 'market' ? '' : 'none';
    if (t === 'market') { if (S.detail) closeDetail(); else fitRows(); }
    if (t === 'home') paintHome();
  }
  // แถวการ์ดสูงพอดีพื้นที่: 3 แถวเต็มกล่องพอดี (จอเล็กไปก็ไม่บีบต่ำกว่า 208px แต่เลื่อนดูแทน)
  // เขียน HTML ใหม่เฉพาะตอนเนื้อหาเปลี่ยนจริง (เขียนทับของเดิม = รูป/การ์ดโหลดใหม่ = กะพริบ)
  function setHtml(el, h) { if (!el || el.__h === h) return false; el.__h = h; el.innerHTML = h; return true; }
  function fitRows() {
    var list = document.getElementById('lvmList'); if (!list || !list.offsetHeight) return;
    var h = list.clientHeight - 28 - 2 * 12;
    list.style.gridAutoRows = Math.max(190, Math.floor(h / 3)) + 'px';
  }
  if (!window.__lvmFit) { window.__lvmFit = 1; window.addEventListener('resize', function () { try { fitRows(); if (S.detail) drawChart(); } catch (e) {} }); }

  // หน้าแรก: ทางเข้า 2 โหมด + ไอเทมที่เพิ่งเห็นล่าสุด (ไม่มีราคา) + วิธีที่ข้อมูลเข้ามา
  function paintHome() {
    var box = document.getElementById('lvmHome'); if (!box) return;
    var p = S.profile || {}, ns = 0, nb = 0, last = 0, recent = [];
    for (var i = 0; i < S.rows.length; i++) {
      var r = S.rows[i], t = Math.max(+r.st || 0, +r.bt || 0);
      if (r.sell) ns++; if (r.buy) nb++;
      if (t > last) last = t;
      if (t) recent.push({ r: r, t: t });
    }
    recent.sort(function (a, b) { return (b.t - a.t) || ((a.r.__i || 0) - (b.r.__i || 0)); });
    var rec = '';
    for (var k = 0; k < recent.length && k < 10; k++) {
      var x = recent[k].r;
      rec += '<div class="lvhItem" data-v="' + esc(vidOf(x)) + '">' + icoHtml(x) +
        '<div class="lvhTx"><b title="' + esc(x.name) + '">' + esc(x.name) + (x.grade ? ' <span class="lvmGi">' + esc(x.grade) + '</span>' : '') + '</b><small>ID ' + esc(x.base) + ' · ' + esc(ago(recent[k].t)) + '</small></div></div>';
    }
    var hello = '<div class="lvhHello"><b>' + esc(tr('hello')) + (p.name ? ', ' + esc(p.name) : '') + '</b><small>' + esc(tr('home_sub')) + '</small></div>';
    var sp = startHtml();
    if (sp) { setHtml(box, hello + sp + '<div class="lvhTip">' + esc(tr('home_tip')) + '</div>'); countUp(); return; }
    setHtml(box, hello +
      '<div class="lvhGo">' +
        '<div class="lvhBig s" data-go="buy"><i>🛒</i><div><b>' + esc(tr('mode_buy')) + '</b><small>' + money(ns) + ' ' + esc(tr('count')) + ' · ' + esc(tr('mode_buy_h')) + '</small></div><em>›</em></div>' +
        (!SELL_ON ? '' : '<div class="lvhBig b" data-go="sell"><i>💰</i><div><b>' + esc(tr('mode_sell')) + '</b><small>' + money(nb) + ' ' + esc(tr('count')) + ' · ' + esc(tr('mode_sell_h')) + '</small></div><em>›</em></div>') +
      '</div>' +
      '<div class="lvhSec"><b>' + esc(tr('recent')) + '</b><small>' + (last ? esc(tr('updated')) + ' ' + esc(ago(last)) : '') + '</small></div>' +
      (rec ? '<div class="lvhRecent">' + rec + '</div>' : '<div class="lvdEmpty">' + esc(tr('none')) + '</div>') +
      '<div class="lvhTip">' + esc(tr('home_tip')) + '</div>');
  }

  // ติดตั้งใหม่ (srv.gate=1): ยังไม่ดึงกองกลางจนกว่าจะกด -> การ์ดเริ่มดึง / กำลังดึง / ได้ N ร้าน / ไม่สำเร็จ
  var PULL_SVG = {
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v9"/><path d="M8 17l4 4 4-4"/><path d="M20.4 16.4A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/></svg>'
  };
  function startHtml() {
    var v = S.srv || {}, P = S.pull || {};
    var first = +v.gate || P.first;
    if (!first) return '';
    if (P.s === 'run') return '<div class="lvhStart"><div class="lvhOrb run"><i class="p"></i>' + PULL_SVG.dl + '</div>' +
      '<b class="t">' + esc(tr('pull_run')) + '</b><div class="lvhBar"><i></i></div></div>';
    if (P.s === 'ok' && P.until && Date.now() < P.until) return '<div class="lvhStart"><div class="lvhOrb ok">' + PULL_SVG.ok + '</div>' +
      '<b class="t">' + esc(tr('pull_ok')) + '</b><span class="lvhCnt" id="lvhCnt" data-n="' + (+P.n || 0) + '">0<em>' + esc(tr('pull_shops')) + '</em></span></div>';
    if (P.s === 'err') return '<div class="lvhStart"><div class="lvhOrb err">' + PULL_SVG.err + '</div>' +
      '<b class="t">' + esc(tr('pull_err')) + '</b><button class="lvhPullBtn" data-pull="1">' + esc(tr('pull_retry')) + '</button></div>';
    if (!+v.gate) return '';
    return '<div class="lvhStart"><div class="lvhOrb">' + PULL_SVG.dl + '</div>' +
      '<b class="t">' + esc(tr('pull_t')) + '</b><small>' + esc(tr('pull_h')) + '</small>' +
      '<button class="lvhPullBtn" data-pull="1">' + esc(tr('pull_btn')) + '</button></div>';
  }
  function countUp() {   // ตัวเลขจำนวนร้านวิ่งขึ้นจาก 0
    var el = document.getElementById('lvhCnt'); if (!el || el.__run) return; el.__run = 1;
    var n = +el.getAttribute('data-n') || 0, t0 = Date.now(), em = el.innerHTML.replace(/^[^<]*/, '');
    (function step() {
      var k = Math.min(1, (Date.now() - t0) / 700), e = 1 - Math.pow(1 - k, 3);
      el.innerHTML = money(Math.round(n * e)) + em;
      if (k < 1 && el.parentNode) setTimeout(step, 30);
    })();
  }
  function startPull() {
    if (S.pull && S.pull.s === 'run') return;
    S.pull = { s: 'run', first: !!(+((S.srv || {}).gate) || (S.pull && S.pull.first && S.pull.s === 'err')) };
    paintHome(); paintSrv(true); send('lvm|pull');
    var me = S.pull;
    setTimeout(function () { if (S.pull === me && me.s === 'run') { S.pull = { s: 'err', first: me.first }; paintHome(); paintSrv(true); } }, 30000);
  }

  function ago(t) {   // t = unix วินาที (เวลาที่ร้านนั้นถูกเห็นล่าสุด)
    t = +t || 0; if (!t) return '';
    var s = Math.max(0, Date.now() / 1000 - t);
    if (s < 90) return tr('ago_now');
    if (s < 3600) return Math.round(s / 60) + ' ' + tr('ago_m');
    if (s < 86400) return Math.round(s / 3600) + ' ' + tr('ago_h');
    return Math.round(s / 86400) + ' ' + tr('ago_d');
  }
  // การ์ดสินค้าแบบ LavkaPrices: รูปบนสุด + badge ซ้าย + ดาวขวา / ชื่อ + ไอดีไอเทม / ราคาใหญ่ / ร้าน·กลาง / ร้าน·อายุ + ป้ายซื้อ-ขาย
  // ช่องรูปไอเทม: สีพื้นของเกม (rarity) + แสงวิ่งผ่าน เหมือน LavkaPrices; ยังไม่รู้สี = เทาเข้ม
  function icoHtml(r, big) {
    var c = /^[0-9A-Fa-f]{6}$/.test(r.bg || '') ? r.bg : '3a4150';
    return '<div class="lvqIco rar' + (big ? ' big' : '') + '" style="--rc:#' + c + '">' +
      '<img src="' + ICON + esc(r.base) + '.webp" onerror="this.style.display=\'none\'"></div>';
  }
  function vidOf(r) { return String(r.vid || r.base); }
  // การ์ด 1 ใบต่อไอเทม (ทุกระดับ 0 / +N / ★N รวมกัน) เหมือนไอเทมธรรมดา; ระดับไปแยกดูในหน้ารายละเอียด
  function mergeRows(a) {
    if (Object.prototype.toString.call(a) !== '[object Array]') return [];
    var by = {}, out = [];
    S.bgv = {};
    for (var i = 0; i < a.length; i++) {
      var x = a[i], b = String(x.base || x.vid), v = String(x.vid || b);
      if (x.bg) S.bgv[v] = x.bg;
      var m = by[b];
      if (!m) { m = by[b] = { vid: b, base: b, name: x.name, bg: null, ns: 0, nb: 0, nlv: 0, st: 0, bt: 0 }; out.push(m); }
      m.nlv++;
      if (v === b || !m.bg) m.bg = x.bg || m.bg;   // สีของตัวปกติก่อน
      if (x.sell && (!m.sell || x.sell < m.sell)) { m.sell = x.sell; m.sellShop = x.sellShop; m.sellCnt = x.sellCnt; }
      if (x.buy && (!m.buy || x.buy > m.buy)) { m.buy = x.buy; m.buyShop = x.buyShop; m.buyCnt = x.buyCnt; }
      m.ns += +x.ns || (x.sell ? 1 : 0); m.nb += +x.nb || (x.buy ? 1 : 0);
      m.st = Math.max(m.st, +x.st || 0); m.bt = Math.max(m.bt, +x.bt || 0);
      if (x.ty != null && m.ty == null) m.ty = x.ty;
      if (v === b) m.med = x.med;   // ราคากลางเฉพาะตัวปกติ (คนละระดับเอามาเฉลี่ยรวมไม่ได้)
    }
    return out;
  }
  // หน้าแรก: การ์ดไอเทมไม่มีราคา (รูป ชื่อ ID จำนวนร้าน) กดแล้วเปิดรายการร้านทั้งหมด
  function card(r) {
    var fav = S.fav[r.base] ? 1 : 0;
    var badge = '';
    var grade = r.grade ? ' <span class="lvmGi">' + esc(r.grade) + '</span>' : '';
    var pills = S.mode === 'sell'
      ? '<span class="lvqPill b">' + (r.nb || 1) + ' ' + esc(tr('n_buy2')) + '</span>'
      : '<span class="lvqPill s">' + (r.ns || 1) + ' ' + esc(tr('n_sell')) + '</span>';
    return '<div class="lvqC" data-v="' + esc(vidOf(r)) + '">' +
      '<div class="lvqImg">' + badge +
        '<span class="lvmStar' + (fav ? ' on' : '') + '" data-b="' + esc(r.base) + '">' + (fav ? '★' : '☆') + '</span>' +
        icoHtml(r) + '</div>' +
      '<div class="lvqB">' +
        '<div class="lvqN" title="' + esc(r.name) + '">' + esc(r.name) + grade + '</div>' +
        '<div class="lvqId">ID ' + esc(r.base) + (r.nlv > 1 ? ' · ' + r.nlv + ' ' + esc(tr('n_lvls')) : '') + '</div>' +
        '<div class="lvqPills">' + pills + '</div>' +
        '<div class="lvqF"><span class="lvqMore">' + esc(tr('view_all')) + ' ›</span></div>' +
      '</div></div>';
  }
  // หน้ารายละเอียด: ร้านขาย (ถูก->แพง) | ร้านรับซื้อ (แพง->ถูก)
  // ตีบวกสูงสุดของไอเทม (จากหน้าต่างข้อมูลในเกม "Улучшение: N/12")
  function upMaxOf(base) {
    var I = S.info || {};
    for (var k in I) if ((k === String(base) || k.indexOf(base + '~') === 0) && I[k] && I[k].upmax) return I[k].upmax;
    return 0;
  }
  // ป้ายระดับของชิ้น: ตีบวก "3/12" (ไม่มีตีบวก = 0/12) หรือดาว "★2"
  function lvlOf(vid, base) {
    // รูปแบบ: 557~e3 / 557~t2 / 10122~t3e8 (ดาวและตีบวกพร้อมกัน)
    var e = /~(?:t\d+)?e(\d+)/.exec(vid), t = /~t(\d+)/.exec(vid), mx = upMaxOf(base);
    var up = e ? '+' + e[1] + (mx ? '/' + mx : '') : (mx ? '0/' + mx : '');
    if (t) return { cls: 't', txt: '★' + t[1] + (up ? ' ' + up : '') };
    if (e) return { cls: 'e', txt: up };
    return mx ? { cls: 'z', txt: up } : null;
  }
  // ลำดับระดับ: ดาวก่อน แล้วตีบวก (0 < +3 < +8 < ★2 < ★2 +8 ...)
  function lvN(v) { var t = /~t(\d+)/.exec(v || ''), e = /~(?:t\d+)?e(\d+)/.exec(v || ''); return (t ? +t[1] * 100 : 0) + (e ? +e[1] : 0); }
  function sideList(d) { return d ? (S.mode !== 'sell' ? d.sell : d.buy) : null; }
  // ระดับที่กำลังดู (กราฟ/ข้อมูลตามระดับนี้): ที่เลือกไว้ > ตัวปกติ (ไม่มีระดับ) ถ้ามีขาย > แถวแรก (ราคาดีสุด)
  function curLv() {
    if (S.lv) return S.lv;
    var base = String(S.detail.base), L = sideList(S.detailData);
    if (L && L.length) {
      var cnt = {}, seen = {}, top = String(L[0].vid || base);
      for (var i = 0; i < L.length; i++) {
        var v = String(L[i].vid || base); if (v === base) return base;
        if (!seen[v + '|' + L[i].shop]) { seen[v + '|' + L[i].shop] = 1; cnt[v] = (cnt[v] || 0) + 1; }
        if (cnt[v] > (cnt[top] || 0)) top = v;
      }
      return top;
    }
    return base;
  }
  // สรุปแต่ละระดับ: ราคาดีสุดตอนนี้ / เฉลี่ยตอนนี้ (ทุกแถว ถ่วงตามจำนวน) / เฉลี่ย 30 วัน (จากกราฟ) / จำนวนร้าน
  // ราคากลางถ่วงตามจำนวนชิ้น: [[ราคา, จำนวน], ...]
  function medOf(ps, n) {
    ps = (ps || []).slice().sort(function (a, b) { return a[0] - b[0]; });
    var half = n / 2, acc = 0;
    for (var i = 0; i < ps.length; i++) { acc += ps[i][1]; if (acc >= half) return ps[i][0]; }
    return ps.length ? ps[ps.length - 1][0] : 0;
  }
  function levelStats(d) {
    var L = sideList(d) || [], sell = S.mode !== 'sell', g = {}, out = [];
    for (var i = 0; i < L.length; i++) {
      var x = L[i], v = String(x.vid || S.detail.base), e = g[v] || (g[v] = { vid: v, best: x.price, shop: x.shop, sum: 0, n: 0, shops: {} });
      if (sell ? x.price < e.best : x.price > e.best) { e.best = x.price; e.shop = x.shop; }
      var c = Math.max(1, +x.cnt || 1); e.sum += x.price * c; e.n += c; e.shops[x.shop] = 1; (e.ps || (e.ps = [])).push([+x.price, c]);
    }
    var H = S.hist && S.hist.base === String(S.detail.base) ? S.hist.levels : null;
    for (var k in g) {
      var s = g[k], ns = 0; for (var z in s.shops) ns++;
      var days = (H && H[k]) || [], hs = 0, hn = 0;
      var d30 = Math.round((Date.now() / 1000 + 3 * 3600) / 86400 - 0.5) - 29;
      for (var j = 0; j < days.length; j++) { if (dayNum(days[j].d) < d30) continue; var p = sell ? (days[j].sm || days[j].s) : (days[j].bm || days[j].b); if (p) { hs += +p; hn++; } }
      out.push({ vid: k, best: s.best, shop: s.shop, avg: medOf(s.ps, s.n), avg30: hn ? Math.round(hs / hn) : 0, shops: ns });
    }
    out.sort(function (a, b) { return lvN(a.vid) - lvN(b.vid); });
    return out;
  }
  // ทุกระดับที่รู้จัก (มีร้านตอนนี้ หรือมีประวัติ) เรียง 0 -> +N -> ★N
  function levelOrder() {
    var seen = {}, out = [], L = sideList(S.detailData) || [], base = String(S.detail.base);
    var H = S.hist && S.hist.base === base ? S.hist.levels : {};
    for (var i = 0; i < L.length; i++) { var v = String(L[i].vid || base); if (!seen[v]) { seen[v] = 1; out.push(v); } }
    var sell = S.mode !== 'sell';
    for (var k in H) if (!seen[k] && histPts(H[k], sell).length) { seen[k] = 1; out.push(k); }
    out.sort(function (a, b) { return lvN(a) - lvN(b); });
    return out;
  }
  // กราฟวาดเส้นเดียว = ระดับที่เลือก (ไม่ให้รก); ระดับอื่นดูโดยกดแท็บ ในหน้าเดิม
  function drawnLevels() { return [curLv()]; }
  function levelColor() { return S.mode !== 'sell' ? '#ffd23f' : '#2fd18b'; }
  // แท็บเลือกระดับ: แค่ชื่อระดับ (ราคา/สถิติอยู่แถวใต้กราฟ)
  function levelBar(d) {
    var st = levelStats(d), cur = curLv(), sell = S.mode !== 'sell';
    if (st.length < 2) return '';
    var h = '<div class="lvdLvls">';
    for (var i = 0; i < st.length; i++) {
      var x = st[i], L = lvlOf(x.vid, S.detail.base);
      h += '<div class="lvdLvc' + (x.vid === cur ? ' on' : '') + '" data-lv="' + esc(x.vid) + '">' +
        '<em class="lvdLv ' + (L ? L.cls : '') + '">' + esc(L ? L.txt : '0') + '</em>' +
        '<b class="' + (sell ? 's' : 'b') + '">' + money(x.best) + '</b>' +
        '<small>' + esc(tr('lv_avg')) + ' ' + money(x.avg) + (x.avg30 ? ' · ' + esc(tr('lv_avg30')) + ' ' + money(x.avg30) : '') + ' · ' + x.shops + ' ' + esc(tr('shops')) + '</small></div>';
    }
    return h + '</div>';
  }
  // รายการร้าน: ทุกระดับรวมกันในรายการเดียว เรียงตามราคา (เหมือนไอเทมธรรมดา) มีคอลัมน์ระดับบอก
  function shopRows(list, cls, emptyKey) {
    if (!list) return '<div class="lvdEmpty">' + esc(tr('loading')) + '</div>';
    if (!list.length) return '<div class="lvdEmpty">' + esc(tr(emptyKey)) + '</div>';
    var base = S.detail.base, cur = curLv(), multi = false, anyLvl = !!upMaxOf(base);
    for (var i = 0; i < list.length; i++) { var v0 = String(list[i].vid || base); if (v0 !== String(list[0].vid || base)) multi = true; if (v0 !== String(base)) anyLvl = true; }
    var cols = anyLvl ? ' lv' : '';
    var h = '<div class="lvdHead' + cols + '"><span>' + esc(tr('col_shop')) + '</span>' + (anyLvl ? '<span>' + esc(tr('col_lvl')) + '</span>' : '') +
      '<span>' + esc(tr('col_price')) + '</span><span>' + esc(tr('col_qty')) + '</span><span>' + esc(tr('col_seen')) + '</span></div>';
    for (var j = 0; j < list.length; j++) {
      var x = list[j], v = String(x.vid || base), L = lvlOf(v, base), pk = isPick(x, v);
      h += '<div class="lvdRow' + cols + (j === 0 ? ' best ' + cls : '') + (pk ? ' pick' : '') + (multi && v === cur ? ' curlv' : '') +
        '" data-shop="' + esc(x.shop) + '" data-vid="' + esc(v) + '" data-price="' + x.price + '">' +
        '<span class="sh" title="' + esc(x.shop) + '">' + esc(x.shop) + '</span>' +
        (anyLvl ? '<span>' + (L ? '<em class="lvdLv ' + L.cls + '">' + esc(L.txt) + '</em>' : '<em class="lvdLv">0</em>') + '</span>' : '') +
        '<b class="' + cls + '">' + money(x.price) + '</b><span class="m">x' + (x.cnt || 1) + '</span><span class="m">' + esc(ago(x.t)) + '</span></div>';
    }
    return h;
  }
  // แถวที่เลือก = ร้าน + ระดับ + ราคา (ร้านเดียววางหลายราคาได้)
  function isPick(x, v) { return !!S.pick && S.pick.shop === x.shop && S.pick.vid === v && (!S.pick.price || +S.pick.price === +x.price); }
  // ชิ้นที่เลือกจากรายการร้าน (ค่าเริ่มต้น = แถวแรกของระดับนี้)
  function pickedRow(d) {
    var list = sideList(d), base = String(S.detail.base), cur = curLv();
    if (!list || !list.length) return null;
    for (var i = 0; i < list.length; i++) if (isPick(list[i], String(list[i].vid || base))) return list[i];
    for (var j = 0; j < list.length; j++) if (String(list[j].vid || base) === cur) return list[j];
    return list[0];
  }
  function pieceHtml(x) {
    if (!x) return '';
    var sell = S.mode !== 'sell', v = String(x.vid || vidOf(S.detail)), L = lvlOf(v, S.detail.base);
    return '<div class="lviPiece"><div class="lviPh">' + esc(tr(sell ? 'piece_s' : 'piece_b')) + ' <b>' + esc(x.shop) + '</b></div>' +
      '<div class="lviPg">' +
        '<div><small>' + esc(tr('col_lvl')) + '</small><b class="lv">' + esc(L ? L.txt : '—') + '</b></div>' +
        '<div><small>' + esc(tr('col_price')) + '</small><b class="' + (sell ? 's' : 'b') + '">' + money(x.price) + '</b></div>' +
        '<div><small>' + esc(tr('col_qty')) + '</small><b>x' + (x.cnt || 1) + '</b></div>' +
        '<div><small>' + esc(tr('col_seen')) + '</small><b>' + esc(ago(x.t)) + '</b></div>' +
      '</div></div>';
  }
  function paintDetail() {
    var box = document.getElementById('lvmDetail'); if (!box) return;
    var r = S.detail, d = S.detailData && S.detailData.vid === vidOf(r) ? S.detailData : null;
    var CL = lvlOf(curLv(), r.base);   // ระดับที่กำลังดูอยู่ (เปลี่ยนตามแถว/แถบที่กด ไม่เปลี่ยนหน้า)
    var grade = CL ? ' <span class="lvmGi">' + esc(CL.txt) + '</span>' : '';
    box.innerHTML =
      '<div class="lvdTop">' +
        '<span class="lvdBack" id="lvdBack">‹ ' + esc(tr('back')) + '</span>' +
        icoHtml({ base: r.base, bg: (S.bgv && S.bgv[curLv()]) || r.bg }, 1) +
        '<div class="lvdTitle"><b>' + esc(r.name) + grade + '</b><small>ID ' + esc(r.base) + '</small></div>' +
        '<div class="lvdKpis">' + kpis(r, d) + '</div>' +
      '</div>' +
      // แสดงฝั่งเดียวตามโหมด: ซ้าย = กราฟ 30 วัน + รายการร้าน, ขวา = ข้อมูลไอเทม (เหมือนหน้าต่างข้อมูลในเกม)
      '<div class="lvdGrid"><div class="lvdLeft">' +
        '<div class="lvdCol lvdHist"><div class="lvdCap ' + (S.mode === 'sell' ? 'b' : 's') + '">' + esc(tr('hist_title')) + (CL && levelOrder().length < 2 ? ' <i>' + esc(CL.txt) + '</i>' : '') + '</div>' +
          levelBar(d) +
          '<div class="lvdChart" id="lvdChart"></div><div id="lvdSumBox"></div></div>' +
        '<div class="lvdCol lvdShops lvdSellCol"><div class="lvdCap s">' + esc(tr('n_sell')) + (d ? ' <i>' + curCount(d.sell) + '</i>' : '') + '</div>' + shopRows(d && d.sell, 's', 'no_sellers') + '</div>' +
        '<div class="lvdCol lvdShops lvdBuyCol"><div class="lvdCap b">' + esc(tr('n_buy2')) + (d ? ' <i>' + curCount(d.buy) + '</i>' : '') + '</div>' + shopRows(d && d.buy, 'b', 'no_buyers') + '</div>' +
      '</div><div class="lvdCol lvdInfo">' + pieceHtml(pickedRow(d)) + infoHtml(r) + '</div></div>';
    box.querySelector('#lvdBack').onclick = closeDetail;
    // คลิกร้าน = ดูชิ้นของร้านนั้น + กราฟ/ข้อมูลเปลี่ยนเป็นระดับของชิ้นนั้น (อยู่หน้าเดิม ไม่สลับหน้า)
    var rws = box.querySelectorAll((S.mode === 'sell' ? '.lvdBuyCol' : '.lvdSellCol') + ' .lvdRow[data-shop]');
    for (var i = 0; i < rws.length; i++) rws[i].onclick = function () {
      S.pick = { shop: this.getAttribute('data-shop'), vid: this.getAttribute('data-vid'), price: this.getAttribute('data-price') };
      S.lv = S.pick.vid; paintDetail();
    };
    var lvc = box.querySelectorAll('.lvdLvc[data-lv]');
    for (var k = 0; k < lvc.length; k++) lvc[k].onclick = function () { S.lv = this.getAttribute('data-lv'); S.pick = null; paintDetail(); };
    drawChart();
  }
  // จำนวนร้าน (ไม่ใช่จำนวนแถว: ร้านเดียวหลายราคา = 1 ร้าน)
  function curCount(list) {
    var seen = {}, n = 0;
    for (var i = 0; i < (list || []).length; i++) if (!seen[list[i].shop]) { seen[list[i].shop] = 1; n++; }
    return n;
  }
  function drawChart() {
    var c = document.getElementById('lvdChart'), sb = document.getElementById('lvdSumBox');
    if (!c || !S.detail) return;
    // ใส่แถวสรุปก่อน แล้วค่อยวัดความสูงกล่อง (ไม่งั้นกราฟสูงเกินไปทับแถวสรุป)
    if (sb) sb.innerHTML = histChart(curLv(), 600, 200).sum || '';
    c.innerHTML = '';
    var o = histChart(curLv(), Math.max(320, c.clientWidth), Math.max(110, c.clientHeight));
    c.innerHTML = o.svg;
  }
  // ตัวเลขหัวหน้า: ฝั่งเดียวตามโหมด (ไม่มีกำไร/ไม่เทียบสองฝั่ง)
  function kpis(r, d) {
    var sell = S.mode !== 'sell', cls = sell ? 's' : 'b', inf = infoOf(r);
    var best = sell ? r.sell : r.buy, n = d ? curCount(sell ? d.sell : d.buy) : (sell ? r.ns : r.nb);
    var h = '<div class="lvdKpi"><small>' + esc(tr(sell ? 'k_best_s' : 'k_best_b')) + '</small><b class="' + cls + '">' + (best ? money(best) : '—') + '</b></div>';
    if (sell && r.med) h += '<div class="lvdKpi"><small>' + esc(tr('med')) + '</small><b>' + money(r.med) + '</b></div>';
    h += '<div class="lvdKpi"><small>' + esc(tr('shops')) + '</small><b>' + (n || 0) + '</b></div>';
    if (sell && (r.buy || (d && d.buy && d.buy.length))) h += '<div class="lvdKpi"><small>' + esc(tr('k_best_b')) + '</small><b class="b">' + (r.buy ? money(r.buy) : '—') + '</b></div>';
    if (inf && inf.count) h += '<div class="lvdKpi"><small>' + esc(tr('k_srv')) + '</small><b>' + esc(String(inf.count).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + '</b></div>';
    return h;
  }
  // ข้อมูลไอเทมจากหน้าต่าง "ИНФОРМАЦИЯ О ПРЕДМЕТЕ" ของเกม: เก็บเป็นบรรทัดดิบ แล้วจัดหมวดที่นี่
  function infoOf(r) {
    // ระดับดาว (~tN) ข้อมูลต่างกัน = ใช้ของระดับนั้นตรง ๆ; ตีบวก (+N) ใช้ของ id หลัก
    var I = S.info || {}, v = S.detail ? curLv() : vidOf(r), mt = /~t(\d+)/.exec(v);
    var raw = I[v] || (mt ? I[r.base + '~t' + mt[1]] : null) || I[r.base];   // เกรดตรงตัวก่อน แล้ว fallback ดาวล้วน / ตัวหลัก
    if (raw && !raw.count && I[r.base] && I[r.base].count) raw = { lines: raw.lines, upmax: raw.upmax, count: I[r.base].count, plus: I[r.base].plus };
    var nm = String(r.name || '').replace(/\s+/g, ' ').trim().toLowerCase(), lastTx = false;
    if (!raw || !raw.lines || (!raw.lines.length && !raw.count)) return null;
    var out = { kind: '', count: raw.count ? raw.count + (raw.plus ? '+' : '') : 0, bonus: [], up: [], text: [], ok: '' }, sec = '';
    for (var i = 0; i < raw.lines.length; i++) {
      var t = String(raw.lines[i] || '').replace(/\s+/g, ' ').trim();
      var wasTx = lastTx; lastTx = false;   // ต่อย่อหน้าเฉพาะเมื่อบรรทัดก่อนหน้าเป็นข้อความธรรมดา
      if (!t) { sec = ''; continue; }
      if (t.toLowerCase() === nm) continue;   // ชื่อไอเทมซ้ำกับหัว
      if (!/^\*/.test(t)) t = t.replace(/^[-–—•\s]+/, '');
      var m;
      if (m = /на сервере:\s*([\d\s.,]+\+?)/i.exec(t)) { out.count = out.count || m[1].replace(/[^\d]/g, ''); continue; }
      if (/^(Покупка предмета|Продажа предмета|Введите|В наличии|У вас|Стоимость|Осталось|Уровень улучшения|Улучшение|Установлен|Принадлежн|Верность|Класс качества|Владел|Срок|Прочност|Характеристики|Цена|Ваш)/i.test(t)) continue;   // ค่าของชิ้นที่ถือ/เฉพาะชิ้น ไม่ใช่ของไอเทม
      if (/^Предмет:/i.test(t)) continue;
      if (/^(?:(?:RU|EN|UA|KZ)\s+)?(?:(?:КУПИТЬ|ПРОДАТЬ|ОТМЕНА|ЗАКРЫТЬ|ВЫБРАТЬ|НАЗАД|ОК|ДА|НЕТ)\s*)+$/i.test(t)) continue;   // ปุ่มของหน้าต่าง   // แค่ชื่อไอเทม (มีบนหัวอยู่แล้ว)
      if (m = /дополнительно да[её]т\s*(.+)$/i.exec(t)) { out.bonus.push(m[1]); continue; }
      if (/^\*\s*/.test(t)) { out.up.push(t.replace(/^\*\s*/, '')); continue; }
      if (!out.kind && i < 2 && /^[^:]{2,20}:\s*\S/.test(t)) { out.kind = t; continue; }
      if (/специальное свойство/i.test(t)) { out.ok = t; continue; }
      // เกมตัดบรรทัดกลางประโยค -> ต่อบรรทัดที่ติดกันเป็นย่อหน้าเดียว
      if (wasTx && !/^["«]/.test(t)) out.text[out.text.length - 1] += ' ' + t; else out.text.push(t);
      lastTx = true; continue;
    }
    return out;
  }
  function infoHtml(r) {
    var o = infoOf(r);
    if (!o) return '<div class="lvdCap">' + esc(tr('info_title')) + '</div><div class="lviNone"><i>ⓘ</i>' + esc(tr('info_none')) + '</div>';
    var h = '<div class="lvdCap">' + esc(tr('info_title')) + '</div>';
    if (o.kind) h += '<span class="lviKind">' + esc(o.kind) + '</span>';
    if (o.bonus.length) { h += '<div class="lviH">' + esc(tr('info_bonus')) + '</div>'; for (var i = 0; i < o.bonus.length; i++) h += '<div class="lviBon">' + esc(o.bonus[i].replace(/^\+/, '')) + '</div>'; }
    if (o.up.length) { h += '<div class="lviH">' + esc(tr('info_up')) + '</div>'; for (var j = 0; j < o.up.length; j++) h += '<div class="lviUp">' + esc(o.up[j]) + '</div>'; }
    if (o.text.length) { h += '<div class="lviH">' + esc(tr('info_desc')) + '</div>'; for (var k = 0; k < o.text.length; k++) h += '<div class="lviTx">' + esc(o.text[k]) + '</div>'; }
    if (o.ok) h += '<div class="lviOk">✓ ' + esc(o.ok) + '</div>';
    return h;
  }
  // กราฟเส้นราคารายวัน (SVG ในตัว): โหมดซื้อ = ราคาขายต่ำสุด, โหมดขาย = ราคารับซื้อสูงสุด, เส้นประ = ราคากลาง
  // ป้ายแกน Y: เลือกทศนิยมตามช่วงราคา (กันป้ายซ้ำ 12m 12m เวลาช่วงแคบ)
  function axisK(v, span) {
    var u = v >= 1e9 ? [1e9, 'b'] : v >= 1e6 ? [1e6, 'm'] : v >= 1e3 ? [1e3, 'k'] : [1, ''];
    var dec = span / u[0] < 0.5 ? 2 : span / u[0] < 5 ? 1 : 0;
    return (v / u[0]).toFixed(dec).replace(/\.0+$/, '') + u[1];
  }
  function dayNum(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000) : null; }
  function histPts(D, sell) {
    var pts = [];
    for (var i = 0; i < (D || []).length; i++) {
      var x = D[i], v = sell ? x.s : x.b, m = sell ? x.sm : x.bm, n = sell ? x.sn : x.bn, dn = dayNum(x.d);
      if (v && dn != null) pts.push({ d: x.d, dn: dn, v: +(m || v), m: +v, n: n || 0 });
    }
    return pts;
  }
  function histChart(vid, W, Ht) {
    // สองเส้นของเกรดที่กำลังดู: เหลือง = ขายถูกสุด, เขียว = รับซื้อสูงสุด (หักค่าธรรมเนียม)
    var H = S.hist && S.detail && S.hist.base === String(S.detail.base) ? S.hist : null;
    if (!H) return { svg: '<div class="lvdEmpty">' + esc(tr('loading')) + '</div>' };
    var today = Math.round((Date.now() / 1000 + 3 * 3600) / 86400 - 0.5);
    function series(isSell, fee) {   // v = ราคาหลัก (ขายถูกสุด / รับซื้อสูงสุด) หักค่าธรรมเนียมถ้ามี
      var raw = histPts(H.levels[vid], isSell), o = [];
      for (var i = 0; i < raw.length; i++) { var r = raw[i]; if (r.dn < today - 29) continue; o.push({ d: r.d, dn: r.dn, v: r.m * (1 - (fee || 0)), n: r.n }); }
      return o;
    }
    var SELL = '#ffd23f', BUY = '#2fd18b';
    var sellP = series(true, 0), buyP = series(false, BUY_FEE);
    if (sellP.length < 1 && buyP.length < 1) return { svg: '<div class="lvdEmpty">' + esc(tr('hist_none')) + '</div>' };
    var first = Infinity;
    if (sellP.length) first = Math.min(first, sellP[0].dn);
    if (buyP.length) first = Math.min(first, buyP[0].dn);
    var span = Math.min(29, Math.max(6, Math.ceil((today - first) * 1.08))), d0 = today - span;
    var L = 62, R = 14, Tp = 12, B = 26, lo = Infinity, hi = -Infinity;
    function bound(a) { for (var j = 0; j < a.length; j++) { lo = Math.min(lo, a[j].v); hi = Math.max(hi, a[j].v); } }
    bound(sellP); bound(buyP);
    var pad = (hi - lo) * 0.12 || hi * 0.1 || 1; lo = Math.max(0, lo - pad); hi += pad;
    function X(dn) { return L + (W - L - R) * Math.min(1, Math.max(0, (dn - d0) / span)); }
    function Y(v) { return Tp + (Ht - Tp - B) * (1 - (v - lo) / (hi - lo)); }
    var g = '', gN = Ht > 260 ? 5 : 3;
    for (var k = 0; k <= gN; k++) {
      var gv = lo + (hi - lo) * k / gN, gy = Y(gv).toFixed(1);
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + gy + '" y2="' + gy + '" stroke="rgba(255,255,255,.06)"/>' +
        '<text x="' + (L - 8) + '" y="' + gy + '" dy="4" text-anchor="end" fill="#5d6578" font-size="11">' + axisK(gv, hi - lo) + '</text>';
    }
    var xN = W > 640 ? 6 : 2;
    for (var q = 0; q <= xN; q++) {
      var dd = Math.round(d0 + q * span / xN), dt = new Date(dd * 86400000), lb = ('0' + dt.getUTCDate()).slice(-2) + '/' + ('0' + (dt.getUTCMonth() + 1)).slice(-2);
      g += '<text x="' + X(dd).toFixed(1) + '" y="' + (Ht - 6) + '" text-anchor="' + (q === 0 ? 'start' : q === xN ? 'end' : 'middle') + '" fill="#5d6578" font-size="11">' + lb + '</text>';
    }
    function pathOf(a) { var p = ''; for (var i = 0; i < a.length; i++) p += (i ? 'L' : 'M') + X(a[i].dn).toFixed(1) + ' ' + Y(a[i].v).toFixed(1); return p; }
    function dotsOf(a, col, lab) { var s = ''; for (var i = 0; i < a.length; i++) s += '<circle cx="' + X(a[i].dn).toFixed(1) + '" cy="' + Y(a[i].v).toFixed(1) + '" r="2.7" fill="' + col + '"><title>' + a[i].d + ' · ' + lab + ' ' + money(a[i].v) + ' · ' + a[i].n + ' ' + tr('shops') + '</title></circle>'; return s; }
    var sellLab = tr('hist_lo_s'), buyLab = BUY_FEE > 0 ? tr('hist_hi_b_fee') : tr('hist_hi_b');
    var svg = '<svg class="lvdSvg" width="' + W + '" height="' + Ht + '" viewBox="0 0 ' + W + ' ' + Ht + '" style="position:absolute;left:0;top:0;width:' + W + 'px;height:' + Ht + 'px">' + g;
    if (buyP.length > 1) svg += '<path d="' + pathOf(buyP) + '" fill="none" stroke="' + BUY + '" stroke-width="2" stroke-linejoin="round"/>';
    if (sellP.length > 1) svg += '<path d="' + pathOf(sellP) + '" fill="none" stroke="' + SELL + '" stroke-width="2.3" stroke-linejoin="round"/>';
    svg += dotsOf(buyP, BUY, buyLab) + dotsOf(sellP, SELL, sellLab) + '</svg>';
    var sLast = sellP[sellP.length - 1], bLast = buyP[buyP.length - 1];
    var sum = '<div class="lvdSum">' +
      '<span class="lvdLeg"><em style="border-color:' + SELL + '"></em>' + esc(sellLab) + (sLast ? ' <b style="color:' + SELL + '">' + money(sLast.v) + '</b>' : '') + '</span>' +
      '<span class="lvdLeg"><em style="border-color:' + BUY + '"></em>' + esc(buyLab) + (bLast ? ' <b style="color:' + BUY + '">' + money(bLast.v) + '</b>' : '') + '</span></div>';
    return { svg: svg, sum: sum };
  }
  function openDetail(vid, pick) {
    var r = null;
    for (var i = 0; i < S.rows.length; i++) if (vidOf(S.rows[i]) === vid) { r = S.rows[i]; break; }
    if (!r) return;
    S.detail = r; S.detailData = null; S.hist = null; S.pick = pick || null; S.lv = null; S.infoOpen = false;
    setTimeout(function () {   // server ไม่ตอบ = บอกว่ายังไม่มีประวัติ แทนหมุนค้าง
      if (S.detail === r && !S.hist) { S.hist = { base: String(r.base), levels: {} }; paintDetail(); }
    }, 8000);
    showDetail(true); paintDetail();
    send('lvm|item:' + vid);
  }
  function closeDetail() { S.detail = null; S.detailData = null; S.pick = null; S.lv = null; showDetail(false); }
  function showDetail(on) {
    var l = document.getElementById('lvmList'), p = document.getElementById('lvmPager'), d = document.getElementById('lvmDetail');
    if (l) l.style.display = on ? 'none' : '';
    var so = document.getElementById('lvmSort'); if (so) so.style.display = on ? 'none' : '';   // ปุ่มเรียงใช้กับรายการการ์ดเท่านั้น
    if (d) { d.style.display = on ? '' : 'none'; d.scrollTop = 0; }
    if (p) p.style.visibility = on ? 'hidden' : '';
    if (!on) fitRows();
  }
  function paintList() {
    var list = document.getElementById('lvmList'); if (!list) return;
    var q = S.query, rows = [], ns = 0, np = 0, cn = {};
    for (var i = 0; i < S.rows.length; i++) {
      var r = S.rows[i];
      if (q && (String(r.name || '').toLowerCase().indexOf(q) < 0) && (String(r.base || '').indexOf(q) < 0)) continue;
      if (r.sell) ns++; if (r.buy) np++;
      if (!sideOf(r)) continue;   // เฉพาะไอเทมที่มีฝั่งของโหมดนี้
      var rc = catOf(r); cn[rc] = (cn[rc] || 0) + 1;
      if (S.cat !== 'all' && rc !== S.cat) continue;
      rows.push(r);
    }
    // sort แบบ stable (CEF ในเกมเป็น Chromium เก่า sort ไม่ stable) = ลำดับไม่สลับไปมาระหว่างหน้า
    for (var k = 0; k < rows.length; k++) rows[k].__i = k;
    // เรียง: ร้านเยอะสุด / อัปเดตล่าสุด / ชื่อ (ไม่มีเรียงตามราคา/กำไร = ไม่ใช่ที่ล่าดีล)
    var srt = S.sort || 'shops', sl = S.mode !== 'sell';
    function key(r) { return srt === 'new' ? -(+(sl ? r.st : r.bt) || 0) : srt === 'name' ? 0 : -(+(sl ? r.ns : r.nb) || 0); }
    rows.sort(function (a, b) {
      return ((S.fav[b.base] ? 1 : 0) - (S.fav[a.base] ? 1 : 0)) || (key(a) - key(b)) ||
        (srt === 'name' ? (String(a.name).toLowerCase() < String(b.name).toLowerCase() ? -1 : String(a.name).toLowerCase() > String(b.name).toLowerCase() ? 1 : 0) : 0) || (a.__i - b.__i);
    });
    var so = document.getElementById('lvmSort');
    if (so) {
      var opts = [['shops', 'sort_shops'], ['new', 'sort_new'], ['name', 'sort_name']], sh = '<span class="lvmSortL">' + esc(tr('sort_by')) + '</span>';
      for (var oi = 0; oi < opts.length; oi++) sh += '<span class="lvmSortB' + (srt === opts[oi][0] ? ' on' : '') + '" data-sort="' + opts[oi][0] + '">' + esc(tr(opts[oi][1])) + '</span>';
      setHtml(so, sh);
    }
    var pages = Math.max(1, Math.ceil(rows.length / PAGE));
    if (S.page >= pages) S.page = pages - 1; if (S.page < 0) S.page = 0;
    var cs = [], from = S.page * PAGE, to = Math.min(rows.length, from + PAGE);
    for (var c = from; c < to; c++) cs.push(card(rows[c]));
    // จำนวนการ์ดเท่าเดิม = เปลี่ยนเฉพาะใบที่ข้อมูลเปลี่ยน (ใบอื่นไม่ถูกแตะ ไม่กะพริบ)
    var oc = list.__cs;
    if (oc && cs.length && oc.length === cs.length && list.children.length === cs.length) {
      for (var ci = 0; ci < cs.length; ci++) if (oc[ci] !== cs[ci]) list.replaceChild(el(cs[ci]), list.children[ci]);
      list.__cs = cs; list.__h = cs.join('');
    } else {
      list.__cs = cs.length ? cs : null;
      setHtml(list, cs.join('') || ('<div class="lvmEmpty">' + esc(tr('none')) + '</div>'));
    }
    var e1 = document.getElementById('lvmNS'); if (e1) e1.textContent = money(ns);
    var e2 = document.getElementById('lvmNP'); if (e2) e2.textContent = money(np);
    var b1 = document.getElementById('lvmBadgeS'); if (b1) b1.textContent = money(ns);
    var b2 = document.getElementById('lvmBadgeB'); if (b2) b2.textContent = money(np);
    for (var ck = 0; ck < CATS.length; ck++) {
      var cb = document.getElementById('lvmCatN_' + CATS[ck].id), cv = cn[CATS[ck].id] || 0;
      if (cb && cb.textContent !== money(cv)) { cb.textContent = money(cv); cb.parentNode.classList.toggle('zero', !cv); }
    }
    paintPager(pages, rows.length, from, to);
    fitRows();
  }
  // แถบเปลี่ยนหน้าตรงกลางด้านล่าง: ‹ 1 … 4 5 [6] 7 8 … 41 ›
  function paintPager(pages, total, from, to) {
    var pg = document.getElementById('lvmPager'); if (!pg) return;
    if (pages <= 1) { setHtml(pg, ''); pg.style.display = 'none'; return; }
    pg.style.display = '';
    var cur = S.page, h = '', slots = [];
    function btn(p, label, cls) { return '<span class="lvmPg' + (cls ? ' ' + cls : '') + '" data-p="' + p + '">' + label + '</span>'; }
    if (pages <= 7) { for (var p = 0; p < pages; p++) slots.push(p); }
    else if (cur <= 3) slots = [0, 1, 2, 3, 4, -1, pages - 1];
    else if (cur >= pages - 4) slots = [0, -1, pages - 5, pages - 4, pages - 3, pages - 2, pages - 1];
    else slots = [0, -1, cur - 1, cur, cur + 1, -1, pages - 1];
    h += btn(cur - 1, '‹', cur === 0 ? 'off' : '');
    for (var k = 0; k < slots.length; k++) h += slots[k] < 0 ? '<span class="lvmPg gap">…</span>' : btn(slots[k], slots[k] + 1, slots[k] === cur ? 'on' : '');
    h += btn(cur + 1, '›', cur === pages - 1 ? 'off' : '');
    h += '<span class="lvmPgInfo">' + (from + 1) + '–' + to + ' ' + esc(tr('of')) + ' ' + money(total) + '</span>';
    setHtml(pg, h);
  }
  function goPage(p) { S.page = p; paintList(); var l = document.getElementById('lvmList'); if (l) l.scrollTop = 0; }

  function bindLangs(root) {
    var dd = root.querySelector('.lvmLangDd'); if (!dd) return;
    var cur = dd.querySelector('.lvmLangCur'), menu = dd.querySelector('.lvmLangMenu');
    cur.onclick = function (e) { e.stopPropagation(); menu.classList.toggle('open'); };
    var opts = dd.querySelectorAll('.lvmLangOpt');
    for (var i = 0; i < opts.length; i++) opts[i].onclick = function (e) {
      e.stopPropagation(); S.lang = this.getAttribute('data-l'); send('lvm|lang:' + S.lang); render();
    };
    if (!document.__lvmLangClose) {
      document.__lvmLangClose = 1;
      document.addEventListener('click', function () {
        var m = document.querySelector('.lvmLangMenu.open'); if (m) m.classList.remove('open');
      });
    }
  }

  function root() { return document.getElementById('lvmRoot'); }
  // ชื่อเซิร์ฟจาก hostname เช่น "Arizona Role Play | Home" -> Home; เลขถ้ามีในชื่อ เช่น [33] / #33 / 33
  // เลขเซิร์ฟ Arizona ตามชื่อ (จากรายชื่อเซิร์ฟของลันเชอร์) -> โลโก้ทางการของเซิร์ฟ
  var SRVNUM = {"phoenix":1,"tucson":2,"scottdale":3,"chandler":4,"brainburg":5,"saint-rose":6,"mesa":7,"red-rock":8,"yuma":9,"surprise":10,"prescott":11,"glendale":12,"kingman":13,"winslow":14,"payson":15,"gilbert":16,"show low":17,"casa-grande":18,"page":19,"sun-city":20,"queen-creek":21,"sedona":22,"holiday":23,"wednesday":24,"yava":25,"faraway":26,"bumble bee":27,"christmas":28,"mirage":29,"love":30,"drake":31,"space":32,"home":33};
  var SRVICO = 'https://cdn.azresources.cloud/projects/arizona-rp/assets/images/project_icons/';
  var SRVNORM = null;   // SRVNUM with only a-z in the names: casa-grande / saint-rose / sun-city / bumble bee ... match their hostnames
  function srvNum(name) {
    if (!SRVNORM) { SRVNORM = {}; for (var n in SRVNUM) SRVNORM[n.replace(/[^a-z]/g, '')] = SRVNUM[n]; }
    return SRVNORM[String(name || '').toLowerCase().replace(/[^a-z]/g, '')] || '';
  }
  // กุญแจเซิร์ฟ (hostname ที่ถูกตัดเหลือ 16 ตัว เช่น "phoenix.arizona-") -> ชื่อ / เลข
  function keyParts(key) {
    key = String(key || '');
    if (/^\d+\.\d+\.\d+\.\d+/.test(key)) return { short: key, num: '', key: key };
    var lb = key.split('.')[0].toLowerCase();
    var num = String(srvNum(lb));
    var short = lb.replace(/(^|[-\s])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    return { short: short || key, num: num, key: key };
  }
  function srvLogo(num, short) {
    return '<span class="lvmSrvNo">' + esc(num || (String(short).charAt(0) || '?').toUpperCase()) +
      (num ? '<img src="' + SRVICO + esc(num) + '.webp" onerror="this.parentNode.removeChild(this)">' : '') + '</span>';
  }
  function isOwnKey(k) { var o = String((S.srv || {}).own || ''); k = String(k || ''); return !!o && (k === o || k === o.slice(0, 16)); }
  function nowS() { return Date.now() / 1000 + (S.skew || 0); }
  function minLeft(v) {
    if (!v || !v.t) return '—';
    var left = v.t + (+v.every || 600) - nowS();
    return left <= 0 ? '…' : String(Math.ceil(left / 60));
  }
  function ringHtml(v) {
    var ev = +v.every || 600, el = v.t ? Math.max(0, Math.min(ev, nowS() - v.t)) : ev;
    var busy = S.pull && S.pull.s === 'run';
    return '<span class="lvmRing' + (busy ? ' busy' : '') + '" data-pull="1" title="' + esc(tr('pull_now')) + '"><svg viewBox="0 0 40 40"><circle class="bg" cx="20" cy="20" r="16"/>' +
      (v.t ? '<circle class="fg" cx="20" cy="20" r="16" style="-webkit-animation-duration:' + ev + 's;animation-duration:' + ev + 's;-webkit-animation-delay:-' + el.toFixed(1) + 's;animation-delay:-' + el.toFixed(1) + 's"/>' : '') +
      '</svg><b id="lvmSrvMin">' + esc(minLeft(v)) + '</b><small>' + esc(tr('min_u')) + '</small></span>';
  }
  function pickSrv(k) {
    if (isOwnKey(k)) k = '';
    var cur = (S.srv && +S.srv.view) ? String(S.srv.key || '') : '';
    if (k === cur) return;
    send('lvm|srv:' + k);
    if (S.detail) closeDetail();
    S.rows = []; paintList(); paintHome();
  }
  function srvMenuHtml() {
    var h = '<div class="lvmSH">' + esc(tr('srv_pick')) + '</div>', L = S.srvList, v = S.srv || {};
    if (!L) return h + '<div class="lvmSE">' + esc(tr('srv_load')) + '</div>';
    var items = [], hasOwn = false;
    for (var i = 0; i < L.length; i++) {
      var k = String(L[i].key || ''), own = isOwnKey(k);
      if (!k || (!own && /^\d+\.\d+\.\d+\.\d+/.test(k))) continue;
      if (own) { if (hasOwn) continue; hasOwn = true; }
      items.push({ key: k, shops: +L[i].shops || 0, t: +L[i].t || 0, own: own, old: !!L[i].old });
    }
    if (!hasOwn && v.own) items.unshift({ key: String(v.own), shops: null, t: 0, own: true });
    items.sort(function (a, b) { return (b.own ? 1 : 0) - (a.own ? 1 : 0); });
    for (var j = 0; j < items.length; j++) {
      var it = items[j], P = keyParts(it.key);
      var on = it.own ? !+v.view : (+v.view && it.key === String(v.key));
      h += '<div class="lvmSI' + (on ? ' on' : '') + (it.old ? ' old' : '') + '" data-srv="' + esc(it.own ? '' : it.key) + '">' + srvLogo(P.num, P.short) +
        '<div class="tx"><b>' + esc(P.short) + (P.num ? ' <i>#' + esc(P.num) + '</i>' : '') + '</b><small>' +
        (it.shops === null ? '—' : it.old ? esc(tr('srv_old')) + (it.t ? ' · ' + esc(ago(it.t)) : '') : money(it.shops) + ' ' + esc(tr('srv_n')) + (it.t ? ' · ' + esc(ago(it.t)) : '')) + '</small></div>' +
        (it.own ? '<em>' + esc(tr('srv_mine')) + '</em>' : '') + (on ? '<b class="ck">✓</b>' : '') + '</div>';
    }
    if (items.length < 2) h += '<div class="lvmSE">' + esc(tr('srv_none')) + '</div>';
    return h;
  }
  function paintSrvMenu() { var m = document.getElementById('lvmSrvMenu'), w = document.getElementById('lvmChipW'); if (m && w && w.classList.contains('open')) setHtml(m, srvMenuHtml()); }
  function srvMenu(on) {
    var w = document.getElementById('lvmChipW'); if (!w) return;
    if (on === undefined) on = !w.classList.contains('open');
    if (on && !w.classList.contains('open')) { S.srvList = null; send('lvm|srvlist'); }
    w.classList.toggle('open', !!on);
    if (on) { var m = document.getElementById('lvmSrvMenu'); if (m) setHtml(m, srvMenuHtml()); }
  }
  function srvParts() {
    var v0 = S.srv || {};
    if (+v0.view) { var Q = keyParts(v0.key); return { raw: Q.key, short: Q.short, num: Q.num, key: Q.key }; }
    var v = S.srv || {}, raw = String(v.name || '').replace(/\s+/g, ' ').trim();
    var short = (/\|\s*([^|]+)$/.exec(raw) || [])[1] || raw || String(v.key || '?');
    var num = (/(?:\[|#|№)\s*(\d{1,3})/.exec(raw) || /\b(\d{1,3})\b/.exec(short) || [])[1] || '';
    short = short.replace(/[\[#№]?\s*\d{1,3}\s*\]?/, '').trim() || short;
    var k = short.toLowerCase().replace(/[_\s]+/g, ' ').trim();
    if (!num) num = String(srvNum(k));
    return { raw: raw, short: short, num: num, key: String(v.key || '') };
  }
  function srvHtml() {
    var v = S.srv, P = srvParts();
    if (!v) return '<div class="lvmSrvC">' + esc(tr('srv_wait')) + '</div>';
    return '<div class="lvmSrvC">' +
      '<div class="lvmSrvH">' + srvLogo(P.num, P.short) + '<div style="min-width:0"><b>' + esc(P.short) + (P.num ? ' <span style="color:#5d6578">#' + esc(P.num) + '</span>' : '') + '</b><small title="' + esc(P.raw) + '">' + esc(+v.view ? tr('srv_viewing') : (P.raw || P.key)) + '</small></div></div>' +
      '<div class="lvmSrvT">' + ringHtml(v) + '<div><i>' + esc(tr('srv_upd')) + '</i><b id="lvmSrvAgo">' + esc(agoTxt(v)) + '</b></div></div>' +
      '<div class="lvmSrvL" title="' + esc(tr('srv_shops')) + '">' + icon('shop') + '<b>' + money(+v.shops || 0) + '</b></div>' +
      (+v.view ? '<div class="lvmSrvBack" data-srvback="1">← ' + esc(tr('srv_back')) + '</div>' : '') +
    '</div>';
  }
  function chipsHtml() {
    var v = S.srv, P = srvParts(), fresh = v && v.t && (Date.now() / 1000 - v.t) < 3 * (+v.every || 60);
    if (!v) return '';
    return '<span class="lvmChip pick' + (+v.view ? ' view' : '') + '" data-pick="1" title="' + esc(tr('srv_pick')) + '"><i class="dot' + (fresh ? '' : ' off') + '"></i>' + esc(P.short) + (P.num ? ' <b>#' + esc(P.num) + '</b>' : '') + '<i class="cv">' + icon('caret') + '</i></span>' +
      '<span class="lvmChip" title="' + esc(tr('srv_shops')) + '">' + icon('shop') + '<b>' + money(+v.shops || 0) + '</b></span>';
  }
  // วาดการ์ด/ป้ายใหม่เฉพาะตอนข้อมูลเปลี่ยน (ชื่อ/จำนวนร้าน/รอบดึง/ภาษา); ทุกวินาทีแค่เปลี่ยนตัวเลข
  var srvSig = '';
  function paintSrv(force) {
    var v = S.srv, sig = v ? [v.name, v.key, v.view, v.shops, v.t, v.every, v.gate, S.pull && S.pull.s, S.lang].join('|') : 'none|' + S.lang;
    var e = document.getElementById('lvmSrv'), c = document.getElementById('lvmChips');
    if (force || sig !== srvSig || (e && !e.firstChild)) {
      srvSig = sig;
      if (e) e.innerHTML = srvHtml();
      setHtml(c, chipsHtml());
      return;
    }
    setHtml(c, chipsHtml());
    tickSrv();
  }
  // ไม่มีนับถอยหลังรายวินาที (หน้าเกมเปลี่ยนทุกวินาที = การ์ดกะพริบ): เปลี่ยนแค่ "อัปเดตล่าสุด" ตอนข้อความเปลี่ยน
  function agoTxt(v) {   // ข้อความ "อัปเดตล่าสุด": กำลังดึง / ยังไม่ได้ดึง / x นาทีที่แล้ว
    if (S.pull && S.pull.s === 'run') return tr('pull_busy');
    return v.t ? ago(v.t) : (+v.gate ? tr('pull_wait') : '—');
  }
  function tickSrv() {
    var v = S.srv, b = document.getElementById('lvmSrvAgo'); if (!v || !b) return;
    var ag = agoTxt(v);
    if (b.textContent !== ag) b.textContent = ag;
    var m = document.getElementById('lvmSrvMin'), ml = minLeft(v);   // เปลี่ยนแค่ตอนเลขนาทีเปลี่ยน (ไม่กะพริบ)
    if (m && m.textContent !== ml) m.textContent = ml;
  }
  // สคริปต์ถูกโหลดใหม่ทุกครั้งที่เปิดหน้า: ล้างตัวจับเวลาของรอบก่อน ไม่งั้นหลายตัวแย่งเขียนข้อความเดียวกัน = กะพริบ
  if (window.__lvmTick) clearInterval(window.__lvmTick);
  window.__lvmTick = setInterval(tickSrv, 15000);
  var ICO = {
    shop: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11v9h14v-9"/><path d="M10 20v-5h4v5"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    cart: '<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    caret: '<path d="M8 10l4 4 4-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    upd: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
    sync: '<path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.5l1.7-2M20 20v-4.5h-4.5"/>',
    share: '<circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8 11l8-4M8 13l8 4"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    acc: '<circle cx="12" cy="13" r="5"/><path d="M9.5 8.5L8 3h8l-1.5 5.5M12 11v2l1.3 1"/>',
    skin: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>',
    clothes: '<path d="M8 4l4 2 4-2 4 3-2.5 3.5L16 9.5V20H8V9.5L6.5 10.5 4 7z"/>',
    veh: '<path d="M4 15l1.6-5h12.8l1.6 5v3H4z"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/><path d="M6.5 10l1.2-3h8.6l1.2 3"/>',
    tuning: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    gun: '<circle cx="12" cy="12" r="7"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="1.2"/>',
    improv: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    food: '<rect x="4" y="6" width="16" height="13" rx="2"/><path d="M9 6V4h6v2M12 9.5v6M9 12.5h6"/>',
    prop: '<path d="M4 20V10l8-6 8 6v10z"/><path d="M10 20v-5h4v5"/>',
    other: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M14.8 9.2c-.5-.8-1.6-1.3-2.8-1.3-1.7 0-2.8.9-2.8 2s1 1.7 2.8 2.1 2.8 1 2.8 2.1-1.2 2-2.8 2c-1.3 0-2.4-.5-2.9-1.4M12 6.5v1.4M12 16.1v1.4"/>'
  };
  function setCatOpen(on) {
    S.catOpen = !!on;
    try { localStorage.setItem('lvmCatOpen', on ? '1' : '0'); } catch (e) {}
    var w = document.getElementById('lvmCats'), p = document.getElementById('lvmCatPar');
    if (w) w.classList.toggle('shut', !on);
    if (p) p.classList.toggle('open', !!on);
  }
  // ===== เมนูบัญชี (สามขีด): อัปเดต / ดึงข้อมูล / แชร์ข้อมูล / Discord / ออกจากระบบ (มียืนยัน) =====
  // ===== หน้าต่างอัปเดต: มีอะไรใหม่ -> กดอัปเดต -> ไฟล์ทีละไฟล์ (วงหมุน -> ✓) -> เสร็จ แล้วสคริปต์โหลดใหม่ =====
  function kb(n) { n = +n || 0; return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function updHtml(intro) {
    if (S.clog) return clogHtml(intro);
    var u = S.upd; if (!u) return '';
    var st = u.s, files = u.files || [], notes = u.notes || [], h = '';
    h += '<div class="lvmUw' + (intro ? ' intro' : '') + '"><div class="lvmUwC"><div class="lvmUwH"><img src="' + LOGO + '" alt=""><div><b>' + esc(tr('uw_title')) + '</b><small>' +
      esc(u.cur || '') + (u.ver ? ' → <em>' + esc(u.ver) + '</em>' : '') + '</small></div></div>';
    if (st === 'check') return h + '<div class="lvmUwM"><i class="sp"></i>' + esc(tr('u_check')) + '</div></div></div>';
    if (st === 'latest') return h + '<div class="lvmUwM ok">✓ ' + esc(tr('uw_latest')) + '</div><div class="lvmUwB"><div data-uw="close">' + esc(tr('uw_close')) + '</div></div></div></div>';
    if (st === 'ask' || notes.length) {
      h += '<div class="lvmUwS">' + esc(tr('uw_new')) + '</div><div class="lvmUwN">';
      if (!notes.length) h += '<ul><li>' + esc(tr('uw_nonotes')) + '</li></ul>';
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i], L = n[S.lang] || n.en || n.th || [];
        h += '<h4>v' + esc(n.v) + (n.date ? '<span>' + esc(n.date) + '</span>' : '') + '</h4><ul>';
        for (var j = 0; j < L.length; j++) h += '<li>' + esc(L[j]) + '</li>';
        h += '</ul>';
      }
      h += '</div>';
    }
    if (files.length) {
      h += '<div class="lvmUwS">' + esc(tr('uw_files')) + '</div>';
      var a = +u.a || 0;
      for (var k = 0; k < files.length; k++) {
        var cls = '', lab = tr('uw_wait'), idx = k + 1;
        if (st === 'dl') { if (idx < a) { cls = 'ok'; lab = tr('uw_ok'); } else if (idx === a) { cls = 'run'; lab = tr('uw_dl'); } }
        else if (st === 'apply') { cls = 'run'; lab = tr('uw_inst'); }
        else if (st === 'done') { cls = 'done'; lab = tr('uw_done_f'); }
        else if (st === 'err') { cls = idx < a ? 'ok' : ''; lab = idx < a ? tr('uw_ok') : '—'; }
        else if (st === 'ask') { lab = ''; }
        h += '<div class="lvmUwF ' + cls + '"><i class="ic"></i><span class="nm">' + esc(files[k].path) + '</span><span class="sz">' + kb(files[k].size) + '</span><span class="st">' + esc(lab) + '</span></div>';
      }
    }
    if (st === 'dl' || st === 'apply' || st === 'done') {
      var tot = files.length || 1, got = st === 'dl' ? Math.max(0, (+u.a || 1) - 1) : tot;
      var pct = st === 'done' ? 100 : st === 'apply' ? 92 : Math.round(got / tot * 85) + 5;
      h += '<div class="lvmUwP"><i style="width:' + pct + '%"></i></div>';
    }
    if (st === 'done') h += '<div class="lvmUwM ok">✓ ' + esc(tr('uw_done')) + '</div>';
    if (st === 'err') h += '<div class="lvmUwM bad">✕ ' + esc(tr('uw_err')) + (u.a ? ' (' + esc(u.a) + ')' : '') + '</div><div class="lvmUwB"><div data-uw="close">' + esc(tr('uw_close')) + '</div><div class="go" data-uw="retry">' + esc(tr('uw_retry')) + '</div></div>';
    if (st === 'ask') h += '<div class="lvmUwB"><div data-uw="no">' + esc(tr('uw_later')) + '</div><div class="go" data-uw="go">' + esc(tr('uw_go')) + '</div></div>';
    return h + '</div></div>';
  }
  function clogHtml(intro) {   // หน้าประวัติเวอร์ชัน (ใช้กล่องเดียวกับหน้าต่างอัปเดต)
    var notes = S.changelog || [];
    var h = '<div class="lvmUw' + (intro ? ' intro' : '') + '"><div class="lvmUwC"><div class="lvmUwH"><img src="' + LOGO + '" alt=""><div><b>' + esc(tr('clog_title')) + '</b><small>' + esc(tr('clog_sub')) + '</small></div></div>';
    if (!notes.length) h += '<div class="lvmUwM"><i class="sp"></i>' + esc(tr('clog_load')) + '</div>';
    else {
      h += '<div class="lvmUwN">';
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i], L = n[S.lang] || n.en || n.th || [];
        h += '<h4>v' + esc(n.v) + (n.date ? '<span>' + esc(n.date) + '</span>' : '') + '</h4><ul>';
        for (var j = 0; j < L.length; j++) h += '<li>' + esc(L[j]) + '</li>';
        h += '</ul>';
      }
      h += '</div>';
    }
    return h + '<div class="lvmUwB"><div data-uw="close">' + esc(tr('uw_close')) + '</div></div></div></div>';
  }
  function paintUpd() { var e = document.getElementById('lvmUw'); if (e) setHtml(e, updHtml(!e.firstChild)); }
  // สถานะอัปเดตจาก Lua (LVM.upd): check / dl a/b / done / err / latest
  function updLine(upd, lat) {
    var u = S.upd;
    if (u && u.s === 'check') return tr('u_check');
    if (u && u.s === 'dl') return tr('u_dl') + ' ' + u.a + '/' + u.b + '…';
    if (u && u.s === 'done') return tr('u_done');
    if (u && u.s === 'err') return tr('u_err');
    return upd ? tr('m_new') + ' ' + lat : tr('m_latest');
  }
  function verNewer(a, b) {   // a ใหม่กว่า b ?
    a = String(a || '').split('.'); b = String(b || '').split('.');
    for (var i = 0; i < Math.max(a.length, b.length); i++) { var x = +a[i] || 0, y = +b[i] || 0; if (x !== y) return x > y; }
    return false;
  }
  function menuHtml() {
    var p = S.profile || {}, ver = p.ver || '', lat = S.latest || '', upd = lat && ver && verNewer(lat, ver);
    if (S.menuAsk) {
      return '<div class="lvmMAsk"><b>' + esc(tr('m_logout_q')) + '</b><small>' + esc(tr('m_logout_h')) + '</small>' +
        '<div class="lvmMBtns"><span class="lvmMB" data-act="cancel">' + esc(tr('m_cancel')) + '</span><span class="lvmMB red" data-act="logout2">' + esc(tr('m_logout')) + '</span></div></div>';
    }
    return '<div class="lvmMHead">' + avatarHtml(p) + '<div><b>' + esc(p.name || '') + '</b><small>' + discordSvg('#8f99ff') + esc(tr('m_disc')) + '</small></div></div>' +
      '<div class="lvmMSec">' + esc(tr('m_sec_app')) + '</div>' +
      '<div class="lvmMI' + (upd ? ' hot' : '') + '"' + (upd ? ' data-act="update"' : '') + '><i>' + icon('upd') + '</i><span>' + esc(tr('m_ver')) + ' ' + esc(ver || '?') +
        '<small>' + esc(updLine(upd, lat)) + '</small></span>' + (upd && !(S.upd && /^(check|dl|done)$/.test(S.upd.s)) ? '<em>' + esc(tr('m_get')) + '</em>' : (upd ? '' : '<em class="ok">✓</em>')) + '</div>' +
      '<div class="lvmMI" data-act="sync"><i>' + icon('sync') + '</i><span>' + esc(tr('m_sync')) + '<small>' + esc(tr('m_sync_h')) + '</small></span></div>' +
      '<div class="lvmMI" data-act="changelog"><i>' + icon('upd') + '</i><span>' + esc(tr('m_history')) + '</span><em class="arr">›</em></div>' +
      '<div class="lvmMSec">' + esc(tr('m_sec_set')) + '</div>' +
      '<div class="lvmMI" data-act="share"><i>' + icon('share') + '</i><span>' + esc(tr('m_share')) + '<small>' + esc(tr('m_share_h')) + '</small></span><b class="lvmSw' + (p.share ? ' on' : '') + '"></b></div>' +
      '<div class="lvmMI" data-act="discord"><i>' + discordSvg('currentColor') + '</i><span>' + esc(tr('m_discord')) + '</span><em class="arr">›</em></div>' +
      '<div class="lvmMSep"></div>' +
      '<div class="lvmMI red" data-act="logout"><i>' + icon('logout') + '</i><span>' + esc(tr('m_logout')) + '</span></div>';
  }
  function paintMenu() { var m = document.getElementById('lvmMenu'); if (m) m.innerHTML = menuHtml(); }
  function toggleMenu(on) {
    var a = document.getElementById('lvmAcc'); if (!a) return;
    if (on === undefined) on = !a.classList.contains('open');
    S.menuAsk = false;
    if (on) { paintMenu(); send('lvm|cfgcheck'); }   // เปิดเมนู = ให้ Lua เช็กเวอร์ชันล่าสุดสด ๆ
    a.classList.toggle('open', !!on);
  }
  function catNavs() {
    var h = '';
    for (var i = 0; i < CATS.length; i++) {
      var c = CATS[i], on = S.tab === 'market' && S.cat === c.id;
      h += '<div class="lvmNav sub' + (on ? ' on' : '') + '" data-tab="market" data-m="buy" data-cat="' + c.id + '"><i>' + icon(c.ico) + '</i><span>' + esc(catName(c)) + '</span><em class="lvmBadge n" id="lvmCatN_' + c.id + '">0</em></div>';
    }
    return h;
  }
  function icon(k) { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + '</svg>'; }
  // ไฮไลต์เมนูซ้าย: หน้า + โหมด (ซื้อ/ขาย อยู่ในเมนูเหมือน LavkaPrices)
  function syncNav() {
    var navs = document.querySelectorAll('#lvmRoot .lvmNav');
    for (var i = 0; i < navs.length; i++) {
      var m = navs[i].getAttribute('data-m');
      var c = navs[i].getAttribute('data-cat');
      navs[i].classList.toggle('on', navs[i].getAttribute('data-tab') === S.tab && (!m || m === S.mode) && (!c || c === S.cat));
    }
  }
  function render() {
    var r = root(); if (!r) return;
    if (S.profile && S.profile.connected) renderMarket(r); else renderLogin(r);
  }

  function mount() {
    var st = document.getElementById('lvmStyle');
    if (!st) { st = document.createElement('style'); st.id = 'lvmStyle'; document.head.appendChild(st); }
    st.textContent = css();   // refresh CSS ทุกครั้ง เผื่อเคยโหลดโค้ดเก่าไว้
    if (!root()) { var r = document.createElement('div'); r.id = 'lvmRoot'; document.body.appendChild(r); }
    render();
    // อนิเมชั่น "เด้งเข้า" เล่นแค่ตอนเปิด (ใส่คลาส lvmIntro ชั่วครู่) ไม่เล่นซ้ำตอน re-render = ไม่กระพริบเวลาคลิก
    var rt = root();
    if (rt) { rt.classList.add('lvmIntro'); setTimeout(function () { try { var x = root(); if (x) x.classList.remove('lvmIntro'); } catch (e) {} }, 340); }
    // กด ESC = ปิดเมนู (CEF โฟกัสที่หน้าเว็บตอนเคอเซอร์ขึ้น)
    if (!document.__lvmEsc) {
      document.__lvmEsc = 1;
      document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && root()) {
          e.preventDefault(); e.stopPropagation();
          if (S.detail) { closeDetail(); return; }   // ESC ครั้งแรก = กลับหน้าการ์ด
          send('lvm|close'); hide();
        }
      }, true);
    }
  }
  function hide() { var r = root(); if (r) r.remove(); }

  window.LVM = {
    __v: 1,
    show: function (lang) { if (lang && T[lang]) S.lang = lang; S.tab = 'home'; S.detail = null; S.detailData = null; S.hist = null; mount(); },
    hide: hide,
    lang: function (c) { if (T[c]) { S.lang = c; render(); } },
    profile: function (js) {   // โปรไฟล์เดิมซ้ำ = ไม่วาดทั้งหน้าใหม่ (กันกะพริบ)
      if (js === S.profileJs && document.getElementById('lvmSrv')) return;
      S.profileJs = js; try { S.profile = JSON.parse(js); } catch (e) {} render();
    },
    loginError: function (k) {
      S.oauthBusy = false;
      var e = document.getElementById('lvmErr'); if (e) e.textContent = k ? tr(k) : '';
      var g = document.getElementById('lvmGo'); if (g) g.textContent = tr('connect');
      var d = document.getElementById('lvmDiscord');
      if (d) { d.classList.remove('busy'); d.innerHTML = discordSvg('#fff') + '<span>' + esc(tr('login_h')) + '</span>'; }
    },
    loginWait: function (k) {   // ข้อความระหว่างรอ (เช่น รอเข้าเซิร์ฟ) โดยไม่รีเซ็ตปุ่ม = spinner ยังหมุนอยู่
      var e = document.getElementById('lvmErr'); if (e) e.textContent = k ? tr(k) : '';
    },
    server: function (js) {
      var g0 = S.srv && +S.srv.gate;
      try { S.srv = JSON.parse(js); } catch (e) {}
      if (S.srv && S.srv.now) S.skew = S.srv.now - Date.now() / 1000;   // นาฬิกาเกม vs หน้าเว็บ
      paintSrv(); paintSrvMenu();
      if (g0 !== (S.srv && +S.srv.gate)) paintHome();
    },
    // ผลการดึงกองกลาง: { s: 'run' | 'ok' | 'err', n }
    pull: function (js) {
      var o = {}; try { o = JSON.parse(js) || {}; } catch (e) {}
      var first = !!(S.pull && S.pull.first) || !!(S.srv && +S.srv.gate);
      S.pull = { s: String(o.s || ''), n: +o.n || 0, first: first };
      if (S.pull.s === 'ok' && first) {   // โชว์ "ได้ N ร้าน" ครู่หนึ่ง แล้วเข้าหน้าแรกปกติ
        var me = S.pull; me.until = Date.now() + 1900;
        setTimeout(function () { if (S.pull === me) { me.first = false; paintHome(); } }, 1950);
      }
      paintHome(); paintSrv(true);
    },
    status: function (t) { S.status = t || ''; var s = document.getElementById('lvmStat'); if (s) s.textContent = S.status; },
    chunk: function (s) { S.buf += s; },
    recv: function () { var a; try { a = JSON.parse(S.buf) || []; } catch (e) { a = []; } S.buf = ''; S.rows = mergeRows(a); paintList(); paintHome(); },
    // ค่าจากเซิร์ฟเวอร์: ที่อยู่รูป (img.item / img.server) + แก้หมวดรายชิ้น (cat) — เปลี่ยนจริงค่อยวาดใหม่
    upd: function (js) { try { S.upd = JSON.parse(js); } catch (e) { S.upd = null; } var a = document.getElementById('lvmAcc'); if (a && a.classList.contains('open')) paintMenu(); paintUpd(); },
    __closeMenu: function () { toggleMenu(false); srvMenu(false); },
    srvList: function (js) { var a; try { a = JSON.parse(js); } catch (e) { a = []; } S.srvList = Object.prototype.toString.call(a) === '[object Array]' ? a : []; paintSrvMenu(); },
    cfg: function (js) {
      var c; try { c = JSON.parse(js) || {}; } catch (e) { return; }
      var img = c.img || {}, ch = false, ov = {}, k;
      if (c.latest && String(c.latest) !== S.latest) {   // เวอร์ชันล่าสุดเปลี่ยน -> รีเฟรชเมนูสดถ้าเปิดอยู่
        S.latest = String(c.latest);
        var am = document.getElementById('lvmAcc'); if (am && am.classList.contains('open')) paintMenu();
      }
      if (Object.prototype.toString.call(c.clog) === '[object Array]') { S.changelog = c.clog; if (S.clog) paintUpd(); }   // ประวัติเวอร์ชัน
      if (/^https:\/\//.test(img.item || '') && img.item !== ICON) { ICON = img.item; ch = true; }
      if (/^https:\/\//.test(img.server || '') && img.server !== SRVICO) { SRVICO = img.server; ch = true; }
      for (k in (c.cat || {})) for (var ci = 0; ci < CATS.length; ci++) if (CATS[ci].id === c.cat[k]) ov[k] = c.cat[k];
      if (JSON.stringify(ov) !== JSON.stringify(S.catOv)) { S.catOv = ov; ch = true; }
      if (!ch) return;
      var l = document.getElementById('lvmList'); if (l) { l.__cs = null; l.__h = null; }
      paintList(); paintHome(); paintSrv(true);
    },
    rows: function (js) { var a; try { a = JSON.parse(js) || []; } catch (e) { a = []; } S.rows = mergeRows(a); paintList(); paintHome(); },
    hist: function (js) {   // ประวัติราคารายวันจาก server (/history)
      var d = null; try { d = JSON.parse(js); } catch (e) {}
      if (!d || !S.detail || String(d.vid) !== vidOf(S.detail)) return;
      var isArr = function (a) { return Object.prototype.toString.call(a) === '[object Array]'; };
      var lv = {};
      if (d.levels && typeof d.levels === 'object') for (var k in d.levels) if (isArr(d.levels[k])) lv[k] = d.levels[k];
      if (!lv[String(d.vid)] && isArr(d.days)) lv[String(d.vid)] = d.days;   // server รุ่นเก่า (ไม่มี levels)
      var hr = {};
      if (d.hours && typeof d.hours === 'object') for (var hk in d.hours) if (isArr(d.hours[hk])) hr[hk] = d.hours[hk];
      S.hist = { base: String(d.vid), levels: lv, hours: hr };
      S.info = S.info || {};
      if (d.info && isArr(d.info.lines)) S.info[String(d.info.vid)] = d.info;
      if (isArr(d.infos)) for (var j = 0; j < d.infos.length; j++) if (d.infos[j] && isArr(d.infos[j].lines)) S.info[String(d.infos[j].vid)] = d.infos[j];
      paintDetail();
    },
    item: function (js) {   // รายการร้านของไอเทมที่เปิดอยู่ (ตอบกลับจาก lvm|item:<vid>)
      var d = null; try { d = JSON.parse(js); } catch (e) {}
      if (!d || !S.detail || String(d.vid) !== vidOf(S.detail)) return;
      // Lua encodeJson ตารางว่าง = {} ไม่ใช่ [] -> บังคับเป็น array
      d.vid = String(d.vid);
      d.sell = Object.prototype.toString.call(d.sell) === '[object Array]' ? d.sell : [];
      d.buy = Object.prototype.toString.call(d.buy) === '[object Array]' ? d.buy : [];
      S.detailData = d; paintDetail();
    },
    info: function (js) {   // ข้อมูลไอเทม {vid, lines:[...], count}: ทีละชิ้นหรือเป็น {vid:{...}} ทั้งชุด
      var d = null; try { d = JSON.parse(js); } catch (e) {}
      if (!d) return;
      S.info = S.info || {};
      if (d.lines) S.info[String(d.vid)] = d; else for (var k in d) if (d[k] && d[k].lines) S.info[k] = d[k];
      if (S.detail) paintDetail();
    }
  };
})();
