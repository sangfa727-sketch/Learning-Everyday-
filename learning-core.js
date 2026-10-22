import { DICTIONARY } from "./dictionary.js";

export { DICTIONARY };

export function normalizeWord(value) {
  return String(value ?? "")
    .toLocaleLowerCase("en")
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-z'-]+|[^a-z'-]+$/g, "");
}

const IRREGULAR_WORD_BASES = Object.freeze({
  am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
  went: "go", gone: "go", goes: "go", going: "go", came: "come", woke: "wake", grown: "grow", risen: "rise", lives: "life",
  saw: "see", seen: "see",
  took: "take", taken: "take",
  gave: "give", given: "give",
  got: "get", gotten: "get",
  brought: "bring", bought: "buy",
  thought: "think", caught: "catch",
  found: "find", told: "tell", said: "say",
  ran: "run", sat: "sit", fell: "fall", stood: "stand", felt: "feel",
  knew: "know", known: "know", understood: "understand",
  wrote: "write", written: "write",
  ate: "eat", eaten: "eat",
  drank: "drink", drunk: "drink",
  spoke: "speak", spoken: "speak",
  broke: "break", broken: "break",
  chose: "choose", chosen: "choose",
  kept: "keep", slept: "sleep", forgot: "forget", forgotten: "forget",
  held: "hold", heard: "hear",
  lost: "lose", won: "win",
  sent: "send", spent: "spend",
  built: "build", met: "meet",
  made: "make", did: "do", done: "do",
  had: "have", has: "have",
  children: "child", men: "man", women: "woman",
  feet: "foot", teeth: "tooth", mice: "mouse",
  worn: "wear", rang: "ring", rung: "ring", began: "begin", shelves: "shelf",
  safer: "safe", taller: "tall", lighter: "light", easier: "easy",
  hurried: "hurry", recognised: "recognise",
});

export function lookupWord(value, dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  if (!word) return null;
  if (Object.prototype.hasOwnProperty.call(dictionary, word)) return dictionary[word];
  // Curly/straight possessives should remain tappable as a whole word and reuse
  // the noun/name entry instead of producing an untranslated token.
  if (word.endsWith("'s")) {
    const possessiveBase = word.slice(0, -2);
    if (Object.prototype.hasOwnProperty.call(dictionary, possessiveBase)) return dictionary[possessiveBase];
  }
  const irregularBase = IRREGULAR_WORD_BASES[word];
  if (irregularBase && Object.prototype.hasOwnProperty.call(dictionary, irregularBase)) return dictionary[irregularBase];

  // Small, deterministic morphology fallback for common English inflections.
  // Keep it conservative: only return a definition when a candidate exists locally.
  const candidates = [];
  if (word.endsWith("ies") && word.length > 4) candidates.push(word.slice(0, -3) + "y");
  if (word.endsWith("es") && word.length > 4) candidates.push(word.slice(0, -2), word.slice(0, -1));
  if (word.endsWith("s") && word.length > 3) candidates.push(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  if (word.endsWith("ed") && word.length > 4) {
    const stem = word.slice(0, -2);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(dictionary, candidate)) return dictionary[candidate];
  }
  return null;
}


