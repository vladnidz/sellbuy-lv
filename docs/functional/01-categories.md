# 01 — Category tree, attribute templates, catalogues, and restrictions

Status: Draft · Owner: product owner with category manager · Last change: 15 Oct 2026

This is SellBuy's own taxonomy. It was designed for Latvian second-hand and business trade. Public category structures from other sites were used only as a reference for coverage; no competitor wording is copied. Latvian (LV), Russian (RU), and English (EN) names are drafts that need native-speaker review before launch.

---

## 1. Conventions

**Codes.** Roots are `Cnn` (consumer) or `Bnn` (business). Subcategories are `Cnn.nn`. Leaves are `Cnn.nn.nn`. Codes never change once published. Retired categories keep their codes and redirect.

**Paths.** Each category is stored as an `ltree` path. ltree labels cannot contain dots, so the path replaces dots with underscores: `C02.01.01` is stored as `C02_01_01`. Lookups use `<@` (descendant) and `~` (match) operators. The business-readable code `C02.01.01` is kept in the `code` column.

**Flags.** Each leaf (or subcategory, where all leaves share the value) carries these flags:

| Flag | Meaning |
|---|---|
| P | Allowed price types: F = fixed, N = negotiable, Fr = free. Default F and N. |
| A | Auction-eligible (R3 and later) |
| E | Escrow-eligible (R2 and later) |
| S | Parcel-shippable (Omniva or DPD parcel size) |
| F-L | Freight or collection only (large or heavy items) |
| D | Documents required at listing (see template notes) |
| L2 | Restricted: seller must be L2 or higher |
| L3 | Business-only: seller must be L3 |
| H | Hygiene-sensitive: certain used items prohibited (see section 6) |
| X | Prohibited on the platform (see section 6) |

**Template.** Each leaf uses one attribute template (section 3). Subcategories name a default template; leaves may override it.

**Release.** Consumer categories are R1 unless marked. Business categories are R4. Auction flags take effect when R3 ships. Escrow flags take effect when R2 ships.

**Seller choice rule.** A listing goes in the most specific leaf. If no leaf fits, the seller uses the `Cnn.nn.99 Other` leaf in that subcategory. Listings in `99 Other` are reviewed weekly and moved or retired by the category manager. Using `Other` repeatedly hurts listing quality scores.

**Overlap rule.** Each item lives in exactly one place:
- Passenger cars, motorcycles, bicycles, car parts, leisure trailers, and boats: C01.
- Commercial vehicles of any weight (vans, trucks, buses, commercial trailers, tractors): B08 or B06 respectively, whatever the seller type.
- Kids' clothing and shoes: C08.03 (not C07).
- Office furniture for home: C04.04. Bulk office furniture from a business: B04.01.
- Hand tools for gardening: C05.02. Hand tools for trades: C06.02.

---

## 2. Consumer categories (R1)

### C01 · Transport (LV Transports · RU Транспорт · EN Transport)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C01.01 | Automašīnas | Легковые автомобили | Cars | T-VEH | P:F,N A E S D | 01 Passenger cars · 02 SUVs and 4x4 · 03 Electric and hybrid · 04 Classic and youngtimer (25+ years) · 99 Other |
| C01.02 | Motocikli un skūteri | Мотоциклы и скутеры | Motorcycles and scooters | T-VEH-2W | P:F,N A E S D | 01 Motorcycles · 02 Scooters and mopeds · 03 Quads and ATVs · 99 Other |
| C01.03 | Velosipēdi | Велосипеды | Bicycles | T-BIKE | P:F,N A E S | 01 City and trekking · 02 Mountain · 03 Road · 04 Electric bikes · 05 Children's bikes · 06 Gravel and cyclocross · 99 Other |
| C01.04 | Auto daļas | Автозапчасти | Car parts | T-PART | P:F,N E S | 01 Engine and transmission · 02 Body and exterior · 03 Interior · 04 Wheels and tyres · 05 Electronics and audio · 06 Lighting · 07 Maintenance (oils, filters) · 99 Other |
| C01.05 | Aksesuāri un ekipējums | Аксессуары и экипировка | Accessories and gear | T-GEN | P:F,N E S | 01 Helmets and riding gear · 02 Car accessories · 03 Roof boxes and towing · 04 Dashcams and navigation · 99 Other |
| C01.06 | Piekabes un kemperi | Прицепы и кемперы | Leisure trailers and caravans | T-VEH-TR | P:F,N A E D F-L | 01 Leisure trailers · 02 Caravans · 03 Motorhomes · 99 Other |
| C01.07 | Laivas un ūdens transports | Лодки и водный транспорт | Boats and marine | T-BOAT | P:F,N A D F-L (R2) | 01 Boats · 02 Marine engines · 03 Marine equipment · 99 Other |

