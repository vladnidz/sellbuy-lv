import { Locale } from './i18n';

type TranslationKeys = {
  nav: Record<string, string>;
  hero: Record<string, string>;
  categories: Record<string, string>;
  listings: Record<string, string>;
  how_it_works: Record<string, string>;
  cta: Record<string, string>;
  auth: Record<string, string>;
  footer: Record<string, string>;
  common: Record<string, string>;
};

export const translations: Record<Locale, TranslationKeys> = {
  lv: {
    nav: { sludinājumi: 'Sludinājumi', kategorijas: 'Kategorijas', ievietot: 'Ievietot', par_mums: 'Par mums', ieiet: 'Ieiet', registrēties: 'Reģistrēties' },
    hero: { title: 'Pērc un pārdod visā Latvijā', subtitle: 'Tūkstoši sludinājumu no uzticamiem pārdevējiem. Smart-ID verificēts, ar Escrow aizsardzību.', search_placeholder: 'Meklēt sludinājumus...', cta_primary: 'Ievietot sludinājumu', cta_secondary: 'Pārlūkot' },
    categories: { title: 'Kategorijas' },
    listings: { title: 'Sludinājumi', search_placeholder: 'Meklēt...', filters: 'Filtri', category: 'Kategorija', city: 'Pilsēta', price_from: 'Cena no', price_to: 'Cena līdz', sort_newest: 'Jaunākie', sort_price_asc: 'Cena ↑', sort_price_desc: 'Cena ↓', results: 'rezultāti', empty_state: 'Nav atrasti sludinājumi', clear_filters: 'Notīrīt filtrus' },
    how_it_works: { title: 'Kā tas strādā', step1_title: 'Atrodi preci', step1_desc: 'Meklē tūkstošos sludinājumu pēc kategorijas, cenas vai atrašanās vietas.', step2_title: 'Sazinies ar pārdevēju', step2_desc: 'Droša saziņa caur platformu — nav jādala savs telefona numurs.', step3_title: 'Drošs darījums', step3_desc: 'Escrow aizsardzība — nauda tiek atbrīvota tikai pēc preces saņemšanas.' },
    cta: { title: 'Gatavs sākt?', subtitle: 'Bezmaksas reģistrācija. Nav slēptu maksu.', register: 'Reģistrēties', browse: 'Pārlūkot sludinājumus' },
    auth: { login_title: 'Ieiet', register_title: 'Reģistrēties', email: 'E-pasts', password: 'Parole', confirm_password: 'Apstiprināt paroli', name: 'Vārds', no_account: 'Nav konts?', has_account: 'Jau ir konts?', login_btn: 'Ieiet', register_btn: 'Reģistrēties', logging_in: 'Ielogojas...', registering: 'Reģistrējas...' },
    footer: { navigation: 'Navigācija', account: 'Konts', security: 'Drošība', escrow_desc: 'Escrow aizsardzība', smart_id_desc: 'Smart-ID verifikācija', encrypted_desc: 'Šifrēta saziņa', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Meklēt', loading: 'Ielādē...', error: 'Kļūda', not_found: 'Nav atrasts', return_home: 'Atpakaļ uz sākumlapu' },
  },
  ru: {
    nav: { sludinājumi: 'Объявления', kategorijas: 'Категории', ievietot: 'Добавить', par_mums: 'О нас', ieiet: 'Войти', registrēties: 'Регистрация' },
    hero: { title: 'Покупайте и продавайте по всей Латвии', subtitle: 'Тысячи объявлений от проверенных продавцов. Верификация Smart-ID, защита Escrow.', search_placeholder: 'Поиск объявлений...', cta_primary: 'Добавить объявление', cta_secondary: 'Просмотреть' },
    categories: { title: 'Категории' },
    listings: { title: 'Объявления', search_placeholder: 'Поиск...', filters: 'Фильтры', category: 'Категория', city: 'Город', price_from: 'Цена от', price_to: 'Цена до', sort_newest: 'Новые', sort_price_asc: 'Цена ↑', sort_price_desc: 'Цена ↓', results: 'результатов', empty_state: 'Объявления не найдены', clear_filters: 'Очистить фильтры' },
    how_it_works: { title: 'Как это работает', step1_title: 'Найдите товар', step1_desc: 'Ищите среди тысяч объявлений по категории, цене или местоположению.', step2_title: 'Свяжитесь с продавцом', step2_desc: 'Безопасное общение через платформу — не нужно делиться номером телефона.', step3_title: 'Безопасная сделка', step3_desc: 'Защита Escrow — деньги переводятся только после получения товара.' },
    cta: { title: 'Готовы начать?', subtitle: 'Бесплатная регистрация. Скрытых платежей нет.', register: 'Регистрация', browse: 'Просмотреть объявления' },
    auth: { login_title: 'Войти', register_title: 'Регистрация', email: 'Эл. почта', password: 'Пароль', confirm_password: 'Подтвердить пароль', name: 'Имя', no_account: 'Нет аккаунта?', has_account: 'Уже есть аккаунт?', login_btn: 'Войти', register_btn: 'Зарегистрироваться', logging_in: 'Вход...', registering: 'Регистрация...' },
    footer: { navigation: 'Навигация', account: 'Аккаунт', security: 'Безопасность', escrow_desc: 'Защита Escrow', smart_id_desc: 'Верификация Smart-ID', encrypted_desc: 'Шифрованная связь', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Поиск', loading: 'Загрузка...', error: 'Ошибка', not_found: 'Не найдено', return_home: 'На главную' },
  },
  en: {
    nav: { sludinājumi: 'Listings', kategorijas: 'Categories', ievietot: 'Post ad', par_mums: 'About', ieiet: 'Log in', registrēties: 'Sign up' },
    hero: { title: 'Buy and sell across Latvia', subtitle: 'Thousands of listings from verified sellers. Smart-ID verified, Escrow protection.', search_placeholder: 'Search listings...', cta_primary: 'Post a listing', cta_secondary: 'Browse' },
    categories: { title: 'Categories' },
    listings: { title: 'Listings', search_placeholder: 'Search...', filters: 'Filters', category: 'Category', city: 'City', price_from: 'Price from', price_to: 'Price to', sort_newest: 'Newest', sort_price_asc: 'Price ↑', sort_price_desc: 'Price ↓', results: 'results', empty_state: 'No listings found', clear_filters: 'Clear filters' },
    how_it_works: { title: 'How it works', step1_title: 'Find an item', step1_desc: 'Search thousands of listings by category, price, or location.', step2_title: 'Contact the seller', step2_desc: 'Secure messaging through the platform — no need to share your phone number.', step3_title: 'Safe transaction', step3_desc: 'Escrow protection — funds are released only after you receive the item.' },
    cta: { title: 'Ready to start?', subtitle: 'Free registration. No hidden fees.', register: 'Sign up', browse: 'Browse listings' },
    auth: { login_title: 'Log in', register_title: 'Sign up', email: 'Email', password: 'Password', confirm_password: 'Confirm password', name: 'Name', no_account: "Don't have an account?", has_account: 'Already have an account?', login_btn: 'Log in', register_btn: 'Sign up', logging_in: 'Logging in...', registering: 'Signing up...' },
    footer: { navigation: 'Navigation', account: 'Account', security: 'Security', escrow_desc: 'Escrow protection', smart_id_desc: 'Smart-ID verification', encrypted_desc: 'Encrypted messaging', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Search', loading: 'Loading...', error: 'Error', not_found: 'Not found', return_home: 'Return home' },
  },
  et: {
    nav: { sludinājumi: 'Kuulutused', kategorijas: 'Kategooriad', ievietot: 'Lisa kuulutus', par_mums: 'Meist', ieiet: 'Logi sisse', registrēties: 'Registreeru' },
    hero: { title: 'Osta ja müü üle Läti', subtitle: 'Tuhanded kuulutused usaldusväärsetelt müüjatelt. Smart-ID kinnitatud, Escrow kaitse.', search_placeholder: 'Otsi kuulutusi...', cta_primary: 'Lisa kuulutus', cta_secondary: 'Sirvi' },
    categories: { title: 'Kategooriad' },
    listings: { title: 'Kuulutused', search_placeholder: 'Otsi...', filters: 'Filtrid', category: 'Kategooria', city: 'Linn', price_from: 'Hind alates', price_to: 'Hind kuni', sort_newest: 'Uusimad', sort_price_asc: 'Hind ↑', sort_price_desc: 'Hind ↓', results: 'tulemused', empty_state: 'Kuulutusi ei leitud', clear_filters: 'Tühjenda filtrid' },
    how_it_works: { title: 'Kuidas see töötab', step1_title: 'Leia toode', step1_desc: 'Otsi tuhandete kuulutuste seast kategooria, hinna või asukoha järgi.', step2_title: 'Võta müüjaga ühendust', step2_desc: 'Turvaline suhtlus platvormi kaudu — telefoni jagama ei pea.', step3_title: 'Turvaline tehing', step3_desc: 'Escrow kaitse — raha vabastatakse alles pärast toote kättesaamist.' },
    cta: { title: 'Valmis alustama?', subtitle: 'Tasuta registreerimine. Varjatud tasusid pole.', register: 'Registreeru', browse: 'Sirvi kuulutusi' },
    auth: { login_title: 'Logi sisse', register_title: 'Registreeru', email: 'E-post', password: 'Parool', confirm_password: 'Kinnita parool', name: 'Nimi', no_account: 'Pole kontot?', has_account: 'Juba on konto?', login_btn: 'Logi sisse', register_btn: 'Registreeru', logging_in: 'Sisselogimine...', registering: 'Registreerimine...' },
    footer: { navigation: 'Navigatsioon', account: 'Konto', security: 'Turvalisus', escrow_desc: 'Escrow kaitse', smart_id_desc: 'Smart-ID kinnitamine', encrypted_desc: 'Krüptitud suhtlus', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Otsi', loading: 'Laadimine...', error: 'Viga', not_found: 'Ei leitud', return_home: 'Tagasi avalehele' },
  },
  lt: {
    nav: { sludinājumi: 'Skelbimai', kategorijas: 'Kategorijos', ievietot: 'Pridėti', par_mums: 'Apie mus', ieiet: 'Prisijungti', registrēties: 'Registruotis' },
    hero: { title: 'Pirkite ir parduokite visoje Latvijoje', subtitle: 'Tūkstančiai skelbimų iš patikimų pardavėjų. Smart-ID patvirtinta, Escrow apsauga.', search_placeholder: 'Ieškoti skelbimų...', cta_primary: 'Pridėti skelbimą', cta_secondary: 'Naršyti' },
    categories: { title: 'Kategorijos' },
    listings: { title: 'Skelbimai', search_placeholder: 'Ieškoti...', filters: 'Filtrai', category: 'Kategorija', city: 'Miestas', price_from: 'Kaina nuo', price_to: 'Kaina iki', sort_newest: 'Naujausi', sort_price_asc: 'Kaina ↑', sort_price_desc: 'Kaina ↓', results: 'rezultatai', empty_state: 'Skelbimų nerasta', clear_filters: 'Išvalyti filtrus' },
    how_it_works: { title: 'Kaip tai veikia', step1_title: 'Raskite prekę', step1_desc: 'Ieškokite tarp tūkstančių skelbimų pagal kategoriją, kainą ar vietą.', step2_title: 'Susisiekite su pardavėju', step2_desc: 'Saugus bendravimas per platformą — nereikia dalintis telefono numeriu.', step3_title: 'Saugus sandoris', step3_desc: 'Escrow apsauga — pinigai išleidžiami tik gavus prekę.' },
    cta: { title: 'Pasiruošę pradėti?', subtitle: 'Nemokama registracija. Jokių paslėptų mokesčių.', register: 'Registruotis', browse: 'Naršyti skelbimus' },
    auth: { login_title: 'Prisijungti', register_title: 'Registruotis', email: 'El. paštas', password: 'Slaptažodis', confirm_password: 'Patvirtinti slaptažodį', name: 'Vardas', no_account: 'Neturite paskyros?', has_account: 'Jau turite paskyrą?', login_btn: 'Prisijungti', register_btn: 'Registruotis', logging_in: 'Jungiamasi...', registering: 'Registruojamasi...' },
    footer: { navigation: 'Navigacija', account: 'Paskyra', security: 'Saugumas', escrow_desc: 'Escrow apsauga', smart_id_desc: 'Smart-ID patvirtinimas', encrypted_desc: 'Šifruotas bendravimas', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Ieškoti', loading: 'Kraunama...', error: 'Klaida', not_found: 'Nerasta', return_home: 'Grįžti į pradžią' },
  },
  pl: {
    nav: { sludinājumi: 'Ogłoszenia', kategorijas: 'Kategorie', ievietot: 'Dodaj', par_mums: 'O nas', ieiet: 'Zaloguj się', registrēties: 'Zarejestruj się' },
    hero: { title: 'Kupuj i sprzedawaj w całej Łotwie', subtitle: 'Tysiące ogłoszeń od zweryfikowanych sprzedawców. Weryfikacja Smart-ID, ochrona Escrow.', search_placeholder: 'Szukaj ogłoszeń...', cta_primary: 'Dodaj ogłoszenie', cta_secondary: 'Przeglądaj' },
    categories: { title: 'Kategorie' },
    listings: { title: 'Ogłoszenia', search_placeholder: 'Szukaj...', filters: 'Filtry', category: 'Kategoria', city: 'Miasto', price_from: 'Cena od', price_to: 'Cena do', sort_newest: 'Najnowsze', sort_price_asc: 'Cena ↑', sort_price_desc: 'Cena ↓', results: 'wyniki', empty_state: 'Nie znaleziono ogłoszeń', clear_filters: 'Wyczyść filtry' },
    how_it_works: { title: 'Jak to działa', step1_title: 'Znajdź przedmiot', step1_desc: 'Przeszukuj tysiące ogłoszeń według kategorii, ceny lub lokalizacji.', step2_title: 'Skontaktuj się ze sprzedawcą', step2_desc: 'Bezpieczna komunikacja przez platformę — bez podawania numeru telefonu.', step3_title: 'Bezpieczna transakcja', step3_desc: 'Ochrona Escrow — środki są uwalniane dopiero po otrzymaniu przedmiotu.' },
    cta: { title: 'Gotowy, by zacząć?', subtitle: 'Bezpłatna rejestracja. Ukrytych opłat.', register: 'Zarejestruj się', browse: 'Przeglądaj ogłoszenia' },
    auth: { login_title: 'Zaloguj się', register_title: 'Zarejestruj się', email: 'E-mail', password: 'Hasło', confirm_password: 'Potwierdź hasło', name: 'Imię', no_account: 'Nie masz konta?', has_account: 'Masz już konto?', login_btn: 'Zaloguj się', register_btn: 'Zarejestruj się', logging_in: 'Logowanie...', registering: 'Rejestracja...' },
    footer: { navigation: 'Nawigacja', account: 'Konto', security: 'Bezpieczeństwo', escrow_desc: 'Ochrona Escrow', smart_id_desc: 'Weryfikacja Smart-ID', encrypted_desc: 'Szyfrowana komunikacja', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Szukaj', loading: 'Ładowanie...', error: 'Błąd', not_found: 'Nie znaleziono', return_home: 'Wróć do strony głównej' },
  },
  de: {
    nav: { sludinājumi: 'Anzeigen', kategorijas: 'Kategorien', ievietot: 'Anzeige aufgeben', par_mums: 'Über uns', ieiet: 'Anmelden', registrēties: 'Registrieren' },
    hero: { title: 'Kaufen und verkaufen in ganz Lettland', subtitle: 'Tausende Anzeigen von verifizierten Verkäufern. Smart-ID verifiziert, Escrow-Schutz.', search_placeholder: 'Anzeigen suchen...', cta_primary: 'Anzeige aufgeben', cta_secondary: 'Durchsuchen' },
    categories: { title: 'Kategorien' },
    listings: { title: 'Anzeigen', search_placeholder: 'Suchen...', filters: 'Filter', category: 'Kategorie', city: 'Stadt', price_from: 'Preis ab', price_to: 'Preis bis', sort_newest: 'Neueste', sort_price_asc: 'Preis ↑', sort_price_desc: 'Preis ↓', results: 'Ergebnisse', empty_state: 'Keine Anzeigen gefunden', clear_filters: 'Filter löschen' },
    how_it_works: { title: 'So funktioniert es', step1_title: 'Artikel finden', step1_desc: 'Durchsuchen Sie Tausende Anzeigen nach Kategorie, Preis oder Standort.', step2_title: 'Verkäufer kontaktieren', step2_desc: 'Sichere Kommunikation über die Plattform — keine Telefonnummer nötig.', step3_title: 'Sichere Transaktion', step3_desc: 'Escrow-Schutz — Geld wird erst nach Erhalt des Artikels freigegeben.' },
    cta: { title: 'Bereit anzufangen?', subtitle: 'Kostenlose Registrierung. Keine versteckten Gebühren.', register: 'Registrieren', browse: 'Anzeigen durchsuchen' },
    auth: { login_title: 'Anmelden', register_title: 'Registrieren', email: 'E-Mail', password: 'Passwort', confirm_password: 'Passwort bestätigen', name: 'Name', no_account: 'Noch kein Konto?', has_account: 'Bereits ein Konto?', login_btn: 'Anmelden', register_btn: 'Registrieren', logging_in: 'Anmeldung...', registering: 'Registrierung...' },
    footer: { navigation: 'Navigation', account: 'Konto', security: 'Sicherheit', escrow_desc: 'Escrow-Schutz', smart_id_desc: 'Smart-ID Verifizierung', encrypted_desc: 'Verschlüsselte Kommunikation', copyright: '© 2026 SellBuy.lv' },
    common: { search: 'Suchen', loading: 'Laden...', error: 'Fehler', not_found: 'Nicht gefunden', return_home: 'Zurück zur Startseite' },
  },
};