const CONTEXTUAL_SENSES = Object.freeze({
  rose: [
    { test: /\b(ms|mr|mrs|miss|teacher|class)\s+rose\b/i, meaning: "Rose, a person's name", my: "ရို့စ် (လူအမည်)" },
    { test: /\b(river|water|level|flood|sun|temperature|price|number|smoke|mist|voice|hand|head|from .*seat|early)\b/i, meaning: "past tense of rise; moved upward or increased", my: "မြင့်တက်လာခဲ့သည်၊ မြင့်တက်ခဲ့သည်" },
    { test: /\b(garden|flower|petal|stem|bloom|red|pink|thorn|plant|bouquet|vase)\b/i, meaning: "a rose, a kind of flowering plant", my: "နှင်းဆီပန်း" }
  ],
  lives: [
    { test: /\b(life|people's|many people's|our|their|his|her|different)\s+lives\b/i, meaning: "plural of life", my: "ဘဝများ၊ အသက်တာများ" },
    { test: /\b(near|in|at|with|she|he|it|who|that|there)\b/i, meaning: "verb: is alive or resides", my: "အသက်ရှင်နေသည်၊ နေထိုင်သည်" }
  ],
  saw: [
    { test: /\b(carpenter|wood|cut|tool|blade|workshop|repair)\b/i, meaning: "a tool used for cutting wood or other material", my: "လွှ" },
    { test: /\b(they|we|i|she|he|maya|nora|lina|students|people)\s+saw\b/i, meaning: "past tense of see; noticed or witnessed", my: "မြင်တွေ့ခဲ့သည်၊ တွေ့မြင်ခဲ့သည်" }
  ],
  found: [
    { test: /\b(founded|foundation|established|set up)\b/i, meaning: "established or set up", my: "တည်ထောင်ခဲ့သည်" },
    { test: /\b(found|discovered|located|puppy|evidence|enough|money|item|place)\b/i, meaning: "past tense of find; discovered or located", my: "တွေ့ရှိခဲ့သည်၊ ရှာတွေ့ခဲ့သည်" }
  ],
  means: [
    { test: /\b(a means|useful means|by means|means of|method|way|transport)\b/i, meaning: "a method or way of doing something", my: "နည်းလမ်း၊ အကြောင်းနည်းလမ်း" },
    { test: /\b(means|mean|means that|means asking|means making|means doing)\b/i, meaning: "indicates or expresses an idea; involves", my: "ဆိုလိုသည်၊ ပါဝင်သည်" }
  ],
  well: [
    { test: /\bwell[- ]intentioned\b/i, meaning: "having good intentions", my: "ရည်ရွယ်ချက်ကောင်းရှိသော" },
    { test: /\b(water|village|deep|dug|hole|bucket|drawn from)\b/i, meaning: "a deep hole from which water is obtained", my: "ရေတွင်း" },
    { test: /\b(healthy|sick|ill|feel|looks|doing|worked|spoke|performed|together)\b/i, meaning: "in a good or satisfactory way; healthy", my: "ကောင်းစွာ၊ ကျန်းမာသော" }
  ],
  looking: [
    { test: /\blooking back(?: on\b|,\s*(?:i|we|they|she|he)\b)/i, meaning: "reflecting on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်ခြင်း" },
    { test: /\blooking back at\b/i, meaning: "turning one's eyes toward something behind", my: "နောက်ဘက်သို့ လှည့်ကြည့်ခြင်း" }
  ],
  looked: [
    { test: /\blooked back on\b/i, meaning: "reflected on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်ခဲ့သည်" },
    { test: /\blooked back at\b/i, meaning: "turned one's eyes toward something behind", my: "နောက်ဘက်သို့ လှည့်ကြည့်ခဲ့သည်" }
  ],
  back: [
    { test: /\bback at (school|home|work|the office)\b/i, meaning: "returned to a place", my: "ပြန်လည်ရောက်ရှိသောအခါ" },
    { test: /\bon (its|his|her|their) back\b/i, meaning: "the rear side of a body or object", my: "နောက်ကျောဘက်တွင်" },
    { test: /\b(looking back(?: on\b|,\s*(?:i|we|they|she|he)\b)|look back on|thinking back)\b/i, meaning: "to think about or reflect on the past", my: "အတိတ်ကို ပြန်လည်စဉ်းစားကြည့်သည်" },
    { test: /\b(turned back|turn back|look back at|looked back at|looking back at|looked back toward|behind|back door|back of)\b/i, meaning: "the rear part; toward the rear", my: "နောက်ဘက်၊ နောက်သို့" }
  ],
  light: [
    { test: /\blight (shower|rain|rainfall)\b/i, meaning: "small in amount or intensity", my: "မိုးဖွဲဖွဲ၊ မိုးနည်းနည်း" },
    { test: /\b(heavy|carry|weight|bag|basket|box)\b/i, meaning: "not heavy", my: "ပေါ့ပါးသော" },
    { test: /\b(sun|lamp|bright|dark|see|shine|torch)\b/i, meaning: "brightness that makes things visible", my: "အလင်းရောင်" }
  ],
  close: [
    { test: /\b(door|gate|window|shut|open|lid|book)\b/i, meaning: "to shut or cover an opening", my: "ပိတ်သည်" },
    { test: /\b(near|distance|nearby|house|school|shop|friend|river|water|walkway|doorway|riverbank)\b/i, meaning: "near in distance or relationship", my: "နီးသော၊ ရင်းနှီးသော" }
  ],
  change: [
    { test: /\b(returned|coins|money|cash|pay|price)\b/i, meaning: "money returned after paying more than the cost", my: "ပြန်အမ်းငွေ" },
    { test: /\b(change|routine|plan|weather|become|different|decide|changed)\b/i, meaning: "to make or become different", my: "ပြောင်းလဲသည်၊ ပြောင်းလဲမှု" }
  ],
  present: [
    { test: /\b(present|presented|presenting)\b.{0,100}\b(findings|results|report|information|proposal|map|idea)\b/i, meaning: "to show or explain information to others", my: "တင်ပြသည်" },
    { test: /\b(gift|birthday|wrapped|gave|receive|Christmas)\b/i, meaning: "a gift", my: "လက်ဆောင်" },
    { test: /\b(adult|teacher|parent|someone)\s+present\b|\bwith .* present\b/i, meaning: "being there at a particular time", my: "ရှိနေသော၊ ရောက်ရှိနေသော" },
    { test: /\b(attend|in the room|being|there|at school|currently)\b/i, meaning: "being in a place; existing now", my: "ရှိနေသော၊ လက်ရှိ" }
  ],
  kind: [
    { test: /\b(?:kind|kinds)\s+of\b|\bwhat kind\b|\bthis kind\b|\bthat kind\b/i, meaning: "a type or sort of something", my: "အမျိုးအစား" },
    { test: /\bkind\s+(?:to|person|words|gesture|act|helpful)\b|\bwas kind\b/i, meaning: "caring, friendly, and considerate", my: "ကြင်နာသော၊ သဘောကောင်းသော" }
  ],
  left: [
    { test: /\b(?:to|on|at|the)\s+left\b|\bleft (?:hand|side)\b|\bturn(?:ed)? left\b/i, meaning: "the side opposite right", my: "ဘယ်ဘက်" },
    { test: /\bleft\b/i, meaning: "past tense of leave; kept something in a place or went away", my: "ချန်ထားခဲ့သည်၊ ထွက်ခွာခဲ့သည်" }
  ],
  mean: [
    { test: /\b(?:did not|does not|do not|doesn't|don't|not)\s+mean\b|\bmean(?:s|t)?\s+(?:that|being|to|something|the|an|a)\b/i, meaning: "to signify or express an idea", my: "ဆိုလိုသည်၊ ဖော်ပြသည်" }
  ],
  like: [
    { test: /\blike\s+(?:a|an|the|natural|tiny|something|it|this|that)\b/i, meaning: "similar to; used to compare things", my: "ကဲ့သို့၊ နှင့်ဆင်တူသော" },
    { test: /\b(?:would|really|do|does|did|don't|doesn't)\s+like\b/i, meaning: "to enjoy or prefer something", my: "နှစ်သက်သည်၊ သဘောကျသည်" }
  ],
  still: [
    { test: /\bstill\s+(?:room|space|enough|time|available|standing|open)\b/i, meaning: "remaining or continuing to be present", my: "ကျန်ရှိနေသေးသော၊ ရှိနေဆဲ" },
    { test: /\bstill\s+(?:could not|cannot|can't|did not|does not|needed|needs|had|was|were|is|are|stands|stood|remains|remained)\b/i, meaning: "continuing up to that time", my: "ယခုထိ၊ ဆက်လက်၍" }
  ],
  bank: [
    { test: /\b(bank account|bank branch|deposit|withdraw|loan|cash|financial)\b/i, meaning: "a financial institution", my: "ဘဏ်" },
    { test: /\b(river|water|shore|flood|stone near the bank|near the bank|riverbank|river bank)\b/i, meaning: "the land alongside a river", my: "မြစ်ကမ်းပါး" }
  ],
  current: [
    { test: /\b(?:river|water|stream)\s+current\b|\bcurrent (?:was|is|became|grew|too strong|strong)\b/i, meaning: "the flow of water in a river or stream", my: "ရေစီးကြောင်း၊ ရေစီးအား" },
    { test: /\bcurrent (?:river|water|level|conditions|status|plan|year|information)\b/i, meaning: "happening or existing now", my: "လက်ရှိဖြစ်နေသော" }
  ],
  level: [
    { test: /\b(?:river|water|flood|gauge|measurements?|rise|rose|rising)\b/i, meaning: "the height or amount of water", my: "ရေအမြင့်၊ ရေပမာဏ" }
  ],
  matter: [
    { test: /\b(?:open area|area|place|safety|evidence|observation|community)\b.*\b(?:matter|matters|mattered)\b|\b(?:matter|matters|mattered)\b.*\b(?:important|difference|effect)\b/i, meaning: "to be important or have an effect", my: "အရေးပါသည်၊ အရေးပါခဲ့သည်" }
  ],
  hard: [
    { test: /\bhard work\b/i, meaning: "requiring effort; effort put into work", my: "ကြိုးစားအားထုတ်မှု" },
    { test: /\bhard (?:to|for|task|problem|decision)\b/i, meaning: "difficult and requiring effort", my: "ခက်ခဲသော" }
  ],
  water: [
    { test: /\b(?:more than|too much|much|clean|drinking|river|flood|upstream|fast|dangerous|safe|fresh|clear|warm|cold|rain|brown|moving|running|dirty)\s+water\b|\bwater\s+(?:moving|entered|was|had|rose|level|rushed|soaked|moved|might|would|looked|travelled|could|is|in|from|into|under|across|ran|carried|to|for)\b|\b(?:dish|bowl|cup|source|supply|amount|quality|sample|samples|pot|glass|body|flow)\s+of water\b/i, meaning: "the clear liquid essential to life", my: "ရေ" },
    { test: /\bwater(?:s|ed|ing)?\s+(?:the|each|every|my|your|their|these|those|plants|flowers|garden|soil|them|it)\b|\bwaters\s+(?:the|each|every|plants|flowers|garden|soil|them|it)\b/i, meaning: "to give water to a plant or living thing", my: "ရေလောင်းသည်" }
  ],
  watered: [
    { test: /\bwatered\s+(?:the|each|every|plants|flowers|garden|soil|them|it)\b/i, meaning: "gave water to a plant or living thing", my: "ရေလောင်းခဲ့သည်" }
  ],
  plant: [
    { test: /\b(?:a|an|the|each|every|young|healthy|weak|small|one|this|that|other|another)\s+plant\b|\bplants?\s+(?:need|needs|needed|looked|was|is|are|can|could|has|had|grew|grows)\b/i, meaning: "a living thing that grows in soil", my: "အပင်" },
    { test: /\bplant(?:s|ed|ing)?\s+(?:trees|flowers|seeds|native|suitable|a|the|some|vegetables|crops|them|more)\b/i, meaning: "to put a plant or seed into the ground", my: "စိုက်ပျိုးသည်" }
  ],
  planted: [
    { test: /\bplanted\s+(?:trees|flowers|seeds|native|suitable|a|the|some|vegetables|crops|them|more)\b/i, meaning: "put a plant or seed into the ground", my: "စိုက်ပျိုးခဲ့သည်" }
  ],
  records: [
    { test: /\b(?:the|official|town|water-level|repair|flood|written|old|public|medical|these|their|early|reliable)\s+records\b|\brecords\s+(?:and|of|for|from|were|show|include|contained|remained|had|helped|indicate)\b/i, meaning: "written accounts or stored information", my: "မှတ်တမ်းများ" },
    { test: /\b(?:they|students|team|Lina|she|he|we|officials|Mr Daniel)\s+records\b|\brecords\s+(?:the|each|every|date|amount|reading|change|information)\b/i, meaning: "to write down or store information", my: "မှတ်တမ်းတင်သည်" }
  ],
  changed: [
    { test: /\b(?:routine|plan|weather|different|become|decide|way|shape|colour|color)\b/i, meaning: "became or made something different", my: "ပြောင်းလဲခဲ့သည်" }
  ],
  changes: [
    { test: /\b(?:these|many|several|some|small|major|recent|important|noticeable|the)\s+changes\b|\bchanges\s+(?:in|to|over|after|include|were|could|show)\b/i, meaning: "differences or developments over time", my: "ပြောင်းလဲမှုများ" }
  ],
  closed: [
    { test: /\bclosed\s+(?:shop|store|gate|door|window|room|library|road|bridge)\b/i, meaning: "not open; shut", my: "ပိတ်ထားသော" },
    { test: /\b(?:was|were|had been|has been|is|are)\s+closed\b/i, meaning: "was or were shut", my: "ပိတ်ထားသည်၊ ပိတ်ထားခဲ့သည်" }
  ],
  called: [
    { test: /\bcalled\s+(?:the number|a number|the office|the service|a neighbour|a neighbor|the owner)\b/i, meaning: "contacted someone or a service by phone", my: "ဖုန်းဆက်ခဲ့သည်" },
    { test: /\bcalled\s+(?:its|his|her|the puppy|the animal)\s+(?:name|Milo|a name)\b/i, meaning: "used a name to call someone or something", my: "အမည်ဖြင့် ခေါ်ခဲ့သည်" }
  ],
  presented: [
    { test: /\bpresented\b.{0,100}\b(findings|results|report|information|proposal|map|idea)\b/i, meaning: "showed or explained information to others", my: "တင်ပြခဲ့သည်" }
  ],
  mattered: [
    { test: /\b(?:open area|area|place|safety|evidence|observation|community)\b.*\bmattered\b|\bmattered\b.*\b(?:important|difference|effect)\b/i, meaning: "was important or had an effect", my: "အရေးပါခဲ့သည်" }
  ],
  meeting: [
    { test: /\bmeeting point\b/i, meaning: "a place where people arrange to meet", my: "တွေ့ဆုံရာနေရာ၊ စုဝေးရာနေရာ" }
  ],
  drinking: [
    { test: /\bdrinking[- ]water\b/i, meaning: "water intended for people to drink", my: "သောက်သုံးရေ" }
  ],
  standing: [
    { test: /\bstill standing\b|\b(?:bridge|building|wall|structure|tree)\s+(?:was|were|is|are)\s+standing\b/i, meaning: "remaining upright and not having fallen", my: "မပြိုမလဲ ကျန်ရှိနေသော" },
    { test: /\bstanding\b/i, meaning: "being upright on one's feet", my: "ရပ်နေခြင်း" }
  ],
  moving: [
    { test: /\bwater moving\b|\bmoving water\b|\bwater\s+(?:moved|moves|flowed)\b/i, meaning: "water flowing or changing position", my: "စီးဆင်းနေသော၊ ရွေ့လျားနေသော" },
    { test: /\bmoving (?:the|a|some|these|those|books|furniture|goods)\b/i, meaning: "taking something to another place", my: "ရွှေ့ပြောင်းခြင်း" }
  ],
  addresses: [
    { test: /\b(?:home|private|postal|mailing|street|office|email)\s+addresses\b|\baddresses\s+(?:were|are|for|of)\b/i, meaning: "locations where people live or receive mail", my: "လိပ်စာများ" },
    { test: /\b(?:plan|report|map|notice|policy|solution|team|school)\s+addresses\b|\baddresses\s+(?:the|a|an|this|that|need|problem|issue|question|concern|risk)\b/i, meaning: "deals with or takes action on an issue", my: "ကိုင်တွယ်ဖြေရှင်းသည်" }
  ],
  mistake: [
    { test: /\b(?:a|the|its|many|some|several|few|major|small|past|same|serious|honest)\s+mistakes?\b|\bmistakes?\s+(?:and|were|show|revealed|happened|in)\b/i, meaning: "an error or incorrect action", my: "အမှား" },
    { test: /\bmistake\s+(?:one|it|them|someone|something)\s+for\b/i, meaning: "to understand or identify something incorrectly", my: "မှားယွင်းယူဆသည်" }
  ]
});

function pluralNounMeaning(value, context, entry, dictionary) {
  const word = normalizeWord(value);
  if (!word.endsWith("s") || word.endsWith("'s") || Object.prototype.hasOwnProperty.call(dictionary, word)) return null;
  const meaning = String(entry?.my ?? "").trim();
  if (!meaning || meaning.includes("ဝါကျအလိုက်")) return null;

  // Story vocabulary is normalized to letters, apostrophes, and hyphens, so it
  // can be inserted into this word-boundary expression without regex escaping.
  const nounClues = [
    "the", "these", "those", "many", "some", "several", "few", "two", "three", "four", "five", "six",
    "all", "both", "other", "their", "our", "your", "my", "its", "local", "new", "old", "small", "large",
    "young", "healthy", "damaged", "public", "important", "reliable", "official", "remaining", "suitable",
    "simple", "short", "long", "easy", "difficult", "careful", "useful", "accurate", "safe", "safer", "correct", "right", "wrong", "clearer", "private", "home", "written", "spoken", "necessary", "possible", "first", "second", "last", "next", "additional", "wooden", "firm", "ripe", "shallow", "quiet", "red", "yellow", "green", "blue", "brown", "white", "black", "grey", "gray", "pink", "orange", "separate", "basic", "older", "younger", "fresh", "cold", "warm", "strong", "weak", "busy", "crowded", "narrow", "wide", "clean", "dirty", "dry", "wet", "high", "low",
    "native", "different", "various", "visible", "common", "early", "current", "flood", "river", "town",
    "school", "family", "community", "nearby", "certain", "clear", "market", "water-level", "high-water",
    "and", "or", "but", "while", "with", "among", "between", "including", "from", "to", "of", "for", "by",
    "near", "beside", "around", "above", "below", "under", "across", "through", "after", "before", "during",
    "inside", "outside", "following", "compared", "showed", "checked", "collected", "recorded", "counted",
    "photographed", "observed", "measured", "planted", "moved", "repaired", "inspected", "reviewed", "updated",
    "displayed", "shared", "asked", "provided", "included", "contained", "found", "gathered", "separated",
    "selected", "used", "created", "built", "made", "placed", "took", "brought", "returned", "added", "marked",
    "visited", "helped", "needed", "required", "gave", "offered", "wrote", "read", "borrowed", "requested",
    "received", "donated", "kept", "preserved", "protected", "followed", "warned", "encouraged", "told",
    "invited", "explained", "mentioned", "described", "presented", "announced", "confirmed", "supported",
    "reduced", "prevented", "changed", "improved", "cleaned", "removed", "called", "showing", "making"
  ].join("|");
  const pattern = new RegExp("(?:^|[.!?]\\s+|[,;:]\\s*|\\b(?:" + nounClues + ")\\s+)" + word + "\\b", "i");
  if (!pattern.test(String(context ?? ""))) return null;
  const pluralParts = meaning.split("၊").map((part) => {
    const trimmed = part.trim();
    if (!trimmed || trimmed.includes("များ") || /(?:သည်|သော|ခြင်း|တယ်|နေသည်|နေသော)$/.test(trimmed)) return trimmed;
    return trimmed + "များ";
  });
  return pluralParts.join("၊ ");
}

export function lookupWordInContext(value, context = "", dictionary = DICTIONARY) {
  const word = normalizeWord(value);
  const entry = lookupWord(word, dictionary);
  if (!entry) return null;

  // Context rules belong to dictionary headwords. Reuse them for possessives
  // and inflected forms that resolve through lookupWord (for example Rose's,
  // changed, and presented) instead of falling back to a mixed-sense entry.
  const possessiveBase = word.endsWith("'s") ? word.slice(0, -2) : word;
  const candidates = [possessiveBase, word];
  if (word.endsWith("ed") && word.length > 4) {
    const stem = word.slice(0, -2);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3);
    candidates.push(stem, stem + "e");
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) candidates.push(stem.slice(0, -1));
  }
  if (word.endsWith("s") && word.length > 3) candidates.push(word.slice(0, -1));

  let senses;
  for (const candidate of candidates) {
    if (CONTEXTUAL_SENSES[candidate]) {
      senses = CONTEXTUAL_SENSES[candidate];
      break;
    }
  }
  if (!senses) {
    const contextualHeadword = Object.keys(CONTEXTUAL_SENSES)
      .find((headword) => dictionary[headword] === entry);
    if (contextualHeadword) senses = CONTEXTUAL_SENSES[contextualHeadword];
  }
  const sentence = String(context ?? "");
  const selected = senses?.find((sense) => sense.test.test(sentence));
  const resolved = selected ? { ...entry, meaning: selected.meaning, my: selected.my } : entry;
  const pluralMeaning = pluralNounMeaning(word, sentence, resolved, dictionary);
  return pluralMeaning ? { ...resolved, my: pluralMeaning } : resolved;
}