### C02 · Electronics (LV Elektronika · RU Электроника · EN Electronics)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C02.01 | Mobilie telefoni | Мобильные телефоны | Mobile phones | T-PHONE | P:F,N A E S | 01 Smartphones · 02 Basic phones · 03 Phone accessories (chargers, cases) · 04 Spare parts · 99 Other |
| C02.02 | Planšetdatori un e-lasītāji | Планшеты и электронные книги | Tablets and e-readers | T-DEV | P:F,N A E S | 01 Tablets · 02 E-readers · 03 Tablet accessories · 99 Other |
| C02.03 | Datori un komponentes | Компьютеры и комплектующие | Computers and components | T-PC | P:F,N A E S | 01 Laptops · 02 Desktops · 03 Processors · 04 Graphics cards · 05 Memory (RAM) · 06 Storage (SSD and HDD) · 07 Motherboards and cases · 08 Power supplies and cooling · 99 Other |
| C02.04 | Monitori un periferija | Мониторы и периферия | Monitors and peripherals | T-PERIPH | P:F,N A E S | 01 Monitors · 02 Keyboards and mice · 03 Printers and scanners · 04 Network equipment · 05 Webcams and microphones · 99 Other |
| C02.05 | TV, audio un Hi-Fi | ТВ, аудио и Hi-Fi | TV, audio and Hi-Fi | T-AV | P:F,N A E S | 01 Televisions · 02 Soundbars and speakers · 03 Headphones and earphones · 04 Amplifiers and receivers · 05 Projectors · 99 Other |
| C02.06 | Fotokameras un video | Фото- и видеотехника | Cameras and video | T-CAM | P:F,N A E S D | 01 Cameras · 02 Lenses · 03 Drones (registration note) · 04 Action cameras · 05 Photo accessories · 99 Other |
| C02.07 | Spēļu konsoles | Игровые консоли | Gaming | T-GAME | P:F,N A E S | 01 Consoles · 02 Games (physical) · 03 Controllers and accessories · 04 VR headsets · 99 Other |
| C02.08 | Viedierīces un nēsājamā elektronika | Умные устройства и носимая электроника | Wearables and smart devices | T-DEV | P:F,N A E S | 01 Smartwatches · 02 Fitness trackers · 03 Smart home devices · 99 Other |
| C02.09 | Kabeļi, krātuves un citi | Кабели, накопители и прочее | Cables, storage and other | T-GEN | P:F,N E S | 01 Cables and adapters · 02 External storage · 03 Batteries and power banks · 99 Other |

### C03 · Home appliances (LV Sadzīves tehnika · RU Бытовая техника · EN Home appliances)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C03.01 | Virtuves tehnika | Кухонная техника | Kitchen appliances | T-APP-H | P:F,N E S F-L (large) | 01 Ovens · 02 Hobs and cooker hoods · 03 Refrigerators and freezers · 04 Dishwashers · 05 Small kitchen (kettles, blenders, coffee machines) · 99 Other |
| C03.02 | Veļas mazgāšana | Стирка и сушка | Laundry | T-APP-H | P:F,N E S F-L (large) | 01 Washing machines · 02 Dryers · 03 Irons and steamers · 99 Other |
| C03.03 | Klimats | Климатическая техника | Climate | T-APP-H | P:F,N E S F-L | 01 Air conditioners · 02 Heaters · 03 Fans and air purifiers · 04 Dehumidifiers · 99 Other |
| C03.04 | Tīrīšanas tehnika | Техника для уборки | Cleaning | T-APP-H | P:F,N E S | 01 Vacuum cleaners · 02 Robot vacuums · 03 Steam cleaners and washers · 99 Other |
| C03.05 | Ūdens sildītāji un santehnika | Водонагреватели и сантехника | Water heating and plumbing | T-APP-H | P:F,N F-L D | 01 Water heaters and boilers (installation note) · 02 Plumbing fittings · 99 Other |

### C04 · Furniture and interior (LV Mēbeles un interjers · RU Мебель и интерьер · EN Furniture and interior)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C04.01 | Dzīvojamā istaba | Гостиная | Living room | T-FURN | P:F,N F-L | 01 Sofas and armchairs · 02 Cabinets and sideboards · 03 TV stands · 04 Coffee and side tables · 99 Other |
| C04.02 | Guļamistaba | Спальня | Bedroom | T-FURN | P:F,N F-L H | 01 Beds · 02 Wardrobes · 03 Mattresses (hygiene rules) · 04 Bedside tables · 99 Other |
| C04.03 | Virtuves mēbeles | Кухонная мебель | Kitchen furniture | T-FURN | P:F,N F-L | 01 Kitchen cabinets · 02 Kitchen tables and chairs · 99 Other |
| C04.04 | Biroja mēbeles (mājai) | Офисная мебель (для дома) | Office furniture (home) | T-FURN | P:F,N F-L | 01 Desks · 02 Office chairs · 03 Storage cabinets · 99 Other |
| C04.05 | Apgaismojums | Освещение | Lighting | T-GEN | P:F,N E S | 01 Ceiling lights · 02 Lamps · 03 Smart lighting · 99 Other |
| C04.06 | Dekori, tekstilijas un spoguļi | Декор, текстиль и зеркала | Decor, textiles and mirrors | T-GEN | P:F,N E S | 01 Decor · 02 Textiles and rugs · 03 Mirrors and frames · 99 Other |
| C04.07 | Plaukti un uzglabāšana | Стеллажи и хранение | Shelving and storage | T-FURN | P:F,N F-L | 01 Shelving units · 02 Storage boxes and organisers · 99 Other |

### C05 · Home and garden (LV Māja un dārzs · RU Дом и сад · EN Home and garden)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C05.01 | Dārza tehnika | Садовая техника | Garden machinery | T-TOOL-G | P:F,N E F-L | 01 Lawn mowers · 02 Trimmers and brushcutters · 03 Chainsaws · 04 Garden tractors (see B06 for commercial) · 05 Pressure washers · 99 Other |
| C05.02 | Dārza rokas instrumenti | Ручной садовый инструмент | Garden hand tools | T-TOOL-H | P:F,N E S | 01 Spades and forks · 02 Pruners and shears · 03 Hoses and sprinklers · 99 Other |
| C05.03 | Dārza mēbeles un grili | Садовая мебель и гриль | Outdoor furniture and grills | T-FURN | P:F,N F-L | 01 Garden furniture · 02 Grills and barbecues · 03 Parasols and covers · 99 Other |
| C05.04 | Baseini un SPA | Бассейны и SPA | Pools and spas | T-GEN | P:F,N F-L | 01 Pools · 02 Pool equipment · 03 Spas and hot tubs · 99 Other |
| C05.05 | Augi, podi un sēklas | Растения, горшки и семена | Plants, pots and seeds | T-GEN | P:F,N (pickup only) | 01 Pots and planters · 02 Plants (pickup only) · 03 Seeds and bulbs · 99 Other |
| C05.06 | Apkure un krāsnis | Отопление и печи | Heating and stoves | T-GEN | P:F,N F-L D | 01 Wood stoves · 02 Fireplaces · 03 Heating accessories · 99 Other |

