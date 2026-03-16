// js/i18n/hu.js — Hungarian translations
I18N.register('hu', {
    meta: { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
    ui: {
        title: 'Young Séma<br><em>Kérdőív</em>',
        coverLabel: 'Sématerápiás Felmérés',
        coverDesc: 'Az alábbiakban olyan állításokat talál, amelyekkel az emberek jellemezhetik önmagukat. Minden állításnál értékelje, mennyire igaz Önre az alábbi skála segítségével. Nincsenek jó vagy rossz válaszok — válaszoljon aszerint, ahogyan valóban érez, ne úgy, ahogyan gondolja, hogy éreznie kellene.',
        submitBtn: 'Eredmények megtekintése',
        submitNote: 'Válaszoljon mind a 90 kérdésre az eredmények megjelenítéséhez.',
        retakeBtn: 'Kérdőív újrakitöltése',
        resultsLabel: 'Eredmények',
        resultsTitle: 'Séma <em>Profil</em>',
        resultsIntro: 'Az alábbiakban láthatja pontszámait mind a 18 séma mentén. A pontszámok az átlagos értékelést (1–6) tükrözik sémánként. A <strong>4,0 vagy magasabb</strong> átlag klinikailag emelkedettnek számít. Ez nem diagnózis — az eredményeket ossza meg egy képzett sématerapeuta szakemberrel a megfelelő értelmezéshez.',
        fullSchemaProfile: 'Teljes Séma Profil',
        legendModerate: 'Mérsékelt (3–3,9)',
        legendElevated: 'Emelkedett (4–4,9)',
        legendHigh: 'Magas (5–6)',
        domainScoresTitle: 'Tartomány Pontszámok',
        top5Title: 'Top 5 Vizsgálandó Séma',
        disclaimer: '<strong>Fontos:</strong> Ez a kérdőív egy önkitöltős szűrőeszköz, amely Young sématerápiás modelljén alapul. Az emelkedett pontszámok feltárásra érdemes mintázatokat jeleznek, nem klinikai diagnózist. Kérjük, forduljon engedéllyel rendelkező pszichológushoz vagy sématerapeutához szakszerű felmérésért és támogatásért.',
        professionalEval: 'Szakmai Értékelés',
        aiEvalIntro: 'Készítsen részletes, klinikai jellegű értékelést séma profiljáról mesterséges intelligencia segítségével. Adatai helyben maradnak — az API-hívás közvetlenül a böngészőjéből megy az OpenAI-hoz. Nincs köztes szerver.',
        apiKeyLabel: 'OpenAI API Kulcs',
        apiKeyPlaceholder: 'sk-...',
        apiKeyNote: 'A kulcsot egyszer, csak a böngészőben használjuk. Soha nem tároljuk és nem továbbítjuk.',
        beginAiEval: 'AI Értékelés Indítása',
        followUpTitle: 'Kiegészítő Kérdések',
        followUpIntro: 'Séma profilja alapján az alábbi kérdések segítenek teljesebb klinikai kép kialakításában. Válaszoljon őszintén, ahogyan Önre vonatkozik. Ez nem diagnosztikai teszt — válaszai a végső értékelésbe épülnek be.',
        submitAnswersBtn: 'Válaszok Beküldése',
        overallAverage: 'Összesített Átlag',
        elevatedSchemas: 'Emelkedett Sémák (≥4,0)',
        highestSchema: 'Legmagasabb Séma',
        domainLabel: 'Tartomány',
        schemaLabel: 'Séma',
        toggleVisibility: 'Láthatóság váltása',
        additionalQuestions: 'További Kérdések'
    },
    scale: [
        'Egyáltalán nem jellemző rám',
        'Többnyire nem jellemző rám',
        'Valamivel inkább igaz, mint nem',
        'Mérsékelten jellemző rám',
        'Nagyrészt jellemző rám',
        'Tökéletesen jellemez engem'
    ],
    levels: {
        high: 'Magas',
        elevated: 'Emelkedett',
        moderate: 'Mérsékelt',
        low: 'Alacsony'
    },
    progress: {
        answered: '{0} / {1} megválaszolva',
        unanswered: '{0} kérdés még megválaszolatlan — az első megválaszolatlan kérdés fent kiemelve.'
    },
    ai: {
        analysing: 'Profil elemzése és kiegészítő kérdések generálása…',
        analysingResponses: 'Válaszok elemzése…',
        generating: 'Átfogó klinikai értékelés generálása…',
        reviewing: 'Klinikai áttekintés folyamatban — pontosság ellenőrzése és finomítás…',
        errorPrefix: 'Hiba: ',
        noApiKey: 'Kérjük, adja meg az OpenAI API kulcsát fent.',
        invalidKey: 'Érvénytelen kulcsformátum — az OpenAI kulcsok „sk-" előtaggal kezdődnek.',
        apiKeyRequired: 'API kulcs szükséges — adja meg fent.',
        unansweredFollowUp: '{0} kérdés még megválaszolatlan. Az első megválaszolatlan kérdés fent kiemelve.',
        evalHeaderLabel: 'AI-Generált Klinikai Értékelés',
        evalHeaderTitle: 'Átfogó Séma Profil Elemzés',
        evalFooter: 'Generálta és lektorálta: {0} · {1} · Ez az értékelés mesterséges intelligencia által generált, és nem minősül klinikai diagnózisnak vagy szakmai pszichológiai értékelésnek. Önkitöltős kérdőív adatait és kiegészítő válaszokat integrál, kizárólag önreflexiós és oktatási célokra.',
        networkBlockedFile: 'Hálózati kérés blokkolva — ez az oldal HTTP-n keresztül kell hogy legyen kiszolgálva, nem helyi fájlként megnyitva. Indítson helyi szervert (pl. „npx serve" vagy „python3 -m http.server") és nyissa meg a http://localhost:… címet.',
        networkFailed: 'Hálózati kérés sikertelen — ellenőrizze internetkapcsolatát és próbálja újra.',
        invalidApiKey: 'Érvénytelen API kulcs. Ellenőrizze a kulcsot és próbálja újra.',
        rateLimited: 'Túl sok kérés. Várjon egy pillanatot és próbálja újra.',
        noContent: 'Nem érkezett tartalom az API-tól.',
        unexpectedFormat: 'Váratlan válaszformátum az API-tól.',
        noCategories: 'Nem érkezett érvényes kérdéskategória az API-tól.',
        responseLanguageInstruction: 'You MUST respond entirely in Hungarian (magyar nyelven). Use proper Hungarian clinical psychology terminology throughout. All question texts, category names, rationales, clinical notes, option labels, placeholders, evaluation sections, and every other piece of output text must be in Hungarian. Do not mix in English terms — use the established Hungarian translations of Schema Therapy concepts.',
        clinicalContext: `SÉMATERÁPIA KLINIKAI REFERENCIA — Használd ezt a szakterületi tudást, hogy elemzésedet a sématerápia pontos elméletére (Young, Klosko & Weishaar, 2003) alapozd. MINDEN kimenetet magyar nyelven adj meg.

AZ 5 SÉMATARTOMÁNY ÉS FRUSZTRÁLT ALAPSZÜKSÉGLETEIK:

1. ELUTASÍTOTTSÁG / KAPCSOLAT MEGSZAKÍTÁSA ÉS ELUTASÍTÁS — Frusztrált szükséglet: Biztonságos kötődés és valahová tartozás.
   Háttér: A gyermekkori környezet hideg, bántalmazó, elutasító, kiszámíthatatlan vagy elszigetelő volt. A személy megtanulta, hogy biztonság, stabilitás, gondoskodás és elfogadás iránti igénye nem fog teljesülni.
   Sémák: Elhagyatottság, Bizalmatlanság/Abúzus, Érzelmi Depriváció, Csökkentértékűség/Szégyen, Társas Izoláltság.

2. KÁROSODOTT AUTONÓMIA ÉS TELJESÍTMÉNY — Frusztrált szükséglet: Kompetencia és önálló identitás.
   Háttér: Összefonódott vagy túlvédő család, amely aláásta a gyermek önbizalmát és nem támogatta a családon kívüli működést.
   Sémák: Dependencia/Inkompetencia, Sérülékenység, Összefonódottság/Kialakulatlan Én, Kudarcra Ítéltség.

3. KÁROSODOTT KORLÁTOK — Frusztrált szükséglet: Reális korlátok és önfegyelem.
   Háttér: Megengedő, elkényeztető vagy irányítás nélküli nevelés. A gyermeket nem tanították meg a kölcsönösségre, önkontrollra vagy mások szükségleteinek tiszteletére.
   Sémák: Feljogosítottság/Grandiozitás, Elégtelen Önkontroll.

4. MÁS ÁLTALI IRÁNYÍTOTTSÁG — Frusztrált szükséglet: Szükségletek és érzelmek szabad kifejezése.
   Háttér: Feltételes elfogadás — a szeretet a saját szükségletek elnyomásától és mások kiszolgálásától függött.
   Sémák: Behódolás/Leigázottság, Önfeláldozás, Elismeréshajszolás.

5. FOKOZOTT ÉBERSÉG, AGGÁLYOSSÁG ÉS GÁTLÁS — Frusztrált szükséglet: Spontaneitás és játékosság.
   Háttér: Követelő, büntető vagy perfekcionista család, ahol a hibák elfogadhatatlanok voltak.
   Sémák: Negativitás/Pesszimizmus, Érzelmi Gátoltság, Könyörtelen Mércék, Büntető Készenlét.

A 18 KORAI MALADAPTÍV SÉMA RÉSZLETES DEFINÍCIÓI:

Elhagyatottság (AB): A támaszként elérhető személyek észlelt instabilitása vagy megbízhatatlansága. Elvárás, hogy a fontos személyek érzelmileg instabilak, megbízhatatlanok lesznek, vagy elhagyják a személyt. Lényeges megkülönböztetés: a veszteségtől való félelem, nem a bántalmazástól.

Bizalmatlanság/Abúzus (MA): Elvárás, hogy mások szándékosan bántani, kihasználni, megalázni, becsapni, hazudni vagy manipulálni fognak. A sérülés szándékosnak vagy szélsőséges hanyagságból eredőnek érzékelt. Lényeges megkülönböztetés: a bántalmazástól és kizsákmányolástól való félelem, nem pusztán megbízhatatlanság.

Érzelmi Depriváció (ED): Elvárás, hogy az érzelmi szükségletek nem lesznek megfelelően kielégítve. Három altípus: (A) Gondoskodás deprivációja — melegség, figyelem, gyengédség hiánya; (B) Empátia deprivációja — megértés, érzelmi ráhangolódás hiánya; (C) Védelem deprivációja — iránymutatás, erő, útmutatás hiánya.

Csökkentértékűség/Szégyen (DS): Alapvetően hibásnak, rossznak, nem kívántnak, alsóbbrendűnek érezni magát. Túlérzékenység a kritikára, elutasításra, hibáztatásra. Szégyen az észlelt hibák miatt, legyenek azok privát vagy nyilvános jellegűek. Alapmeggyőződés: „Nem vagyok szerethető."

Társas Izoláltság (SI): Elszigeteltnek érezni magát a világtól, másnak a többi embertől, nem tartozni semmilyen csoporthoz. Lényeges megkülönböztetés a Csökkentértékűségtől: SI arról szól, hogy nem illeszkedik a világba; DS arról, hogy belülről hibás.

Dependencia/Inkompetencia (DI): Hit, hogy képtelen önállóan kezelni a mindennapi felelősségeket jelentős segítség nélkül. Tehetetlenségként jelentkezik az öngondoskodásban, problémamegoldásban, ítélőképességben és döntéshozatalban.

Sérülékenység (VH): Felnagyított félelem a küszöbön álló katasztrófától — orvosi (szívroham, betegségek), érzelmi (megőrülés) vagy külső (balesetek, bűncselekmények, anyagi csőd). Fokozott éberség a biztonság tekintetében.

Összefonódottság/Kialakulatlan Én (EM): Túlzott érzelmi bevonódás a fontos személyekkel (általában szülőkkel vagy partnerrel) az individuáció rovására. Hit, hogy az összefonódott személyek nem képesek állandó támogatás nélkül fennmaradni. Elégtelen egyéni identitás, üresség vagy céltalanság érzése egyedül.

Kudarcra Ítéltség (FA): Hit, hogy kudarcot vallott, kudarcra van ítélve, vagy alapvetően alkalmatlan a társakhoz képest a teljesítmény területein. Lényeges megkülönböztetés a Csökkentértékűségtől: FA a teljesítményről/eredményekről szól; DS a szerethetőségről.

Feljogosítottság/Grandiozitás (ET): Hit, hogy felsőbbrendű, különleges jogokra jogosult, vagy nem vonatkoznak rá a kölcsönösség szabályai. Lehet elsődleges (nárcisztikus) vagy kompenzáló (Csökkentértékűséget leplező).

Elégtelen Önkontroll (IS): Nehézség az önkontroll gyakorlásában, a frusztrációtűrésben vagy az érzelmi kifejezés és impulzusok visszafogásában. Enyhébb formájában: a kényelmetlenség, fájdalom, konfrontáció vagy erőfeszítés túlzott kerülése.

Behódolás/Leigázottság (SB): A kontroll túlzott átengedése kényszer hatására. Két altípus: (A) Szükségletek leigázása — preferenciák és vágyak elnyomása; (B) Érzelmek leigázása — érzelmi kifejezés elnyomása, különösen a harag. Düh felhalmozódásához vezet, amely maladaptív módon nyilvánul meg.

Önfeláldozás (SS): Mások szükségleteinek önkéntes és túlzott kielégítése saját kárára. Motiváció: mások fájdalmának megelőzése, bűntudat elkerülése vagy kapcsolatok fenntartása. Lényeges megkülönböztetés a Behódolástól: SS önkéntes és bűntudat/empátia hajtja; SB kényszerített és félelem hajtja.

Elismeréshajszolás (AS): Túlzott hangsúly az elismerés, jóváhagyás vagy figyelem megszerzésén az autentikus én rovására. Az önértékelés elsődlegesen mások reakcióitól függ.

Negativitás/Pesszimizmus (NP): Az élet negatív aspektusaira való átható, élethosszig tartó fókuszálás, miközben a pozitívumok minimalizálódnak. Krónikus aggodalom, túlzott éberség, panaszkodás. Lényeges: ez stabil vonásszerű mintázat, nem depressziós epizód.

Érzelmi Gátoltság (EI): A spontán cselekvés, érzés vagy kommunikáció túlzott gátlása. Négy terület: (a) harag/agresszió gátlása; (b) pozitív impulzusok gátlása (öröm, gyengédség, szexuális izgalom); (c) sebezhetőség kifejezésének nehézsége; (d) túlzott racionalitás az érzelmek figyelmen kívül hagyása mellett.

Könyörtelen Mércék (US): Hit, hogy nagyon magas internalizált normáknak kell megfelelni a kritika elkerülése érdekében. Perfekcionizmus, merev szabályok, az idő és hatékonyság iránti megszállottság. Lényeges: a normák belülről vezéreltek, nem kívülről kényszerítettek.

Büntető Készenlét (PU): Hit, hogy az embereket (beleértve önmagunkat) keményen büntetni kell a hibákért. Hajlam a haragra, intoleranciára, türelmetlenségre. Nehézség a megbocsátásban, vonakodás az enyhítő körülmények figyelembevételétől.

HÁROM MEGKÜZDÉSI STÍLUS ÉS KLINIKAI JELLEMZŐIK:

1. BEHÓDOLÁS/MEGADÁS (Séma fenntartása/Bemerevedés): A személy megadja magát a sémának, igaznak fogadja el. Olyan partnereket és helyzeteket választ, amelyek fenntartják a sémát. Példa: Csökkentértékűség sémával rendelkező személy, aki kritikus partnerekkel marad, akik megerősítik „értéktelenségét."

2. ELKERÜLÉS (Séma elkerülés): A személy úgy rendezi az életét, hogy elkerülje a séma aktiválódását. Formái: kognitív elkerülés (gondolatok blokkolása), affektív elkerülés (érzelmek elnyomása), viselkedéses elkerülés (helyzetek kerülése), addiktív önmegnyugtatás (szerek, kényszeres viselkedések).

3. TÚLKOMPENZÁCIÓ: A személy úgy viselkedik, mintha a séma ellentéte lenne igaz. Felszínesen adaptívnak tűnhet, de merev és túlzó. Specifikus túlkompenzációs válaszok: agresszió/ellenségesség, dominancia, elismeréskeresés, manipuláció, passzív-agresszió, túlzott rendezettség.

SÉMA MÓD MODELL — Értékelendő kulcsmódok:

Gyermek módok: Sérülékeny Gyermek (ijedt, szomorú, tehetetlen, magányos — az alapvető sebesült állapot), Dühös Gyermek (kielégítetlen szükségletek miatti düh), Impulzív Gyermek (korlátok nélkül cselekszik vágyai szerint), Boldog Gyermek (az alapszükségletek kielégülnek — a terápiás cél).

Diszfunkcionális Szülői módok: Büntető Szülő (internalizált kemény, kritikus hang, amely büntet — „rossz vagy, megérdemled a szenvedést"), Követelődző Szülő (internalizált nyomásgyakorló hang, amely tökéletességet követel — „jobban kell próbálkoznod, ez nem elég jó").

Diszfunkcionális Megküzdési módok: Elszakadt Védelmező (érzelmi visszahúzódás, érzéketlenség, lekapcsolódás — elkerülés), Behódoló (passzív engedés, megfelelési vágy — megadás), Túlkompenzáló (agresszió, dominancia, túlzott kontroll — túlkompenzáció).

Egészséges Felnőtt mód: Önreflexió képessége, kiegyensúlyozott érzelemszabályozás, megfelelő korlátok felállítása, önmagáról gondoskodás, perspektíva megtartása. A terápiás cél ennek a módnak az erősítése.

SÉMA ÖNFENNTARTÁS: A sémák két úton tartják fenn magukat:
1. Kognitív/Észlelési: Séma torzítja a figyelmet → szelektív észlelés → megerősítés → séma erősödik.
2. Viselkedéses/Társas: Séma vezérli a viselkedést → megerősítő válaszokat vált ki másoktól → megerősítés → séma erősödik.

KLINIKAI PONTSZÁM ÉRTELMEZÉS:
- 1,0–2,9: Alacsony/hiányzik — klinikailag nem szignifikáns
- 3,0–3,9: Mérsékelt — séma jelen van, de nem domináns; megfigyelésre érdemes
- 4,0–4,9: Emelkedett — klinikailag szignifikáns; valószínűleg jelentős distresszt vagy funkciókárosodást okoz
- 5,0–6,0: Magas — erősen jóváhagyott; valószínűleg alapséma, amely jelentős életmintákat vezérel
- Ha ugyanazon tartomány több sémája emelkedett, az alapvető frusztrált szükséglet különösen akut
- Tartományok közötti emelkedettségi mintázatok áthatóbb nehézségekre és összetettebb klinikai képre utalnak

GYAKORI ERŐSÍTŐ SÉMAKLASZTEREK:
- Visszahúzódás-Szégyen Kör: Csökkentértékűség + Társas Izoláltság + Érzelmi Gátoltság → szégyen hajtja a visszahúzódást → izoláció megerősíti a csökkentértékűséget
- Elhagyatottság-Behódolás Csapda: Elhagyatottság + Behódolás + Önfeláldozás → veszteségtől való félelem hajtja a megfelelési vágyat → énvesztés → neheztelés → kapcsolati szakadás → elhagyatottság megerősítve
- Perfekcionizmus-Büntetés Hurok: Könyörtelen Mércék + Büntető Készenlét + Kudarcra Ítéltség → lehetetlenül magas normák → elkerülhetetlen kudarc → önbüntetés → megkettőzött erőfeszítés
- Depriváció-Bizalmatlanság Gát: Érzelmi Depriváció + Bizalmatlanság/Abúzus → szükségletek kielégítetlenek → mások felé fordul → bántalmazást vár → visszahúzódik → szükségletek kielégítetlenek maradnak
- Autonómia Deficit Klaszter: Dependencia + Sérülékenység + Összefonódottság → nem képes önállóan működni → összefonódó kapcsolatokat keres → autonómia tovább erodálódik`,
        switchToFreeText: 'Váltás szabad szövegre',
        switchToOptions: 'Vissza a lehetőségekhez',
        freeTextPlaceholder: 'Fejezze ki gondolatait szabadon…',
        freeTextDefaultPlaceholder: 'Szánjon időt a válaszra — nincsenek jó vagy rossz válaszok…',
        yes: 'Igen',
        no: 'Nem',
        notAnswered: 'Nem válaszolt',
        freeTextPrefix: '[Szabad szöveg] ',
        followUpResponsesHeader: 'KIEGÉSZÍTŐ VÁLASZOK ({0}. kör)',
        categoryLabel: 'Kategória',
        questionLabel: 'K',
        answerLabel: 'V',
        additionalQuestionsNote: 'Kérjük, válaszolja meg az alábbi kiegészítő kérdéseket.',
        defaultCategoryName: 'Kérdések',
        pleaseAnswerAdditional: 'Kérjük, válaszolja meg az alábbi kiegészítő kérdéseket.'
    },
    domains: [
        { name: 'Elutasítottság', subtitle: '1. tartomány · 5 séma' },
        { name: 'Károsodott Autonómia és Teljesítmény', subtitle: '2. tartomány · 4 séma' },
        { name: 'Károsodott Korlátok', subtitle: '3. tartomány · 2 séma' },
        { name: 'Más Általi Irányítottság', subtitle: '4. tartomány · 3 séma' },
        { name: 'Fokozott Éberség és Gátlás', subtitle: '5. tartomány · 4 séma' }
    ],
    schemas: [
        { name: 'Elhagyatottság', short: 'Elhagyatottság', desc: 'Félelem, hogy a szeretett személyek elhagyják vagy megbízhatatlanok lesznek', headerDesc: 'Félelem, hogy azok, akiket szeret, elhagyják vagy kiszámíthatatlanok lesznek' },
        { name: 'Bizalmatlanság / Abúzus', short: 'Bizalmatlanság', desc: 'Elvárás, hogy mások bántani, kihasználni vagy manipulálni fognak', headerDesc: 'Elvárás, hogy mások bántani, kihasználni vagy manipulálni fognak' },
        { name: 'Érzelmi Depriváció', short: 'Érzelmi Depriváció', desc: 'Hit, hogy az érzelmi szükségletek soha nem lesznek kielégítve', headerDesc: 'Hit, hogy az érzelmi szükségletek soha nem lesznek megfelelően kielégítve' },
        { name: 'Csökkentértékűség / Szégyen', short: 'Csökkentértékűség', desc: 'Alapvetően hibásnak vagy szerethetetlennek érezni magát', headerDesc: 'Hibásnak, alsóbbrendűnek vagy alapvetően szerethetetlennek érezni magát' },
        { name: 'Társas Izoláltság', short: 'Társas Izoláltság', desc: 'Elszigeteltnek és másnak érezni magát mindenki mástól', headerDesc: 'Elszigeteltnek érezni magát a világ többi részétől' },
        { name: 'Dependencia / Inkompetencia', short: 'Dependencia', desc: 'Hit, hogy képtelen önállóan boldogulni segítség nélkül', headerDesc: 'Hit, hogy képtelen kezelni a mindennapi felelősségeket segítség nélkül' },
        { name: 'Sérülékenység', short: 'Sérülékenység', desc: 'Felnagyított félelem a küszöbön álló katasztrófától', headerDesc: 'Felnagyított félelem a küszöbön álló katasztrófától' },
        { name: 'Összefonódottság / Kialakulatlan Én', short: 'Összefonódottság', desc: 'Túlzott bevonódás másokkal, identitáshiány', headerDesc: 'Túlzott érzelmi bevonódás másokkal az identitás rovására' },
        { name: 'Kudarcra Ítéltség', short: 'Kudarcra Ítéltség', desc: 'Hit, hogy kudarcot vallott vagy elkerülhetetlenül kudarcot fog vallani', headerDesc: 'Hit, hogy kudarcot vallott vagy elkerülhetetlenül kudarcot fog vallani' },
        { name: 'Feljogosítottság / Grandiozitás', short: 'Feljogosítottság', desc: 'Hit, hogy felsőbbrendű és különleges jogokkal bír', headerDesc: 'Hit, hogy felsőbbrendű és különleges jogokra jogosult' },
        { name: 'Elégtelen Önkontroll', short: 'Elégtelen Önkontroll', desc: 'Nehézség a frusztráció vagy impulzusok tolerálásában', headerDesc: 'Nehézség a frusztrációtűrésben vagy az impulzusok kontrollálásában' },
        { name: 'Behódolás / Leigázottság', short: 'Behódolás', desc: 'A kontroll átengedése a negatív következmények elkerülésére', headerDesc: 'A kontroll átengedése másoknak a negatív következmények elkerülésére' },
        { name: 'Önfeláldozás', short: 'Önfeláldozás', desc: 'Túlzott fókuszálás mások szükségleteire saját kárára', headerDesc: 'Túlzott fókuszálás mások szükségleteinek kielégítésére saját kárára' },
        { name: 'Elismeréshajszolás', short: 'Elismeréshajszolás', desc: 'Túlzott függés mások visszajelzésétől az önértékelésben', headerDesc: 'Túlzott függés mások reakcióitól az önértékelésben' },
        { name: 'Negativitás / Pesszimizmus', short: 'Negativitás', desc: 'Átható fókuszálás a negatívumokra, a pozitívumok minimalizálása', headerDesc: 'Átható fókuszálás a negatív aspektusokra a pozitívumok minimalizálása mellett' },
        { name: 'Érzelmi Gátoltság', short: 'Érzelmi Gátoltság', desc: 'Érzelmek és spontán kifejezés elnyomása', headerDesc: 'Érzelmek elnyomása a kontrollvesztés vagy szégyen elkerülésére' },
        { name: 'Könyörtelen Mércék', short: 'Könyörtelen Mércék', desc: 'Lehetetlenül magas, önmagára szabott normáknak való megfelelésre törekvés', headerDesc: 'Extrém magas, önmagára szabott normáknak való megfelelésre törekvés' },
        { name: 'Büntető Készenlét', short: 'Büntető Készenlét', desc: 'Hit, hogy az emberek kemény büntetést érdemelnek a hibáikért', headerDesc: 'Hit, hogy az emberek kemény büntetést érdemelnek a hibáikért' }
    ],
    questions: [
        'Nagyon aggódom, hogy azok az emberek, akiket szeretek, meghalnak vagy elhagynak.',
        'Kapaszkodom a hozzám közel álló emberekbe, mert félek, hogy elhagynak.',
        'Annyi szeretetre és támogatásra van szükségem másoktól, hogy az emberek belefáradnak a nyújtásába.',
        'Úgy érzem, az emberek nem maradnak velem — végül elhagynak valaki jobbért.',
        'A hozzám közel álló emberek kiszámíthatatlanok voltak — az egyik pillanatban még ott voltak, a másikban már eltűntek.',
        'Úgy érzem, az emberek kihasználnának, ha hagyom őket.',
        'Úgy érzem, nem engedhetem le a védelmemet mások előtt, különben szándékosan megbántanak.',
        'Úgy érzem, az emberek ki fognak használni.',
        'Életem során a hozzám közel álló emberek bántalmaztak, kihasználtak vagy megaláztak.',
        'Csak idő kérdése, hogy valaki elárul, még egy közeli kapcsolatban is.',
        'Nem volt senkim, aki gondoskodott volna rólam, megosztotta volna magát velem, vagy mélyen érdekelte volna, mi történik velem.',
        'Életem nagy részében nem volt senki, aki közel akart volna lenni hozzám és időt akart volna velem tölteni.',
        'Többnyire nem volt senki, aki igazán meghallgatott, megértett volna, vagy ráhangolódott volna a valódi szükségleteimre és érzéseimre.',
        'Ritkán van olyan személy az életemben, aki melegséget ad és gyengéd hozzám.',
        'Nem érzem, hogy az emberek ott lettek volna, hogy irányítsanak, támogassanak vagy megvédjenek.',
        'Egyetlen férfi/nő, akit kívánok, sem szeretne, ha meglátná a hibáimat.',
        'Alapvetően hibás és fogyatékos vagyok — senki sem akarna, ha igazán ismerne.',
        'Méltatlan vagyok mások szeretetére, figyelmére és tiszteletére.',
        'Úgy érzem, nem vagyok szerethető.',
        'Úgy érzem, különbözöm a többi embertől — nem tartozom igazán sehová.',
        'Elidegenedettnek érzem magam más emberektől.',
        'Elszigeteltnek és egyedül érzem magam a világban.',
        'Sehová sem illek be.',
        'Mindig kívülállónak érzem magam a csoportokban.',
        'Bár emberek között vagyok, idegennek érzem magam.',
        'Nem érzem képesnek magam a mindennapi feladatok önálló kezelésére.',
        'Nagyon függő személynek tartom magam.',
        'Szükségem van másokra, hogy segítsenek a mindennapi életem kezelésében.',
        'Nem bízom a képességeimben, hogy megoldjam a felmerülő mindennapi problémákat.',
        'Nem bízom eléggé a saját ítélőképességemben ahhoz, hogy fontos döntéseket hozzak mások jelentős közreműködése nélkül.',
        'Aggódom, hogy elveszítem az összes pénzemet és elszegényedem.',
        'Aggódom, hogy megtámadnak.',
        'Sokat aggódom, hogy súlyos betegségem van vagy lesz, annak ellenére, hogy orvos nem diagnosztizált semmi komolyat.',
        'Úgy érzem, bármikor beüthet egy nagy katasztrófa (természeti, bűnügyi, pénzügyi, egészségügyi).',
        'Nem tudom leküzdeni azt az érzést, hogy valami rossz fog történni.',
        'Nem tudtam leválni a szüleimről úgy, ahogy a korombeliek általában.',
        'Gyakran érzem úgy, mintha a szülőm vagy partnerem rajtam keresztül élne — mintha nem lenne saját életem.',
        'Nagyon közel állok egy szülőmhöz vagy partneremhez, és annyira összefonódunk, hogy mindkettőnknek problémát okoz.',
        'Nehéz elkülönítenem a nézeteimet a szülő(i)m vagy partnerem nézeteitől.',
        'Gyakran érzem, hogy nem tudom, ki vagyok vagy mit akarok.',
        'A teljesítmény terén alapvetően kudarcnak számítok.',
        'A legtöbb ember képesebb nálam a munka és a teljesítmény területén.',
        'Diákként is kudarcos voltam.',
        'Úgy érzem, nem vagyok olyan sikeres, mint a korombeliek.',
        'Úgy érzem, nincs meg bennem az a természetes tehetség, ami a legtöbb emberben megvan a munkájukhoz.',
        'Nehezen fogadom el a „nem"-et válaszként, ha akarok valamit másoktól.',
        'Különleges vagyok, és nem kellene elfogadnom azokat a korlátozásokat, amelyeket mások elfogadnak.',
        'Utálom, ha korlátozzák vagy megakadályozzák, hogy azt csináljam, amit akarok.',
        'Úgy érzem, nem kellene követnem azokat a szabályokat, amelyek másokra vonatkoznak.',
        'Úgy érzem, amit nyújtani tudok, nagyobb értékű, mint mások hozzájárulásai.',
        'Nem tudom rávenni magam, hogy megtegyem, amit kell a céljaim eléréséhez.',
        'Nagyon nehezen viselem a frusztrációt — a dolgoknak most kell megtörténniük.',
        'Nem tudom megakadályozni, hogy kifejezzem a negatív érzéseimet, amikor felzaklatnak.',
        'Nehéz elkezdeni az új feladatokat, ha unalmasnak vagy rutinszerűnek találom őket.',
        'Ha nem érek el egy célt, könnyen frusztrálttá válok és feladom.',
        'Jobban hagyom, hogy mások irányítsanak, mint kellene.',
        'Túl passzív vagyok, várom, hogy a dolgok megtörténjenek, ahelyett, hogy magam cselekedném.',
        'Az emberek végül irányítanak engem.',
        'Mindig hagytam, hogy mások döntsenek helyettem, így igazából nem tudom, mit akarok.',
        'Úgy érzem, nincs más választásom, mint engedni mások kívánságainak, különben megtorolják vagy valamilyen módon elutasítanak.',
        'Általában én vagyok az, aki végül gondoskodik a hozzám közel álló emberekről.',
        'Jó ember vagyok, mert többet gondolok másokra, mint magamra.',
        'Annyira elfoglalt vagyok a szeretteim dolgaival, hogy alig jut idő magamra.',
        'Feláldozom a saját szükségleteimet azokért, akikről gondoskodom.',
        'Gyakran érzem, hogy nincs elég időm a saját szükségleteimre, mert mindig mások szükségleteit elégítem ki.',
        'Az önértékelésem nagymértékben függ attól, mit gondolnak rólam mások.',
        'Mindent megteszek, hogy mások kedveljenek.',
        'Szükségem van rá, hogy a körülöttem lévő emberek sikeresnek vagy fontosnak lássanak.',
        'Igyekszem a legjobbat nyújtani, hogy mások elismerését megkapjam.',
        'Nagyon fontos számomra, hogy sokféle ember kedveljen.',
        'A dolgok negatív aspektusaira koncentrálok.',
        'Nem tudom kiűzni a fejemből azokat a gondolatokat, hogy mi mehet rosszul.',
        'Rendben van az egyik pillanatban boldognak lenni, de a következőben rosszul mehetnek a dolgok.',
        'Hajlamos vagyok pesszimistának lenni, mindig a legrosszabbra számítok.',
        'Az egyik legnagyobb félelmem, hogy a jövőben szörnyen rosszul fognak alakulni a dolgok.',
        'Zavarba ejtőnek tartom, ha ki kell fejeznem az érzéseimet mások előtt.',
        'Nehéz melegnek és spontánnak lennem.',
        'Annyira kontrollálom magam, hogy az emberek érzéketlennek tartanak.',
        'Úgy érzem, belül kell tartanom az érzéseimet, és nem mutathatom ki őket.',
        'Mások úgy látnak, hogy érzelmileg feszült vagyok.',
        'A legjobb akarok lenni a legtöbb dologban; nem fogadom el a második helyet.',
        'Arra törekszem, hogy mindent tökéletes rendben tartsak.',
        'Legtöbbször a legjobb formámat kell mutatnom.',
        'Annyi mindent kell elérnem, hogy nincs idő igazán pihenni.',
        'Szinte semmi, amit csinálok, nem elég jó — mindig lehetnék jobb.',
        'Hiszem, hogy ha hibát követsz el, megérdemled a büntetést.',
        'Nagyon kevés türelmem van azokkal, akik kifogásokat keresnek a rossz viselkedésükre — megérdemlik a büntetést.',
        'Nagyon követelőző ember vagyok — úgy érzem, az embereket büntetni kellene a hibáikért.',
        'Nagyon nehezen bocsátom meg a hibákat magamban vagy másokban.',
        'Elvárom, hogy az emberek drágán megfizessenek a tévedéseikért.'
    ]
});