export function splitEnglishSentences(value) {
  const text = String(value ?? "");
  const sentences = [];
  let start = 0;

  for (let index = 0; index < text.length; index += 1) {
    const punctuation = text[index];
    if (punctuation !== "." && punctuation !== "!" && punctuation !== "?") continue;
    if (punctuation === "." && text[index + 1] === ".") continue;

    const candidate = text.slice(start, index + 1).trimEnd();
    if (punctuation === "." && /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|Mt|No|vs|etc)\.$/i.test(candidate)) {
      continue;
    }

    let end = index + 1;
    while (end < text.length && /["'”’)}\]]/.test(text[end])) end += 1;
    const sentenceText = text.slice(start, end).trim();
    if (sentenceText) {
      const leadingWhitespace = text.slice(start, end).search(/\S/);
      const sentenceStart = start + Math.max(0, leadingWhitespace);
      sentences.push({ text: sentenceText, index: sentences.length, start: sentenceStart, end });
    }

    start = end;
    while (start < text.length && /\s/.test(text[start])) start += 1;
    index = start - 1;
  }

  const remainder = text.slice(start).trim();
  if (remainder) {
    const leadingWhitespace = text.slice(start).search(/\S/);
    const sentenceStart = start + Math.max(0, leadingWhitespace);
    sentences.push({ text: remainder, index: sentences.length, start: sentenceStart, end: text.length });
  }
  return sentences;
}

export function tokenizeStory(text) {
  return String(text ?? "").split(/(\s+)/).map((part) => {
    if (!part || /^\s+$/.test(part)) return { text: part, word: null };
    const word = normalizeWord(part);
    return { text: part, word: /^[a-z]+(?:['-][a-z]+)*$/i.test(word) ? word.toLowerCase() : null };
  });
}

export function countCharacters(value) {
  return Array.from(String(value ?? "")).length;
}

export function clampSpeechRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return 1;
  return Math.min(2, Math.max(0.5, rate));
}