### C06 · Tools and DIY (LV Instrumenti · RU Инструменты · EN Tools)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C06.01 | Elektroinstrumenti | Электроинструменты | Power tools | T-TOOL | P:F,N A E S | 01 Drills and drivers · 02 Saws · 03 Angle grinders · 04 Sanders and polishers · 05 Routers and planers · 06 Multi-tools · 99 Other |
| C06.02 | Rokas instrumenti | Ручной инструмент | Hand tools | T-TOOL-H | P:F,N A E S | 01 Spanners and sockets · 02 Screwdrivers · 03 Pliers and cutters · 04 Hammers and mallets · 05 Tool sets and cases · 99 Other |
| C06.03 | Darbnīcas aprīkojums | Оборудование для мастерской | Workshop equipment | T-TOOL | P:F,N A F-L | 01 Workbenches · 02 Compressors · 03 Vices and clamps · 04 Air tools · 99 Other |
| C06.04 | Mērīšanas un pārbaudes instrumenti | Измерительные приборы | Measuring and testing | T-TOOL | P:F,N A E S | 01 Laser levels · 02 Multimeters · 03 Calipers and gauges · 04 Thermal cameras · 99 Other |
| C06.05 | Kāpnes un piekļuve | Лестницы и подмости | Ladders and access | T-TOOL | P:F,N F-L | 01 Ladders · 02 Scaffolding (consumer) · 03 Step stools · 99 Other |
| C06.06 | Metināšana un lodēšana | Сварка и пайка | Welding and soldering | T-TOOL | P:F,N A E S | 01 Welding machines · 02 Soldering stations · 03 Welding accessories · 99 Other |
| C06.07 | Būvmateriāli un remonts | Стройматериалы и ремонт | Building and renovation | T-GEN | P:F,N F-L | 01 Tiles and flooring · 02 Paint and finishes · 03 Doors and windows · 04 Sanitary ware · 99 Other |

### C07 · Fashion (adults) (LV Apģērbi · RU Одежда · EN Fashion)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C07.01 | Sieviešu apģērbs | Женская одежда | Women's clothing | T-APPAREL | P:F,N E S H | 01 Tops and shirts · 02 Dresses · 03 Trousers and skirts · 04 Outerwear · 05 Knitwear · 06 Underwear and swimwear (new only) · 99 Other |
| C07.02 | Vīriešu apģērbs | Мужская одежда | Men's clothing | T-APPAREL | P:F,N E S H | 01 Shirts and tops · 02 Trousers · 03 Outerwear · 04 Knitwear · 05 Suits and formal · 06 Underwear and swimwear (new only) · 99 Other |
| C07.03 | Apavi | Обувь | Shoes | T-SHOE | P:F,N E S | 01 Women's shoes · 02 Men's shoes · 03 Sports shoes · 04 Boots · 05 Sandals and slippers · 99 Other |
| C07.04 | Somas un bagāža | Сумки и багаж | Bags and luggage | T-GEN | P:F,N E S | 01 Handbags · 02 Backpacks · 03 Luggage and suitcases · 04 Wallets and small leather goods · 99 Other |
| C07.05 | Aksesuāri | Аксессуары | Accessories | T-GEN | P:F,N E S | 01 Belts · 02 Scarves and gloves · 03 Hats · 04 Sunglasses · 99 Other |
| C07.06 | Rotaslietas un pulksteņi | Украшения и часы | Jewellery and watches | T-JEWEL | P:F,N A E S L2 | 01 Fine jewellery · 02 Fashion jewellery · 03 Watches · 04 Watch parts and straps · 99 Other |
| C07.07 | Svētku un kāzu apģērbs | Праздничная и свадебная одежда | Occasion and wedding wear | T-APPAREL | P:F,N E S | 01 Wedding dresses · 02 Evening wear · 03 Suits for events · 99 Other |

### C08 · Kids and baby (LV Bērniem · RU Детям · EN Kids and baby)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C08.01 | Bērnu ratiņi un autosēdeklīši | Коляски и автокресла | Strollers and car seats | T-KIDS | P:F,N E S D H | 01 Strollers · 02 Car seats (accident-history note) · 03 High chairs · 04 Cots and cribs (safety standard field) · 99 Other |
| C08.02 | Rotaļlietas | Игрушки | Toys | T-TOY | P:F,N A E S | 01 Toys by age · 02 Board games · 03 Educational toys · 04 Remote-control toys · 05 Building sets · 99 Other |
| C08.03 | Bērnu apģērbs un apavi | Детская одежда и обувь | Kids' clothing and shoes | T-KIDS-APP | P:F,N E S | 01 Girls' clothing · 02 Boys' clothing · 03 Kids' shoes · 04 Winter wear · 99 Other |
| C08.04 | Bērnu istaba | Детская комната | Kids' room | T-FURN | P:F,N F-L | 01 Kids' beds · 02 Kids' desks and chairs · 03 Play furniture · 99 Other |
| C08.05 | Barošana un kopšana | Кормление и уход | Feeding and care | T-GEN | P:F,N E S H | 01 Bottles and feeding · 02 Baby monitors · 03 Changing and bathing · 04 Breast pumps (new only) · 99 Other |

### C09 · Sports and leisure (LV Sports un atpūta · RU Спорт и отдых · EN Sports and leisure)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C09.01 | Fitnesa tehnika | Фитнес-оборудование | Fitness equipment | T-SPORT-FIT | P:F,N E F-L | 01 Treadmills and bikes · 02 Weights and racks · 03 Home gyms · 04 Yoga and pilates · 99 Other |
| C09.02 | Riteņbraukšanas piederumi | Велоаксессуары | Cycling accessories | T-SPORT | P:F,N E S | 01 Cycling clothing · 02 Lights and computers · 03 Locks · 04 Bike racks · 99 Other |
| C09.03 | Kempings un pārgājieni | Кемпинг и походы | Camping and hiking | T-SPORT | P:F,N E S | 01 Tents · 02 Sleeping bags and mats · 03 Backpacks (hiking) · 04 Stoves and cookware · 99 Other |
| C09.04 | Ūdens sports | Водный спорт | Water sports | T-SPORT | P:F,N E F-L | 01 Kayaks and canoes · 02 Paddleboards · 03 Wetsuits and gear · 04 Snorkelling · 99 Other |
| C09.05 | Ziemas sports | Зимний спорт | Winter sports | T-SPORT | P:F,N E S | 01 Skis · 02 Snowboards · 03 Boots and bindings · 04 Sledges · 99 Other |
| C09.06 | Komandu un bumbu sports | Командные и игровые виды спорта | Team and ball sports | T-SPORT | P:F,N E S | 01 Football · 02 Basketball · 03 Tennis and padel · 04 Other team sports · 99 Other |
| C09.07 | Makšķerēšana | Рыбалка | Fishing | T-SPORT | P:F,N E S | 01 Rods and reels · 02 Lures and tackle · 03 Boats and accessories (see C01.07) · 99 Other |
| C09.08 | Medības un šaušana | Охота и стрельба | Hunting and shooting | — | X | Prohibited (see section 6) |

### C10 · Hobbies and collectibles (LV Hobiji un kolekcionēšana · RU Хобби и коллекционирование · EN Hobbies and collectibles)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C10.01 | Monētas un banknotes | Монеты и банкноты | Coins and banknotes | T-COLL | P:F,N A E S | 01 Coins · 02 Banknotes · 03 Medals and tokens · 99 Other |
| C10.02 | Markas un pasta | Марки и почта | Stamps and postal items | T-COLL | P:F,N A E S | 01 Stamps · 02 Postcards and covers · 99 Other |
| C10.03 | Plates un mūzikas nesēji | Пластинки и носители музыки | Records and music media | T-MEDIA | P:F,N A E S | 01 Vinyl · 02 CDs · 03 Cassettes · 04 DVD and Blu-ray · 99 Other |
| C10.04 | Kolekcionējamās kartītes | Коллекционные карточки | Trading cards | T-COLL | P:F,N A E S | 01 Sports cards · 02 Trading card games · 03 Sealed packs and boxes · 99 Other |
| C10.05 | Komiksi | Комиксы | Comics | T-BOOK | P:F,N A E S | 01 Comics · 02 Graphic novels · 03 Manga · 99 Other |
| C10.06 | Figūriņas, modeļi un LEGO | Фигурки, модели и LEGO | Figures, models and LEGO | T-COLL | P:F,N A E S | 01 Figures · 02 Model kits · 03 LEGO sets (set number field) · 04 Model trains · 99 Other |
| C10.07 | Antikvariāts un māksla | Антиквариат и искусство | Antiques and art | T-ANTIQUE | P:F,N A F-L D | 01 Furniture (antique) · 02 Ceramics and glass · 03 Silver and metalware · 04 Paintings and prints · 05 Clocks · 99 Other |
| C10.08 | Militārās kolekcijas (bez ieročiem) | Военные коллекции (без оружия) | Military collectibles (no weapons) | T-COLL | P:F,N A E S L2 | 01 Uniforms and insignia · 02 Helmets and equipment (no weapons) · 03 Documents and medals · 99 Other |

### C11 · Musical instruments (LV Mūzikas instrumenti · RU Музыкальные инструменты · EN Musical instruments)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C11.01 | Ģitāras un basģitāras | Гитары и бас-гитары | Guitars and basses | T-INST | P:F,N A E S | 01 Electric guitars · 02 Acoustic guitars · 03 Bass guitars · 04 Classical guitars · 05 Amplifiers for guitar · 99 Other |
| C11.02 | Klavieres un taustiņinstrumenti | Пианино и клавишные | Pianos and keyboards | T-INST | P:F,N A F-L | 01 Acoustic pianos · 02 Digital pianos · 03 Synthesisers · 04 MIDI controllers · 99 Other |
| C11.03 | Sitamie instrumenti | Ударные инструменты | Drums and percussion | T-INST | P:F,N A F-L | 01 Drum kits · 02 Cymbals and hardware · 03 Percussion instruments · 99 Other |
| C11.04 | Pūšamie instrumenti | Духовые инструменты | Wind and brass | T-INST | P:F,N A E S | 01 Saxophones · 02 Trumpets and brass · 03 Flutes and woodwind · 99 Other |
| C11.05 | Stīgu un orķestra instrumenti | Струнные и оркестровые | Strings and orchestral | T-INST | P:F,N A E S | 01 Violins and viola · 02 Cellos and double bass · 03 Harps · 99 Other |
| C11.06 | Studijas, DJ un PA | Студия, DJ и PA | Studio, DJ and PA | T-INST-PRO | P:F,N A E S F-L | 01 Studio monitors · 02 Microphones · 03 Audio interfaces · 04 DJ controllers · 05 PA systems · 99 Other |
| C11.07 | Pastiprinātāji un efekti | Усилители и эффекты | Amplifiers and effects | T-INST | P:F,N A E S | 01 Guitar effects · 02 Bass amplifiers · 03 Pedals · 99 Other |

### C12 · Books and media (LV Grāmatas un mediji · RU Книги и медиа · EN Books and media)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C12.01 | Daiļliteratūra | Художественная литература | Fiction | T-BOOK | P:F,N E S | 01 Novels · 02 Crime and thriller · 03 Fantasy and science fiction · 04 Poetry and drama · 99 Other |
| C12.02 | Zinātniskā un populārzinātniskā literatūra | Научно-популярная литература | Non-fiction | T-BOOK | P:F,N E S | 01 History · 02 Science · 03 Business and economics · 04 Self-help · 99 Other |
| C12.03 | Mācību grāmatas un izglītība | Учебники и образование | Textbooks and education | T-BOOK | P:F,N E S | 01 School textbooks · 02 University textbooks · 03 Language learning · 04 Exam preparation · 99 Other |
| C12.04 | Bērnu grāmatas | Детские книги | Children's books | T-BOOK | P:F,N E S | 01 Picture books · 02 Early readers · 03 Teen fiction · 99 Other |

### C13 · Beauty and health (LV Skaistums un veselība · RU Красота и здоровье · EN Beauty and health)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C13.01 | Matu tehnika | Техника для волос | Hair devices | T-BEAUTY-DEV | P:F,N E S H | 01 Hair dryers · 02 Straighteners and curlers · 03 Hair clippers and trimmers · 04 Hair removal (new only) · 99 Other |
| C13.02 | Personīgās kopšanas ierīces | Приборы для ухода | Personal care devices | T-BEAUTY-DEV | P:F,N E S H | 01 Electric toothbrushes · 02 Shavers · 03 Massage devices · 99 Other |
| C13.03 | Smaržas un kosmētika (neatvērta) | Парфюмерия и косметика (неоткрытая) | Fragrance and cosmetics (sealed only) | T-BEAUTY | P:F,N E S L2 H | 01 Fragrances (sealed) · 02 Skincare (sealed) · 03 Make-up (sealed) · 99 Other |
| C13.04 | Mobilitātes palīglīdzekļi | Средства для мобильности | Mobility aids | T-MED-AID | P:F,N E F-L D | 01 Wheelchairs · 02 Walkers and rollators · 03 Bathroom aids · 99 Other |
| C13.05 | Medikamenti un uztura bagātinātāji | Лекарства и БАДы | Medicines and supplements | — | X | Prohibited (see section 6) |

### C14 · Pets (LV Mājdzīvnieki · RU Животные · EN Pets)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C14.01 | Mājdzīvnieku preces | Товары для животных | Pet supplies | T-PET | P:F,N E S | 01 Beds and bowls · 02 Leads and collars · 03 Toys · 04 Pet food (sealed only) · 05 Carriers and transport · 99 Other |
| C14.02 | Akvāriji un terārijs (aprīkojums) | Аквариумы и террариумы | Aquariums and terrariums | T-PET | P:F,N F-L | 01 Aquariums · 02 Filters and pumps · 03 Heaters and lighting · 04 Terrarium equipment · 99 Other |
| C14.03 | Dzīvnieki | Живые животные | Live animals | — | X | Prohibited (see section 6) |

### C15 · Other (LV Citi · RU Прочее · EN Other)

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| C15.01 | Citas preces | Прочие товары | Other goods | T-GEN | P:F,N E S | 01 Other goods (description required, weekly review) |

---

## 3. Business categories (R4)

All business categories require L3 verification. Templates marked with `F-L` default to freight or collection.

| Code | LV | RU | EN | Template | Flags | Leaves |
|---|---|---|---|---|---|---|
| B01 | Rūpnieciskās iekārtas | Промышленное оборудование | Industrial machinery | T-BIZ | L3 A | 01 CNC and metalworking · 02 Woodworking machinery · 03 Plastics and rubber machinery · 04 Packaging machinery · 05 Compressors and pumps · 06 Generators and power units · 07 Electrical and switchgear · 08 Food processing machinery · 99 Other |
| B02 | Celtniecības tehnika | Строительная техника | Construction machinery | T-BIZ-HEAVY | L3 A F-L D | 01 Excavators · 02 Loaders and dozers · 03 Cranes and lifting · 04 Concrete and road equipment · 05 Scaffolding and formwork · 06 Surplus building materials (lots) · 99 Other |
| B03 | Ēdināšanas aprīkojums (HoReCa) | Оборудование для HoReCa | HoReCa equipment | T-BIZ | L3 A F-L | 01 Commercial kitchen · 02 Refrigeration · 03 Coffee and beverage machines · 04 Café and restaurant furniture · 05 POS and tills · 06 Dishwashing · 99 Other |
| B04 | Biroja un IT aprīkojums | Офисное и IT-оборудование | Office and IT business equipment | T-BIZ | L3 A | 01 Office furniture (bulk) · 02 Servers and networking · 03 Printers and copiers · 04 Telephony and call centre · 99 Other |
| B05 | Noliktavas un mazumtirdzniecības aprīkojums | Складское и торговое оборудование | Retail, warehouse, and surplus | T-LOT | L3 A F-L | 01 Surplus stock lots · 02 Shelving and racking · 03 Store fixtures · 04 Packaging and logistics supplies · 05 Forklifts and warehouse equipment · 99 Other |
| B06 | Lauksaimniecības tehnika | Сельхозтехника | Agricultural machinery | T-BIZ-HEAVY | L3 A F-L D | 01 Tractors · 02 Farm implements · 03 Feed and animal equipment · 04 Greenhouse and irrigation · 99 Other |
| B07 | Medicīnas un zobārstniecības aprīkojums | Медицинское и стоматологическое оборудование | Medical and dental equipment | T-BIZ-MED | L3 D L2 | 01 Dental units · 02 Diagnostic equipment · 03 Laboratory equipment · 04 Hospital furniture · 99 Other (requires documentation; see section 6) |
| B08 | Komerciālie transportlīdzekļi | Коммерческий транспорт | Commercial vehicles | T-VEH-COM | L3 A D F-L | 01 Vans and light trucks (up to 3.5 t) · 02 Trucks (over 3.5 t) · 03 Buses and minibuses · 04 Special vehicles · 05 Commercial trailers · 99 Other |

---

## 4. Brand and model catalogues

Catalogues drive dropdowns for brand and model fields. Seed data below is a starting point. The category manager loads full catalogues from a curated source (the owner selects it under Q-08 and the data-licensing review). Until then, sellers can type a brand and model that is not in the list; these entries are flagged `unverified` and reviewed weekly.

Rules:
- Brand is an enum from the brand catalogue. Model is an enum dependent on brand. Typed values go to review.
- Catalogue entries have status `seed`, `curated`, or `retired`. Retired entries stay valid for existing listings.
- Model names are stored as published by the manufacturer. Do not add marketing names.

| Family | Used by | Brands (seed) | Example models (seed) | Notes |
|---|---|---|---|---|
| Smartphones | C02.01 | Apple, Samsung, Xiaomi, Huawei, Google, Sony, Motorola, Nokia, OnePlus, Oppo, Honor, Realme, Nothing, Fairphone | iPhone 13, iPhone 14, iPhone 15, iPhone 16; Galaxy S23, Galaxy S24; Pixel 8; Redmi Note 13 | Storage and colour from family list. IMEI is optional and never public. |
| Tablets | C02.02 | Apple, Samsung, Lenovo, Huawei, Xiaomi, Microsoft | iPad (10th gen), iPad Air; Galaxy Tab S9; Surface Go | |
| Laptops | C02.03 | Apple, Dell, HP, Lenovo, Asus, Acer, Microsoft | MacBook Air M2; XPS 13; ThinkPad T14; EliteBook 840; ZenBook 14; Aspire 5; Surface Laptop | CPU, RAM, storage fields are required for laptops. |
| Consoles | C02.07 | Sony, Microsoft, Nintendo, Valve | PlayStation 4, PlayStation 5; Xbox Series X, Xbox Series S; Nintendo Switch; Steam Deck | Region code field for games. |
| Cameras | C02.06 | Canon, Nikon, Sony, Fujifilm, Panasonic, Olympus, GoPro, DJI | Canon EOS R6; Nikon Z6; Sony A7 III; GoPro HERO12 | Drones: registration note required by law (legal review, Q-14). |
| Cars | C01.01, C01.02 | Volkswagen, BMW, Audi, Mercedes-Benz, Škoda, Toyota, Volvo, Ford, Opel, Renault, Peugeot, Hyundai, Kia, Mazda, Honda, Nissan, Lexus, Subaru, Mitsubishi, Citroën, Seat, Fiat | Golf, Passat (Volkswagen); 3 Series (BMW); Octavia, Fabia (Škoda); Corolla, RAV4 (Toyota) | Full model lists are loaded from a curated source. VIN is never shown publicly. |
| Motorcycles | C01.02 | Yamaha, Honda, Kawasaki, Suzuki, BMW, KTM, Ducati, Triumph, Harley-Davidson | MT-07 (Yamaha); CB650R (Honda) | Licence category required (A1, A2, A). |
| Bicycles | C01.03 | Trek, Giant, Specialized, Merida, Cube, Kross, Bergamont, Scott, Canyon | | Frame size and wheel size required. |
| Power tools | C06.01 | Bosch, Makita, DeWalt, Milwaukee, Hilti, Metabo, Ryobi, Einhell, Stanley, Festool | | Voltage and battery platform fields. |
| Musical instruments | C11.x | Fender, Gibson, Yamaha, Ibanez, Roland, Korg, Casio, Pearl, Ludwig, Taylor, Martin | Stratocaster (Fender); Les Paul (Gibson) | Serial number optional. |
| Watches | C07.06 | Rolex, Omega, Seiko, Tissot, Casio, Swatch, Breitling, TAG Heuer, Longines | | Certificate and box fields. Auction-eligible with authentication. |
| Fitness | C09.01 | Life Fitness, Technogym, Concept2, Garmin (trackers in C02.08) | | |
| Kids' car seats | C08.01 | Britax, Cybex, Maxi-Cosi, Chicco, Joie | | Accident history field. |
| Business machinery | B01, B02, B06 | Caterpillar, JCB, Komatsu, Liebherr, Kubota, John Deere, Case IH, Atlas Copco, Kaeser | | Operating hours and serial number recommended. |
| HoReCa | B03 | Rational, Hobart, Fagor, Nuova Simonelli, La Marzocco, Electrolux Professional | | |

---

## 5. Attribute templates

Each template lists its fields. Required fields are marked R. Public fields are shown in listings and search; private fields are visible only to the seller, buyers in an active conversation, or moderators with a logged reason.

### T-GEN (general goods)
Brand (text, catalogue optional), Model (text), Colour (enum), Dimensions (cm, optional), Weight (kg, optional), Condition (R), Accessories included (multi-select, optional), Year of purchase (optional).

### T-DEV (electronic devices)
Brand (catalogue, R), Model (catalogue, R), Storage (enum, optional), Colour (enum, R), Condition (R), Battery health % (number, optional, Apple devices show the battery health field), Accessories included (R), Warranty remaining (months, optional), Original box (boolean), Serial number (optional, private).

### T-PHONE (phones)
All T-DEV fields, plus: Network lock (enum: unlocked, carrier locked, unknown, R), Dual SIM (boolean), Screen damage (boolean, R), IMEI (private, optional; checked by the stolen-goods service per US-06.09 when the listing is reviewed).

### T-PC (computers)
All T-DEV fields, plus: Processor (text, R for laptops and desktops), RAM (GB, R), Storage (GB and type, R), Graphics (text, optional), Operating system (enum, optional), Screen size (inches, laptops only).

### T-PERIPH and T-AV
T-DEV fields. T-AV adds Screen size (inches, TVs), Wireless (boolean), Power output (W, speakers and amplifiers).

### T-CAM
T-DEV fields, plus: Shutter count (optional, public), Lens included (text), Drone registration number (text, required for drones, private until reviewed).

### T-GAME
T-DEV fields, plus: Platform (enum, R), Region code (enum, R for games), Edition (text, optional), Game title (catalogue text, R for games).

### T-APP-H (home appliances)
Brand (catalogue, R), Model (catalogue, R), Energy class (enum A to G, optional for ovens, fridges, washing machines, dishwashers, air conditioners), Width (cm, optional), Year (optional), Installed before (boolean, R), Warranty remaining (months, optional), Accessories included (R), Working condition note (text, R).

### T-FURN (furniture)
Material (enum: wood, MDF, metal, glass, leather, fabric, plastic, mixed; R), Colour (R), Dimensions width, depth, height (cm, R), Weight (kg, optional), Assembly required (boolean, R), Smoke-free and pet-free home (boolean, optional), Stain or damage notes (text, R if any), Hygiene declaration (mattresses only, R).

### T-APPAREL (clothing)
Size system (enum: EU, UK, US, LV, RU, other, R), Size (enum per system, R), Gender (enum: women, men, unisex, R), Colour (R), Material (text, R), Brand (catalogue or text, R), Tags attached (boolean), Condition (R), Measurements (chest, waist, length in cm, optional).

### T-SHOE
T-APPAREL fields, with EU size (number, R) and Width (enum, optional) in place of size system.

### T-JEWEL (jewellery and watches)
Metal (enum, R), Purity (enum, e.g. 585, 750, 925, R for precious metals), Stone (enum, optional), Weight (grams, R for precious metals), Brand (catalogue, R for watches), Movement (enum, watches only), Box and papers (boolean), Hallmark (text, optional), Authenticity certificate (attachment, optional). Watches over the auction threshold require an authentication step (flow F-15).

### T-KIDS (kids' goods with safety fields)
Age from (months, R), Age to (months, optional), Brand (catalogue, R), Safety standard reference (text, R for car seats and cots), Accident history (enum: none, reported, unknown, R for car seats), Condition (R).

### T-KIDS-APP
T-APPAREL fields, with age range (years, R) in place of gender.

### T-TOY
Age from (years, R), Brand (R), Complete set (boolean, R), Batteries required (boolean), Pieces count (number, optional), Condition (R).

### T-SPORT and T-SPORT-FIT
Brand (R), Model (text), Size (text, optional), Colour, Dimensions (cm, optional), Weight capacity (kg, T-SPORT-FIT only, R), Usage (enum: new, used a few times, regular use, R), Condition (R).

### T-COLL (coins, stamps, cards, figures, LEGO)
Year (R where applicable), Country of origin (catalogue, R for coins and stamps), Grade (enum per family: coins use the standard numismatic scale; cards and figures use free text; R where graded), Grading service (enum, optional), Edition or variant (text, optional), Set number (text, R for LEGO), Quantity (number, optional), Certificate (attachment, optional).

### T-MEDIA (records, CDs, DVDs)
Format (enum, R), Year (R), Label (text, optional), Media condition (enum, R), Sleeve condition (enum, R), Pressing or edition (text, optional).

### T-BOOK
Language (enum: LV, RU, EN, other, R), Author (R), Title (R), Publisher (optional), Year (optional), Edition (optional), Format (enum: hardback, paperback, other, R), Pages (optional), ISBN (optional, public), Condition (R).

### T-INST and T-INST-PRO
Brand (catalogue, R), Model (catalogue, R), Year (optional), Colour (optional), Case included (boolean, R), Accessories included (R), Serial number (optional, private), Condition (R). T-INST-PRO adds Power (W, optional), Channels (number, optional), Weight (kg, optional).

### T-BEAUTY-DEV and T-BEAUTY
T-BEAUTY-DEV: Brand (catalogue, R), Model (R), Power source (enum: mains, battery, both, R), Accessories included (R), Hygiene declaration (new or cleaned per manufacturer instructions, R). T-BEAUTY: Brand (R), Product name (R), Volume (ml, R), Sealed (boolean, must be true, R), Expiry or best-before date (R).

### T-MED-AID
Brand (R), Model (optional), Weight capacity (kg, R), Foldable (boolean, R), Hygiene declaration (R), Condition (R).

### T-PET
Species target (enum: dog, cat, bird, fish, reptile, small mammal, other, R), Brand (R), Size (optional), Food sealed (boolean, R for food), Best-before date (R for food), Condition (R).

### T-ANTIQUE
Period or era (text, R), Origin (text, R), Dimensions (cm, R), Provenance (text, optional), Restoration (enum: none, partial, full, R), Appraisal attached (boolean), Material (text, R).

### T-BIZ (business equipment)
Brand (catalogue, R), Model (catalogue, R), Year of manufacture (R), Serial number (R for machinery, public), Operating hours (optional), Quantity (number, R), Location (district and city, R), Pickup only (boolean, default true), Weight (kg, R), Dimensions (cm, R), Warranty remaining (months, optional), Inspection report (attachment, optional, recommended), VAT invoice (enum: available, not available, margin scheme, R), Condition (R).

### T-BIZ-HEAVY
T-BIZ fields, plus: Maximum load (kg, R where applicable), Drive hours or mileage (R for vehicles and machinery), Certified inspection (boolean), Transport arranged by (enum: seller, buyer, R).

### T-VEH (passenger cars and similar)
Make (catalogue, R), Model (catalogue dependent on make, R), Year (R), Mileage (km, R), Fuel (enum: petrol, diesel, hybrid, plug-in hybrid, electric, LPG, CNG, R), Gearbox (enum: manual, automatic, semi-automatic, R), Body (enum, R), Engine capacity (cm³, R for combustion), Power (kW, R), Drive (enum: front, rear, all, R), Colour (R), Owners (count, R), VIN (private until a buyer is in an active conversation and the seller consents), Technical inspection valid until (date, R for registered vehicles), Accident history (enum: none, reported, unknown, R), First registration date (optional).

### T-VEH-2W
Make (R), Model (R), Year (R), Mileage (km, R), Engine capacity (cm³, R), Power (kW, optional), Licence category (enum: AM, A1, A2, A, R), Colour (R), Owners (count, R), VIN (private as above), Technical inspection valid until (date, R).

### T-VEH-COM (commercial vehicles)
Make (R), Model (R), Year (R), Mileage or hours (R), Gross weight (kg, R), Body type (enum, R), Load capacity (kg, R), Axles (number, R), Technical inspection valid until (date, R), VIN (private as above), Accident history (R), Tachograph (boolean, trucks only).

### T-VEH-TR, T-BOAT, T-BIKE, T-PART
T-VEH-TR: Make or manufacturer (R), Model (R), Year (R), Length (m, R), Weight (kg, optional), Axles (number), Registration plate (private, optional), Condition (R).
T-BOAT: Manufacturer (R), Model (R), Length (m, R), Year (R), Engine make and power (kW, R), Hours (optional), Hull material (enum, R), Registration documents (attachment, R).
T-BIKE: Brand (catalogue, R), Model (text, R), Frame size (enum, R), Wheel size (enum, R), Frame material (enum, R), Type (enum, R), Electric (boolean, R), Battery capacity (Wh, R if electric), Year (optional).
T-PART: Fits make (catalogue, R), Fits model (catalogue, R), Fits years (range, R), OEM part number (text, optional), Part type (OEM, aftermarket, used original, R), Condition (R).

### T-LOT (surplus lots)
Lot contents (text list, R), Total quantity (number, R), Unit (text, R), Pallets count (number, optional), Original packaging (boolean, R), Stock origin (enum: new surplus, returned, damaged packaging, showroom, R), Plus the T-BIZ fields.

### T-BIZ-MED (regulated medical equipment, L3)
Brand (catalogue, R), Model (R), Year of manufacture (R), Serial number (R), Medical device classification (text, R), CE marking (boolean, R), Declaration of conformity (attachment, R), Last calibration date and next due date (R where applicable), Operating hours (optional), Warranty remaining (months, optional). Listing publication requires a manual review by an M2 moderator.

---

## 6. Prohibited and restricted items

### 6.1 Prohibited (X)

These items cannot be listed. Attempts are blocked by rule, and repeated attempts go to moderation.

- Firearms, ammunition, explosives, and their components. Hunting and shooting category is closed.
- Knives and blades designed to injure. Kitchen knives and tools for ordinary use are permitted under C03 and C06 (legal review, Q-15).
- Narcotics, psychoactive substances, and paraphernalia.
- Prescription medicines, medicines, and dietary supplements (C13.05).
- Live animals (C14.03).
- Human body parts, remains, and organs.
- Counterfeit or infringing goods (any listing with a known counterfeit signal goes to review, and confirmed cases are removed).
- Stolen goods. Any listing with a stolen-goods signal is held for M2 review.
- Identity documents, passports, driving licences, bank cards, and login details.
- Alcohol and tobacco (R1; a business route is proposed for R4 subject to licensing review, Q-14).
- Adult content and services.
- Gambling products and services.
- Surveillance devices designed for covert recording of other people (review under legal rules, Q-14).
- Hazardous materials: fuel, gas cylinders, pressurised containers, and chemicals not for personal use.
- Used underwear, swimwear, and breast pumps (H-flag rule).
- Opened cosmetics and opened pet food (sealed only).

### 6.2 Restricted (L2 or L3 required, plus extra checks)

- Restricted categories with L2: C07.06 jewellery and watches above the auction threshold, C10.08 military collectibles, C13.03 sealed fragrances and cosmetics.
- L3 required: all B categories, and any listing published as a business.
- Documentation required: vehicles (technical inspection and, where relevant, registration documents), drones (registration number), boats (registration documents), medical devices (declaration of conformity), heating systems and water heaters (installation note), car seats (accident history).
- Hygiene rule (H): the seller must confirm the item is new or cleaned to the manufacturer's standard. Certain items (see 6.1) are prohibited used.

### 6.3 Enforcement

The rule engine checks title, description, attributes, and images before publication. Matches go to `pending_review` with a reason code. Repeat violations trigger the enforcement ladder in `03-business-rules.md`.

---

## 7. Category governance

- The category manager (an admin role) owns this file. Changes go through a pull request reviewed by the product owner.
- Adding a leaf: request, code assigned, template chosen, flags set, LV/RU/EN names reviewed by a native speaker, mapping of existing `Other` listings reviewed within 14 days.
- Retiring a leaf: listings moved to the parent `99 Other` leaf in one batch job; old URLs redirect; the code is never reused.
- Quarterly review: usage per leaf, `Other` share, search zero-result rate, and seller feedback. A leaf with fewer than 20 listings for two quarters is merged into its parent, unless it is a restricted or regulated category.
- Translation changes follow the same process as code changes.
