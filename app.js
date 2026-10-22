import { lookupWord, lookupWordInContext, tokenizeStory, splitEnglishSentences, countCharacters, clampSpeechRate } from "./learning-core.js";
import { readLocalValue, writeLocalValue } from "./local-state.js";
import { extractPdfText } from "./pdf-import.js";

const $ = (selector) => document.querySelector(selector);
const DEFAULT_STORY = "Maya has a small garden. Every morning, she waters the flowers. A yellow bird visits the garden and sings in the tree. Maya feels happy when she hears the song.";
let readingStory = DEFAULT_STORY;
let story = DEFAULT_STORY;
let activeListeningStoryId = null;
let activeStoryTranslations = [];
let activeStoryUtterance = null;
let activeWordUtterance = null;
let activeSpeechHighlightTimer = null;
let activeWordParagraphIndex = 0;
let activeWordButton = null;
let dismissedWordButton = null;
let currentStoryParagraphIndex = 0;
const LISTENING_STORIES = [
  {
    id: "garden-bird", title: "Maya’s Garden", myTitle: "Maya ၏ ဥယျာဉ်", level: "A1", category: "Nature", myCategory: "သဘာဝ", icon: "🌱",
    summary: "A quiet garden teaches Maya to care for living things.", mySummary: "ဥယျာဉ်လေးကို ပြုစုရင်း သက်ရှိများကို ဂရုစိုက်တတ်လာသော Maya အကြောင်း။",
    text: [
      "Maya lived in a small house at the end of a quiet lane. Behind the house was a garden that her grandmother had started many years ago. It was not very large, but it had roses, sunflowers, mint, and a small mango tree. Every morning, Maya carried a blue watering can outside and checked each plant carefully.",
      "Her grandmother taught her that plants needed more than water. They needed sunlight, healthy soil, and time to grow. Maya pulled weeds gently, added dry leaves to the soil, and moved young flowers away from strong wind. When a plant looked weak, she did not throw it away. She asked what it needed and tried to help it recover.",
      "One warm morning, Maya heard a soft sound from the mango tree. A little yellow bird sat on a branch, looking around the garden. Maya wanted to move closer, but Grandmother reminded her to be quiet and give the bird space. Maya watched from the doorway. Soon the bird sang a bright little song and flew down to drink from a shallow dish.",
      "After that day, Maya kept a clean dish of water in a safe corner. She planted flowers that attracted butterflies and left a small patch of soil for insects. She learned not to touch nests or feed wild animals unsuitable food. The garden became busier, but Maya made sure there was still room for every visitor.",
      "During the following weeks, Maya kept a small notebook beside the back door. She wrote down when new leaves appeared, which flowers attracted butterflies, and how much rain fell. On very hot days she watered the garden early, before the sun grew strong. When she made a mistake, such as giving one plant too much water, Grandmother helped her notice the signs and change her routine. Maya discovered that careful observation was just as important as hard work.",
      "One afternoon, a neighbour asked Maya to cut every yellow leaf from a young plant. Maya checked with Grandmother first and learned that a few yellow leaves could be part of natural growth, while other signs might show a problem. They examined the soil and the roots before deciding what to do. Maya began to understand that caring for nature meant asking questions, learning patiently, and avoiding quick decisions.",
      "At the end of the season, the flowers opened in many colours, and the mango tree carried tiny green fruit. Maya drew a picture of the garden for her school project. She wrote that caring for nature was not one big action, but many small actions repeated with patience. When the yellow bird returned, Maya smiled and let it sing in peace."
    ].join("\n\n"),
    paragraphTranslations: [
      "Maya သည် တိတ်ဆိတ်သော လမ်းလေးအဆုံးရှိ အိမ်ငယ်တစ်အိမ်တွင် နေထိုင်သည်။ အိမ်နောက်ဘက်တွင် သူမ၏ အဘွားက လွန်ခဲ့သောနှစ်များစွာက စတင်စိုက်ပျိုးခဲ့သည့် ဥယျာဉ်တစ်ခုရှိသည်။ ဥယျာဉ်သည် အလွန်မကြီးသော်လည်း နှင်းဆီ၊ နေကြာ၊ ပူစီနံနှင့် သရက်ပင်ငယ်တစ်ပင် ရှိသည်။ မနက်တိုင်း Maya သည် အပြာရောင်ရေလောင်းဘူးကို ယူထွက်လာပြီး အပင်တစ်ပင်ချင်းစီကို ဂရုတစိုက်ကြည့်ရှုသည်။",
      "အပင်များသည် ရေတစ်ခုတည်းသာ မလိုအပ်ကြောင်း အဘွားက သင်ပေးခဲ့သည်။ နေရောင်၊ ကောင်းမွန်သောမြေဆီလွှာနှင့် ကြီးထွားရန်အချိန်လည်း လိုအပ်သည်။ Maya သည် ပေါင်းပင်များကို ညင်သာစွာဖယ်ရှားပြီး ခြောက်သွေ့သောသစ်ရွက်များကို မြေထဲထည့်ကာ ပန်းပင်ငယ်များကို လေပြင်းနှင့်ဝေးရာသို့ ရွှေ့ပေးသည်။ အပင်တစ်ပင် အားနည်းနေပုံရလျှင် Maya သည် ၎င်းကို စွန့်ပစ်မည်မဟုတ်ပါ။ ၎င်းအပင် ဘာလိုအပ်သလဲဟု စဉ်းစားပြီး ပြန်လည်ကောင်းမွန်လာရန် ကူညီသည်။",
      "ပူနွေးသော မနက်ခင်းတစ်ခုတွင် Maya သည် သရက်ပင်မှ အသံပျော့ပျော့တစ်ခုကို ကြားလိုက်သည်။ အဝါရောင်ငှက်ကလေးတစ်ကောင်သည် သစ်ကိုင်းပေါ်တွင် ထိုင်ပြီး ဥယျာဉ်ကို လှည့်ကြည့်နေသည်။ Maya က အနီးသို့သွားချင်သော်လည်း အဘွားက တိတ်တိတ်နေပြီး ငှက်ကလေးကို နေရာလွတ်ပေးရန် သတိပေးသည်။ Maya သည် တံခါးဝမှ စောင့်ကြည့်နေသည်။ မကြာမီ ငှက်ကလေးသည် သာယာသော သီချင်းတိုလေးဆိုပြီး ရေထည့်ထားသော ပန်းကန်တိမ်တိမ်မှ ရေသောက်ရန် ဆင်းလာသည်။",
      "ထိုနေ့နောက်ပိုင်း Maya သည် လုံခြုံသောထောင့်တစ်နေရာတွင် ရေသန့်ပန်းကန်တစ်လုံး ထားပေးသည်။ လိပ်ပြာများကို ဆွဲဆောင်နိုင်သော ပန်းများစိုက်ပြီး ပိုးမွှားများအတွက် မြေကွက်ငယ်တစ်ခုကိုလည်း ချန်ထားသည်။ ငှက်သိုက်များကို မထိရန်နှင့် တောရိုင်းတိရစ္ဆာန်များကို မသင့်တော်သောအစာ မကျွေးရန် သူမ သင်ယူခဲ့သည်။ ဥယျာဉ်သည် ပိုမိုစည်ကားလာသော်လည်း ဧည့်သည်တိုင်းအတွက် နေရာရှိနေစေရန် Maya ဂရုစိုက်သည်။",
      "နောက်ရက်သတ္တပတ်များတွင် Maya သည် အိမ်နောက်တံခါးနားတွင် မှတ်စုစာအုပ်ငယ်တစ်အုပ် ထားထားသည်။ အရွက်သစ်များ ပေါက်လာသည့်အချိန်၊ ဘယ်ပန်းများက လိပ်ပြာများကို ဆွဲဆောင်သည်နှင့် မိုးရေမည်မျှရွာသည်ကို မှတ်တမ်းတင်သည်။ အလွန်ပူသောနေ့များတွင် နေမပြင်းမီ မနက်စောစော ရေလောင်းသည်။ အပင်တစ်ပင်ကို ရေအလွန်များစွာ လောင်းမိသကဲ့သို့ အမှားလုပ်မိလျှင် အဘွားက လက္ခဏာများကို သတိထားမိအောင် ကူညီပြီး လုပ်ရိုးလုပ်စဉ်ကို ပြောင်းလဲပေးသည်။ အလုပ်ကြိုးစားခြင်းသာမက ဂရုတစိုက်လေ့လာခြင်းလည်း အရေးကြီးကြောင်း Maya သိလာသည်။",
      "တစ်နေ့လယ်တွင် အိမ်နီးချင်းတစ်ဦးက အပင်ငယ်တစ်ပင်ပေါ်မှ အဝါရောင်အရွက်အားလုံးကို ဖြတ်ပစ်ရန် Maya ကို ပြောသည်။ Maya သည် အဘွားနှင့် အရင်တိုင်ပင်ပြီး အဝါရောင်အရွက်အနည်းငယ်သည် သဘာဝအတိုင်း ကြီးထွားမှု၏ အစိတ်အပိုင်းဖြစ်နိုင်သော်လည်း အချို့လက္ခဏာများက ပြဿနာရှိကြောင်း ပြနိုင်သည်ကို သိလာသည်။ ဘာလုပ်ရမည်ကို မဆုံးဖြတ်မီ မြေဆီလွှာနှင့် အမြစ်များကို စစ်ဆေးကြသည်။ သဘာဝကို ဂရုစိုက်ခြင်းဆိုသည်မှာ မေးခွန်းမေးခြင်း၊ စိတ်ရှည်စွာသင်ယူခြင်းနှင့် အလျင်စလိုမဆုံးဖြတ်ခြင်းတို့ ပါဝင်ကြောင်း Maya နားလည်လာသည်။",
      "ရာသီကုန်ချိန်တွင် ပန်းများသည် အရောင်စုံပွင့်လာပြီး သရက်ပင်တွင် အစိမ်းရောင်အသီးငယ်များ သီးလာသည်။ Maya သည် ကျောင်းပရောဂျက်အတွက် ဥယျာဉ်ပုံတစ်ပုံ ဆွဲခဲ့သည်။ သဘာဝကို ဂရုစိုက်ခြင်းသည် ကြီးမားသောလုပ်ရပ်တစ်ခုတည်း မဟုတ်ဘဲ စိတ်ရှည်စွာ ထပ်ခါထပ်ခါ ပြုလုပ်သော လုပ်ရပ်ငယ်များစွာဖြစ်ကြောင်း သူမ ရေးသားခဲ့သည်။ အဝါရောင်ငှက်ကလေး ပြန်လာသောအခါ Maya ပြုံးပြီး အေးအေးချမ်းချမ်း သီချင်းဆိုခွင့်ပေးလိုက်သည်။"
    ]
  },
  {
    id: "market-morning", title: "A Morning at the Market", myTitle: "ဈေးထဲက မနက်ခင်း", level: "A1", category: "Everyday life", myCategory: "နေ့စဉ်ဘဝ", icon: "🧺",
    summary: "Nora learns to shop thoughtfully and help her neighbours.", mySummary: "ဈေးဝယ်ရင်း စဉ်းစားတတ်ပြီး အိမ်နီးချင်းများကို ကူညီတတ်လာသော Nora အကြောင်း။",
    text: [
      "Nora woke up early on Saturday because her family planned to prepare breakfast together. Her mother gave her a short shopping list and a cloth bag. Nora checked the list before leaving: apples, bananas, bread, eggs, and a small bunch of coriander. She counted the money in her purse and walked to the market along the familiar street.",
      "The market was already full of sounds and smells. Sellers arranged bright fruit in neat rows, a baker placed warm bread on a wooden shelf, and shoppers compared prices. Nora greeted the fruit seller, Mr Lin, who helped her choose firm apples without bruises. He explained that ripe bananas had yellow skins with a few brown spots, so Nora picked a small bunch.",
      "At the bread stall, Nora noticed an older woman searching through her purse. The woman had forgotten how much money she needed and looked worried. Nora asked if she could help read the price card. Together they counted the coins, and the woman found she had enough for a loaf. She thanked Nora and smiled with relief.",
      "Nora bought the remaining items and checked the list again before paying. She put the eggs carefully at the top of the bag so they would not break. Mr Lin returned the correct change and reminded her to reuse the cloth bag next time. Nora thanked the sellers and offered to carry the older woman’s light basket to the market gate.",
      "Before leaving the market, Nora compared the prices of two kinds of bread. One loaf cost less, but it was smaller; the other was a little more expensive and would feed the whole family. She considered the number of people eating breakfast instead of choosing only the lowest price. Mr Lin also explained that buying fruit in season often meant better flavour and less expense. Nora began to see that careful shopping required both counting money and thinking about value.",
      "On the walk home, Nora checked that the bag was comfortable to carry and that the eggs had not moved. She remembered the older woman and wondered how small acts of help could make a busy morning easier. At home, she told her family how the sellers had answered her questions and why she had chosen certain items. Her mother praised her for checking the list and treating people politely. Nora decided to plan the next shopping trip with her brother so he could practise too.",
      "At home, Nora washed the fruit while her mother prepared the eggs and toasted the bread. Her younger brother set the table, and her father made tea. They ate together and talked about the market. Nora was proud that she had followed the list, spent the money carefully, and helped someone. She learned that a good shopping trip was about more than buying things; it was also about patience, kindness, and making thoughtful choices."
    ].join("\n\n"),
    paragraphTranslations: [
      "စနေနေ့တွင် မိသားစုက မနက်စာကို အတူပြင်ဆင်ရန် စီစဉ်ထားသောကြောင့် Nora သည် စောစောနိုးလာသည်။ အမေက ဈေးဝယ်စာရင်းတိုတစ်ခုနှင့် အဝတ်အိတ်တစ်လုံး ပေးသည်။ Nora သည် မထွက်ခင် စာရင်းကို စစ်ဆေးပြီး ပန်းသီး၊ ငှက်ပျောသီး၊ ပေါင်မုန့်၊ ကြက်ဥနှင့် နံနံပင်စည်းငယ်တစ်စည်း လိုအပ်ကြောင်း မှတ်သားသည်။ ပိုက်ဆံအိတ်ထဲက ငွေကို ရေတွက်ပြီး ရင်းနှီးနေသောလမ်းအတိုင်း ဈေးသို့ လမ်းလျှောက်သွားသည်။",
      "ဈေးထဲတွင် အသံများနှင့် အနံ့များ ပြည့်နှက်နေပြီဖြစ်သည်။ ဈေးသည်များက သစ်သီးရောင်စုံများကို အတန်းလိုက်စီထားပြီး မုန့်ဖုတ်သူက ပေါင်မုန့်ပူပူများကို သစ်သားစင်ပေါ်တင်ထားကာ ဈေးဝယ်သူများက ဈေးနှုန်းများကို နှိုင်းယှဉ်ကြသည်။ Nora သည် သစ်သီးသည် ဦးလင်းကို နှုတ်ဆက်ပြီး အနာအဆာမရှိသော ပန်းသီးများ ရွေးရန် အကူအညီတောင်းသည်။ ငှက်ပျောသီးမှည့်သည် အညိုစက်အနည်းငယ်ပါသော အဝါရောင်အခွံရှိတတ်ကြောင်း သူက ရှင်းပြသဖြင့် Nora သည် စည်းငယ်တစ်စည်း ရွေးလိုက်သည်။",
      "ပေါင်မုန့်ဆိုင်တွင် အသက်ကြီးသော အမျိုးသမီးတစ်ဦးက ပိုက်ဆံအိတ်ထဲတွင် ရှာဖွေနေသည်ကို Nora သတိထားမိသည်။ အမျိုးသမီးသည် လိုအပ်သောငွေပမာဏကို မေ့သွားပြီး စိတ်ပူနေပုံရသည်။ Nora က ဈေးနှုန်းကတ်ကို ဖတ်ပေးရမလားဟု မေးသည်။ သူတို့နှစ်ဦး အကြွေစေ့များကို အတူရေတွက်ကြရာ ပေါင်မုန့်တစ်လုံးဝယ်ရန် ငွေလုံလောက်နေကြောင်း သိရသည်။ အမျိုးသမီးက ကျေးဇူးတင်ပြီး စိတ်သက်သာရာရစွာ ပြုံးလိုက်သည်။",
      "Nora သည် ကျန်ပစ္စည်းများကို ဝယ်ပြီး ငွေမပေးမီ စာရင်းကို ထပ်စစ်သည်။ ကြက်ဥမကွဲစေရန် အိတ်၏အပေါ်ဘက်တွင် ဂရုတစိုက်ထားသည်။ ဦးလင်းက ပြန်အမ်းငွေမှန်ကန်စွာ ပေးပြီး နောက်တစ်ကြိမ်တွင် အဝတ်အိတ်ကို ပြန်သုံးရန် သတိပေးသည်။ Nora သည် ဈေးသည်များကို ကျေးဇူးတင်ပြီး အမျိုးသမီး၏ ပေါ့ပါးသောခြင်းကို ဈေးဝင်ပေါက်အထိ ကူသယ်ပေးသည်။",
      "ဈေးမှ မပြန်မီ Nora သည် ပေါင်မုန့်အမျိုးအစားနှစ်မျိုး၏ ဈေးနှုန်းကို နှိုင်းယှဉ်သည်။ တစ်လုံးက ဈေးသက်သာသော်လည်း အရွယ်သေးပြီး အခြားတစ်လုံးက အနည်းငယ်ဈေးပိုကြီးသော်လည်း မိသားစုတစ်စုလုံး စားနိုင်သည်။ အနိမ့်ဆုံးဈေးကိုသာ မရွေးဘဲ မနက်စာစားမည့်သူ အရေအတွက်ကိုပါ စဉ်းစားသည်။ ဦးလင်းကလည်း ရာသီပေါ်သစ်သီးများသည် အရသာပိုကောင်းပြီး ကုန်ကျစရိတ်လည်း သက်သာတတ်ကြောင်း ရှင်းပြသည်။ ငွေကိုရေတွက်ရုံသာမက တန်ဖိုးကိုပါ စဉ်းစားရကြောင်း Nora သိလာသည်။",
      "အိမ်ပြန်လမ်းတွင် Nora သည် အိတ်ကို သက်သောင့်သက်သာ သယ်နိုင်မနိုင်နှင့် ကြက်ဥများ မရွေ့သွားကြောင်း စစ်ဆေးသည်။ အသက်ကြီးသောအမျိုးသမီးကို သတိရပြီး အကူအညီသေးသေးလေးများက အလုပ်များသောမနက်ခင်းကို ပိုလွယ်ကူစေနိုင်ပုံကို စဉ်းစားမိသည်။ အိမ်ရောက်သောအခါ ဈေးသည်များက သူမ၏မေးခွန်းများကို မည်သို့ဖြေကြားခဲ့ကြောင်းနှင့် ပစ္စည်းအချို့ကို ဘာကြောင့်ရွေးချယ်ခဲ့ကြောင်း မိသားစုကို ပြောပြသည်။ အမေက စာရင်းစစ်ဆေးပြီး လူများကို ယဉ်ကျေးစွာဆက်ဆံခဲ့သည့်အတွက် ချီးကျူးသည်။ နောက်တစ်ကြိမ်တွင် ညီငယ်ပါ လေ့ကျင့်နိုင်ရန် အတူဈေးဝယ်ရန် Nora ဆုံးဖြတ်သည်။",
      "အိမ်ရောက်သောအခါ Nora သည် သစ်သီးများကို ဆေးကြောပြီး အမေက ကြက်ဥပြင်ဆင်ကာ ပေါင်မုန့်ကင်သည်။ ညီငယ်က စားပွဲပြင်ပြီး အဖေက လက်ဖက်ရည်ဖျော်သည်။ မိသားစုသည် အတူစားသောက်ရင်း ဈေးအကြောင်း ပြောကြသည်။ စာရင်းအတိုင်း ဝယ်နိုင်ခြင်း၊ ငွေကို သေချာသုံးခြင်းနှင့် အခြားသူကို ကူညီနိုင်ခြင်းအတွက် Nora ဂုဏ်ယူသည်။ ဈေးဝယ်ခြင်းက ပစ္စည်းဝယ်ရုံသာမက စိတ်ရှည်ခြင်း၊ ကြင်နာခြင်းနှင့် စဉ်းစားရွေးချယ်ခြင်းတို့လည်း ပါဝင်ကြောင်း သူမ သိလာသည်။"
    ]
  },
  {
    id: "rainy-day", title: "The Rainy Afternoon", myTitle: "မိုးရွာသော နေ့လယ်ခင်း", level: "A1", category: "Weather", myCategory: "ရာသီဥတု", icon: "🌧️",
    summary: "Ben turns a rainy day into a calm and creative afternoon.", mySummary: "မိုးရွာသောနေ့ကို အေးချမ်းပြီး ဖန်တီးမှုရှိသော နေ့လယ်ခင်းအဖြစ် ပြောင်းလဲလိုက်သော Ben အကြောင်း။",
    text: [
      "After lunch, Ben noticed dark clouds gathering above the houses. The air became cool, and leaves moved in the rising wind. His mother was still hanging clothes outside, so Ben quickly helped bring them indoors. A few minutes later, rain tapped on the roof and ran down the window like tiny silver lines.",
      "Ben had planned to play football with his friends, but the wet field would be slippery. At first he felt disappointed and stood by the window watching the rain. His grandfather suggested making the afternoon useful instead of waiting for the weather to change. They made warm tea and chose a comfortable place near the window.",
      "Grandfather brought an old box of photographs from a cupboard. Some showed the family standing in front of their first house; others showed a river before a new bridge was built. Ben asked questions about the people and places in the pictures. Grandfather told him how the neighbourhood had changed and which trees had grown taller over the years.",
      "When the rain became lighter, Ben found paper and coloured pencils. He drew the street as he imagined it many years ago, with small houses, a narrow path, and the old river crossing. Grandfather helped him add details but let Ben make his own choices. They wrote short captions beneath the pictures so Ben could remember the stories later.",
      "While they worked, Grandfather explained that photographs could show useful details but could not tell every part of a story. A picture might show a new bridge, for example, but it could not explain why people needed it or how the building changed their lives. Ben wrote this idea in his notebook. He realised that asking who took a photograph, when it was taken, and what might be missing could help him understand it more carefully.",
      "The next morning, Ben showed his drawings to a friend who lived nearby. His friend remembered a large tree that had stood beside the road before it was cut down. They added the tree to the picture and discussed how streets change as people build homes and shops. Ben kept the original drawing and made a second version with notes. He felt proud that a rainy afternoon had given him a project he wanted to continue.",
      "By late afternoon, the rain had stopped and the clouds began to open. Ben still could not play football because the field was muddy, but he no longer felt that the day had been wasted. He had learned family history, practised drawing, and spent time listening carefully. He put the pictures in a folder and decided to ask his grandfather for another story next weekend."
    ].join("\n\n"),
    paragraphTranslations: [
      "နေ့လယ်စာစားပြီးနောက် Ben သည် အိမ်များအပေါ်တွင် မိုးတိမ်မည်းများ စုလာသည်ကို သတိထားမိသည်။ လေထုအေးလာပြီး လေတိုက်လာသဖြင့် သစ်ရွက်များ လှုပ်ရှားလာသည်။ အမေက အပြင်တွင် အဝတ်လှန်းနေသေးသောကြောင့် Ben သည် အဝတ်များကို အိမ်ထဲသို့ အမြန်ကူသယ်လာသည်။ မိနစ်အနည်းငယ်အကြာတွင် မိုးစက်များက အမိုးပေါ်တွင် တဒေါက်ဒေါက်ကျလာပြီး ပြတင်းပေါက်တစ်လျှောက် ငွေရောင်မျဉ်းငယ်များလို စီးဆင်းလာသည်။",
      "Ben သည် သူငယ်ချင်းများနှင့် ဘောလုံးကစားရန် စီစဉ်ထားသော်လည်း စိုနေသောကွင်းမှာ ချော်နိုင်သည်။ အစပိုင်းတွင် သူ စိတ်ပျက်ပြီး ပြတင်းပေါက်နားတွင် မိုးကိုကြည့်နေသည်။ အဘိုးက ရာသီဥတုပြောင်းမည့်အချိန်ကို စောင့်နေမည့်အစား နေ့လယ်ခင်းကို အကျိုးရှိအောင် အသုံးချရန် အကြံပြုသည်။ သူတို့သည် လက်ဖက်ရည်ပူပူဖျော်ပြီး ပြတင်းပေါက်နားက သက်သောင့်သက်သာရှိသောနေရာကို ရွေးကြသည်။",
      "အဘိုးသည် ဗီရိုထဲမှ ဓာတ်ပုံဟောင်းများပါသော သေတ္တာတစ်လုံးကို ယူလာသည်။ ဓာတ်ပုံအချို့တွင် မိသားစုက ပထမဆုံးအိမ်ရှေ့တွင် ရပ်နေကြပြီး အချို့တွင် တံတားအသစ် မဆောက်မီက မြစ်တစ်စင်းကို ပြထားသည်။ Ben သည် ဓာတ်ပုံထဲက လူများနှင့် နေရာများအကြောင်း မေးခွန်းများမေးသည်။ အဘိုးက ရပ်ကွက်သည် မည်သို့ပြောင်းလဲလာကြောင်းနှင့် နှစ်များကြာလာသည်နှင့်အမျှ ဘယ်သစ်ပင်များ ပိုမြင့်လာကြောင်း ပြောပြသည်။",
      "မိုးလျော့လာသောအခါ Ben သည် စက္ကူနှင့် ရောင်စုံခဲတံများကို ယူလာသည်။ လွန်ခဲ့သောနှစ်များက လမ်းပုံစံကို သူ စိတ်ကူးဖြင့် ဆွဲရာတွင် အိမ်ငယ်များ၊ လမ်းကျဉ်းတစ်လမ်းနှင့် မြစ်ကိုဖြတ်ကူးရာနေရာဟောင်းတစ်ခု ပါဝင်သည်။ အဘိုးက အသေးစိတ်များ ထည့်ရန် ကူညီသော်လည်း Ben ကိုယ်တိုင် ရွေးချယ်ခွင့်ပေးသည်။ နောက်ပိုင်းတွင် ဇာတ်လမ်းများကို မှတ်မိစေရန် ပုံများအောက်တွင် စာတန်းတိုများ ရေးကြသည်။",
      "သူတို့ အလုပ်လုပ်နေစဉ် ဓာတ်ပုံများက အသုံးဝင်သော အသေးစိတ်အချက်အလက်များကို ပြနိုင်သော်လည်း ဇာတ်လမ်းတစ်ခုလုံးကို မဖော်ပြနိုင်ကြောင်း အဘိုးက ရှင်းပြသည်။ ဥပမာ ဓာတ်ပုံတစ်ပုံက တံတားအသစ်ကို ပြနိုင်သော်လည်း လူများ ဘာကြောင့်တံတားလိုအပ်ခဲ့ကြောင်း သို့မဟုတ် တံတားဆောက်ခြင်းက သူတို့ဘဝကို မည်သို့ပြောင်းလဲစေခဲ့ကြောင်း မရှင်းပြနိုင်ပါ။ Ben သည် ထိုအတွေးကို မှတ်စုစာအုပ်တွင် ရေးမှတ်သည်။ ဓာတ်ပုံကို ဘယ်သူရိုက်ခဲ့သလဲ၊ ဘယ်အချိန်က ရိုက်ခဲ့သလဲ၊ ဘာတွေ မပါဝင်နိုင်သလဲဟု မေးခြင်းက ပိုမိုသေချာနားလည်စေနိုင်ကြောင်း သူ သိလာသည်။",
      "နောက်မနက်တွင် Ben သည် သူ၏ပုံများကို အနီးအနားတွင်နေသော သူငယ်ချင်းတစ်ဦးအား ပြသည်။ လမ်းဘေးတွင် ယခင်က သစ်ပင်ကြီးတစ်ပင် ရှိခဲ့ပြီး နောက်ပိုင်း ခုတ်လှဲခဲ့ကြောင်း သူငယ်ချင်းက မှတ်မိသည်။ သူတို့သည် ပုံထဲတွင် သစ်ပင်ကို ထည့်ပြီး လူများက အိမ်များနှင့် ဆိုင်များ ဆောက်လာသောအခါ လမ်းများ မည်သို့ပြောင်းလဲလာကြောင်း ဆွေးနွေးကြသည်။ Ben သည် မူရင်းပုံကို သိမ်းထားပြီး မှတ်ချက်များပါသော ဒုတိယပုံတစ်ပုံကို ဆွဲသည်။ မိုးရွာသောနေ့လယ်ခင်းက ဆက်လက်လုပ်ချင်သော စီမံကိန်းတစ်ခု ပေးခဲ့သဖြင့် သူ ဂုဏ်ယူမိသည်။",
      "ညနေစောင်းချိန်တွင် မိုးတိတ်သွားပြီး မိုးတိမ်များကြားမှ ကောင်းကင်ပွင့်လာသည်။ ကွင်းမှာ ရွှံ့များနေသဖြင့် Ben ဘောလုံးမကစားနိုင်သေးသော်လည်း တစ်နေ့တာ အလဟဿဖြစ်သွားသည်ဟု မခံစားတော့ပါ။ သူသည် မိသားစုသမိုင်းကို သိလာပြီး ပုံဆွဲလေ့ကျင့်ကာ အာရုံစိုက်နားထောင်ခဲ့သည်။ ပုံများကို ဖိုင်တွဲထဲထည့်ပြီး နောက်အပတ်တွင် အဘိုးထံမှ နောက်ထပ်ဇာတ်လမ်းတစ်ပုဒ် နားထောင်ရန် ဆုံးဖြတ်လိုက်သည်။",
    ]
  },
  {
    id: "lost-puppy", title: "The Lost Puppy", myTitle: "ပျောက်နေသော ခွေးကလေး", level: "A2", category: "Animals", myCategory: "တိရစ္ဆာန်များ", icon: "🐶",
    summary: "Lina and a neighbour safely reunite a lost puppy with its family.", mySummary: "Lina နှင့် အိမ်နီးချင်းတစ်ဦးက ပျောက်နေသော ခွေးကလေးကို မိသားစုနှင့် ပြန်လည်ဆုံစည်းစေသည်။",
    text: [
      "Lina was walking home from school when she heard a small whimper near a closed shop. Beside a cardboard box sat a brown puppy with white paws. It looked tired and frightened, and it had no person nearby. Lina wanted to pick it up at once, but she remembered that frightened animals could be hurt more easily if people moved too quickly.",
      "She stayed a little distance away and spoke in a gentle voice. The puppy stopped shaking and looked at her, but it did not come closer. Lina went to a nearby tea shop and asked the owner to help. The owner brought a bowl of clean water and called a neighbour who knew how to care for animals. They made sure the puppy could drink without being crowded.",
      "The neighbour noticed a collar around the puppy’s neck, with a phone number written on a small tag. He called the number and explained where they had found the animal. While they waited, Lina checked the area for traffic and asked shopkeepers whether they had seen anyone searching. She did not post the owner’s phone number online; she understood that private details should be shared carefully.",
      "Soon, a worried father and his young daughter hurried to the shop. The girl recognised the puppy immediately and called its name, Milo. The puppy wagged its tail and ran toward her. The father thanked Lina and the neighbour, explaining that Milo had slipped through an open gate while the family carried groceries inside.",
      "During the following week, Lina made a small poster for the school noticeboard about helping lost animals. She wrote three simple steps: stay calm, keep a safe distance, and ask a trusted adult for help. Her teacher reminded the class not to chase an animal into traffic or try to treat an injury without guidance. If an animal looked seriously hurt, they should contact a responsible adult or an animal-care service rather than attempting a rescue alone.",
      "Lina also learned that a collar and phone number could help a pet return home, but owners needed to check that the details stayed readable. Her family put a current contact number on their own pet’s tag and made sure their gate closed properly. Lina did not think of herself as a hero. She was glad that she had paused, asked for help, and allowed people with more experience to guide the situation safely.",
      "Before leaving, the father checked Milo’s collar and promised to repair the gate and add a safer tag. Lina felt happy, but she also learned an important lesson: helping an animal means being calm, asking responsible adults for help, and keeping both the animal and the people around it safe. She continued home, glad that Milo was back with the people who loved him."
    ].join("\n\n"),
    paragraphTranslations: [
      "Lina သည် ကျောင်းမှ အိမ်ပြန်လာစဉ် ပိတ်ထားသောဆိုင်အနီးမှ ခွေးကလေး၏ ညည်းသံကို ကြားလိုက်သည်။ ကတ်ထူသေတ္တာဘေးတွင် ခြေဖဝါးဖြူသော အညိုရောင်ခွေးကလေးတစ်ကောင် ထိုင်နေသည်။ ပင်ပန်းပြီး ကြောက်ရွံ့နေပုံရကာ အနီးအနားတွင် လူတစ်ဦးမျှ မရှိပါ။ Lina က ချက်ချင်းကောက်ချီချင်သော်လည်း ကြောက်နေသောတိရစ္ဆာန်များကို အလျင်စလို လှုပ်ရှားပါက ပိုမိုထိခိုက်နိုင်ကြောင်း သတိရလိုက်သည်။",
      "သူမသည် အနည်းငယ်အကွာတွင် ရပ်ပြီး နူးညံ့သောအသံဖြင့် ပြောသည်။ ခွေးကလေးသည် တုန်နေခြင်း ရပ်သွားပြီး သူမကိုကြည့်သော်လည်း အနီးသို့ မလာသေးပါ။ Lina သည် အနီးရှိ လက်ဖက်ရည်ဆိုင်သို့သွားပြီး ဆိုင်ရှင်ကို အကူအညီတောင်းသည်။ ဆိုင်ရှင်က ရေသန့်ပန်းကန်တစ်လုံး ယူလာပြီး တိရစ္ဆာန်များကို စောင့်ရှောက်တတ်သော အိမ်နီးချင်းတစ်ဦးကို ခေါ်သည်။ သူတို့သည် ခွေးကလေး လူများဝိုင်းမနေဘဲ ရေသောက်နိုင်ကြောင်း သေချာစေသည်။",
      "အိမ်နီးချင်းက ခွေးကလေး၏ လည်ပတ်တွင် ဖုန်းနံပါတ်ရေးထားသော အမှတ်ပြားငယ်တစ်ခု ပါနေသည်ကို သတိထားမိသည်။ သူက ထိုနံပါတ်ကို ဖုန်းဆက်ပြီး တွေ့ရှိသည့်နေရာကို ရှင်းပြသည်။ စောင့်နေစဉ် Lina သည် ယာဉ်အသွားအလာကို စစ်ဆေးပြီး ဆိုင်ရှင်များကို ပိုင်ရှင်တစ်ဦးဦး လာရှာနေသလားဟု မေးသည်။ ပိုင်ရှင်၏ ဖုန်းနံပါတ်ကို အင်တာနက်ပေါ် မတင်ခဲ့ဘဲ ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို သတိထားမျှဝေရမည်ကို သူမ နားလည်သည်။",
      "မကြာမီ စိုးရိမ်နေသော ဖခင်တစ်ဦးနှင့် သမီးငယ်တစ်ဦး ဆိုင်သို့ အမြန်ရောက်လာသည်။ သမီးငယ်က ခွေးကလေးကို ချက်ချင်းမှတ်မိပြီး Milo ဟု ခေါ်လိုက်သည်။ ခွေးကလေးသည် အမြီးလှုပ်ကာ သူမဆီ ပြေးသွားသည်။ ဖခင်က Lina နှင့် အိမ်နီးချင်းကို ကျေးဇူးတင်ပြီး မိသားစုက ဈေးဝယ်ပစ္စည်းများ အိမ်ထဲသယ်နေစဉ် တံခါးဖွင့်နေရာမှ Milo ထွက်ပြေးသွားကြောင်း ရှင်းပြသည်။",
      "နောက်တစ်ပတ်တွင် Lina သည် ပျောက်နေသောတိရစ္ဆာန်များကို ကူညီပုံအကြောင်း ကျောင်းကြေညာဘုတ်အတွက် ပိုစတာငယ်တစ်ခု ပြုလုပ်သည်။ သူမက အဆင့်သုံးဆင့်—စိတ်တည်ငြိမ်ရန်၊ လုံခြုံသောအကွာအဝေးတွင်နေရန်၊ ယုံကြည်ရသောလူကြီးတစ်ဦးထံ အကူအညီတောင်းရန်—ကို ရေးထားသည်။ တိရစ္ဆာန်တစ်ကောင်ကို လိုက်ဖမ်းရင်း ယာဉ်သွားလာနေသော လမ်းထဲသို့ မလိုက်သွားရန်၊ လမ်းညွှန်မှုမရှိဘဲ ဒဏ်ရာကို ကုသရန်လည်း မကြိုးစားရန် ဆရာမက အတန်းသားများကို သတိပေးသည်။ တိရစ္ဆာန်သည် ပြင်းထန်စွာ ထိခိုက်ထားပုံရလျှင် ကိုယ်တိုင်ကယ်ဆယ်ရန် မကြိုးစားဘဲ တာဝန်ရှိသောလူကြီး သို့မဟုတ် တိရစ္ဆာန်စောင့်ရှောက်ရေးဝန်ဆောင်မှုထံ ဆက်သွယ်သင့်သည်။",
      "လည်ပတ်နှင့် ဖုန်းနံပါတ်က အိမ်မွေးတိရစ္ဆာန်ကို အိမ်ပြန်ရောက်စေနိုင်သော်လည်း အချက်အလက်များ ဖတ်လို့ရနေသေးကြောင်း ပိုင်ရှင်များ စစ်ဆေးရမည်ကို Lina သင်ယူခဲ့သည်။ သူမ၏မိသားစုသည် မိမိတို့၏ အိမ်မွေးတိရစ္ဆာန်အမှတ်ပြားတွင် လက်ရှိဆက်သွယ်ရန်နံပါတ်ကို ထည့်ပြီး ခြံတံခါးကို သေချာပိတ်နိုင်ကြောင်း စစ်ဆေးသည်။ Lina သည် မိမိကိုယ်ကို သူရဲကောင်းတစ်ဦးဟု မထင်ပါ။ အလျင်စလိုမလုပ်ဘဲ အကူအညီတောင်းပြီး အတွေ့အကြုံရှိသူများ၏ လမ်းညွှန်မှုကို လိုက်နာနိုင်ခဲ့သည့်အတွက် ဝမ်းသာသည်။",
      "မပြန်မီ ဖခင်သည် Milo ၏ လည်ပတ်ကို စစ်ဆေးပြီး တံခါးကို ပြုပြင်ကာ ပိုမိုလုံခြုံသော အမှတ်ပြားတစ်ခု တပ်ပေးမည်ဟု ကတိပေးသည်။ Lina ပျော်ရွှင်သော်လည်း အရေးကြီးသော သင်ခန်းစာတစ်ခုလည်း ရရှိခဲ့သည်—တိရစ္ဆာန်ကို ကူညီရာတွင် စိတ်တည်ငြိမ်ရန်၊ တာဝန်ယူနိုင်သော လူကြီးများထံ အကူအညီတောင်းရန်နှင့် တိရစ္ဆာန်အပြင် ပတ်ဝန်းကျင်ရှိလူများ၏ လုံခြုံရေးကိုပါ ဂရုစိုက်ရန် လိုအပ်သည်။ Milo သည် ချစ်ခင်သူများထံ ပြန်ရောက်သွားသဖြင့် Lina ဝမ်းသာစွာ အိမ်ဆက်ပြန်ခဲ့သည်။"
    ]
  },
  {
    id: "school-trip", title: "A Day at the Museum", myTitle: "ပြတိုက်သို့ လေ့လာရေးခရီး", level: "A2", category: "Learning", myCategory: "လေ့လာရေး", icon: "🏛️",
    summary: "A school visit helps students connect objects with real lives.", mySummary: "ပြတိုက်လေ့လာရေးခရီးက ပစ္စည်းများနှင့် လူတို့၏ဘဝကို ဆက်စပ်နားလည်စေသည်။",
    text: [
      "On Friday, Ms Rose’s class visited the town museum. Before entering, she reminded everyone to walk calmly, keep food in their bags, and look carefully at the displays. Each student received a small notebook and a task: choose one object and discover what it could tell people about life in the past.",
      "Their guide began with tools used by farmers. A wooden plough, a worn sickle, and a clay water pot stood behind glass. The guide explained how families grew food before modern machines became common. The students compared the tools with equipment used on farms today and noticed that many old tools were simple but carefully designed.",
      "In the next room, they saw maps, letters, and black-and-white photographs. One photograph showed a crowded market beside a river. Another showed children learning in a classroom with wooden desks. The students asked how people travelled, how letters reached distant towns, and why some streets had different names. The guide encouraged them to ask questions rather than simply memorise dates.",
      "Sam chose an old school bell for his notebook. He learned that the bell called children to lessons and warned people when a meeting was about to begin. He imagined the sound travelling across the town many years ago. His friend Aye chose a woven basket and discovered that its pattern showed which village had made it.",
      "Ms Rose gave the students a second task: write two questions that the museum could help answer and one question that still needed more research. Sam asked how often the old bell had rung, while Aye wondered who had woven the basket and how long it took. Their guide had not known every answer, which helped the students understand that learning often begins with a question rather than a complete explanation.",
      "The class later compared their notes with a short book about the town. Some details matched, while others needed correction. They learned to check the source of a claim and avoid treating a guess as a fact. Ms Rose explained that museums preserve objects so future visitors can study them, but each object becomes more meaningful when people ask careful questions and connect it with reliable information. The students planned to return with their families and share what they had discovered.",
      "Back at school, the class shared what they had learned. Sam explained the bell, and Aye showed a sketch of the basket. Ms Rose asked everyone to separate facts they had seen from ideas they had imagined. The students realised that history was not only a list of dates; it was a way to understand ordinary people, their work, and the choices they made. They left ready to look more closely at the objects around them."
    ].join("\n\n"),
    paragraphTranslations: [
      "သောကြာနေ့တွင် Ms Rose ၏ အတန်းသည် မြို့ပြတိုက်သို့ သွားရောက်လည်ပတ်သည်။ အထဲမဝင်မီ ဆရာမက အေးအေးဆေးဆေး လျှောက်ရန်၊ အစားအစာများကို အိတ်ထဲတွင်ထားရန်နှင့် ပြသထားသောပစ္စည်းများကို သေချာကြည့်ရန် သတိပေးသည်။ ကျောင်းသားတစ်ဦးစီသည် မှတ်စုစာအုပ်ငယ်တစ်အုပ် ရရှိပြီး အတိတ်ကဘဝအကြောင်း ပစ္စည်းတစ်ခုမှ ဘာတွေသိနိုင်မလဲ ရှာဖွေရန် တာဝန်ရသည်။",
      "လမ်းညွှန်သည် လယ်သမားများ အသုံးပြုခဲ့သော ကိရိယာများဖြင့် စတင်ပြသသည်။ သစ်သားထွန်တစ်ခု၊ အသုံးများ၍ ဟောင်းနွမ်းနေသော တံစဉ်တစ်ခုနှင့် မြေအိုးတစ်လုံးကို မှန်နောက်တွင် ထားရှိထားသည်။ ခေတ်မီစက်များ အသုံးများမလာမီ မိသားစုများက အစားအစာကို မည်သို့စိုက်ပျိုးခဲ့ကြောင်း ရှင်းပြသည်။ ကျောင်းသားများသည် ရှေးကိရိယာများကို ယနေ့လယ်ယာကိရိယာများနှင့် နှိုင်းယှဉ်ပြီး ရိုးရှင်းသော်လည်း သေချာစွာ ဒီဇိုင်းဆွဲထားကြောင်း သတိပြုမိကြသည်။",
      "နောက်အခန်းတွင် မြေပုံများ၊ စာများနှင့် အဖြူအမည်းဓာတ်ပုံများကို တွေ့ရသည်။ ဓာတ်ပုံတစ်ပုံတွင် မြစ်ဘေးရှိ လူစည်ကားသောဈေးကို ပြထားသည်။ အခြားတစ်ပုံတွင် သစ်သားစားပွဲများရှိသော စာသင်ခန်းထဲ၌ ကလေးများ သင်ယူနေကြသည်။ ကျောင်းသားများက လူများ မည်သို့ခရီးသွားကြသလဲ၊ စာများသည် ဝေးလံသောမြို့များသို့ မည်သို့ရောက်သလဲ၊ လမ်းအမည်အချို့ ဘာကြောင့်ကွဲပြားသလဲဟု မေးကြသည်။ လမ်းညွှန်က ရက်စွဲများကို အလွတ်ကျက်ရုံမဟုတ်ဘဲ မေးခွန်းမေးရန် အားပေးသည်။",
      "Sam သည် မှတ်စုစာအုပ်အတွက် ကျောင်းခေါင်းလောင်းဟောင်းတစ်လုံးကို ရွေးချယ်ခဲ့သည်။ ထိုခေါင်းလောင်းက ကလေးတွေကို သင်ခန်းစာတက်ဖို့ ခေါ်ပြီး အစည်းအဝေးစတော့မယ့်အချိန်မှာ လူတွေကို သတိပေးဖို့ အသုံးပြုခဲ့ကြောင်း သူသိလာသည်။ လွန်ခဲ့သောနှစ်များက ထိုအသံသည် မြို့တစ်ဝန်းသို့ ပျံ့နှံ့သွားပုံကို သူစိတ်ကူးကြည့်ခဲ့သည်။ သူ့သူငယ်ချင်း Aye က ယက်လုပ်ထားသောခြင်းတစ်လုံးကို ရွေးချယ်ပြီး ၎င်း၏ယက်လုပ်ပုံစံက ဘယ်ရွာတွင် ပြုလုပ်ခဲ့သည်ကို ဖော်ပြပေးကြောင်း သိရှိခဲ့သည်။",
      "Ms Rose သည် ကျောင်းသားများကို ဒုတိယတာဝန်တစ်ခု ပေးသည်—ပြတိုက်က အဖြေရှာရာတွင် ကူညီပေးနိုင်မည့် မေးခွန်းနှစ်ခုနှင့် ထပ်မံသုတေသနလုပ်ရန် လိုသေးသော မေးခွန်းတစ်ခုကို ရေးရန်ဖြစ်သည်။ Sam က ခေါင်းလောင်းဟောင်းကို မည်မျှမကြာခဏ တီးလေ့ရှိခဲ့သလဲဟု မေးပြီး Aye က ခြင်းကို ဘယ်သူယက်လုပ်ခဲ့သလဲ၊ ဘယ်လောက်ကြာခဲ့သလဲဟု သိချင်သည်။ လမ်းညွှန်က အဖြေအားလုံးကို မသိခဲ့ခြင်းကြောင့် သင်ယူမှုသည် ပြည့်စုံသောရှင်းလင်းချက်တစ်ခုမှမဟုတ်ဘဲ မေးခွန်းတစ်ခုမှ စတင်တတ်ကြောင်း ကျောင်းသားများ နားလည်လာသည်။",
      "နောက်ပိုင်းတွင် အတန်းသားများသည် သူတို့၏မှတ်စုများကို မြို့အကြောင်းရေးထားသော စာအုပ်တိုတစ်အုပ်နှင့် နှိုင်းယှဉ်ကြသည်။ အချက်အလက်အချို့ ကိုက်ညီသော်လည်း အချို့ကို ပြင်ဆင်ရန် လိုအပ်သည်။ အဆိုတစ်ခု၏ ရင်းမြစ်ကို စစ်ဆေးရန်နှင့် ခန့်မှန်းချက်ကို အမှန်တရားအဖြစ် မယူဆရန် သင်ယူကြသည်။ ပြတိုက်များသည် အနာဂတ်လာရောက်သူများ လေ့လာနိုင်ရန် ပစ္စည်းများကို ထိန်းသိမ်းထားသော်လည်း သေချာသောမေးခွန်းများမေးပြီး ယုံကြည်စိတ်ချရသော အချက်အလက်များနှင့် ဆက်စပ်သောအခါ ပစ္စည်းတစ်ခုချင်းစီသည် ပိုမိုအဓိပ္ပာယ်ရှိလာကြောင်း ဆရာမက ရှင်းပြသည်။ ကျောင်းသားများသည် မိသားစုနှင့်အတူ ပြန်လာပြီး ရှာဖွေတွေ့ရှိခဲ့သည်များကို မျှဝေရန် စီစဉ်ကြသည်။",
      "ကျောင်းပြန်ရောက်သောအခါ အတန်းသားများသည် လေ့လာခဲ့သည်များကို မျှဝေကြသည်။ Sam က ခေါင်းလောင်းအကြောင်း ရှင်းပြပြီး Aye က ခြင်းပုံကြမ်းကို ပြသည်။ ဆရာမ Rose က ကိုယ်တိုင်မြင်ခဲ့သော အချက်အလက်နှင့် စိတ်ကူးဖြင့် ခန့်မှန်းထားသောအရာများကို ခွဲခြားရန် ပြောသည်။ သမိုင်းဆိုသည်မှာ ရက်စွဲစာရင်းတစ်ခုသာ မဟုတ်ဘဲ သာမန်လူများ၊ သူတို့၏အလုပ်နှင့် ဆုံးဖြတ်ချက်များကို နားလည်ရန် နည်းလမ်းတစ်ခုဖြစ်ကြောင်း ကျောင်းသားများ သိလာကြသည်။ ပတ်ဝန်းကျင်ရှိ ပစ္စည်းများကို ပိုမိုဂရုတစိုက် လေ့လာကြည့်ရှုရန် အသင့်ဖြစ်ကာ သူတို့ ပြန်သွားကြသည်။",
    ]
  },
  {
    id: "village-library", title: "The Little Village Library", myTitle: "ရွာလေး၏ စာကြည့်တိုက်", level: "B1", category: "Community", myCategory: "လူမှုအသိုင်းအဝိုင်း", icon: "📚",
    summary: "Neighbours work together to build a library that belongs to everyone.", mySummary: "လူတိုင်းပိုင်ဆိုင်နိုင်သော စာကြည့်တိုက်တစ်ခုအတွက် အိမ်နီးချင်းများ အတူတကွ ကြိုးစားကြသည်။",
    text: [
      "For many years, children in Pine Village had few books outside their school textbooks. The nearest public library was far away, and travelling there cost both time and money. One afternoon, teacher Mr Daniel asked the village meeting whether an unused room beside the market could become a small community library. At first, people worried about repairs, books, and who would keep the room open.",
      "Instead of waiting for one person to solve everything, the villagers made a simple plan. Families donated books they no longer needed, a carpenter repaired the shelves, and older students cleaned the room. The shop owners collected a little money for paint and a lock. Mr Daniel wrote down every donation and expense on a noticeboard so everyone could see how the project was progressing.",
      "The team agreed on clear rules. Children could borrow one book at a time and return it the following week. Readers had to keep food away from the shelves and tell a volunteer if a book was damaged. The library would open after school on weekdays and for two hours on Saturday. Volunteers took turns, so no one person had to do all the work.",
      "On opening day, the room looked bright and welcoming. A sign above the door read, “Books belong to everyone.” Some children chose picture books, while others looked for stories about science, travel, and history. A grandmother came to read aloud to younger children. A teenager offered to help students practise English, and the carpenter built a low shelf that small children could reach safely.",
      "After a few months, the library became more than a place to borrow books. Students met to finish homework, adults shared local stories, and neighbours used the noticeboard to announce community events. When a storm damaged part of the roof, volunteers organised repairs and moved the books to a dry room until the work was complete.",
      "To make the library useful for more people, the volunteers asked readers what they wanted to learn. Younger children requested picture books and simple science activities, while older students asked for dictionaries and graded English readers. Adults wanted practical books about gardening, health, and small businesses. The team could not buy everything at once, so they used the requests to choose a few books that would help the greatest number of readers.",
      "The library also started a weekly reading circle. Each person could read a short passage or simply listen while another volunteer read aloud. New learners were encouraged to ask about unfamiliar words without feeling embarrassed. The volunteers recorded which books were borrowed most often, but they did not publish individual readers’ names or reading choices. The village learned that a welcoming library needed not only books and shelves, but also respect, privacy, and a habit of listening to its members.",
      "At the end of the year, the village held a small celebration. Mr Daniel thanked everyone, but he also reminded them that a library needed ongoing care. They planned to add new books slowly, check borrowed books regularly, and invite more volunteers. The children understood that the library had grown because many people contributed something useful. It was small, but it belonged to the whole village—and it gave everyone a place to learn together."
    ].join("\n\n"),
    paragraphTranslations: [
      "နှစ်ပေါင်းများစွာ Pine ရွာရှိ ကလေးများတွင် ကျောင်းစာအုပ်များအပြင် ဖတ်စရာစာအုပ် အနည်းငယ်သာ ရှိခဲ့သည်။ အနီးဆုံး အများပြည်သူစာကြည့်တိုက်မှာ ဝေးလံပြီး ထိုနေရာသို့ သွားလာရန် အချိန်နှင့် ငွေကုန်ကျသည်။ တစ်နေ့လယ်တွင် ဆရာ Mr Daniel က ဈေးဘေးရှိ အသုံးမပြုသောအခန်းကို ရွာလူထုစာကြည့်တိုက်ငယ်အဖြစ် ပြောင်းလဲနိုင်မလားဟု ရွာအစည်းအဝေးတွင် မေးသည်။ အစပိုင်းတွင် ပြုပြင်စရိတ်၊ စာအုပ်များနှင့် အခန်းဖွင့်ပေးမည့်သူအကြောင်း လူများ စိုးရိမ်ကြသည်။",
      "လူတစ်ဦးတည်းက အရာအားလုံးကို ဖြေရှင်းပေးမည်ဟု စောင့်မနေဘဲ ရွာသားများသည် ရိုးရှင်းသောအစီအစဉ်တစ်ခု ချမှတ်ကြသည်။ မိသားစုများက မလိုအပ်တော့သောစာအုပ်များ လှူဒါန်းပြီး လက်သမားက စင်များကို ပြုပြင်ကာ ကျောင်းသားကြီးများက အခန်းကို သန့်ရှင်းရေးလုပ်ကြသည်။ ဆိုင်ရှင်များက ဆေးနှင့် သော့ဝယ်ရန် ငွေအနည်းငယ် စုဆောင်းကြသည်။ စီမံကိန်း မည်သို့တိုးတက်နေကြောင်း လူတိုင်းမြင်နိုင်ရန် Mr Daniel သည် လှူဒါန်းမှုနှင့် ကုန်ကျစရိတ်တိုင်းကို ကြေညာဘုတ်ပေါ်တွင် မှတ်တမ်းတင်ထားသည်။",
      "အဖွဲ့သည် ရှင်းလင်းသောစည်းမျဉ်းများကို သဘောတူကြသည်။ ကလေးများသည် တစ်ကြိမ်လျှင် စာအုပ်တစ်အုပ် ငှားနိုင်ပြီး နောက်အပတ်တွင် ပြန်ပေးရသည်။ စာဖတ်သူများသည် စင်များအနီး အစားအစာမစားရဘဲ စာအုပ်ပျက်စီးပါက စေတနာ့ဝန်ထမ်းကို အသိပေးရသည်။ စာကြည့်တိုက်ကို ရက်သတ္တပတ်အတွင်း ကျောင်းဆင်းပြီးနောက်နှင့် စနေနေ့တွင် နှစ်နာရီ ဖွင့်ရန် သတ်မှတ်ကြသည်။ တစ်ဦးတည်း အလုပ်အားလုံး မလုပ်ရစေရန် စေတနာ့ဝန်ထမ်းများ အလှည့်ကျ တာဝန်ယူကြသည်။",
      "ဖွင့်ပွဲနေ့တွင် အခန်းသည် တောက်ပပြီး နွေးထွေးဖိတ်ခေါ်မှုရှိနေသည်။ တံခါးအပေါ်ရှိ ဆိုင်းဘုတ်တွင် “စာအုပ်များသည် လူတိုင်းအတွက်ဖြစ်သည်” ဟု ရေးထားသည်။ ကလေးအချို့က ပုံပြင်စာအုပ်များကို ရွေးပြီး အချို့က သိပ္ပံ၊ ခရီးသွားခြင်းနှင့် သမိုင်းအကြောင်းစာအုပ်များကို ရှာကြသည်။ အဘွားတစ်ဦးက ကလေးငယ်များအား အသံထွက်ဖတ်ပြသည်။ ဆယ်ကျော်သက်တစ်ဦးက အင်္ဂလိပ်စာလေ့ကျင့်ရန် ကူညီပေးပြီး လက်သမားက ကလေးငယ်များ လုံခြုံစွာလက်လှမ်းမီသော စင်နိမ့်တစ်ခုကို ပြုလုပ်ပေးသည်။",
      "လအနည်းငယ်ကြာသောအခါ စာကြည့်တိုက်သည် စာအုပ်ငှားရန်သာမက အခြားလုပ်ငန်းများအတွက်ပါ အသုံးဝင်သောနေရာ ဖြစ်လာသည်။ ကျောင်းသားများသည် အိမ်စာပြီးစေရန် တွေ့ဆုံကြပြီး လူကြီးများက ဒေသခံပုံပြင်များ မျှဝေကြကာ အိမ်နီးချင်းများက လူထုလှုပ်ရှားမှုများကို ကြေညာဘုတ်တွင် အသိပေးကြသည်။ မုန်တိုင်းကြောင့် အမိုးတစ်စိတ်တစ်ပိုင်း ပျက်စီးသွားသောအခါ စေတနာ့ဝန်ထမ်းများက ပြုပြင်ရေးစီစဉ်ပြီး အလုပ်ပြီးသည်အထိ စာအုပ်များကို ခြောက်သွေ့သောအခန်းသို့ ရွှေ့ထားကြသည်.",
      "စာကြည့်တိုက်ကို လူပိုများများအတွက် အသုံးဝင်စေရန် စေတနာ့ဝန်ထမ်းများက စာဖတ်သူများ ဘာတွေသင်ယူချင်ကြသလဲဟု မေးကြသည်။ ကလေးငယ်များက ပုံစာအုပ်များနှင့် သိပ္ပံလှုပ်ရှားမှုလွယ်လွယ်များကို တောင်းဆိုကြပြီး ကျောင်းသားကြီးများက အဘိဓာန်များနှင့် အဆင့်လိုက်အင်္ဂလိပ်စာဖတ်စာအုပ်များကို လိုချင်ကြသည်။ လူကြီးများက ဥယျာဉ်စိုက်ပျိုးခြင်း၊ ကျန်းမာရေးနှင့် အသေးစားစီးပွားရေးအကြောင်း လက်တွေ့အသုံးဝင်သောစာအုပ်များကို လိုချင်ကြသည်။ အရာအားလုံးကို တစ်ကြိမ်တည်း မဝယ်နိုင်သောကြောင့် စာဖတ်သူအများဆုံးကို အထောက်အကူပြုမည့် စာအုပ်အနည်းငယ်ကို ရွေးချယ်ရန် တောင်းဆိုချက်များကို အသုံးပြုကြသည်။",
      "စာကြည့်တိုက်တွင် အပတ်စဉ် စာဖတ်ဝိုင်းတစ်ခုကိုလည်း စတင်ခဲ့သည်။ လူတစ်ဦးစီသည် စာပိုဒ်တိုတစ်ခုကို ဖတ်နိုင်သလို အခြားစေတနာ့ဝန်ထမ်းတစ်ဦး ဖတ်ပြသည်ကိုလည်း နားထောင်နိုင်သည်။ စကားလုံးအသစ်များ မသိပါက ရှက်ရွံ့စရာမလိုဘဲ မေးရန် သင်ယူသူအသစ်များကို အားပေးသည်။ ဘယ်စာအုပ်များကို အများဆုံးငှားကြောင်း မှတ်တမ်းတင်သော်လည်း စာဖတ်သူတစ်ဦးချင်း၏ အမည် သို့မဟုတ် ဖတ်ရှုမှုရွေးချယ်ချက်များကို လူသိရှင်ကြား မဖော်ပြကြပါ။ စာကြည့်တိုက်ကောင်းတစ်ခုတွင် စာအုပ်နှင့်စင်များသာမက လေးစားမှု၊ ကိုယ်ရေးကိုယ်တာလုံခြုံမှုနှင့် အသင်းဝင်များ၏အသံကို နားထောင်တတ်ခြင်းတို့လည်း လိုအပ်ကြောင်း ရွာသားများ သိလာကြသည်။",
      "နှစ်ကုန်တွင် ရွာသားများသည် အခမ်းအနားငယ်တစ်ခု ကျင်းပကြသည်။ Mr Daniel က လူတိုင်းကို ကျေးဇူးတင်သော်လည်း စာကြည့်တိုက်တစ်ခုသည် ဆက်လက်ဂရုစိုက်မှု လိုအပ်ကြောင်း သတိပေးသည်။ စာအုပ်အသစ်များကို ဖြည်းဖြည်းချင်းထည့်ရန်၊ ငှားထားသောစာအုပ်များကို ပုံမှန်စစ်ဆေးရန်နှင့် စေတနာ့ဝန်ထမ်းအသစ်များ ဖိတ်ခေါ်ရန် စီစဉ်ကြသည်။ လူများစွာက အသုံးဝင်သောအရာတစ်ခုစီ ပံ့ပိုးခဲ့သောကြောင့် စာကြည့်တိုက် ကြီးထွားလာကြောင်း ကလေးများ နားလည်ကြသည်။ စာကြည့်တိုက်သည် သေးငယ်သော်လည်း ရွာတစ်ရွာလုံးပိုင်ဆိုင်ပြီး လူတိုင်းအတူတကွ သင်ယူနိုင်သောနေရာ ဖြစ်လာသည်။"
    ]
  },
  {
    id: "river-remembers", title: "The River That Remembered", myTitle: "အမှတ်တရများရှိသော မြစ်", level: "B1", category: "Community & Nature", myCategory: "လူမှုအသိုင်းအဝိုင်းနှင့် သဘာဝ", icon: "🌊",
    summary: "Lina and her classmates help Willowbrook prepare for a changing river.", mySummary: "ပြောင်းလဲလာသော မြစ်အတွက် Willowbrook မြို့ကို ပြင်ဆင်ကူညီသော Lina နှင့် သူငယ်ချင်းများအကြောင်း။",
    text: [
      "At the edge of a wide green valley stood the town of Willowbrook, where a river curved between farms before disappearing into distant hills. The river gave the town drinking water, fish, fertile soil, and a road for small boats. Children learned its bends before they learned the names of faraway cities. In summer they watched silver fish beneath the bridge; in winter they listened to water moving under thin sheets of ice. Most people believed the river was predictable because their parents and grandparents had lived beside it for generations. Yet the river was changing. The rainy season had become less regular, hillsides were losing trees, and new houses were being built close to the water. Twelve-year-old Lina noticed these changes, although adults often told her that rivers had always risen and fallen. She began keeping a notebook of what she saw, hoping that careful observation might help her understand the place she called home.",
      "Lina lived with her father, who repaired bicycles, and her grandmother, Daw May, who had spent her life growing vegetables beside the river. Their home stood on a gentle slope above the market road. Each morning, Lina walked across the old wooden bridge to school and counted the marks painted on a stone near the bank. The marks showed how high the water had risen in earlier years. Her teacher, Mr Daniel, had explained that measurements were more useful than guesses, so Lina wrote down the date, the weather, and the water level whenever she passed. She also recorded the colour of the water, the amount of rubbish caught among the reeds, and whether birds were nesting near the shore. At first, the notebook seemed like a private game. Gradually, however, Lina began to see patterns: after heavy rain upstream, the river rose even when Willowbrook itself stayed dry.",
      "One Monday, Mr Daniel announced a school project called “Our Town, Our Future.” Each group had to investigate a local problem and suggest a practical solution. Some students chose traffic, litter, or the lack of places to play. Lina proposed studying the river. Her classmates Arun and May Thiri joined her, although Arun admitted that he preferred building models to writing reports. Mr Daniel approved the idea and reminded them to work safely: they must never enter fast water, climb unstable banks, or collect samples without an adult. They planned to interview residents, draw a map, compare old photographs, and find out how the river affected different parts of the town. Lina felt excited, but she also understood that a good project needed evidence, not just an interesting story. The three students divided their tasks and agreed to meet after school every Tuesday.",
      "Their first interview was with Daw Hnin, a retired boat operator who lived near the market. She remembered a flood from twenty years earlier, when water entered several shops and carried away wooden crates. She also remembered how neighbours helped one another move rice, medicine, and children to higher ground. “The water was frightening,” she told them, “but confusion made it worse. Some people heard warnings late, and others did not know where to go.” Daw Hnin showed them an old photograph of the bridge surrounded by water. Lina carefully noted the year written on its back and asked permission to copy the image for the project. Before they left, the woman pointed toward a new row of buildings close to the riverbank. The land had once been a grassy space where boats could stop safely. Lina added this information to the map and wondered whether the town had forgotten why that open area mattered.",
      "The students next visited the small local library, where the librarian, U Ba, helped them search through newspapers and town records. They found reports about several floods, including one that had happened during a year with unusually heavy rain in the hills. An old map showed wetlands and ponds that no longer existed. New roads and buildings had replaced many of them. U Ba explained that wetlands acted like natural bowls: they held extra rainwater and released it slowly. When wetlands disappeared, more water rushed directly toward the river. Lina copied the map with a ruler, marking the former ponds in blue and newer buildings in red. The task took longer than expected because some place names had changed. Rather than guessing, the children compared two maps and asked the librarian about the differences. They learned that reliable research often involved patient checking and admitting when information was uncertain.",
      "Arun suggested that the team measure the river every day, but Mr Daniel explained that students should not approach the bank alone or try to measure dangerous water. Instead, the school contacted the town engineering office. An engineer named Ms Khin agreed to show them a safe staff gauge fixed beside a protected viewing platform. She taught them how to read the scale and explained that one measurement could not predict a flood. Rainfall, soil conditions, upstream water, and the shape of the river all mattered. The students recorded readings with an adult present and compared them with rainfall reports. Ms Khin also showed them how to organise a table so that dates and units were clear. Lina discovered that a neat chart could reveal changes more easily than pages of notes. She began plotting the numbers and marked days when the water rose quickly after storms far away.",
      "As their investigation continued, the team noticed that rubbish gathered near a narrow bend below the market. Plastic bags, broken baskets, and fallen branches slowed the flow around a drainage opening. Some residents blamed careless visitors, while others said rubbish came from streets washed clean by rain. The students did not want to accuse anyone without proof. They photographed the blocked opening from the safe path, counted the visible kinds of waste, and asked the sanitation team how rubbish was collected. A worker explained that the drain was too small for large branches and that a damaged screen had not been replaced. The children wrote down both the problem and the limits of their observations. They could not know exactly where every item had come from, but they could show that the blockage reduced the space available for water. Their report began to focus on solutions rather than blame.",
      "Lina’s grandmother offered another kind of evidence. She took the children to an older garden where fruit trees stood above the bank. Their roots held the soil together, and thick plants slowed rain as it crossed the ground. Daw May remembered when the hillside beyond the garden had been covered with trees. Over the years, some trees had been cut down for timber and new fields. Without roots and leaf litter, heavy rain washed soil downhill, making the river muddy. The children compared the garden with a bare patch nearby. After a light shower, small streams ran across the bare earth, carrying brown soil into a ditch. In the garden, water soaked into the ground more slowly. Daw May reminded them that one visit could not prove every cause, but it could suggest questions worth studying. Lina added a section about trees and soil to their notebook.",
      "A few days later, a strong storm passed over the distant hills while Willowbrook received only a little rain. The next morning, Lina crossed the bridge and saw the river higher than it had been all week. The water moved quickly, carrying leaves and branches. She did not go closer. Instead, she told her father, who checked the official river notice and contacted the town office when the level continued to rise. The school postponed outdoor activities until the warning was lifted. Lina’s notes helped her explain why local sunshine did not mean the river was safe. The experience made the project feel less like homework and more like a responsibility. Mr Daniel praised the students for reporting their observations without spreading rumours. He reminded the class to follow official warnings and never rely on a child’s notebook as an emergency forecast. Lina wrote that evidence could support good decisions, but safety instructions must come from responsible authorities.",
      "The team decided to ask residents what information they needed during heavy rain. They prepared a short questionnaire with simple questions: Where would you go if the river rose? Which official channel would you trust? Could you help a neighbour who needed assistance? With their teacher present, they spoke to shopkeepers, parents, older residents, and people who lived in lower streets. Some knew the school hall was on higher ground, but others did not know whether it would be open during an emergency. A few residents had received warnings through family messages, while others depended on a radio. The children learned that information was useful only when people could receive and understand it. They avoided collecting private details and recorded answers without names. Their results showed that the town needed a clear, shared plan, not just more measurements of the river.",
      "At the next town meeting, Lina and her classmates presented their first findings. They were nervous when they stood before shop owners, farmers, engineers, and local officials. Arun showed the maps, May Thiri explained the rubbish survey, and Lina described the water-level records. They spoke carefully about what they knew and what they still needed to learn. One shop owner objected that floods were caused only by unusually heavy rain. Ms Khin agreed that rainfall was important but explained how blocked drains, lost wetlands, and construction near the bank could increase the damage. The students did not claim that one simple action would prevent every flood. Instead, they proposed several practical steps: repair the drainage screen, clear waste safely, protect remaining wetland, plant suitable trees, and create a warning plan. Their calm presentation helped turn disagreement into a useful discussion.",
      "Not everyone supported the proposals. A builder argued that the old wetland was wasted land and that new shops would bring jobs. Some families worried that planting trees would take space away from crops. The students listened instead of dismissing these concerns. Mr Daniel helped them compare short-term benefits with long-term risks. Ms Khin explained that development could continue more safely if buildings were kept away from the most vulnerable areas and drainage was designed properly. A farmer suggested planting native trees along a narrow strip where crops were already difficult to grow. The librarian proposed a public display showing old maps beside current photographs. Lina realised that caring for a town meant balancing different needs rather than insisting that everyone agree immediately. She added a page to the project called “Questions We Must Keep Discussing,” because a useful plan should allow people to raise concerns and improve the details.",
      "The town council agreed to inspect the damaged drainage screen and asked the sanitation team to remove the rubbish when conditions were safe. Volunteers could help sort waste from the dry path, but no child would enter the river or handle dangerous material. Lina’s school organised a clean-up day on the market streets, where adults provided gloves, bags, drinking water, and clear instructions. Students separated recyclable items where a collection service was available and recorded the amount gathered. They discovered that the same drain filled again when people dropped wrappers near the market stalls. A one-day clean-up could not solve a repeated problem, so the class designed simple signs and asked shopkeepers to place bins where customers could reach them. The students also suggested a weekly check by trained adults. The project was becoming a set of habits that could be maintained, not a single event that would be forgotten.",
      "Meanwhile, May Thiri worked with the librarian to create a large map for the library wall. It showed the river, the bridge, the school, the clinic, higher ground, and roads that might become difficult during floods. The map did not include private home addresses. Instead, it marked public meeting points and safe routes confirmed by town officials. A legend explained each symbol, and the date of the latest review appeared at the bottom. The children invited residents to check whether the labels were easy to understand. An older man pointed out that one lane became muddy even after moderate rain, while a nurse suggested marking the clinic entrance that stayed accessible longer. The team updated the map after verifying each suggestion. Lina learned that a map was not finished simply because it looked attractive; it had to be accurate, readable, and regularly checked by people who understood the area.",
      "The school then held a practice drill approved by local officials. Teachers explained the signal that would mean students should move calmly to the assembly point. Classes practised leaving their rooms without pushing, following marked routes, and listening to staff instructions. The exercise included students who walked slowly or needed help hearing announcements. Teachers checked that everyone knew which adult to follow and where to wait for family members. Lina had expected the drill to be simple, but she saw how confusion could arise when two groups reached a narrow doorway at the same time. Afterward, the school adjusted the route and repeated the practice. No one treated the exercise as a game or frightened younger children with dramatic stories. The purpose was to make safe actions familiar before a real emergency. Lina wrote that preparation should build confidence, not panic, and that every plan needed to include people with different needs.",
      "During the following month, the river remained calm, and some residents began to lose interest. Lina understood why: everyday work was demanding, and a danger that was not visible could feel unimportant. To keep people informed, the students prepared a short monthly river report using verified readings, rainfall information, and notes from the town office. They displayed it at the library and school, clearly separating measured facts from suggestions. They also explained that the report was educational and not a substitute for official alerts. A few people corrected a date, and the team thanked them and fixed the mistake. This made the report more trustworthy. The children discovered that sharing information required more than publishing numbers; they had to explain what the numbers meant, where they came from, and what they could not tell anyone. Accuracy became a habit they practised together.",
      "One afternoon, Lina noticed that a family had begun building a fence across a low path leading toward the old wetland. She worried that the path might be blocked, but she did not argue with the family. She asked a town officer whether the route was public and learned that the boundary was unclear on an old plan. The officer arranged a visit with the family and the survey team. Together they checked the records and found a way to keep a narrow access route open while respecting the family’s property. Lina saw that even a well-intentioned warning could create conflict if it was based on incomplete information. The correct response was to ask questions, find reliable records, and involve the people responsible for the decision. She added the experience to her project as an example of solving problems respectfully rather than spreading accusations.",
      "The rainy season returned earlier than expected. Dark clouds gathered over the hills for three days, and the official notices warned that water might rise quickly. The town office sent updates through the radio, notice boards, and the school’s approved message channel. Shopkeepers moved goods from low shelves, families checked medicines and important documents, and volunteers confirmed that the community hall had clean water and basic supplies. Lina’s father helped an elderly neighbour secure a bicycle and carry a small bag to a relative’s house on higher ground. Lina and her classmates stayed with their families and followed adult instructions; they did not go to the bridge to collect photographs. The river began to swell after midnight, and by morning the lower road was covered with water. Because the warning had arrived early, most people had already moved away from the most exposed places.",
      "The flood was serious, but the town’s preparation reduced confusion. Officials closed the unsafe bridge and directed residents along the verified route to higher ground. The school hall opened as a temporary shelter, with separate areas for families, first aid, drinking water, and quiet rest. Teachers and volunteers checked names to help families find one another, while protecting personal information from public display. The clinic arranged medicine for people who needed regular treatment. Some residents were frightened, and children asked when they could return home. Adults gave honest updates instead of promising that the water would fall at a particular time. Lina helped sort clean blankets and picture books at the hall under her teacher’s supervision. She saw that an emergency plan was not only a map or a warning; it depended on calm people doing clear jobs and treating everyone with respect.",
      "Near midday, a message spread that the old bridge had collapsed. People began to worry, but no one at the shelter could confirm the report. Mr Daniel asked everyone not to forward it until officials checked. A town officer later announced that the bridge was still standing but had been closed because the current was too strong. The correction stopped a wave of unnecessary fear. Lina remembered how easily a dramatic claim could travel faster than a verified fact. She helped write the official update on the shelter notice board, including the time it had been confirmed and the office responsible for the information. The event taught the students an important lesson about communication: a message should say what is known, avoid guessing, and direct people to a trusted source. During an emergency, responsible sharing can protect people just as surely as a useful physical barrier.",
      "By the second evening, the rain weakened and the river began to fall. Officials did not immediately allow people to return. Teams inspected roads, electrical lines, buildings, and the bridge for damage. The clinic reminded residents to avoid floodwater, which could contain sewage, sharp objects, or chemicals. When families were finally permitted to return to certain streets, they received clear instructions about which areas remained closed. Lina went home with her father and grandmother, staying on the approved route. Their ground floor was damp, but their important documents had been stored high and their neighbours helped move wet furniture into the sun. Daw May was sad to see several vegetable beds ruined, yet she was grateful that the family was safe. They took photographs of the damage only after officials said it was safe, so the images could help with repair records rather than put anyone at risk.",
      "The days after the flood were full of work. Residents cleaned mud from homes, checked drinking-water supplies, and reported damaged drains. The town arranged safe collection of broken furniture and contaminated waste. Volunteers offered food and helped older residents contact relatives. The students did not handle sharp or dirty objects; instead, they helped the library prepare a list of damaged books and sorted clean donations under adult supervision. U Ba created a temporary reading corner in a dry room so children could have a calm place while repairs continued. Lina noticed that recovery was not the same for every family. Some had insurance or relatives elsewhere, while others had lost tools needed for their jobs. The town began recording needs so assistance could be distributed fairly. Lina wrote that kindness mattered, but good organisation helped kindness reach the people who needed it most.",
      "When the water fully receded, the students returned to the river with Ms Khin and other adults. They compared the new high-water mark with their earlier measurements and photographed changes from safe viewpoints. The river had moved soil from one bend and deposited it near a stand of reeds. Some small trees had fallen, but the protected garden above the bank remained mostly intact. The team did not assume that one flood proved every idea in their report. Instead, they updated their evidence and asked engineers to explain which changes were normal and which required attention. Ms Khin showed them how repeated measurements over several seasons could reveal a pattern. Lina understood that science was not about finding a single dramatic answer; it was about collecting observations, testing explanations, and being willing to revise conclusions when new evidence appeared.",
      "The council invited the students to share what they had learned at a public meeting. This time, they presented the project as a cycle: observe, check, plan, practise, review, and improve. They showed how the repaired drain reduced one blockage, why the wetland needed protection, and how the warning drill helped residents understand where to go. They also admitted that some questions remained unanswered, including how rainfall patterns might change over the coming years. Officials agreed to review building rules near the river, maintain public warning channels, and seek expert advice before making larger changes. Local farmers volunteered to test native plants along a suitable strip of bank. The students asked that progress be reviewed each year rather than forgotten after the flood. The meeting ended with tasks assigned to named offices and community groups, making the plan easier to follow and measure.",
      "Over the next several months, small improvements began to appear. The drainage screen was checked on a schedule, market bins were emptied more reliably, and signs reminded visitors to keep rubbish out of the water. The library displayed the river map and monthly report beside a box where residents could suggest corrections. A group of farmers and volunteers planted native trees in agreed locations, choosing species suited to the soil and leaving enough room for crops and paths. The school repeated its safety drill and updated the route after road repairs. None of these actions made Willowbrook invulnerable to floods, and the officials said so clearly. Their purpose was to reduce avoidable risks and make the community better prepared. Lina found this honest message reassuring. It was more useful to promise steady improvement than to claim that nature could be controlled completely.",
      "A year after the school project began, Lina opened her original notebook and read the first pages. At first she had written only the water level and weather, believing that a careful list might reveal the river’s secret. Now the notebook contained maps, interviews, measurements, corrections, questions, and records of decisions. Some early guesses had proved wrong, and she was glad she had marked them as guesses rather than facts. She had learned to ask permission before copying photographs, protect people’s private information, and check a message before sharing it. Most importantly, she had discovered that a community could learn from both its mistakes and its successes. Her father said that a town was like a bicycle: it worked best when many parts were maintained together. Lina smiled at the comparison and added one final note to her notebook.",
      "On the anniversary of the flood, the school invited residents to the library for a small exhibition. The walls displayed the old maps, the students’ water-level chart, photographs of the repaired drain, and stories from people who had helped their neighbours. The exhibition did not celebrate the flood itself. It recognised the people who had prepared carefully, shared reliable information, and worked together afterward. Daw Hnin brought her old bridge photograph and explained how the town had changed since she first operated a boat. Younger children asked Lina how to read the river gauge, and she showed them the safe viewing platform on the map. She told them never to approach fast water and always to follow official instructions. Mr Daniel praised the class for showing that learning could lead to practical service. Visitors left suggestions for the next year’s project, including checking drinking-water access and improving shade near the shelter.",
      "During the next school term, Mr Daniel asked Lina to help younger students start their own observation notebooks. She did not tell them to copy her work. Instead, she showed them how to write the date, describe what they could actually see, and separate a fact from a guess. One child wrote that every dark cloud meant a flood was coming. Lina asked what evidence might help test that idea, and the class compared the statement with official rainfall and river reports. They learned that clouds could bring different amounts of rain and that the river might rise because of weather far away. The children practised asking questions without feeling embarrassed when they did not know an answer. Lina was surprised by how much she learned while teaching. Explaining an idea clearly revealed gaps in her own understanding, so she returned to the engineer’s notes and checked the details before answering.",
      "The school also invited a nurse to talk about health after floods. She explained that water that looked clear could still be unsafe, and that people should follow local advice about drinking water, cleaning wounds, and returning to damaged buildings. Students made a simple information sheet using language younger children could understand. They checked each sentence with the nurse rather than inventing medical advice themselves. The sheet included the clinic’s official contact route and reminded families to ask qualified staff when they were unsure. Lina learned that good communication had to match the subject: students could help make information easier to read, but trained health workers needed to confirm health guidance. The class translated the key points into languages used by families in Willowbrook and asked adults to review the wording. Their work helped more residents understand the instructions without replacing professional advice.",
      "Arun wanted to build a miniature model of the town to show how water travelled across the valley. The students used cardboard, clay, and recycled boxes, carefully labelling the river, hills, wetland, roads, and buildings. Their first model sent too much water directly into the town because the hills were too steep and the wetland was too small. Rather than hiding the mistake, they changed the shape and ran the demonstration again. The model was not a scientific forecast, and they labelled it clearly as a learning tool. Still, it helped visitors understand why land use upstream could affect streets downstream. Ms Khin reminded them that real landscapes were more complex than a classroom model. Lina added a note explaining what the model could show and what it could not prove. She liked that the team could improve an imperfect idea by testing it openly.",
      "As the exhibition grew, the students discussed how to keep their records useful after they graduated. They created a shared folder at school for approved maps, public reports, and the dates when each item had been checked. Personal interviews were stored only with permission, and private details were left out of public displays. A teacher was responsible for keeping the records organised and deciding who could update them. The team wrote down how to correct a mistake: note the old version, confirm the new information, record who checked it, and show the date of the change. This process seemed less exciting than collecting new photographs, but it protected the project from confusion. Lina realised that information could become dangerous when old instructions looked current or when people could not tell a verified report from an unconfirmed message.",
      "One Saturday, the market association held a meeting about keeping streets clean during the rainy season. Some sellers worried that bins would take up space, while others said overflowing waste already made their stalls unpleasant. The group walked through the market with a sanitation worker and identified places where bins would be reachable without blocking customers or emergency access. They agreed on a collection schedule and asked each stall to keep the area nearby clear. The town printed a small sign showing what could go into each container, using pictures for people who did not read the same language. The plan was reviewed after two weeks, and one bin was moved because it stood too close to a narrow walkway. Lina liked seeing a community solution adjusted after people tried it in real life. A useful plan was not one that never changed, but one that responded responsibly to evidence.",
      "Lina’s father helped repair bicycles for volunteers who needed to travel between the shelter, clinic, and higher streets during recovery. He checked brakes, lights, and tyres before returning each bicycle, because a quick repair that ignored safety could cause another problem. Lina helped write down which tools and spare parts were used, while her father made the technical decisions. Several neighbours donated small amounts of money or useful equipment, and the shop displayed a clear list of what had been received and how it was used. The records prevented misunderstandings and made it easier to thank people accurately. Lina noticed that trust grew when helpers explained their decisions and admitted what they could not do. Community work was not only about generosity; it also needed careful planning, safe methods, and honest records.",
      "At the end of the year, Lina returned to the stone by the bridge and added the latest official water mark to her chart. She did not write that the town was now safe from every future flood. Instead, she recorded the improvements, the remaining concerns, and the date when the information should be reviewed again. She noted that the drain still needed regular checks, the trees needed care, and the warning plan depended on reliable communication. Her classmates added their own reflections about what had worked and what should change next time. Mr Daniel told them that responsibility did not mean being certain about everything; it meant being honest about evidence and continuing to learn. Lina closed the notebook with a sense of quiet pride. The river would keep changing, but Willowbrook had become better at watching carefully, sharing knowledge, and helping one another prepare.",
      "In the quiet weeks that followed, Lina returned to her favourite place above the river, where the old garden met the grassy slope. She watched clouds travel over the hills and listened to water moving around the bend. The river looked peaceful, but she no longer confused peace with certainty. She knew that careful measurements, healthy wetlands, safe buildings, clear warnings, and neighbours who trusted one another all played a part in resilience. She also knew that no notebook could replace trained experts or official emergency information. Her work was only one small contribution, but it had helped adults ask better questions and make a few useful changes. Lina closed the notebook and looked toward Willowbrook, where market stalls were opening and children were walking to school. The river continued on its way, carrying leaves and reflections toward the hills. Lina felt ready to keep learning, because caring for a place was never a finished task."
    ].join("\n\n"),
    paragraphTranslations: [
      "စိမ်းလန်းကျယ်ဝန်းသော ချိုင့်ဝှမ်း၏အစွန်းတွင် ဝီလိုးဘရွတ်မြို့လေး တည်ရှိပြီး မြစ်တစ်စင်းသည် ဝေးလံသောတောင်ကုန်းများကြားသို့ ပျောက်ကွယ်မသွားမီ လယ်ယာများကြားမှ ကွေ့ကောက်စီးဆင်းနေသည်။ ထိုမြစ်သည် မြို့သူမြို့သားများအတွက် သောက်သုံးရေ၊ ငါး၊ မြေဆီဩဇာကောင်းသော မြေကြီးနှင့် လှေငယ်များသွားလာနိုင်သည့် ရေလမ်းကို ပေးစွမ်းသည်။ ကလေးများသည် အဝေးရှိမြို့များ၏အမည်များကို မသင်ယူမီ မြစ်၏ကွေ့ကောက်ရာများကို သိရှိနေကြသည်။ နွေရာသီတွင် တံတားအောက်၌ ငွေရောင်ငါးများကို ကြည့်ကြပြီး ဆောင်းရာသီတွင် ရေခဲလွှာပါးများအောက်မှ ရေစီးသံကို နားထောင်ကြသည်။ မိဘများနှင့် အဘိုးအဘွားများသည် မျိုးဆက်များစွာ မြစ်ကမ်းဘေးတွင် နေထိုင်လာခဲ့ကြသောကြောင့် လူအများစုက မြစ်၏အခြေအနေကို ကြိုတင်ခန့်မှန်းနိုင်သည်ဟု ယုံကြည်ကြသည်။ သို့သော် မြစ်သည် ပြောင်းလဲလာနေပြီဖြစ်သည်။ မိုးရာသီသည် ယခင်ကလောက် ပုံမှန်မဖြစ်တော့ဘဲ တောင်စောင်းများပေါ်ရှိ သစ်ပင်များ လျော့နည်းလာကာ မြစ်နှင့်နီးသောနေရာများတွင် အိမ်အသစ်များ ဆောက်လုပ်လာကြသည်။ အသက် ၁၂ နှစ်အရွယ် လီနာသည် ထိုပြောင်းလဲမှုများကို သတိပြုမိသော်လည်း လူကြီးများက မြစ်များသည် ယခင်ကတည်းက ရေတက်ရေကျဖြစ်တတ်ကြောင်း မကြာခဏ ပြောကြသည်။ သူမသည် မိမိမြင်တွေ့သမျှကို မှတ်စုစာအုပ်ထဲတွင် စတင်မှတ်တမ်းတင်ပြီး ဂရုတစိုက်လေ့လာခြင်းက မိမိအိမ်ဟု ခေါ်သောနေရာကို နားလည်ရန် အထောက်အကူဖြစ်မည်ဟု မျှော်လင့်ခဲ့သည်။",
      "လီနာသည် စက်ဘီးများကို ပြုပြင်ပေးသော ဖခင်နှင့် မြစ်ကမ်းဘေးတွင် တစ်ဘဝလုံး ဟင်းသီးဟင်းရွက်စိုက်ပျိုးခဲ့သော အဘွား ဒေါ်မေတို့နှင့်အတူ နေထိုင်သည်။ သူတို့၏အိမ်သည် ဈေးသွားလမ်းအထက်ရှိ အနည်းငယ်စောင်းသော မြေပြင်ပေါ်တွင် တည်ရှိသည်။ မနက်တိုင်း လီနာသည် သစ်သားတံတားဟောင်းကို ဖြတ်ကာ ကျောင်းသို့သွားပြီး မြစ်ကမ်းအနီး ကျောက်တုံးပေါ်တွင် ဆေးခြယ်ထားသော အမှတ်များကို ရေတွက်ကြည့်သည်။ ထိုအမှတ်များက ယခင်နှစ်များက ရေမည်မျှမြင့်တက်ခဲ့သည်ကို ပြသပေးသည်။ သူမ၏ဆရာ မစ္စတာဒန်နီယယ်က ခန့်မှန်းပြောဆိုခြင်းထက် တိုင်းတာချက်များက ပိုအသုံးဝင်ကြောင်း ရှင်းပြထားသဖြင့် လီနာသည် တံတားကို ဖြတ်သွားတိုင်း ရက်စွဲ၊ ရာသီဥတုနှင့် ရေအမြင့်ကို ရေးမှတ်သည်။ ရေ၏အရောင်၊ ကျူပင်များကြားတွင် ငြိနေသောအမှိုက်ပမာဏနှင့် ကမ်းစပ်အနီး ငှက်များ အသိုက်ဆောက်နေခြင်း ရှိမရှိကိုလည်း မှတ်တမ်းတင်သည်။ အစပိုင်းတွင် ထိုမှတ်စုစာအုပ်သည် သူမတစ်ဦးတည်းကစားသည့် ဂိမ်းတစ်ခုလိုသာ ထင်ရသည်။ သို့သော် တဖြည်းဖြည်းနှင့် သူမသည် ပုံစံတစ်ခုကို သတိထားမိလာသည်—မြစ်ညာဘက်တွင် မိုးသည်းထန်စွာရွာပြီးနောက် ဝီလိုးဘရွတ်မြို့တွင် မိုးမရွာဘဲ ခြောက်သွေ့နေသော်လည်း မြစ်ရေတက်လာတတ်သည်။",
      "တနင်္လာနေ့တစ်နေ့တွင် မစ္စတာဒန်နီယယ်က “ကျွန်ုပ်တို့မြို့၊ ကျွန်ုပ်တို့အနာဂတ်” ဟု အမည်ပေးထားသော ကျောင်းပရောဂျက်တစ်ခုကို ကြေညာခဲ့သည်။ အဖွဲ့တိုင်းသည် ဒေသတွင်းပြဿနာတစ်ခုကို စုံစမ်းလေ့လာပြီး လက်တွေ့အသုံးဝင်သော ဖြေရှင်းနည်းတစ်ခုကို အကြံပြုရမည်ဖြစ်သည်။ ကျောင်းသားအချို့က ယာဉ်ကြောပိတ်ဆို့မှု၊ အမှိုက်ပြဿနာ သို့မဟုတ် ကစားရန်နေရာမလုံလောက်မှုတို့ကို ရွေးချယ်ကြသည်။ လီနာက မြစ်အကြောင်း လေ့လာရန် အဆိုပြုခဲ့သည်။ သူမ၏အတန်းဖော် အာရွန်နှင့် မေသီရိတို့ကလည်း ပူးပေါင်းလာကြပြီး အာရွန်က အစီရင်ခံစာရေးခြင်းထက် ပုံစံငယ်များတည်ဆောက်ရခြင်းကို ပိုနှစ်သက်ကြောင်း ဝန်ခံခဲ့သည်။ မစ္စတာဒန်နီယယ်က အကြံကို အတည်ပြုပေးပြီး ဘေးကင်းစွာလုပ်ဆောင်ရန် သတိပေးခဲ့သည်—ရေစီးသန်ပြီး အန္တရာယ်ရှိသော ရေထဲသို့ မဝင်ရ၊ မတည်ငြိမ်သော မြစ်ကမ်းပါးများပေါ်သို့ မတက်ရ၊ လူကြီးတစ်ဦးမပါဘဲ ရေနမူနာများ မကောက်ယူရပေ။ သူတို့သည် ဒေသခံများကို မေးမြန်းရန်၊ မြေပုံဆွဲရန်၊ ဓာတ်ပုံဟောင်းများကို နှိုင်းယှဉ်ရန်နှင့် မြစ်က မြို့၏မတူညီသောနေရာများအပေါ် မည်သို့သက်ရောက်သည်ကို ရှာဖွေရန် စီစဉ်ကြသည်။ လီနာသည် စိတ်လှုပ်ရှားပျော်ရွှင်နေသော်လည်း ကောင်းမွန်သောပရောဂျက်တစ်ခုတွင် စိတ်ဝင်စားဖွယ်ဇာတ်လမ်းတစ်ခုသာမက သက်သေအထောက်အထားများလည်း လိုအပ်ကြောင်း နားလည်ထားသည်။ ကျောင်းသားသုံးဦးသည် လုပ်ငန်းတာဝန်များကို ခွဲဝေယူပြီး အင်္ဂါနေ့တိုင်း ကျောင်းဆင်းပြီးနောက် တွေ့ဆုံရန် သဘောတူခဲ့ကြသည်။",
      "သူတို့၏ပထမဆုံးမေးမြန်းမှုကို ဈေးအနီးတွင် နေထိုင်သော အငြိမ်းစားလှေမောင်းသူ ဒေါ်နှင်းနှင့် ပြုလုပ်ခဲ့သည်။ လွန်ခဲ့သောနှစ်နှစ်ဆယ်က ရေကြီးမှုတစ်ခုဖြစ်ခဲ့ပြီး ရေသည် ဆိုင်အချို့ထဲသို့ ဝင်ရောက်ကာ သစ်သားကုန်သေတ္တာများကို မျောပါသွားစေခဲ့ကြောင်း သူမမှတ်မိသည်။ အိမ်နီးချင်းများက ဆန်၊ ဆေးဝါးနှင့် ကလေးများကို မြင့်သောနေရာသို့ ရွှေ့ပြောင်းရာတွင် အချင်းချင်းကူညီခဲ့ကြပုံကိုလည်း သူမမှတ်မိသည်။ “ရေက ကြောက်စရာကောင်းတယ်၊ ဒါပေမဲ့ ရှုပ်ထွေးမှုတွေကြောင့် ပိုဆိုးသွားတယ်” ဟု သူမက ပြောပြသည်။ လူအချို့သည် သတိပေးချက်များကို နောက်ကျမှကြားခဲ့ကြပြီး အချို့မှာ ဘယ်နေရာသို့သွားရမည်ကို မသိခဲ့ကြပါ။ ဒေါ်နှင်းက ရေများဝန်းရံနေသော တံတားဟောင်း၏ ဓာတ်ပုံတစ်ပုံကို ပြသခဲ့သည်။ လီနာသည် ဓာတ်ပုံနောက်ကျောတွင် ရေးထားသောနှစ်ကို ဂရုတစိုက်မှတ်သားပြီး ပရောဂျက်အတွက် ဓာတ်ပုံကို ကူးယူခွင့်တောင်းခဲ့သည်။ သူတို့မပြန်မီ ဒေါ်နှင်းက မြစ်ကမ်းပါးနှင့် နီးကပ်စွာ ဆောက်ထားသော အဆောက်အအုံအသစ်တန်းကို ညွှန်ပြခဲ့သည်။ ထိုမြေနေရာသည် ယခင်က လှေများ ဘေးကင်းစွာ ရပ်နားနိုင်သော မြက်ခင်းပြင်တစ်ခုဖြစ်ခဲ့သည်။ လီနာက ထိုအချက်အလက်ကို မြေပုံထဲသို့ ထည့်သွင်းပြီး ထိုပွင့်လင်းသောနေရာ၏ အရေးပါမှုကို မြို့သူမြို့သားများ မေ့လျော့သွားကြသလားဟု စဉ်းစားမိသည်။",
      "ထို့နောက် ကျောင်းသားများသည် ဒေသခံစာကြည့်တိုက်ငယ်သို့ သွားကြပြီး စာကြည့်တိုက်မှူး ဦးဘက သတင်းစာများနှင့် မြို့မှတ်တမ်းများကို ရှာဖွေရာတွင် ကူညီပေးခဲ့သည်။ သူတို့သည် ရေကြီးမှုအကြောင်း မှတ်တမ်းများစွာကို တွေ့ရှိခဲ့ပြီး တောင်ကုန်းများတွင် ပုံမှန်ထက် မိုးအလွန်သည်းထန်စွာရွာခဲ့သောနှစ်တစ်နှစ်က ဖြစ်ပွားခဲ့သည့် ရေကြီးမှုလည်း ပါဝင်သည်။ မြေပုံဟောင်းတစ်ခုတွင် ယခုမရှိတော့သော စိုစွတ်မြေများနှင့် ရေကန်ငယ်များကို ပြထားသည်။ လမ်းသစ်များနှင့် အဆောက်အအုံများက ထိုနေရာအများအပြားကို အစားထိုးခဲ့ကြသည်။ ဦးဘက စိုစွတ်မြေများသည် သဘာဝပန်းကန်လုံးများကဲ့သို့ လုပ်ဆောင်ကြောင်း—မိုးရေပိုလျှံမှုကို ထိန်းသိမ်းထားပြီး ဖြည်းဖြည်းချင်း ပြန်လွှတ်ပေးကြောင်း—ရှင်းပြသည်။ စိုစွတ်မြေများ ပျောက်ကွယ်သွားသောအခါ ရေပိုများသည် မြစ်ဘက်သို့ တိုက်ရိုက် အလျင်အမြန် စီးဆင်းလာသည်။ လီနာသည် ပေတံဖြင့် မြေပုံကို ကူးရေးပြီး ယခင်ရေကန်များကို အပြာရောင်ဖြင့်၊ အဆောက်အအုံအသစ်များကို အနီရောင်ဖြင့် အမှတ်အသားပြုသည်။ နေရာအမည်အချို့ ပြောင်းလဲသွားသောကြောင့် ထိုအလုပ်သည် မျှော်လင့်ထားသည်ထက် ပိုကြာခဲ့သည်။ ခန့်မှန်းပြောဆိုမည့်အစား ကလေးများသည် မြေပုံနှစ်ခုကို နှိုင်းယှဉ်ပြီး ကွာခြားချက်များအကြောင်း စာကြည့်တိုက်မှူးကို မေးမြန်းကြသည်။ ယုံကြည်စိတ်ချရသော သုတေသနတစ်ခုတွင် စိတ်ရှည်စွာ စစ်ဆေးခြင်းနှင့် အချက်အလက်မသေချာသည့်အခါ ဝန်ခံခြင်းတို့ လိုအပ်ကြောင်း သူတို့သင်ယူခဲ့ကြသည်။",
      "အဖွဲ့သည် မြစ်ရေကို နေ့စဉ်တိုင်းတာရန် အကြံပြုခဲ့သော်လည်း မစ္စတာဒန်နီယယ်က ကျောင်းသားများသည် တစ်ယောက်တည်း မြစ်ကမ်းသို့ မချဉ်းကပ်သင့်သလို အန္တရာယ်ရှိသောရေကိုလည်း မတိုင်းတာသင့်ကြောင်း ရှင်းပြခဲ့သည်။ ထို့ကြောင့် ကျောင်းက မြို့၏ အင်ဂျင်နီယာရုံးသို့ ဆက်သွယ်ခဲ့သည်။ မစ္စခင်အမည်ရှိ အင်ဂျင်နီယာတစ်ဦးက အကာအကွယ်ရှိသော ကြည့်ရှုစင်ဘေးတွင် ခိုင်မြဲစွာတပ်ဆင်ထားသည့် ရေအမြင့်တိုင်းကိရိယာကို ပြသပေးရန် သဘောတူခဲ့သည်။ သူမသည် စကေးကို ဖတ်နည်းသင်ပေးပြီး တိုင်းတာချက်တစ်ခုတည်းဖြင့် ရေကြီးမှုကို ကြိုတင်မခန့်မှန်းနိုင်ကြောင်း ရှင်းပြခဲ့သည်။ မိုးရေချိန်၊ မြေဆီလွှာအခြေအနေ၊ မြစ်ညာဘက်မှ စီးဝင်လာသောရေနှင့် မြစ်၏ပုံသဏ္ဌာန်တို့အားလုံး အရေးကြီးသည်။ လူကြီးတစ်ဦး ရှိနေစဉ် ကျောင်းသားများသည် ရေအမြင့်ကို မှတ်တမ်းတင်ပြီး မိုးရေချိန်အစီရင်ခံစာများနှင့် နှိုင်းယှဉ်ခဲ့ကြသည်။ ရက်စွဲများနှင့် တိုင်းတာယူနစ်များကို ရှင်းလင်းစွာဖော်ပြနိုင်ရန် ဇယားတစ်ခု စီစဉ်နည်းကိုလည်း မစ္စခင်က ပြသခဲ့သည်။ မှတ်စုစာမျက်နှာများစွာထက် သပ်ရပ်သောဇယားတစ်ခုက ပြောင်းလဲမှုများကို ပိုမိုလွယ်ကူစွာ ဖော်ပြနိုင်ကြောင်း လီနာသိလာသည်။ သူမသည် ကိန်းဂဏန်းများကို ဂရပ်ပေါ်တွင် အမှတ်ချပြီး အဝေးရှိဒေသများတွင် မုန်တိုင်းတိုက်ပြီးနောက် မြစ်ရေ လျင်မြန်စွာတက်ခဲ့သည့်ရက်များကို မှတ်သားခဲ့သည်။",
      "သူတို့၏စုံစမ်းလေ့လာမှု ဆက်လက်လုပ်ဆောင်နေစဉ် ဈေးအောက်ဘက်ရှိ မြစ်၏ကျဉ်းမြောင်းသောကွေ့တစ်ခုအနီးတွင် အမှိုက်များ စုပုံနေသည်ကို အဖွဲ့က သတိပြုမိခဲ့သည်။ ပလတ်စတစ်အိတ်များ၊ ကျိုးနေသောခြင်းများနှင့် ကျလာသောသစ်ကိုင်းများက ရေထုတ်မြောင်းဝအနီး ရေစီးဆင်းမှုကို နှေးကွေးစေခဲ့သည်။ အချို့ဒေသခံများက ဂရုမစိုက်သော လာရောက်လည်ပတ်သူများကို အပြစ်တင်ကြသော်လည်း အချို့က မိုးရေကြောင့် သန့်စင်သွားသောလမ်းများမှ အမှိုက်များ ပါလာခြင်းဖြစ်သည်ဟု ဆိုကြသည်။ သက်သေမရှိဘဲ မည်သူ့ကိုမျှ စွပ်စွဲရန် ကျောင်းသားများ မလိုလားကြပါ။ သူတို့သည် လုံခြုံသောလမ်းမှ ပိတ်ဆို့နေသော ရေထုတ်ပေါက်ကို ဓာတ်ပုံရိုက်ပြီး မြင်တွေ့ရသော အမှိုက်အမျိုးအစားများကို ရေတွက်ကာ အမှိုက်များကို မည်သို့စုဆောင်းကြောင်း သန့်ရှင်းရေးအဖွဲ့ကို မေးမြန်းခဲ့ကြသည်။ ရေမြောင်းသည် သစ်ကိုင်းကြီးများအတွက် သေးငယ်လွန်းပြီး ပျက်စီးနေသော အကာစကာကိုလည်း အစားမထိုးရသေးကြောင်း အလုပ်သမားတစ်ဦးက ရှင်းပြခဲ့သည်။ ကလေးများသည် ပြဿနာကိုသာမက မိမိတို့၏လေ့လာချက်များတွင် ရှိသောကန့်သတ်ချက်များကိုပါ မှတ်တမ်းတင်ခဲ့ကြသည်။ အမှိုက်တစ်ခုချင်းစီ ဘယ်ကလာသည်ကို အတိအကျမသိနိုင်သော်လည်း ပိတ်ဆို့မှုကြောင့် ရေစီးရန်နေရာ လျော့နည်းသွားကြောင်းကို ပြသနိုင်ခဲ့ကြသည်။ ထို့ကြောင့် သူတို့၏အစီရင်ခံစာသည် အပြစ်တင်ခြင်းထက် ဖြေရှင်းနည်းများကို အဓိကထားလာခဲ့သည်။",
      "လီနာ၏အဘွားက သက်သေအထောက်အထားနောက်တစ်မျိုးကို ပြသပေးခဲ့သည်။ သူမသည် ကလေးများကို မြစ်ကမ်းပါးအထက်တွင် သစ်သီးပင်များပေါက်နေသော ဥယျာဉ်ဟောင်းတစ်ခုသို့ ခေါ်သွားခဲ့သည်။ သစ်ပင်အမြစ်များက မြေဆီလွှာကို အတူတကွ ထိန်းထားပြီး ထူထပ်သောအပင်များက မြေပြင်ပေါ် ဖြတ်သန်းစီးဆင်းသော မိုးရေကို နှေးကွေးစေသည်။ ဥယျာဉ်အထက်ရှိ တောင်စောင်းတစ်လျှောက် သစ်ပင်များ ဖုံးလွှမ်းနေခဲ့သည့်အချိန်ကို ဒေါ်မေက မှတ်မိနေသည်။ နှစ်များကြာလာသည်နှင့်အမျှ သစ်ပင်အချို့ကို သစ်သားရယူရန် ခုတ်လှဲခဲ့ကြပြီး လယ်ကွင်းအသစ်များလည်း ဖော်ထုတ်ခဲ့ကြသည်။ အမြစ်များနှင့် ကြွေကျသစ်ရွက်အလွှာများ မရှိတော့သည့်အခါ မိုးသည်းထန်စွာရွာလျှင် မြေဆီလွှာကို တောင်အောက်သို့ ဆေးကြောသယ်ဆောင်သွားကာ မြစ်ရေကို နောက်ကျိစေသည်။ ကလေးများသည် ဥယျာဉ်နှင့် အနီးရှိ အပင်မရှိသော မြေကွက်ကို နှိုင်းယှဉ်ခဲ့ကြသည်။ မိုးဖွဲဖွဲကျပြီးနောက် မြေဗလာပေါ်တွင် ရေစီးကြောင်းငယ်များ ဖြစ်ပေါ်လာကာ အညိုရောင်မြေကြီးကို မြောင်းထဲသို့ သယ်ဆောင်သွားသည်။ ဥယျာဉ်ထဲတွင်မူ ရေသည် မြေထဲသို့ ပိုမိုနှေးကွေးစွာ စိမ့်ဝင်သွားသည်။ တစ်ကြိမ်သာ သွားရောက်လေ့လာခြင်းဖြင့် အကြောင်းရင်းအားလုံးကို သက်သေမပြနိုင်သော်လည်း ဆက်လက်လေ့လာသင့်သည့် မေးခွန်းများကို အကြံပြုနိုင်ကြောင်း ဒေါ်မေက သတိပေးခဲ့သည်။ လီနာသည် သစ်ပင်များနှင့် မြေဆီလွှာအကြောင်း အပိုင်းတစ်ခုကို မှတ်စုစာအုပ်ထဲ ထည့်ရေးခဲ့သည်။",
      "ရက်အနည်းငယ်ကြာပြီးနောက် ဝီလိုးဘရွတ်မြို့တွင် မိုးအနည်းငယ်သာရွာနေစဉ် အဝေးရှိတောင်ကုန်းများပေါ်တွင် မုန်တိုင်းပြင်းထန်စွာ ဖြတ်သန်းသွားခဲ့သည်။ နောက်တစ်နေ့မနက် လီနာသည် တံတားကိုဖြတ်သည့်အခါ ထိုတစ်ပတ်လုံး မြင်ခဲ့သမျှထက် မြစ်ရေပိုမြင့်နေသည်ကို တွေ့ခဲ့သည်။ ရေသည် လျင်မြန်စွာစီးဆင်းနေပြီး သစ်ရွက်များနှင့် သစ်ကိုင်းများကို သယ်ဆောင်လာသည်။ သူမသည် မြစ်နှင့်ပိုနီးအောင် မသွားခဲ့ပါ။ ထိုအစား ဖခင်ကို ပြောပြခဲ့ပြီး ဖခင်က တရားဝင်မြစ်ရေသတိပေးချက်ကို စစ်ဆေးကာ ရေမြင့်တက်နေဆဲဖြစ်သဖြင့် မြို့ရုံးသို့ ဆက်သွယ်ခဲ့သည်။ သတိပေးချက် ရုပ်သိမ်းသည်အထိ ကျောင်းက အပြင်ဘက်လှုပ်ရှားမှုများကို ရွှေ့ဆိုင်းခဲ့သည်။ ဒေသတွင် နေရောင်ထွန်းနေခြင်းသည် မြစ်ရေဘေးကင်းကြောင်း မဆိုလိုသည့်အကြောင်းကို လီနာ၏မှတ်စုများက ရှင်းပြပေးနိုင်ခဲ့သည်။ ထိုအတွေ့အကြုံကြောင့် ပရောဂျက်သည် အိမ်စာတစ်ခုထက် တာဝန်ယူရမည့်အလုပ်တစ်ခုနှင့် ပိုတူလာသည်။ ကောလာဟလများ မဖြန့်ဘဲ မိမိတို့မြင်တွေ့ချက်များကို တင်ပြခဲ့သည့်အတွက် မစ္စတာဒန်နီယယ်က ကျောင်းသားများကို ချီးကျူးခဲ့သည်။ ကလေး၏မှတ်စုစာအုပ်ကို အရေးပေါ်အခြေအနေအတွက် တရားဝင်ခန့်မှန်းချက်အဖြစ် မမှီခိုဘဲ တရားဝင်သတိပေးချက်များကို လိုက်နာရန်လည်း အတန်းကို သတိပေးခဲ့သည်။ သက်သေအထောက်အထားများသည် ကောင်းမွန်သောဆုံးဖြတ်ချက်များချရာတွင် အထောက်အကူဖြစ်နိုင်သော်လည်း ဘေးကင်းရေးညွှန်ကြားချက်များကို တာဝန်ရှိအာဏာပိုင်များထံမှသာ ရယူရမည်ဟု လီနာ ရေးသားခဲ့သည်။",
      "အဖွဲ့သည် မိုးသည်းထန်စွာရွာသည့်အချိန်တွင် ဒေသခံများအနေဖြင့် မည်သည့်အချက်အလက်များ လိုအပ်ကြောင်း မေးမြန်းရန် ဆုံးဖြတ်ခဲ့သည်။ သူတို့သည် “မြစ်ရေတက်လာလျှင် ဘယ်နေရာသို့ သွားမည်နည်း” ကဲ့သို့ မေးခွန်းရိုးရိုးလေးများပါသော မေးခွန်းလွှာတိုတစ်ခု ပြင်ဆင်ခဲ့ကြသည်။ ဘယ်တရားဝင်သတင်းလမ်းကြောင်းကို ယုံကြည်မည်နည်း။ အကူအညီလိုအပ်သော အိမ်နီးချင်းကို ကူညီနိုင်မည်လား။ ဆရာရှိနေစဉ် သူတို့သည် ဆိုင်ရှင်များ၊ မိဘများ၊ သက်ကြီးရွယ်အိုများနှင့် မြေနိမ့်လမ်းများတွင် နေထိုင်သူများကို မေးမြန်းခဲ့ကြသည်။ အချို့က ကျောင်းခန်းမသည် မြင့်သောနေရာတွင် ရှိကြောင်း သိကြသော်လည်း အရေးပေါ်အခြေအနေတွင် ထိုခန်းမကို ဖွင့်ပေးမည်မဖွင့်ပေးမည်ကို အချို့က မသိကြပါ။ ဒေသခံအချို့သည် မိသားစုစာတိုများမှ သတိပေးချက်များ ရရှိခဲ့ကြပြီး အချို့မှာ ရေဒီယိုကို အားထားခဲ့ကြသည်။ အချက်အလက်ကို လူများ လက်ခံရရှိနိုင်ပြီး နားလည်နိုင်မှသာ အသုံးဝင်ကြောင်း ကလေးများ သင်ယူခဲ့ကြသည်။ သူတို့သည် ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို မစုဆောင်းဘဲ အဖြေများကို အမည်မဖော်ပြဘဲ မှတ်တမ်းတင်ခဲ့ကြသည်။ စစ်တမ်းရလဒ်များအရ မြို့အနေဖြင့် မြစ်ရေကို ပိုမိုတိုင်းတာရုံသာမက လူတိုင်းမျှဝေသုံးစွဲနိုင်သော ရှင်းလင်းသည့်အစီအစဉ်တစ်ခု လိုအပ်ကြောင်း တွေ့ရှိခဲ့ကြသည်။",
      "နောက်တစ်ကြိမ် မြို့အစည်းအဝေးတွင် လီနာနှင့် အတန်းဖော်များက ပထမဆုံးရရှိထားသော တွေ့ရှိချက်များကို တင်ပြခဲ့ကြသည်။ ဆိုင်ရှင်များ၊ လယ်သမားများ၊ အင်ဂျင်နီယာများနှင့် ဒေသခံအရာရှိများရှေ့တွင် ရပ်နေကြစဉ် သူတို့ စိတ်လှုပ်ရှားနေကြသည်။ အာရွန်က မြေပုံများကို ပြသပြီး မေသီရိက အမှိုက်စစ်တမ်းအကြောင်း ရှင်းပြကာ လီနာက ရေအမြင့်မှတ်တမ်းများကို တင်ပြခဲ့သည်။ သူတို့သိထားသည့်အချက်များနှင့် ဆက်လက်လေ့လာရန် လိုအပ်နေသည့်အရာများကို သေချာစွာ ခွဲခြားပြောဆိုခဲ့ကြသည်။ ဆိုင်ရှင်တစ်ဦးက ရေကြီးမှုသည် ပုံမှန်ထက် မိုးအလွန်သည်းထန်ခြင်းကြောင့်သာ ဖြစ်သည်ဟု ကန့်ကွက်ခဲ့သည်။ မစ္စခင်က မိုးရေချိန်သည် အရေးကြီးကြောင်း သဘောတူသော်လည်း ရေမြောင်းပိတ်ဆို့ခြင်း၊ စိုစွတ်မြေများ ပျောက်ကွယ်ခြင်းနှင့် မြစ်ကမ်းနားတွင် ဆောက်လုပ်ခြင်းတို့က ပျက်စီးဆုံးရှုံးမှုကို ပိုမိုကြီးမားစေနိုင်ကြောင်း ရှင်းပြခဲ့သည်။ ကျောင်းသားများက လုပ်ဆောင်ချက်တစ်ခုတည်းဖြင့် ရေကြီးမှုတိုင်းကို တားဆီးနိုင်သည်ဟု မဆိုခဲ့ကြပါ။ ယင်းအစား ရေမြောင်းအကာကို ပြုပြင်ရန်၊ ဘေးကင်းစွာ အမှိုက်ရှင်းလင်းရန်၊ ကျန်ရှိသေးသော စိုစွတ်မြေများကို ကာကွယ်ရန်၊ သင့်လျော်သောသစ်ပင်များ စိုက်ပျိုးရန်နှင့် သတိပေးအစီအစဉ်တစ်ခု ဖန်တီးရန် အကြံပြုခဲ့ကြသည်။ သူတို့၏ တည်ငြိမ်သေချာသော တင်ပြမှုကြောင့် သဘောမတူမှုများသည် အသုံးဝင်သော ဆွေးနွေးမှုအဖြစ် ပြောင်းလဲလာခဲ့သည်။",
      "အဆိုပြုချက်အားလုံးကို လူတိုင်းက ထောက်ခံကြသည်တော့ မဟုတ်ပါ။ ဆောက်လုပ်ရေးလုပ်ငန်းရှင်တစ်ဦးက စိုစွတ်မြေဟောင်းသည် အလဟဿဖြစ်နေသော မြေဖြစ်ပြီး ဆိုင်အသစ်များ ဆောက်လုပ်ပါက အလုပ်အကိုင်များ ရရှိလာမည်ဟု ပြောဆိုခဲ့သည်။ သစ်ပင်စိုက်ခြင်းကြောင့် သီးနှံစိုက်ပျိုးရန် နေရာလျော့နည်းသွားမည်ကို မိသားစုအချို့က စိုးရိမ်ကြသည်။ ကျောင်းသားများသည် ထိုစိုးရိမ်မှုများကို ပယ်ချမည့်အစား နားထောင်ခဲ့ကြသည်။ မစ္စတာဒန်နီယယ်က ရေတိုအကျိုးကျေးဇူးများနှင့် ရေရှည်အန္တရာယ်များကို နှိုင်းယှဉ်စဉ်းစားရန် ကူညီပေးခဲ့သည်။ အဆောက်အအုံများကို အန္တရာယ်အများဆုံးနေရာများနှင့် ဝေးဝေးထားပြီး ရေစီးရေလာစနစ်ကို မှန်ကန်စွာ ဒီဇိုင်းရေးဆွဲပါက ဖွံ့ဖြိုးတိုးတက်မှုကို ပိုမိုဘေးကင်းစွာ ဆက်လုပ်နိုင်ကြောင်း မစ္စခင်က ရှင်းပြခဲ့သည်။ သီးနှံစိုက်ပျိုးရန် ခက်ခဲနေပြီးသား ကျဉ်းမြောင်းသော မြေနေရာတစ်လျှောက် ဒေသခံမျိုးရင်းသစ်ပင်များ စိုက်ရန် လယ်သမားတစ်ဦးက အကြံပြုခဲ့သည်။ စာကြည့်တိုက်မှူးက မြေပုံဟောင်းများကို ယနေ့ရိုက်ထားသော ဓာတ်ပုံများနှင့် ယှဉ်တွဲပြသရန် အကြံပေးခဲ့သည်။ မြို့တစ်မြို့ကို စောင့်ရှောက်ခြင်းဆိုသည်မှာ လူတိုင်းကို ချက်ချင်းသဘောတူစေရန် အတင်းအကျပ်လုပ်ခြင်းမဟုတ်ဘဲ လိုအပ်ချက်အမျိုးမျိုးကို မျှတအောင် ညှိနှိုင်းခြင်းဖြစ်ကြောင်း လီနာ နားလည်လာသည်။ အသုံးဝင်သောအစီအစဉ်တစ်ခုတွင် လူများက စိုးရိမ်ချက်များကို တင်ပြပြီး အသေးစိတ်များကို ပိုကောင်းအောင် ပြင်ဆင်နိုင်ရမည်ဖြစ်သောကြောင့် သူမသည် “ဆက်လက်ဆွေးနွေးရမည့် မေးခွန်းများ” ဟု အမည်ပေးထားသော စာမျက်နှာတစ်ခုကို ပရောဂျက်ထဲ ထပ်ထည့်ခဲ့သည်။",
      "မြို့ကောင်စီသည် ပျက်စီးနေသော ရေထုတ်မြောင်းအကာကို စစ်ဆေးရန် သဘောတူခဲ့ပြီး အခြေအနေဘေးကင်းသည့်အခါ အမှိုက်များကို ဖယ်ရှားရန် သန့်ရှင်းရေးအဖွဲ့ကို တာဝန်ပေးခဲ့သည်။ စေတနာ့ဝန်ထမ်းများသည် ခြောက်သွေ့သောလမ်းပေါ်ရှိ အမှိုက်များကို အမျိုးအစားခွဲရာတွင် ကူညီနိုင်သော်လည်း မည်သည့်ကလေးမျှ မြစ်ထဲသို့ မဝင်ရ၊ အန္တရာယ်ရှိသောပစ္စည်းများကိုလည်း မကိုင်တွယ်ရပါ။ လီနာ၏ကျောင်းက ဈေးလမ်းများတွင် သန့်ရှင်းရေးနေ့တစ်နေ့ကို စီစဉ်ခဲ့ပြီး လူကြီးများက လက်အိတ်၊ အိတ်များ၊ သောက်ရေနှင့် ရှင်းလင်းသောညွှန်ကြားချက်များ ပံ့ပိုးပေးခဲ့သည်။ စုဆောင်းပေးသည့်ဝန်ဆောင်မှု ရှိသည့်နေရာများတွင် ကျောင်းသားများက ပြန်လည်အသုံးပြုနိုင်သောပစ္စည်းများကို သီးခြားခွဲပြီး စုဆောင်းရရှိသည့်ပမာဏကို မှတ်တမ်းတင်ခဲ့ကြသည်။ ဈေးဆိုင်တန်းများအနီးတွင် လူများက ထုပ်ပိုးအမှိုက်များကို ပစ်ချသည့်အခါ ရေမြောင်းတစ်ခုတည်းသည် ထပ်မံပိတ်ဆို့လာကြောင်း သူတို့တွေ့ရှိခဲ့သည်။ တစ်ရက်တာ သန့်ရှင်းရေးလုပ်ရုံဖြင့် ထပ်ခါထပ်ခါဖြစ်နေသော ပြဿနာကို မဖြေရှင်းနိုင်သဖြင့် အတန်းက ရိုးရှင်းသော ဆိုင်းဘုတ်များကို ဒီဇိုင်းဆွဲပြီး ဝယ်သူများ လက်လှမ်းမီသည့်နေရာတွင် အမှိုက်ပုံးများထားရန် ဆိုင်ရှင်များကို တောင်းဆိုခဲ့သည်။ လေ့ကျင့်သင်ကြားထားသော လူကြီးများက အပတ်စဉ် စစ်ဆေးရန်လည်း အကြံပြုခဲ့ကြသည်။ ထိုပရောဂျက်သည် မကြာမီမေ့ပျောက်သွားမည့် တစ်ကြိမ်တည်းသောပွဲတစ်ခု မဟုတ်တော့ဘဲ ဆက်လက်ထိန်းသိမ်းနိုင်သော အလေ့အကျင့်များအဖြစ် ပြောင်းလဲလာခဲ့သည်။",
      "တစ်ချိန်တည်းမှာပင် မေသီရိသည် စာကြည့်တိုက်မှူးနှင့်အတူ စာကြည့်တိုက်နံရံတွင် ချိတ်ဆွဲရန် မြေပုံကြီးတစ်ခု ပြုလုပ်ခဲ့သည်။ မြေပုံတွင် မြစ်၊ တံတား၊ ကျောင်း၊ ဆေးခန်း၊ မြင့်သောမြေနေရာများနှင့် ရေကြီးချိန်တွင် သွားလာရခက်ခဲနိုင်သော လမ်းများကို ဖော်ပြထားသည်။ ကိုယ်ပိုင်အိမ်လိပ်စာများကိုမူ ထည့်မထားပါ။ ယင်းအစား မြို့အရာရှိများက အတည်ပြုပေးထားသော အများပြည်သူတွေ့ဆုံရာနေရာများနှင့် ဘေးကင်းသောလမ်းကြောင်းများကို မှတ်သားထားသည်။ သင်္ကေတတစ်ခုချင်းစီ၏ အဓိပ္ပာယ်ကို ရှင်းပြထားသော အညွှန်းလည်း ပါဝင်ပြီး နောက်ဆုံးအကြိမ် ပြန်လည်စစ်ဆေးခဲ့သည့်ရက်ကို မြေပုံအောက်ခြေတွင် ဖော်ပြထားသည်။ အညွှန်းများကို နားလည်ရလွယ်ကူခြင်း ရှိမရှိ စစ်ဆေးပေးရန် ကလေးများက ဒေသခံများကို ဖိတ်ခေါ်ခဲ့ကြသည်။ သက်ကြီးရွယ်အိုတစ်ဦးက မိုးအနည်းငယ်ရွာရုံဖြင့်ပင် လမ်းကြားတစ်ခု ရွှံ့ထူလာတတ်ကြောင်း ထောက်ပြခဲ့ပြီး သူနာပြုတစ်ဦးက ပိုကြာကြာ သွားလာနိုင်သေးသော ဆေးခန်းဝင်ပေါက်ကို မှတ်သားရန် အကြံပြုခဲ့သည်။ အဖွဲ့သည် အကြံပြုချက်တစ်ခုချင်းစီကို အတည်ပြုပြီးနောက် မြေပုံကို ပြင်ဆင်ခဲ့သည်။ မြေပုံတစ်ခုသည် ကြည့်ကောင်းရုံဖြင့် ပြီးပြည့်စုံသွားခြင်းမဟုတ်ဘဲ တိကျရမည်၊ ဖတ်ရှုရလွယ်ကူရမည်၊ ထိုဒေသကို နားလည်သူများက ပုံမှန်စစ်ဆေးပေးရမည်ဖြစ်ကြောင်း လီနာ သင်ယူခဲ့သည်။",
      "ထို့နောက် ကျောင်းသည် ဒေသခံအရာရှိများ၏ ခွင့်ပြုချက်ဖြင့် ဘေးကင်းရေးလေ့ကျင့်မှုတစ်ခု ပြုလုပ်ခဲ့သည်။ ကျောင်းသားများသည် စုဝေးရာနေရာသို့ တည်ငြိမ်စွာ ရွှေ့ပြောင်းရမည်ကို ပြသမည့် အချက်ပေးသံကို ဆရာများက ရှင်းပြခဲ့သည်။ အတန်းများသည် အချင်းချင်း မတွန်းမတိုက်ဘဲ အခန်းများမှ ထွက်ခြင်း၊ အမှတ်အသားပြုထားသော လမ်းကြောင်းများအတိုင်း သွားခြင်းနှင့် ဝန်ထမ်းများ၏ ညွှန်ကြားချက်များကို နားထောင်ခြင်းတို့ကို လေ့ကျင့်ခဲ့ကြသည်။ ဖြည်းဖြည်းလမ်းလျှောက်ရသော သို့မဟုတ် ကြေညာချက်များကို ကြားရန် အကူအညီလိုသော ကျောင်းသားများလည်း လေ့ကျင့်မှုတွင် ပါဝင်ခဲ့ကြသည်။ မည်သည့်လူကြီးနောက် လိုက်ရမည်၊ မိသားစုဝင်များကို မည်သည့်နေရာတွင် စောင့်ရမည်ကို လူတိုင်းသိကြောင်း ဆရာများက စစ်ဆေးခဲ့သည်။ လေ့ကျင့်မှုသည် ရိုးရှင်းမည်ဟု လီနာထင်ခဲ့သော်လည်း အုပ်စုနှစ်စုက ကျဉ်းမြောင်းသောတံခါးဝသို့ တစ်ချိန်တည်းရောက်လာသည့်အခါ ရှုပ်ထွေးမှု ဖြစ်နိုင်ကြောင်း သူမတွေ့မြင်ခဲ့သည်။ ထို့နောက် ကျောင်းက လမ်းကြောင်းကို ပြင်ဆင်ပြီး လေ့ကျင့်မှုကို ထပ်မံပြုလုပ်ခဲ့သည်။ မည်သူမျှ ထိုလေ့ကျင့်မှုကို ကစားပွဲတစ်ခုလို မသဘောထားခဲ့သလို ကလေးငယ်များကိုလည်း ကြောက်လန့်စေမည့် ဇာတ်လမ်းများ မပြောခဲ့ကြပါ။ တကယ့်အရေးပေါ်အခြေအနေ မဖြစ်မီ ဘေးကင်းသောလုပ်ဆောင်ချက်များကို ရင်းနှီးကျွမ်းဝင်စေရန်မှာ ရည်ရွယ်ချက်ဖြစ်သည်။ ပြင်ဆင်မှုသည် ထိတ်လန့်မှုမဟုတ်ဘဲ ယုံကြည်မှုကို တည်ဆောက်ပေးသင့်ပြီး အစီအစဉ်တိုင်းတွင် လိုအပ်ချက်မတူညီသောသူများကို ထည့်သွင်းစဉ်းစားရမည်ဟု လီနာ ရေးသားခဲ့သည်။",
      "နောက်တစ်လအတွင်း မြစ်ရေသည် ငြိမ်သက်နေခဲ့ပြီး ဒေသခံအချို့၏ စိတ်ဝင်စားမှုလည်း လျော့နည်းလာခဲ့သည်။ နေ့စဉ်လုပ်ငန်းများက ပင်ပန်းခက်ခဲပြီး မမြင်ရသောအန္တရာယ်တစ်ခုကို အရေးမကြီးသလို ခံစားမိနိုင်ကြောင်း လီနာ နားလည်ခဲ့သည်။ လူများကို သတင်းအချက်အလက် ပေးထားနိုင်ရန် ကျောင်းသားများသည် အတည်ပြုပြီးသော ရေအမြင့်တိုင်းတာချက်များ၊ မိုးရေအချက်အလက်များနှင့် မြို့ရုံးမှ မှတ်စုများကို အသုံးပြု၍ လစဉ်မြစ်အခြေအနေအစီရင်ခံစာတိုတစ်ခု ပြင်ဆင်ခဲ့ကြသည်။ တိုင်းတာထားသောအချက်အလက်များနှင့် အကြံပြုချက်များကို ရှင်းလင်းစွာ ခွဲခြားဖော်ပြပြီး စာကြည့်တိုက်နှင့် ကျောင်းတွင် ကပ်ထားခဲ့ကြသည်။ ထိုအစီရင်ခံစာသည် ပညာပေးရန်အတွက်သာဖြစ်ပြီး တရားဝင်သတိပေးချက်များကို အစားထိုးခြင်းမဟုတ်ကြောင်းလည်း ရှင်းပြခဲ့ကြသည်။ လူအနည်းငယ်က ရက်စွဲတစ်ခု မှားနေကြောင်း ပြင်ဆင်ထောက်ပြခဲ့ပြီး အဖွဲ့က ကျေးဇူးတင်ကာ အမှားကို ပြင်ဆင်ခဲ့သည်။ ထိုသို့လုပ်ခြင်းက အစီရင်ခံစာအပေါ် ယုံကြည်မှုကို ပိုမိုတိုးစေခဲ့သည်။ ကိန်းဂဏန်းများကို ထုတ်ပြန်ရုံသာမက ၎င်းတို့က ဘာကိုဆိုလိုကြောင်း၊ ဘယ်နေရာမှ ရရှိလာကြောင်းနှင့် ဘာကို မဖော်ပြနိုင်ကြောင်းကိုလည်း ရှင်းပြရမည်ဖြစ်ကြောင်း ကလေးများ သိလာခဲ့သည်။ တိကျမှန်ကန်မှုသည် သူတို့အတူတကွ လေ့ကျင့်လာသော အလေ့အကျင့်တစ်ခု ဖြစ်လာခဲ့သည်။",
      "တစ်နေ့လယ်တွင် လီနာသည် မိသားစုတစ်စုက စိုစွတ်မြေဟောင်းဘက်သို့ သွားသော မြေနိမ့်လမ်းကို ဖြတ်၍ ခြံစည်းရိုးဆောက်နေသည်ကို သတိပြုမိခဲ့သည်။ လမ်းပိတ်သွားမည်ကို သူမစိုးရိမ်သော်လည်း မိသားစုနှင့် အငြင်းမပွားခဲ့ပါ။ ထိုလမ်းသည် အများပြည်သူသုံးလမ်း ဟုတ်မဟုတ် မြို့အရာရှိတစ်ဦးကို မေးမြန်းရာ အစီအစဉ်ဟောင်းတစ်ခုတွင် နယ်နိမိတ်ကို ရှင်းလင်းစွာ မဖော်ပြထားကြောင်း သိခဲ့ရသည်။ အရာရှိက မိသားစုနှင့် မြေတိုင်းအဖွဲ့တို့ တွေ့ဆုံစစ်ဆေးနိုင်ရန် စီစဉ်ပေးခဲ့သည်။ သူတို့သည် မှတ်တမ်းများကို အတူတကွ စစ်ဆေးပြီး မိသားစု၏ ပိုင်ဆိုင်ခွင့်ကို လေးစားသည့်အပြင် ဖြတ်သန်းသွားလာနိုင်သော ကျဉ်းမြောင်းသည့် လမ်းကြောင်းတစ်ခုကိုလည်း ဖွင့်ထားနိုင်မည့် နည်းလမ်းကို ရှာတွေ့ခဲ့ကြသည်။ အချက်အလက်မပြည့်စုံဘဲ သတိပေးခြင်းသည် ရည်ရွယ်ချက်ကောင်းရှိသော်လည်း ပဋိပက္ခဖြစ်စေနိုင်ကြောင်း လီနာ သဘောပေါက်လာသည်။ မှန်ကန်သောနည်းလမ်းမှာ မေးခွန်းမေးရန်၊ ယုံကြည်စိတ်ချရသော မှတ်တမ်းများကို ရှာဖွေရန်နှင့် ဆုံးဖြတ်ချက်ချရန် တာဝန်ရှိသူများကို ပါဝင်စေရန်ဖြစ်သည်။ စွပ်စွဲပြောဆိုခြင်းထက် လေးစားမှုရှိစွာ ပြဿနာဖြေရှင်းပုံ ဥပမာတစ်ခုအဖြစ် သူမသည် ထိုအတွေ့အကြုံကို ပရောဂျက်တွင် ထည့်ရေးခဲ့သည်။",
      "မိုးရာသီသည် မျှော်လင့်ထားသည်ထက် စောစီးစွာ ပြန်လည်ရောက်ရှိလာခဲ့သည်။ တောင်ကုန်းများပေါ်တွင် မိုးတိမ်မည်းများ သုံးရက်ကြာ စုဝေးနေပြီး ရေသည် လျင်မြန်စွာ မြင့်တက်လာနိုင်ကြောင်း တရားဝင်သတိပေးချက်များက ဖော်ပြခဲ့သည်။ မြို့ရုံးသည် ရေဒီယို၊ ကြေညာဘုတ်များနှင့် ကျောင်းက အတည်ပြုထားသော စာတိုပို့လမ်းကြောင်းမှတစ်ဆင့် သတင်းအသစ်များ ပေးပို့ခဲ့သည်။ ဆိုင်ရှင်များက ကုန်ပစ္စည်းများကို အနိမ့်စင်များမှ ရွှေ့ထားကြပြီး မိသားစုများက ဆေးဝါးနှင့် အရေးကြီးစာရွက်စာတမ်းများကို စစ်ဆေးခဲ့ကြကာ စေတနာ့ဝန်ထမ်းများကလည်း ရပ်ရွာခန်းမတွင် သန့်ရှင်းသောရေနှင့် အခြေခံပစ္စည်းများ ရှိမရှိ အတည်ပြုခဲ့ကြသည်။ လီနာ၏ဖခင်က သက်ကြီးရွယ်အိုအိမ်နီးချင်းတစ်ဦးအား စက်ဘီးကို လုံခြုံအောင်ထားပြီး အိတ်ငယ်တစ်လုံးကို မြင့်သောနေရာရှိ ဆွေမျိုးအိမ်သို့ သယ်ယူရာတွင် ကူညီပေးခဲ့သည်။ လီနာနှင့် အတန်းဖော်များသည် မိသားစုများနှင့်အတူ နေပြီး လူကြီးများ၏ ညွှန်ကြားချက်ကို လိုက်နာကာ ဓာတ်ပုံရိုက်ရန် တံတားသို့ မသွားခဲ့ကြပါ။ သန်းခေါင်ကျော်နောက်ပိုင်း မြစ်ရေ စတင်မြင့်တက်လာပြီး မနက်ရောက်သောအခါ မြေနိမ့်လမ်းကို ရေဖုံးလွှမ်းသွားခဲ့သည်။ သတိပေးချက်ကို စောစီးစွာ ရရှိခဲ့သောကြောင့် လူအများစုသည် အန္တရာယ်အများဆုံးနေရာများမှ ကြိုတင်ရွှေ့ပြောင်းထားပြီးဖြစ်သည်။",
      "ရေကြီးမှုသည် ပြင်းထန်ခဲ့သော်လည်း မြို့၏ကြိုတင်ပြင်ဆင်မှုကြောင့် ရှုပ်ထွေးမှုများ လျော့နည်းခဲ့သည်။ အရာရှိများက ဘေးမကင်းသော တံတားကို ပိတ်ပြီး ဒေသခံများကို အတည်ပြုပြီးသော လမ်းကြောင်းအတိုင်း မြင့်သောနေရာသို့ ညွှန်ကြားပေးခဲ့သည်။ ကျောင်းခန်းမကို ယာယီခိုလှုံရာအဖြစ် ဖွင့်လှစ်ပြီး မိသားစုများ၊ ရှေးဦးသူနာပြုစုမှု၊ သောက်ရေနှင့် အနားယူတိတ်ဆိတ်ရာနေရာများအတွက် သီးခြားနေရာများ စီစဉ်ပေးခဲ့သည်။ မိသားစုဝင်များ အချင်းချင်း ပြန်လည်တွေ့ဆုံနိုင်ရန် ဆရာများနှင့် စေတနာ့ဝန်ထမ်းများက အမည်စာရင်းများကို စစ်ဆေးခဲ့သော်လည်း ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို အများမြင်ကွင်းတွင် မဖော်ပြခဲ့ကြပါ။ ဆေးခန်းက ပုံမှန်ဆေးကုသမှုလိုအပ်သူများအတွက် ဆေးဝါးများ စီစဉ်ပေးခဲ့သည်။ ဒေသခံအချို့ ကြောက်လန့်နေကြပြီး ကလေးများက အိမ်ပြန်နိုင်မည့်အချိန်ကို မေးမြန်းခဲ့ကြသည်။ လူကြီးများက ရေဘယ်အချိန်ကျမည်ဟု အတိအကျကတိပေးမည့်အစား မှန်ကန်သော သတင်းအချက်အလက်များကို ရိုးသားစွာ အသိပေးခဲ့ကြသည်။ လီနာသည် ဆရာမ၏ ကြီးကြပ်မှုအောက်တွင် ခန်းမ၌ သန့်ရှင်းသောစောင်များနှင့် ရုပ်ပုံစာအုပ်များကို အမျိုးအစားခွဲကူညီခဲ့သည်။ အရေးပေါ်အစီအစဉ်ဆိုသည်မှာ မြေပုံတစ်ခု သို့မဟုတ် သတိပေးချက်တစ်ခုသာ မဟုတ်ဘဲ တာဝန်ရှင်းလင်းသော လူများက တည်ငြိမ်စွာ မိမိတို့အလုပ်ကို လုပ်ဆောင်ပြီး လူတိုင်းကို လေးစားစွာ ဆက်ဆံခြင်းအပေါ်လည်း မူတည်နေကြောင်း သူမ သိမြင်ခဲ့သည်။",
      "နေ့လယ်ခင်းနီးပါးတွင် တံတားဟောင်း ပြိုကျသွားပြီဟု သတင်းတစ်ခု ပျံ့နှံ့လာခဲ့သည်။ လူများ စိုးရိမ်လာကြသော်လည်း ခိုလှုံရာနေရာရှိ မည်သူမျှ ထိုသတင်းကို အတည်မပြုနိုင်ခဲ့ပါ။ မစ္စတာဒန်နီယယ်က အရာရှိများ မစစ်ဆေးမချင်း ထိုသတင်းကို အခြားသူများထံ ဆက်မပို့ရန် လူတိုင်းကို တောင်းဆိုခဲ့သည်။ နောက်ပိုင်းတွင် မြို့အရာရှိတစ်ဦးက တံတားသည် မပြိုကျသေးဘဲ ရေစီးအား အလွန်ပြင်းထန်နေသောကြောင့်သာ ပိတ်ထားခြင်းဖြစ်ကြောင်း ကြေညာခဲ့သည်။ ထိုပြင်ဆင်ချက်ကြောင့် မလိုအပ်သော ကြောက်ရွံ့မှုများ ပျံ့နှံ့မလာတော့ပါ။ စိတ်လှုပ်ရှားဖွယ် ပြောဆိုချက်တစ်ခုသည် အတည်ပြုထားသော အချက်အလက်ထက် ပိုမြန်စွာ ပျံ့နှံ့နိုင်ကြောင်း လီနာ သတိရခဲ့သည်။ အတည်ပြုချက်ရရှိသည့်အချိန်နှင့် သတင်းအချက်အလက်အတွက် တာဝန်ရှိသောရုံးကို ဖော်ပြပြီး ခိုလှုံရာနေရာရှိ ကြေညာဘုတ်ပေါ်တွင် တရားဝင်သတင်းကို ရေးကပ်ရာတွင် သူမ ကူညီခဲ့သည်။ သတင်းပေးပို့ရာတွင် သိရှိထားသည့်အရာကိုသာ ပြောရန်၊ ခန့်မှန်းပြောဆိုမှုကို ရှောင်ရန်နှင့် ယုံကြည်စိတ်ချရသော အရင်းအမြစ်သို့ ညွှန်ပြရန် လိုအပ်ကြောင်း ထိုဖြစ်ရပ်က ကျောင်းသားများကို သင်ပေးခဲ့သည်။ အရေးပေါ်အခြေအနေတွင် တာဝန်ယူမှုရှိစွာ သတင်းမျှဝေခြင်းသည် အသုံးဝင်သော ရုပ်ပိုင်းဆိုင်ရာအတားအဆီးတစ်ခုကဲ့သို့ပင် လူများကို ကာကွယ်ပေးနိုင်သည်။",
      "ဒုတိယညရောက်သောအခါ မိုးအားလျော့လာပြီး မြစ်ရေ စတင်ကျဆင်းလာခဲ့သည်။ သို့သော် အရာရှိများက လူများကို ချက်ချင်းပြန်ခွင့်မပြုခဲ့ပါ။ အဖွဲ့များက လမ်းများ၊ လျှပ်စစ်ကြိုးများ၊ အဆောက်အအုံများနှင့် တံတားတို့တွင် ပျက်စီးမှုရှိမရှိ စစ်ဆေးခဲ့ကြသည်။ ရေကြီးရေလျှံမှုကြောင့် ရေထဲတွင် မိလ္လာအညစ်အကြေး၊ ချွန်ထက်သောပစ္စည်းများ သို့မဟုတ် ဓာတုပစ္စည်းများ ပါဝင်နိုင်သဖြင့် မချဉ်းကပ်ရန် ဆေးခန်းက ဒေသခံများကို သတိပေးခဲ့သည်။ နောက်ဆုံးတွင် အချို့လမ်းများသို့ ပြန်ဝင်ခွင့်ရသောအခါ ပိတ်ထားဆဲနေရာများကို ရှင်းလင်းစွာ အသိပေးခဲ့သည်။ လီနာသည် ဖခင်နှင့် အဘွားတို့နှင့်အတူ အတည်ပြုထားသောလမ်းကြောင်းအတိုင်း အိမ်ပြန်ခဲ့သည်။ သူတို့အိမ်၏ မြေညီထပ်မှာ စိုစွတ်နေသော်လည်း အရေးကြီးစာရွက်စာတမ်းများကို မြင့်သောနေရာတွင် သိမ်းထားခဲ့ပြီး အိမ်နီးချင်းများက စိုနေသောပရိဘောဂများကို နေပူထဲရွှေ့ပေးခဲ့ကြသည်။ ဟင်းသီးဟင်းရွက်ခင်းအချို့ ပျက်စီးသွားသည်ကို မြင်ရ၍ ဒေါ်မေ ဝမ်းနည်းခဲ့သော်လည်း မိသားစုဘေးကင်းနေခြင်းအတွက် ကျေးဇူးတင်ခဲ့သည်။ အရာရှိများက ဘေးကင်းကြောင်း ပြောပြီးမှသာ သူတို့သည် ပျက်စီးမှုများကို ဓာတ်ပုံရိုက်ခဲ့ကြပြီး ထိုပုံများကို အန္တရာယ်ဖြစ်စေရန်မဟုတ်ဘဲ ပြုပြင်ရေးမှတ်တမ်းအတွက် အသုံးပြုနိုင်ခဲ့သည်။",
      "ရေကြီးပြီးနောက် ရက်များတွင် အလုပ်များစွာ ရှိခဲ့သည်။ ဒေသခံများသည် အိမ်များထဲမှ ရွှံ့များကို သန့်ရှင်းရေးလုပ်ကြပြီး သောက်ရေထောက်ပံ့မှု အခြေအနေကို စစ်ဆေးကာ ပျက်စီးနေသော ရေမြောင်းများကို သတင်းပို့ခဲ့ကြသည်။ မြို့က ပျက်စီးနေသော ပရိဘောဂများနှင့် ညစ်ညမ်းသောအမှိုက်များကို ဘေးကင်းစွာ စုဆောင်းဖယ်ရှားရန် စီစဉ်ပေးခဲ့သည်။ စေတနာ့ဝန်ထမ်းများက အစားအစာများ ပေးဝေပြီး သက်ကြီးရွယ်အိုများ ဆွေမျိုးများနှင့် ဆက်သွယ်နိုင်ရန် ကူညီခဲ့ကြသည်။ ကျောင်းသားများသည် ချွန်ထက်သော သို့မဟုတ် ညစ်ပတ်သောပစ္စည်းများကို မကိုင်တွယ်ခဲ့ကြဘဲ ယင်းအစား စာကြည့်တိုက်တွင် ပျက်စီးသွားသောစာအုပ်များစာရင်း ပြုစုရာ၌ ကူညီပြီး လူကြီးများ၏ ကြီးကြပ်မှုအောက်တွင် သန့်ရှင်းသော လှူဒါန်းပစ္စည်းများကို အမျိုးအစားခွဲခဲ့ကြသည်။ ဦးဘက ပြုပြင်ရေးလုပ်ငန်းများ ဆက်လက်လုပ်ဆောင်နေစဉ် ကလေးများ တည်ငြိမ်စွာ နေနိုင်ရန် ခြောက်သွေ့သောအခန်းတစ်ခန်းတွင် ယာယီစာဖတ်ထောင့်တစ်ခု ပြုလုပ်ပေးခဲ့သည်။ ပြန်လည်ထူထောင်ရေးသည် မိသားစုတိုင်းအတွက် တူညီခြင်းမရှိကြောင်း လီနာ သတိပြုမိသည်။ အချို့တွင် အာမခံ သို့မဟုတ် အခြားနေရာရှိ ဆွေမျိုးများ ရှိသော်လည်း အချို့မှာ အလုပ်လုပ်ရန် လိုအပ်သောကိရိယာများ ဆုံးရှုံးခဲ့ကြသည်။ အကူအညီများကို မျှမျှတတ ခွဲဝေပေးနိုင်ရန် မြို့က လိုအပ်ချက်များကို မှတ်တမ်းတင်စတင်ခဲ့သည်။ ကြင်နာမှုသည် အရေးကြီးသော်လည်း စနစ်တကျစီစဉ်ထားခြင်းက အကူအညီလိုအပ်သူများထံ ကြင်နာမှုရောက်ရှိစေရန် ကူညီပေးကြောင်း လီနာ ရေးသားခဲ့သည်။",
      "ရေများ လုံးဝကျဆင်းသွားသောအခါ ကျောင်းသားများသည် မစ္စခင်နှင့် အခြားလူကြီးများအတူ မြစ်သို့ ပြန်သွားခဲ့ကြသည်။ ရေအမြင့်ဆုံးအမှတ်အသစ်ကို ယခင်တိုင်းတာချက်များနှင့် နှိုင်းယှဉ်ပြီး ဘေးကင်းသောနေရာများမှ ပြောင်းလဲမှုများကို ဓာတ်ပုံရိုက်ခဲ့ကြသည်။ မြစ်သည် ကွေ့တစ်နေရာမှ မြေဆီလွှာကို တိုက်စားသယ်ဆောင်သွားပြီး ကျူပင်များပေါက်နေသောနေရာအနီးတွင် အနည်အနှစ်များ စုပုံကျန်ခဲ့သည်။ သစ်ပင်ငယ်အချို့ လဲကျခဲ့သော်လည်း ကမ်းပါးအထက်ရှိ ကာကွယ်ထားသော ဥယျာဉ်မှာ အများအားဖြင့် မပျက်မစီး ကျန်ရှိနေခဲ့သည်။ ရေကြီးမှုတစ်ကြိမ်ဖြစ်ခဲ့ခြင်းကြောင့် အစီရင်ခံစာထဲက အယူအဆအားလုံး မှန်ကန်ကြောင်း ကျောင်းသားများ မယူဆခဲ့ကြပါ။ ယင်းအစား သက်သေအထောက်အထားများကို ပြင်ဆင်ဖြည့်စွက်ပြီး မည်သည့်ပြောင်းလဲမှုများသည် ပုံမှန်ဖြစ်ပြီး မည်သည့်အရာများကို အာရုံစိုက်ရန်လိုကြောင်း အင်ဂျင်နီယာများကို မေးမြန်းခဲ့ကြသည်။ ရာသီအလိုက် ထပ်ခါထပ်ခါတိုင်းတာခြင်းဖြင့် ပုံစံတစ်ခုကို ဖော်ထုတ်နိုင်ကြောင်း မစ္စခင်က ပြသခဲ့သည်။ သိပ္ပံပညာဆိုသည်မှာ စိတ်လှုပ်ရှားဖွယ်အဖြေတစ်ခုတည်းကို ရှာဖွေခြင်းမဟုတ်ဘဲ လေ့လာတွေ့ရှိချက်များကို စုဆောင်းခြင်း၊ ရှင်းလင်းချက်များကို စမ်းသပ်ခြင်းနှင့် သက်သေအထောက်အထားအသစ်များ ပေါ်လာလျှင် ကောက်ချက်များကို ပြန်လည်ပြင်ဆင်လိုစိတ်ရှိခြင်းဖြစ်ကြောင်း လီနာ နားလည်လာသည်။",
      "ကောင်စီသည် ကျောင်းသားများကို အများပြည်သူအစည်းအဝေးတစ်ခုတွင် သူတို့သင်ယူခဲ့သမျှကို မျှဝေရန် ဖိတ်ခေါ်ခဲ့သည်။ ယခုတစ်ကြိမ်တွင် သူတို့သည် ပရောဂျက်ကို စက်ဝန်းတစ်ခုအဖြစ် တင်ပြခဲ့ကြသည်—လေ့လာ၊ စစ်ဆေး၊ စီစဉ်၊ လေ့ကျင့်၊ ပြန်လည်သုံးသပ်၊ တိုးတက်အောင်ပြင်ဆင်။ ပြုပြင်ထားသော ရေမြောင်းက ပိတ်ဆို့မှုတစ်ခုကို မည်သို့လျော့နည်းစေကြောင်း၊ စိုစွတ်မြေကို အဘယ်ကြောင့် ကာကွယ်ရန်လိုကြောင်းနှင့် သတိပေးလေ့ကျင့်မှုက လူများကို ဘယ်နေရာသို့ သွားရမည်ကို နားလည်စေရန် မည်သို့ကူညီကြောင်း ပြသခဲ့ကြသည်။ လာမည့်နှစ်များတွင် မိုးရေချိန်ပုံစံများ မည်သို့ပြောင်းလဲနိုင်မည်ဆိုသည့် မေးခွန်းအပါအဝင် အဖြေမရသေးသောအချက်အချို့ ရှိနေကြောင်းကိုလည်း ဝန်ခံခဲ့ကြသည်။ မြစ်အနီး ဆောက်လုပ်ရေးစည်းမျဉ်းများကို ပြန်လည်သုံးသပ်ရန်၊ အများပြည်သူသုံး သတိပေးလမ်းကြောင်းများကို ထိန်းသိမ်းရန်နှင့် ကြီးမားသောပြောင်းလဲမှုများ မပြုလုပ်မီ ကျွမ်းကျင်သူများထံ အကြံဉာဏ်တောင်းရန် အရာရှိများ သဘောတူခဲ့ကြသည်။ ဒေသခံလယ်သမားများက သင့်လျော်သော ကမ်းပါးတစ်လျှောက်တွင် ဒေသမျိုးရင်းအပင်များ စမ်းသပ်စိုက်ပျိုးရန် စေတနာ့ဝန်ထမ်းလုပ်ခဲ့ကြသည်။ ရေကြီးပြီးနောက် မေ့ပျောက်သွားခြင်းမဖြစ်စေရန် တိုးတက်မှုကို နှစ်စဉ်ပြန်လည်သုံးသပ်ဖို့ ကျောင်းသားများ တောင်းဆိုခဲ့ကြသည်။ အစည်းအဝေးအဆုံးတွင် သက်ဆိုင်ရာရုံးများနှင့် ရပ်ရွာအဖွဲ့များကို တာဝန်များ ခွဲဝေပေးခဲ့သဖြင့် အစီအစဉ်ကို လိုက်နာရန်နှင့် တိုင်းတာရန် ပိုမိုလွယ်ကူလာသည်။",
      "နောက်လအနည်းငယ်အတွင်း တိုးတက်မှုအသေးစားများ စတင်မြင်တွေ့လာရသည်။ ရေမြောင်းအကာကို သတ်မှတ်ထားသောအချိန်ဇယားအတိုင်း စစ်ဆေးခဲ့ကြပြီး ဈေးရှိ အမှိုက်ပုံးများကို ပိုမိုမှန်မှန် ရှင်းလင်းကာ ရေထဲသို့ အမှိုက်မပစ်ရန် ဆိုင်းဘုတ်များကလည်း လာရောက်သူများကို သတိပေးခဲ့သည်။ စာကြည့်တိုက်တွင် မြစ်မြေပုံနှင့် လစဉ်အစီရင်ခံစာကို ပြသထားပြီး ဒေသခံများက ပြင်ဆင်ချက်များ အကြံပြုနိုင်ရန် စာတိုက်ပုံးတစ်ခု ထားရှိခဲ့သည်။ လယ်သမားများနှင့် စေတနာ့ဝန်ထမ်းအဖွဲ့တစ်ဖွဲ့သည် သဘောတူထားသောနေရာများတွင် ဒေသမျိုးရင်းသစ်ပင်များ စိုက်ပျိုးခဲ့ကြပြီး မြေဆီလွှာနှင့် သင့်လျော်သောမျိုးစိတ်များကို ရွေးချယ်ကာ သီးနှံခင်းများနှင့် လမ်းများအတွက် နေရာလုံလောက်စွာ ချန်ထားခဲ့ကြသည်။ ကျောင်းက ဘေးကင်းရေးလေ့ကျင့်မှုကို ထပ်မံပြုလုပ်ပြီး လမ်းပြုပြင်ရေးပြီးနောက် သွားလာရမည့်လမ်းကြောင်းကို အသစ်ပြင်ဆင်ခဲ့သည်။ ဤလုပ်ဆောင်ချက်များကြောင့် ဝီလိုးဘရွတ်မြို့သည် ရေကြီးမှုအန္တရာယ် လုံးဝကင်းသွားသည်ဟု မဆိုနိုင်ကြောင်း အရာရှိများက ရှင်းလင်းစွာ ပြောခဲ့ကြသည်။ ရည်ရွယ်ချက်မှာ ရှောင်ရှားနိုင်သော အန္တရာယ်များကို လျော့နည်းစေပြီး ရပ်ရွာကို ပိုမိုပြင်ဆင်ထားနိုင်ရန်ဖြစ်သည်။ ထိုသို့ ရိုးသားစွာ ပြောဆိုခြင်းက လီနာကို စိတ်ချမ်းသာစေခဲ့သည်။ သဘာဝကို အပြည့်အဝ ထိန်းချုပ်နိုင်သည်ဟု ကတိပေးခြင်းထက် တဖြည်းဖြည်း တိုးတက်အောင်လုပ်မည်ဟု ကတိပေးခြင်းက ပိုအသုံးဝင်သည်။",
      "ကျောင်းပရောဂျက် စတင်ပြီး တစ်နှစ်အကြာတွင် လီနာသည် မူလမှတ်စုစာအုပ်ကို ဖွင့်ကာ ပထမစာမျက်နှာများကို ပြန်ဖတ်ခဲ့သည်။ အစပိုင်းတွင် မြစ်၏လျှို့ဝှက်ချက်ကို ဂရုတစိုက်ရေးထားသော စာရင်းက ဖော်ထုတ်ပေးနိုင်မည်ဟု ယုံကြည်ကာ ရေအမြင့်နှင့် ရာသီဥတုကိုသာ ရေးသားခဲ့သည်။ ယခုတော့ မှတ်စုစာအုပ်ထဲတွင် မြေပုံများ၊ မေးမြန်းချက်များ၊ တိုင်းတာချက်များ၊ ပြင်ဆင်ချက်များ၊ မေးခွန်းများနှင့် ဆုံးဖြတ်ချက်မှတ်တမ်းများ ပါဝင်လာခဲ့သည်။ အစောပိုင်းက ခန့်မှန်းချက်အချို့ မှားယွင်းခဲ့ကြောင်း သက်သေပြနိုင်ခဲ့ပြီး ၎င်းတို့ကို အချက်အလက်အဖြစ်မဟုတ်ဘဲ ခန့်မှန်းချက်အဖြစ် မှတ်သားထားခဲ့သည့်အတွက် သူမ ဝမ်းသာခဲ့သည်။ ဓာတ်ပုံများကို ကူးယူမီ ခွင့်ပြုချက်တောင်းရန်၊ လူများ၏ ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို ကာကွယ်ရန်နှင့် သတင်းတစ်ခုကို မျှဝေမီ စစ်ဆေးရန်လည်း သူမ သင်ယူခဲ့သည်။ အရေးအကြီးဆုံးမှာ ရပ်ရွာတစ်ခုသည် အမှားများနှင့် အောင်မြင်မှုများ နှစ်မျိုးစလုံးမှ သင်ယူနိုင်ကြောင်း သူမ သိရှိလာခဲ့သည်။ သူမ၏ဖခင်က မြို့တစ်မြို့သည် စက်ဘီးတစ်စီးနှင့် တူပြီး အစိတ်အပိုင်းများစွာကို အတူတကွ ထိန်းသိမ်းပြုပြင်မှသာ ကောင်းစွာအလုပ်လုပ်နိုင်ကြောင်း ပြောခဲ့သည်။ လီနာသည် ထိုနှိုင်းယှဉ်ချက်ကို ပြုံး၍ သဘောကျပြီး မှတ်စုစာအုပ်ထဲသို့ နောက်ဆုံးမှတ်ချက်တစ်ခု ထပ်ရေးခဲ့သည်။",
      "ရေကြီးမှုဖြစ်ပွားခဲ့သည့် နှစ်ပတ်လည်နေ့တွင် ကျောင်းက ဒေသခံများကို စာကြည့်တိုက်၌ ပြပွဲငယ်တစ်ခုသို့ ဖိတ်ခေါ်ခဲ့သည်။ နံရံများပေါ်တွင် မြေပုံဟောင်းများ၊ ကျောင်းသားများ၏ ရေအမြင့်ဇယား၊ ပြုပြင်ထားသော ရေမြောင်း၏ ဓာတ်ပုံများနှင့် အိမ်နီးချင်းများကို ကူညီခဲ့သူများ၏ အတွေ့အကြုံဇာတ်လမ်းများကို ပြသထားသည်။ ထိုပြပွဲသည် ရေကြီးမှုကို ဂုဏ်ပြုခြင်းမဟုတ်ပါ။ ကြိုတင်သေချာစွာ ပြင်ဆင်ခဲ့သူများ၊ ယုံကြည်စိတ်ချရသော သတင်းအချက်အလက်များ မျှဝေခဲ့သူများနှင့် နောက်ပိုင်းတွင် အတူတကွ လုပ်ဆောင်ခဲ့သူများကို အသိအမှတ်ပြုခြင်းဖြစ်သည်။ ဒေါ်နှင်းက တံတားဟောင်း၏ ဓာတ်ပုံကို ယူလာပြီး သူမ လှေမောင်းစလုပ်ခဲ့သည့်အချိန်မှစ၍ မြို့သည် မည်သို့ပြောင်းလဲလာကြောင်း ရှင်းပြခဲ့သည်။ ကလေးငယ်များက မြစ်ရေအမြင့်တိုင်းကိရိယာကို ဖတ်နည်း လီနာကို မေးကြပြီး သူမက မြေပုံပေါ်ရှိ ဘေးကင်းသောကြည့်ရှုစင်ကို ပြသခဲ့သည်။ ရေစီးအားပြင်းသောနေရာသို့ ဘယ်တော့မှ မချဉ်းကပ်ရန်နှင့် တရားဝင်ညွှန်ကြားချက်များကို အမြဲလိုက်နာရန်လည်း သူမ ပြောပြခဲ့သည်။ သင်ယူမှုသည် လက်တွေ့အသုံးဝင်သော ဝန်ဆောင်မှုအဖြစ် ပြောင်းလဲနိုင်ကြောင်း ပြသခဲ့သည့်အတွက် မစ္စတာဒန်နီယယ်က အတန်းကို ချီးကျူးခဲ့သည်။ ဧည့်သည်များက နောက်နှစ်ပရောဂျက်အတွက် အကြံပြုချက်များ ချန်ထားခဲ့ကြပြီး သောက်ရေရရှိနိုင်မှုကို စစ်ဆေးရန်နှင့် ခိုလှုံရာအနီး အရိပ်ရနေရာများ တိုးတက်အောင်လုပ်ရန် အကြံများလည်း ပါဝင်ခဲ့သည်။",
      "နောက်ကျောင်းစာသင်ကာလတွင် မစ္စတာဒန်နီယယ်က ငယ်ရွယ်သောကျောင်းသားများ ကိုယ်ပိုင်လေ့လာမှတ်စုစာအုပ် စတင်ရေးနိုင်ရန် လီနာကို ကူညီပေးစေခဲ့သည်။ သူမက မိမိရေးထားသမျှကို ကူးရေးရန် မပြောခဲ့ပါ။ ယင်းအစား ရက်စွဲရေးနည်း၊ မိမိတကယ်မြင်တွေ့နိုင်သည့်အရာကို ဖော်ပြနည်းနှင့် အချက်အလက်တစ်ခုကို ခန့်မှန်းချက်တစ်ခုမှ ခွဲခြားနည်းတို့ကို ပြသခဲ့သည်။ ကလေးတစ်ဦးက မိုးတိမ်မည်းတိုင်းသည် ရေကြီးတော့မည်ဟု ရေးခဲ့သည်။ ထိုအယူအဆကို စမ်းသပ်ရန် မည်သည့်သက်သေလိုအပ်မည်နည်းဟု လီနာ မေးခဲ့ပြီး အတန်းက ထိုပြောဆိုချက်ကို တရားဝင်မိုးရေချိန်နှင့် မြစ်ရေအစီရင်ခံစာများနှင့် နှိုင်းယှဉ်ခဲ့ကြသည်။ မိုးတိမ်များသည် မတူညီသော မိုးရေပမာဏကို ဖြစ်စေနိုင်ကြောင်း၊ အဝေးရှိရာသီဥတုကြောင့်လည်း မြစ်ရေတက်လာနိုင်ကြောင်း သူတို့ သင်ယူခဲ့ကြသည်။ အဖြေမသိသည့်အခါ ရှက်ရွံ့မနေဘဲ မေးခွန်းမေးတတ်ရန် ကလေးများ လေ့ကျင့်ခဲ့ကြသည်။ သင်ကြားပေးရင်း မိမိလည်း များစွာသင်ယူနေရကြောင်း လီနာ အံ့ဩခဲ့သည်။ အယူအဆတစ်ခုကို ရှင်းလင်းစွာ ဖော်ပြခြင်းက မိမိနားလည်မှုတွင် လိုအပ်နေသည့်အပိုင်းများကို ဖော်ထုတ်ပေးသောကြောင့် သူမသည် အင်ဂျင်နီယာ၏မှတ်စုများကို ပြန်ဖတ်ကာ အသေးစိတ်များကို စစ်ဆေးပြီးမှ ဖြေကြားခဲ့သည်။",
      "ရေကြီးပြီးနောက် ကျန်းမာရေးအကြောင်း ဆွေးနွေးရန် ကျောင်းက သူနာပြုတစ်ဦးကိုလည်း ဖိတ်ခေါ်ခဲ့သည်။ ကြည်လင်နေသောရေသည်ပင် သောက်သုံးရန် ဘေးကင်းမည်ဟု မဆိုနိုင်ကြောင်း၊ သောက်ရေ၊ ဒဏ်ရာများကို သန့်ရှင်းရေးလုပ်ခြင်းနှင့် ပျက်စီးနေသောအဆောက်အအုံများသို့ ပြန်ဝင်ခြင်းတို့အတွက် ဒေသခံအာဏာပိုင်များ၏ အကြံပြုချက်များကို လိုက်နာသင့်ကြောင်း သူမ ရှင်းပြခဲ့သည်။ ကျောင်းသားများက ငယ်ရွယ်သောကလေးများ နားလည်နိုင်မည့် စကားလုံးများဖြင့် ရိုးရှင်းသော သတင်းအချက်အလက်စာရွက်တစ်ရွက် ပြုလုပ်ခဲ့ကြသည်။ ကိုယ်တိုင် ဆေးဘက်ဆိုင်ရာအကြံဉာဏ်များ ဖန်တီးပြောဆိုမည့်အစား ဝါကျတစ်ကြောင်းချင်းစီကို သူနာပြုနှင့် စစ်ဆေးခဲ့ကြသည်။ ထိုစာရွက်တွင် ဆေးခန်း၏ တရားဝင်ဆက်သွယ်ရန်လမ်းကြောင်း ပါဝင်ပြီး မသေချာသည့်အခါ အရည်အချင်းပြည့်မီသော ဝန်ထမ်းများကို မေးမြန်းရန် မိသားစုများကို သတိပေးထားသည်။ သတင်းအချက်အလက်ကောင်းတစ်ခုသည် အကြောင်းအရာနှင့် ကိုက်ညီရမည်ဖြစ်ကြောင်း လီနာ သင်ယူခဲ့သည်—ကျောင်းသားများက အချက်အလက်ကို ဖတ်ရလွယ်ကူအောင် ကူညီနိုင်သော်လည်း ကျန်းမာရေးလမ်းညွှန်ချက်ကို လေ့ကျင့်သင်ကြားထားသော ကျန်းမာရေးဝန်ထမ်းများက အတည်ပြုရမည်ဖြစ်သည်။ အတန်းက အဓိကအချက်များကို ဝီလိုးဘရွတ်ရှိ မိသားစုများ အသုံးပြုသော ဘာသာစကားများသို့ ဘာသာပြန်ပြီး စကားအသုံးအနှုန်းကို လူကြီးများက ပြန်လည်စစ်ဆေးပေးရန် တောင်းဆိုခဲ့သည်။ သူတို့၏လုပ်ဆောင်မှုက ပညာရှင်၏အကြံဉာဏ်ကို အစားမထိုးဘဲ ဒေသခံများ ပိုမိုနားလည်နိုင်ရန် ကူညီပေးခဲ့သည်။",
      "အာရွန်က ချိုင့်ဝှမ်းတစ်လျှောက် ရေမည်သို့ စီးဆင်းသွားသည်ကို ပြသရန် မြို့၏ပုံစံငယ်တစ်ခု တည်ဆောက်လိုခဲ့သည်။ ကျောင်းသားများသည် ကတ်ထူပြား၊ ရွှံ့နှင့် ပြန်လည်အသုံးပြုထားသော သေတ္တာများကို အသုံးပြုပြီး မြစ်၊ တောင်ကုန်းများ၊ စိုစွတ်မြေ၊ လမ်းများနှင့် အဆောက်အအုံများကို ဂရုတစိုက် အညွှန်းတပ်ခဲ့ကြသည်။ ပထမပုံစံငယ်တွင် တောင်ကုန်းများ အလွန်မတ်စောက်ပြီး စိုစွတ်မြေဧရိယာ အလွန်သေးငယ်နေသောကြောင့် ရေအလွန်များသည် မြို့ထဲသို့ တိုက်ရိုက်စီးဝင်သွားခဲ့သည်။ အမှားကို ဖုံးကွယ်မည့်အစား သူတို့သည် ပုံစံကို ပြောင်းလဲပြီး စမ်းသပ်ပြသမှုကို ထပ်မံပြုလုပ်ခဲ့ကြသည်။ ထိုပုံစံငယ်သည် သိပ္ပံနည်းကျ ရေကြီးမှုခန့်မှန်းချက် မဟုတ်ကြောင်း ရှင်းလင်းစွာ အညွှန်းတပ်ထားခဲ့သည်။ သို့သော် မြစ်ညာဘက်ရှိ မြေအသုံးချမှုသည် မြစ်အောက်ဘက်ရှိ လမ်းများအပေါ် အဘယ်ကြောင့် သက်ရောက်နိုင်ကြောင်းကို ဧည့်သည်များ နားလည်စေရန် ကူညီပေးခဲ့သည်။ တကယ့်သဘာဝမြေမျက်နှာသွင်ပြင်သည် စာသင်ခန်းပုံစံငယ်ထက် ပိုမိုရှုပ်ထွေးကြောင်း မစ္စခင်က သတိပေးခဲ့သည်။ ပုံစံငယ်က ဘာကို ပြသနိုင်ပြီး ဘာကို သက်သေမပြနိုင်ကြောင်း လီနာက မှတ်ချက်တစ်ခု ထပ်ရေးခဲ့သည်။ မပြည့်စုံသေးသော အယူအဆတစ်ခုကို ပွင့်လင်းစွာ စမ်းသပ်ခြင်းဖြင့် တိုးတက်အောင် ပြင်ဆင်နိုင်ခြင်းကို သူမ သဘောကျခဲ့သည်။",
      "ပြပွဲ ပိုမိုကျယ်ပြန့်လာသည်နှင့်အမျှ ကျောင်းသားများသည် ကျောင်းပြီးသွားပြီးနောက်တွင်လည်း မှတ်တမ်းများကို အသုံးဝင်အောင် မည်သို့ထိန်းသိမ်းရမည်ကို ဆွေးနွေးခဲ့ကြသည်။ ကျောင်းတွင် အတည်ပြုထားသော မြေပုံများ၊ အများပြည်သူသုံးအစီရင်ခံစာများနှင့် အချက်အလက်တစ်ခုချင်းစီကို စစ်ဆေးခဲ့သည့်ရက်များအတွက် မျှဝေသုံးစွဲနိုင်သော ဖိုင်တွဲတစ်ခု ဖန်တီးခဲ့ကြသည်။ ကိုယ်ရေးကိုယ်တာမေးမြန်းချက်များကို ခွင့်ပြုချက်ရမှသာ သိမ်းဆည်းပြီး အများပြည်သူပြသမှုများမှ ကိုယ်ရေးကိုယ်တာအသေးစိတ်များကို ချန်လှပ်ထားခဲ့သည်။ မှတ်တမ်းများကို စနစ်တကျထိန်းသိမ်းရန်နှင့် မည်သူက ပြင်ဆင်ခွင့်ရှိသည်ကို ဆုံးဖြတ်ရန် ဆရာတစ်ဦးကို တာဝန်ပေးခဲ့သည်။ အမှားတစ်ခုကို ပြင်ဆင်နည်းကိုလည်း အဖွဲ့က ရေးမှတ်ခဲ့သည်—ယခင်ဗားရှင်းကို မှတ်တမ်းတင်ရန်၊ အချက်အလက်အသစ်ကို အတည်ပြုရန်၊ မည်သူစစ်ဆေးခဲ့ကြောင်း ရေးမှတ်ရန်နှင့် ပြောင်းလဲသည့်ရက်စွဲကို ဖော်ပြရန်ဖြစ်သည်။ ထိုလုပ်ငန်းစဉ်သည် ဓာတ်ပုံအသစ်များ စုဆောင်းခြင်းလောက် စိတ်လှုပ်ရှားဖွယ်မကောင်းသော်လည်း ပရောဂျက်တွင် ရှုပ်ထွေးမှုများ မဖြစ်စေရန် ကာကွယ်ပေးခဲ့သည်။ ညွှန်ကြားချက်ဟောင်းများကို လက်ရှိညွှန်ကြားချက်များဟု ထင်မှတ်မိသည့်အခါ သို့မဟုတ် အတည်ပြုထားသောအစီရင်ခံစာနှင့် မအတည်ပြုရသေးသောသတင်းကို ခွဲခြားမရသည့်အခါ သတင်းအချက်အလက်သည် အန္တရာယ်ဖြစ်စေနိုင်ကြောင်း လီနာ နားလည်လာသည်။",
      "စနေနေ့တစ်နေ့တွင် ဈေးအသင်းက မိုးရာသီအတွင်း လမ်းများသန့်ရှင်းနေစေရန် အစည်းအဝေးတစ်ခု ကျင်းပခဲ့သည်။ အမှိုက်ပုံးများထားပါက နေရာယူသွားမည်ကို ရောင်းသူအချို့ စိုးရိမ်ကြသော်လည်း အခြားသူများက အမှိုက်များ ပြည့်လျှံနေခြင်းကြောင့် ဆိုင်များပတ်ဝန်းကျင် မသန့်ရှင်းဖြစ်နေပြီဟု ပြောကြသည်။ အဖွဲ့သည် သန့်ရှင်းရေးဝန်ထမ်းတစ်ဦးနှင့်အတူ ဈေးတစ်လျှောက် လှည့်လည်ပြီး ဝယ်သူများ၏လမ်းကြောင်း သို့မဟုတ် အရေးပေါ်ဝင်ထွက်လမ်းကို မပိတ်ဆို့ဘဲ အမှိုက်ပုံးများကို လက်လှမ်းမီစွာ ထားနိုင်မည့်နေရာများကို ရှာဖွေခဲ့သည်။ အမှိုက်သိမ်းမည့် အချိန်ဇယားကို သဘောတူသတ်မှတ်ပြီး ဆိုင်တစ်ဆိုင်ချင်းစီက မိမိတို့အနီးပတ်ဝန်းကျင်ကို ရှင်းလင်းထားရန် တောင်းဆိုခဲ့သည်။ မည်သည့်ပစ္စည်းကို မည်သည့်ပုံးထဲ ထည့်ရမည်ကို ပြသသော ဆိုင်းဘုတ်ငယ်တစ်ခုကို မြို့က ပုံနှိပ်ပေးခဲ့ပြီး တူညီသောဘာသာစကားကို မဖတ်တတ်သူများအတွက် ပုံများကို အသုံးပြုထားသည်။ နှစ်ပတ်အကြာတွင် အစီအစဉ်ကို ပြန်လည်သုံးသပ်ခဲ့ပြီး အမှိုက်ပုံးတစ်ပုံးသည် ကျဉ်းမြောင်းသောလမ်းလျှောက်လမ်းနှင့် နီးလွန်းနေသောကြောင့် နေရာရွှေ့ခဲ့သည်။ လက်တွေ့ဘဝတွင် စမ်းသပ်ပြီးနောက် ရပ်ရွာ၏ဖြေရှင်းနည်းတစ်ခုကို ပြင်ဆင်ညှိနှိုင်းနိုင်သည်ကို မြင်ရသဖြင့် လီနာ သဘောကျခဲ့သည်။ အသုံးဝင်သောအစီအစဉ်ဆိုသည်မှာ ဘယ်တော့မှ မပြောင်းလဲသောအစီအစဉ်မဟုတ်ဘဲ သက်သေအထောက်အထားများကို တာဝန်ယူမှုရှိစွာ တုံ့ပြန်နိုင်သောအစီအစဉ်ဖြစ်သည်။",
      "လီနာ၏ဖခင်သည် ပြန်လည်ထူထောင်ရေးကာလအတွင်း ခိုလှုံရာနေရာ၊ ဆေးခန်းနှင့် မြင့်သောလမ်းများကြား သွားလာရန်လိုအပ်သော စေတနာ့ဝန်ထမ်းများ၏ စက်ဘီးများကို ပြုပြင်ပေးခဲ့သည်။ ဘေးကင်းရေးကို လျစ်လျူရှုသော အမြန်ပြုပြင်မှုက နောက်ထပ်ပြဿနာဖြစ်စေနိုင်သောကြောင့် ဘရိတ်၊ မီးနှင့် တာယာများကို စစ်ဆေးပြီးမှသာ စက်ဘီးတစ်စီးချင်းစီကို ပြန်ပေးခဲ့သည်။ လီနာက အသုံးပြုခဲ့သော ကိရိယာများနှင့် အပိုပစ္စည်းများကို မှတ်တမ်းတင်ရာတွင် ကူညီခဲ့ပြီး နည်းပညာဆိုင်ရာ ဆုံးဖြတ်ချက်များကိုတော့ ဖခင်က ချမှတ်ခဲ့သည်။ အိမ်နီးချင်းအချို့က ငွေအနည်းငယ် သို့မဟုတ် အသုံးဝင်သောကိရိယာများ လှူဒါန်းခဲ့ကြပြီး ဆိုင်တွင် လက်ခံရရှိသည့်ပစ္စည်းများနှင့် ၎င်းတို့ကို မည်သို့အသုံးပြုခဲ့ကြောင်း ရှင်းလင်းသောစာရင်းကို ပြသထားခဲ့သည်။ ထိုမှတ်တမ်းများကြောင့် နားလည်မှုလွဲမှားခြင်းများကို ကာကွယ်နိုင်ပြီး လှူဒါန်းသူများကို မှန်ကန်စွာ ကျေးဇူးတင်ရန်လည်း လွယ်ကူလာသည်။ ကူညီပေးသူများက မိမိတို့ဆုံးဖြတ်ချက်များကို ရှင်းပြပြီး မလုပ်ပေးနိုင်သည့်အရာများကို ရိုးသားစွာ ဝန်ခံသည့်အခါ ယုံကြည်မှု ပိုမိုတိုးလာကြောင်း လီနာ သတိပြုမိသည်။ ရပ်ရွာအလုပ်ဆိုသည်မှာ ရက်ရောမှုတစ်ခုတည်းမဟုတ်ဘဲ သေချာသောစီမံကိန်း၊ ဘေးကင်းသောနည်းလမ်းများနှင့် ရိုးသားသောမှတ်တမ်းများလည်း လိုအပ်သည်။",
      "နှစ်ကုန်တွင် လီနာသည် တံတားဘေးရှိ ကျောက်တုံးဆီ ပြန်သွားပြီး နောက်ဆုံးထုတ်ပြန်ထားသော ရေအမြင့်အမှတ်ကို သူမ၏ဇယားတွင် ထည့်သွင်းခဲ့သည်။ မြို့သည် အနာဂတ်ရေကြီးမှုတိုင်းမှ လုံးဝဘေးကင်းသွားပြီဟု သူမ မရေးခဲ့ပါ။ ယင်းအစား တိုးတက်လာသည့်အချက်များ၊ ကျန်ရှိနေသေးသော စိုးရိမ်ချက်များနှင့် အချက်အလက်များကို နောက်တစ်ကြိမ် ပြန်လည်သုံးသပ်ရမည့်ရက်တို့ကို မှတ်တမ်းတင်ခဲ့သည်။ ရေမြောင်းကို ပုံမှန်စစ်ဆေးရန် လိုအပ်နေသေးကြောင်း၊ သစ်ပင်များကို ပြုစုထိန်းသိမ်းရမည်ဖြစ်ကြောင်းနှင့် သတိပေးအစီအစဉ်သည် ယုံကြည်စိတ်ချရသော ဆက်သွယ်မှုအပေါ် မူတည်ကြောင်း သူမ မှတ်သားခဲ့သည်။ အတန်းဖော်များကလည်း ဘာတွေ အလုပ်ဖြစ်ခဲ့ပြီး နောက်တစ်ကြိမ် ဘာတွေပြောင်းလဲသင့်ကြောင်း မိမိတို့၏အမြင်များကို ထည့်သွင်းခဲ့ကြသည်။ အရာအားလုံးကို သေချာသိနေခြင်းသည် တာဝန်ယူမှု၏ အဓိပ္ပာယ်မဟုတ်ဘဲ သက်သေအထောက်အထားများအပေါ် ရိုးသားပြီး ဆက်လက်သင်ယူနေခြင်းဖြစ်ကြောင်း မစ္စတာဒန်နီယယ်က ပြောခဲ့သည်။ လီနာသည် တိတ်ဆိတ်သောဂုဏ်ယူမှုဖြင့် မှတ်စုစာအုပ်ကို ပိတ်လိုက်သည်။ မြစ်သည် ဆက်လက်ပြောင်းလဲနေဦးမည်ဖြစ်သော်လည်း ဝီလိုးဘရွတ်မြို့သည် ဂရုတစိုက်စောင့်ကြည့်ခြင်း၊ အသိပညာမျှဝေခြင်းနှင့် အချင်းချင်းကူညီပြင်ဆင်ခြင်းတို့တွင် ပိုမိုကောင်းမွန်လာခဲ့သည်။",
      "ထိုနောက်ပိုင်း တိတ်ဆိတ်သော ရက်သတ္တပတ်များအတွင်း လီနာသည် ဥယျာဉ်ဟောင်းနှင့် မြက်ခင်းစောင်း ဆုံရာ မြစ်အထက်ရှိ သူမအကြိုက်ဆုံးနေရာသို့ ပြန်သွားခဲ့သည်။ သူမသည် တောင်ကုန်းများကို ဖြတ်သန်းသွားသော မိုးတိမ်များကို ကြည့်ပြီး မြစ်ကွေ့တစ်လျှောက် စီးဆင်းနေသောရေသံကို နားထောင်ခဲ့သည်။ မြစ်သည် ငြိမ်းချမ်းနေသကဲ့သို့ မြင်ရသော်လည်း ငြိမ်သက်နေခြင်းကို အရာအားလုံးသေချာပြီဟု သူမ မယူဆတော့ပါ။ ဂရုတစိုက်တိုင်းတာမှုများ၊ ကျန်းမာသော စိုစွတ်မြေများ၊ ဘေးကင်းသောအဆောက်အအုံများ၊ ရှင်းလင်းသောသတိပေးချက်များနှင့် အချင်းချင်းယုံကြည်သော အိမ်နီးချင်းများသည် ရပ်ရွာ၏ခံနိုင်ရည်ရှိမှုအတွက် အရေးပါကြောင်း သူမ သိခဲ့သည်။ မှတ်စုစာအုပ်တစ်အုပ်မျှဖြင့် လေ့ကျင့်သင်ကြားထားသော ကျွမ်းကျင်သူများ သို့မဟုတ် တရားဝင်အရေးပေါ်သတင်းအချက်အလက်များကို အစားထိုး၍မရကြောင်းကိုလည်း သူမ နားလည်ခဲ့သည်။ သူမ၏အလုပ်သည် သေးငယ်သော ပံ့ပိုးမှုတစ်ခုသာဖြစ်သော်လည်း လူကြီးများ ပိုမိုကောင်းမွန်သောမေးခွန်းများ မေးနိုင်ရန်နှင့် အသုံးဝင်သောပြောင်းလဲမှုအချို့ ပြုလုပ်နိုင်ရန် ကူညီပေးခဲ့သည်။ လီနာသည် မှတ်စုစာအုပ်ကို ပိတ်ပြီး ဈေးဆိုင်များ ဖွင့်လှစ်လာကာ ကလေးများ ကျောင်းသို့ လမ်းလျှောက်သွားနေသော ဝီလိုးဘရွတ်မြို့ဘက်သို့ ကြည့်လိုက်သည်။ မြစ်သည် သစ်ရွက်များနှင့် ရောင်ပြန်ပုံရိပ်များကို သယ်ဆောင်လျက် တောင်ကုန်းများဘက်သို့ ဆက်လက်စီးဆင်းနေသည်။ နေရာတစ်ခုကို ဂရုစိုက်ခြင်းသည် ဘယ်တော့မှ ပြီးဆုံးသွားသောအလုပ်မဟုတ်သောကြောင့် လီနာသည် ဆက်လက်သင်ယူရန် အသင့်ဖြစ်နေခဲ့သည်။",
    ]
  }

];
const translations = {
  en: { homeLink:"← Home", skillsLink:"Skills & Levels",chooseLevel:"Choose your CEFR level",chooseLevelSub:"Select one of the six levels, then start the selected skill.",startPractice:"Start selected practice →",changeLevel:"Change skill or level",progressLink:"Progress", eyebrow:"YOUR DAILY ENGLISH PRACTICE",daily:"A little practice goes a long way",minutes:"Start with 5 minutes",chooseSub:"Pick one and start right where you are.",lessonType:"A SHORT READING",beginner:"Beginner",backTop:"Back to top ↑",headline:"Small steps.<br>Stronger English.",intro:"Learn at your pace, even when you are offline.",offline:"Designed for offline learning",start:"GET STARTED",choose:"Choose a skill",reading:"Vocabulary",readingDesc:"Words and example sentences",listening:"Listening",listeningDesc:"Stories to listen to and read",writing:"Writing",writingDesc:"Letters and sentences",speaking:"Speaking",speakingDesc:"Speak aloud and practice",practice:"PRACTICE ROOM",tapHint:"Tap a word in the story to explore its meaning.",word:"WORD",close:"Close",listenStory:"Listen to story",stop:"Stop",speed:"Speed",writePrompt:"Write this sentence: “I learn a little every day.”",speakPrompt:"Read the sentence aloud: “I learn a little every day.”",startSpeaking:"Start speaking practice",pdfTitle:"Bring your own story",pdfBody:"Choose a text-based PDF to read it aloud. The document is processed on this device and is never uploaded. The PDF reader downloads on first use and is cached for later offline use.",pdfChoose:"Choose PDF",pdfLoading:"Reading PDF on this device…",pdfSuccess:"PDF text loaded. Tap any word to look it up, or listen to the story.",pdfError:"Could not read this PDF.",privacy:"Your practice stays on this device in this first version.",characters:"characters",unknown:"No offline definition is available for this word yet.",voiceNote:"Your browser's installed English voice is used. Voice availability varies by device.",noSpeech:"Speech synthesis is not available in this browser.",listeningTitle:"Listen and follow the story",writingTitle:"Practice writing",speakingTitle:"Speaking practice",readTitle:"Read a short story",speakUnsupported:"Speech recognition is not supported by this browser. You can still practice aloud without recording.",permission:"Microphone access was not available. Check your browser permission settings." },
  my: { homeLink:"← ပင်မစာမျက်နှာ", skillsLink:"ကျွမ်းကျင်မှုနှင့် အဆင့်များ",chooseLevel:"CEFR အဆင့်ရွေးပါ",chooseLevelSub:"အဆင့် ၆ ဆင့်ထဲမှ ရွေးပြီး ရွေးထားသော ကျွမ်းကျင်မှုကို စတင်ပါ။",startPractice:"ရွေးထားသော လေ့ကျင့်ခန်း စတင်ရန် →",changeLevel:"ကျွမ်းကျင်မှု သို့မဟုတ် အဆင့် ပြောင်းရန်",progressLink:"လေ့လာမှုတိုးတက်မှု", eyebrow:"နေ့စဉ် အင်္ဂလိပ်စာ လေ့ကျင့်ခန်း",daily:"နေ့စဉ် နည်းနည်းစီ လေ့ကျင့်ခြင်းက တိုးတက်မှုကို ဖြစ်စေသည်",minutes:"၅ မိနစ်မှ စတင်ပါ",chooseSub:"မိမိနှင့် သင့်တော်သော ကဏ္ဍတစ်ခုကို ရွေးပြီး စတင်ပါ။",lessonType:"စာဖတ်လေ့ကျင့်ခန်းတို",beginner:"အစပြုသူ",backTop:"အပေါ်သို့ ပြန်သွားရန် ↑",headline:"အင်္ဂလိပ်စာ ကောင်းလာဖို့<br>နေ့စဉ် တစ်လှမ်းချင်း လှမ်းကြစို့။",intro:"အင်တာနက်မရှိချိန်မှာလည်း ကိုယ့်အရှိန်နဲ့ကိုယ် သင်ယူပါ။",offline:"အင်တာနက်မရှိဘဲ သင်ယူနိုင်ရန် ဒီဇိုင်းလုပ်ထားသည်",start:"စတင်လေ့လာရန်",choose:"ကျွမ်းကျင်မှုတစ်ခု ရွေးပါ",reading:"ဝေါဟာရ",readingDesc:"စကားလုံးနှင့် ဥပမာဝါကျများ",listening:"နားထောင်ခြင်း",listeningDesc:"ပုံပြင်ကို နားထောင်၊ ဖတ်ရှုရန်",writing:"စာရေးခြင်း",writingDesc:"အက္ခရာနှင့် ဝါကျများ",speaking:"စကားပြောခြင်း",speakingDesc:"အသံထွက် လေ့ကျင့်ရန်",practice:"လေ့ကျင့်ခန်း",tapHint:"စကားလုံးအဓိပ္ပာယ်ကြည့်ရန် စကားလုံးကို ထိပါ။",word:"စကားလုံး",close:"ပိတ်ရန်",listenStory:"ပုံပြင်နားထောင်ရန်",stop:"ရပ်ရန်",speed:"အမြန်နှုန်း",writePrompt:"ဤဝါကျကို ရေးပါ — “I learn a little every day.”",speakPrompt:"ဤဝါကျကို အသံထွက်ဖတ်ပါ — “I learn a little every day.”",startSpeaking:"စကားပြောလေ့ကျင့်မှု စတင်ရန်",pdfTitle:"ကိုယ်ပိုင်ပုံပြင် ထည့်သွင်းရန်",pdfBody:"စာသားပါသော PDF ကို ရွေးပြီး ဖုန်းပေါ်တွင် ဖတ်ရှုနားထောင်နိုင်သည်။ PDF ဖိုင်ကို server သို့ upload မလုပ်ပါ။ PDF ဖတ်ရှုသည့် library ကို ပထမဆုံးအသုံးပြုချိန်တွင် အင်တာနက်ဖြင့် ရယူပြီး နောက်ပိုင်း offline အသုံးပြုရန် cache သိမ်းထားသည်။",pdfChoose:"PDF ရွေးရန်",pdfLoading:"PDF ကို ဤစက်ပေါ်တွင် ဖတ်နေသည်…",pdfSuccess:"PDF စာသားထည့်သွင်းပြီးပါပြီ။ စကားလုံးကိုထိ၍ အဓိပ္ပာယ်ကြည့်နိုင်သလို အသံဖြင့်လည်း နားထောင်နိုင်သည်။",pdfError:"ဤ PDF ကို ဖတ်၍မရပါ။",privacy:"ယခုဗားရှင်းတွင် သင်၏လေ့ကျင့်မှုကို ဤစက်ပေါ်တွင်သာ ထားရှိသည်။",characters:"လုံး",unknown:"ဤစကားလုံးအတွက် offline အဓိပ္ပာယ် မထည့်ရသေးပါ။",voiceNote:"ဖုန်းတွင် ထည့်သွင်းထားသော English အသံကို အသုံးပြုသည်။ အသံရရှိမှုသည် စက်ပေါ်မူတည်သည်။",noSpeech:"ဤ browser တွင် အသံထွက်ဖတ်ခြင်း မရနိုင်ပါ။",listeningTitle:"ပုံပြင်ကို နားထောင်ပြီး လိုက်ဖတ်ပါ",writingTitle:"စာရေးလေ့ကျင့်ရန်",speakingTitle:"စကားပြောလေ့ကျင့်မှု",readTitle:"ပုံပြင်တိုတစ်ပုဒ် ဖတ်ရန်",speakUnsupported:"ဤ browser တွင် အသံမှ စာသားပြောင်းသည့်စနစ် မရနိုင်ပါ။ အသံထွက်လေ့ကျင့်နိုင်သေးသည်။",permission:"မိုက်ခရိုဖုန်းခွင့်ပြုချက် မရရှိပါ။ Browser ခွင့်ပြုချက်များကို စစ်ဆေးပါ။" }
};
const savedLanguage = readLocalValue("le.language", "en");
let language = savedLanguage === "my" ? "my" : "en";
let activeSkill = "reading";
let speechRecognition = null;

const pageCopy = {
  home: { en: { title: "Learn at your own pace", description: "Choose a skill and continue with a focused practice page.", eyebrow: "YOUR DAILY LEARNING PATH" }, my: { title: "မိမိနှုန်းထားအတိုင်း လေ့လာပါ", description: "ကျွမ်းကျင်မှုတစ်ခုကို ရွေးချယ်ပြီး သက်ဆိုင်ရာစာမျက်နှာတွင် အာရုံစိုက်လေ့ကျင့်ပါ။", eyebrow: "နေ့စဉ်လေ့လာမှု လမ်းကြောင်း" } },
  skills: { en: { title: "Four skills · Six levels", description: "Choose a skill and a CEFR level here. Your practice pages stay focused on the exercise.", eyebrow: "CHOOSE YOUR LEARNING PATH" }, my: { title: "ကျွမ်းကျင်မှု ၄ မျိုး · အဆင့် ၆ ဆင့်", description: "ကျွမ်းကျင်မှုနှင့် CEFR အဆင့်ကို ဤနေရာတွင် ရွေးပါ။ လေ့ကျင့်ခန်းစာမျက်နှာများတွင် လေ့ကျင့်မှုကိုသာ အာရုံစိုက်နိုင်သည်။", eyebrow: "သင်ယူမှုလမ်းကြောင်း ရွေးချယ်ပါ" } },
  progress: { en: { title: "Your learning progress", description: "Review your completed skill-level practices. Your progress stays on this device unless you export it.", eyebrow: "YOUR LEARNING JOURNEY" }, my: { title: "လေ့လာမှုတိုးတက်မှု", description: "ပြီးမြောက်ထားသော ကျွမ်းကျင်မှုလေ့ကျင့်ခန်းများကို ကြည့်ပါ။ Export မလုပ်ပါက မှတ်တမ်းကို ဤစက်ပေါ်တွင်သာ သိမ်းထားသည်။", eyebrow: "သင်ယူမှုခရီးစဉ်" } },
  reading: { en: { title: "Vocabulary", description: "Explore everyday words by topic, with meanings and example sentences.", eyebrow: "WORDS · MEANING · EXAMPLES" }, my: { title: "ဝေါဟာရ", description: "နေ့စဉ်သုံး စကားလုံးများကို အမျိုးအစားအလိုက် လေ့လာပြီး အဓိပ္ပာယ်နှင့် ဥပမာဝါကျများကို ကြည့်ပါ။", eyebrow: "စကားလုံး · အဓိပ္ပာယ် · ဥပမာ" } },
  listening: { en: { title: "Listening practice", description: "Listen to English at a comfortable speed and follow along with the text.", eyebrow: "LISTEN · FOLLOW · REPEAT" }, my: { title: "နားထောင်လေ့ကျင့်ခန်း", description: "မိမိနှင့်သင့်တော်သော အမြန်နှုန်းဖြင့် အင်္ဂလိပ်စာကို နားထောင်ပြီး စာသားနှင့်အတူ လိုက်လေ့ကျင့်ပါ။", eyebrow: "နားထောင်ပါ · လိုက်ဖတ်ပါ · ထပ်လေ့ကျင့်ပါ" } },
  writing: { en: { title: "Writing practice", description: "Build clear letter shapes and practise writing words and sentences.", eyebrow: "TRACE · WRITE · IMPROVE" }, my: { title: "စာရေးလေ့ကျင့်ခန်း", description: "စာလုံးပုံစံများကို မှန်ကန်စွာ လိုက်ရေးပြီး စကားလုံးနှင့် ဝါကျများကို လေ့ကျင့်ပါ။", eyebrow: "လိုက်ရေးပါ · ရေးသားပါ · တိုးတက်ပါ" } },
  speaking: { en: { title: "Speaking practice", description: "Practise saying useful English sentences aloud, at your own pace.", eyebrow: "SPEAK · PRACTISE · BUILD CONFIDENCE" }, my: { title: "စကားပြောလေ့ကျင့်ခန်း", description: "နေ့စဉ်အသုံးဝင်သော အင်္ဂလိပ်ဝါကျများကို မိမိအရှိန်အဟုန်ဖြင့် အသံထွက်လေ့ကျင့်ပါ။", eyebrow: "ပြောပါ · လေ့ကျင့်ပါ · ယုံကြည်မှုတည်ဆောက်ပါ" } }
};
const validPages = new Set(["home", "skills", "reading", "listening", "writing", "speaking", "progress"]);
function currentPage() {
  const route = location.hash.slice(1).split("/").filter(Boolean)[0];
  return validPages.has(route) ? route : "home";
}
function renderPage() {
  const page = currentPage();
  const copy = pageCopy[page][language];
  document.body.dataset.page = page;
  const navigation = $("#page-navigation");
  navigation.hidden = page === "home";
  $("#page-title").textContent = copy.title;
  $("#page-description").textContent = copy.description;
  navigation.querySelector(".eyebrow").textContent = copy.eyebrow;
  document.title = page === "home" ? "Learning Everyday — Your English practice space" : `${copy.title} — Learning Everyday`;
  if (page === "reading") {
    $("#curriculum-title").textContent = language === "my" ? "အမျိုးအစားအလိုက် ဝေါဟာရလေ့လာရန်" : "Vocabulary by topic";
    $("#curriculum-title").nextElementSibling.textContent = language === "my" ? "စကားလုံးတစ်လုံးကို ရွေးပါ။ မြန်မာအဓိပ္ပာယ်နှင့် အသုံးပြုပုံ ဥပမာဝါကျကို လေ့လာပါ။" : "Choose a word to see its Myanmar meaning and an example sentence in context.";
  }
  if (["reading", "listening", "writing", "speaking"].includes(page)) {
    updateSkill(page);
  } else if (page === "skills") {
    updateSkill(activeSkill);
  } else if (page === "home") {
    document.querySelectorAll("[data-skill]").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
  }
  syncListeningView(page);
}
window.addEventListener("hashchange", () => {
  renderPage();
  window.scrollTo({ top: 0, behavior: "auto" });
});

function renderListeningLibrary() {
  const grid = $("#listening-story-grid");
  if (!grid) return;
  const isMyanmar = language === "my";
  grid.replaceChildren();
  for (const item of LISTENING_STORIES) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "listening-story-card";
    card.dataset.storyId = item.id;
    card.setAttribute("aria-label", `${isMyanmar ? item.myTitle : item.title}, ${item.level}`);
    const art = document.createElement("span");
    art.className = "story-card-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = item.icon;
    const meta = document.createElement("span");
    meta.className = "story-card-meta";
    const level = document.createElement("span");
    level.className = "story-level-pill";
    level.textContent = item.level;
    const category = document.createElement("span");
    category.className = "story-card-category";
    category.textContent = isMyanmar ? item.myCategory : item.category;
    meta.append(level, category);
    const title = document.createElement("span");
    title.className = "story-card-title";
    title.textContent = isMyanmar ? item.myTitle : item.title;
    const summary = document.createElement("span");
    summary.className = "story-card-summary";
    summary.textContent = isMyanmar ? item.mySummary : item.summary;
    const action = document.createElement("span");
    action.className = "story-card-action";
    action.textContent = isMyanmar ? "ဖတ်ရှုနားထောင်ရန် →" : "Read & listen →";
    card.append(art, meta, title, summary, action);
    card.addEventListener("click", () => {
      // Commit navigation first so a device-specific speech API error cannot block story opening.
      location.hash = `#/listening/${item.id}`;
      // Render immediately instead of relying only on a later hashchange event.
      // This guarantees the reader panel opens even if a webview delays hashchange.
      renderPage();
      window.scrollTo({ top: 0, behavior: "auto" });
      try {
        stopStoryNarration();
      } catch {
        // Navigation must still succeed even if speech cleanup fails on this browser.
      }
    });
    grid.append(card);
  }
  $("#listening-library-title").textContent = isMyanmar ? "ပုံပြင်စာကြည့်တိုက်" : "Story library";
  $("[data-library-eyebrow]").textContent = isMyanmar ? "ပုံပြင်များ စုစည်းမှု" : "STORY COLLECTION";
  $("[data-library-intro]").textContent = isMyanmar ? "ပုံပြင်ကတ်တစ်ခုကို ရွေးပြီး ဖတ်ရှုနားထောင်နိုင်သော စာမျက်နှာသို့ ဝင်ပါ။" : "Choose a story card to open its reading and listening page.";
  $("[data-library-count]").textContent = isMyanmar ? `ပုံပြင် ${LISTENING_STORIES.length} ပုဒ်` : `${LISTENING_STORIES.length} STORIES`;
  $("#back-to-story-library").textContent = isMyanmar ? "← ပုံပြင်စာကြည့်တိုက်သို့" : "← All stories";
}

function syncListeningView(page = currentPage()) {
  const library = $("#listening-library");
  const panel = $("#practice-panel");
  const back = $("#back-to-story-library");
  const translationTools = $("#story-translation-tools");
  const translationToggle = $("#toggle-story-translation");
  const translationPanel = $("#story-translation");
  if (!library || !panel || !back) return;
  const route = location.hash.slice(1).split("/").filter(Boolean);
  if (page !== "listening") {
    if (translationTools) translationTools.hidden = true;
    if (translationToggle) {
      translationToggle.hidden = true;
      translationToggle.setAttribute("aria-expanded", "false");
    }
    if (translationPanel) translationPanel.hidden = true;
    library.hidden = true;
    panel.hidden = false;
    back.hidden = true;
    if (activeListeningStoryId) {
      stopStoryNarration();
      story = readingStory;
      activeStoryTranslations = [];
      activeListeningStoryId = null;
      currentStoryParagraphIndex = 0;
      renderStory();
    }
    return;
  }
  const selected = LISTENING_STORIES.find((item) => item.id === route[1]);
  if (!selected) {
    if (translationTools) translationTools.hidden = true;
    if (translationToggle) {
      translationToggle.hidden = true;
      translationToggle.setAttribute("aria-expanded", "false");
    }
    if (translationPanel) translationPanel.hidden = true;
    stopStoryNarration();
    activeListeningStoryId = null;
    currentStoryParagraphIndex = 0;
    story = readingStory;
    activeStoryTranslations = [];
    renderStory();
    renderListeningLibrary();
    library.hidden = false;
    panel.hidden = true;
    back.hidden = true;
    return;
  }
  if (activeListeningStoryId !== selected.id) {
    if (activeListeningStoryId) stopStoryNarration();
    if (translationPanel) translationPanel.hidden = true;
    if (translationToggle) translationToggle.setAttribute("aria-expanded", "false");
    activeListeningStoryId = selected.id;
    currentStoryParagraphIndex = 0;
    story = typeof selected.text === "string" ? selected.text : selected.text.join("\n\n");
    activeStoryTranslations = selected.paragraphTranslations || [];
    renderStory();
    $("#word-card").hidden = true;
    $("#status-message").textContent = translations[language].voiceNote;
  }
  library.hidden = true;
  panel.hidden = false;
  back.hidden = false;
  renderStoryTranslation(selected);
  $("#panel-title").textContent = language === "my" ? selected.myTitle : selected.title;
  $(".panel-heading .eyebrow").textContent = language === "my" ? "နားထောင်လေ့ကျင့်ခန်း" : "LISTENING STORY";
  $("#lesson-level-tag").textContent = `${selected.level} · ${selected.level === "A1" ? (language === "my" ? "အစပြုသူ" : "Beginner") : selected.level === "A2" ? (language === "my" ? "အခြေခံ" : "Elementary") : (language === "my" ? "အလယ်အလတ်" : "Intermediate")}`;
  $(".lesson-number").textContent = language === "my" ? "ပုံပြင်" : "STORY";
}

function renderStoryTranslation(selected) {
  const tools = $("#story-translation-tools");
  const toggle = $("#toggle-story-translation");
  const panel = $("#story-translation");
  const title = $("#story-translation-title");
  const paragraphs = $("#story-translation-paragraphs");
  if (!toggle || !panel || !title || !paragraphs) return;
  if (tools) tools.hidden = !selected;
  toggle.hidden = !selected;
  if (!selected) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    return;
  }
  const isMyanmar = language === "my";
  title.textContent = isMyanmar ? "မြန်မာဘာသာပြန်" : "Myanmar translation";
  toggle.textContent = panel.hidden
    ? (isMyanmar ? "မြန်မာဘာသာပြန်ကို ပြရန်" : "Show Myanmar translation")
    : (isMyanmar ? "မြန်မာဘာသာပြန်ကို ဖျောက်ရန်" : "Hide Myanmar translation");
  paragraphs.replaceChildren();
  const translation = (selected.paragraphTranslations || [])[currentStoryParagraphIndex];
  if (translation) {
    const paragraph = document.createElement("p");
    paragraph.className = "story-translation-paragraph";
    const number = document.createElement("span");
    number.className = "story-translation-number";
    number.textContent = `${currentStoryParagraphIndex + 1}.`;
    paragraph.append(number, document.createTextNode(` ${translation}`));
    paragraphs.append(paragraph);
  } else {
    const fallback = document.createElement("p");
    fallback.className = "story-translation-paragraph";
    fallback.textContent = language === "my"
      ? "ဤစာပိုဒ်အတွက် ဘာသာပြန်မရရှိသေးပါ။"
      : "Translation is not available for this paragraph yet.";
    paragraphs.append(fallback);
  }
}

function refreshCurrentStoryTranslation() {
  const selected = LISTENING_STORIES.find((item) => item.id === activeListeningStoryId);
  if (selected) renderStoryTranslation(selected);
}

function clearSpeechHighlightTimer() {
  if (activeSpeechHighlightTimer !== null) window.clearInterval(activeSpeechHighlightTimer);
  activeSpeechHighlightTimer = null;
}

function stopStoryNarration() {
  activeStoryUtterance = null;
  activeWordUtterance = null;
  clearSpeechHighlightTimer();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  clearSpeechHighlight();
  const playButton = $("#play-button");
  if (playButton) playButton.disabled = false;
}

function clearSpeechHighlight() {
  document.querySelectorAll("#lesson-text .speech-current-word").forEach((element) => {
    element.classList.remove("speech-current-word");
    element.removeAttribute("aria-current");
  });
}

function highlightSpeechWord(charIndex) {
  if (!Number.isFinite(charIndex) || charIndex < 0) return;
  const words = document.querySelectorAll("#lesson-text .lesson-word[data-speech-start]");
  let active = null;
  for (const word of words) {
    const start = Number(word.dataset.speechStart);
    const end = Number(word.dataset.speechEnd);
    if (charIndex >= start && charIndex < end) {
      active = word;
      break;
    }
  }
  if (!active) return;
  const previous = $("#lesson-text .speech-current-word");
  if (previous === active) return;
  clearSpeechHighlight();
  active.classList.add("speech-current-word");
  active.setAttribute("aria-current", "true");
  const bounds = active.getBoundingClientRect();
  if (bounds.top < 72 || bounds.bottom > window.innerHeight - 48) {
    active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function getStoryParagraphs() {
  return String(story ?? "").split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function getStoryParagraphStart(index, paragraphs = getStoryParagraphs()) {
  return paragraphs.slice(0, index).reduce((total, paragraph) => total + paragraph.length, 0) + Math.max(0, index) * 2;
}

function renderStory() {
  const container = $("#lesson-text");
  const paragraphs = getStoryParagraphs();
  if (currentStoryParagraphIndex >= paragraphs.length) currentStoryParagraphIndex = Math.max(0, paragraphs.length - 1);
  if (currentStoryParagraphIndex < 0) currentStoryParagraphIndex = 0;
  const paragraph = paragraphs[currentStoryParagraphIndex] || "";
  const paragraphStart = getStoryParagraphStart(currentStoryParagraphIndex, paragraphs);
  container.replaceChildren();
  let speechOffset = paragraphStart;
  for (const part of tokenizeStory(paragraph)) {
    const partStart = speechOffset;
    speechOffset += part.text.length;
    if (!part.word) {
      container.append(document.createTextNode(part.text));
      continue;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-word";
    button.textContent = part.text;
    button.dataset.speechStart = String(partStart);
    button.dataset.speechEnd = String(speechOffset);
    button.setAttribute("aria-label", `Look up ${part.word}`);
    const wordParagraphIndex = currentStoryParagraphIndex;
    button.addEventListener("click", () => {
      // If the current card was dismissed by this same tap, do not immediately reopen it.
      if (dismissedWordButton === button) {
        dismissedWordButton = null;
        return;
      }
      dismissedWordButton = null;
      activeWordButton = button;
      showWord(part.word, wordParagraphIndex);
      pronounceWord(part.word);
    });
    container.append(button);
  }
  const pager = $("#story-pagination");
  const pageLabel = $("#story-page-label");
  const previous = $("#story-previous");
  const next = $("#story-next");
  if (pager) pager.hidden = paragraphs.length <= 1;
  if (pageLabel) pageLabel.textContent = language === "my"
    ? `စာပိုဒ် ${currentStoryParagraphIndex + 1} / ${paragraphs.length}`
    : `Paragraph ${currentStoryParagraphIndex + 1} of ${paragraphs.length}`;
  if (previous) {
    previous.disabled = currentStoryParagraphIndex === 0;
    previous.textContent = language === "my" ? "← ရှေ့စာပိုဒ်" : "← Previous";
  }
  if (next) {
    next.disabled = currentStoryParagraphIndex >= paragraphs.length - 1;
    next.textContent = language === "my" ? "နောက်စာပိုဒ် →" : "Next →";
  }
  if (activeListeningStoryId) {
    const selected = LISTENING_STORIES.find((item) => item.id === activeListeningStoryId);
    if (selected) renderStoryTranslation(selected);
  }
}

function pronounceWord(word) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  activeStoryUtterance = null;
  activeWordUtterance = null;
  clearSpeechHighlight();
  $("#play-button").disabled = false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  const voice = selectedEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = clampSpeechRate($("#speech-speed")?.value ?? 0.85);
  activeWordUtterance = utterance;
  utterance.onend = () => {
    if (activeWordUtterance === utterance) activeWordUtterance = null;
  };
  utterance.onerror = () => {
    if (activeWordUtterance !== utterance) return;
    activeWordUtterance = null;
    $("#status-message").textContent = translations[language].noSpeech;
  };
  window.speechSynthesis.speak(utterance);
}

function sentenceAtOffset(paragraph, offset) {
  const sentences = splitEnglishSentences(paragraph);
  const found = sentences.find((sentence) => offset >= sentence.start && offset <= sentence.end);
  return found ? { text: found.text, index: found.index } : { text: paragraph, index: 0 };
}

function showWord(word, paragraphIndex = 0) {
  const wordButton = activeWordButton;
  activeWordParagraphIndex = paragraphIndex;
  const paragraphs = getStoryParagraphs();
  const paragraph = paragraphs[paragraphIndex] || "";
  const paragraphStart = getStoryParagraphStart(paragraphIndex, paragraphs);
  const localOffset = wordButton ? Math.max(0, Number(wordButton.dataset.speechStart) - paragraphStart) : 0;
  const sentence = sentenceAtOffset(paragraph, localOffset);
  const entry = lookupWordInContext(word, sentence.text);
  $("#word-title").textContent = word;
  $("#word-definition").textContent = entry ? entry.meaning + ". " + entry.usage : translations[language].unknown;
  const sentenceContext = $("#word-sentence-context");
  if (sentenceContext) sentenceContext.textContent = sentence.text;
  const contextTranslation = $("#word-context-translation");
  if (contextTranslation) {
    const translatedParagraph = activeStoryTranslations[paragraphIndex] || "";
    const translatedSentences = translatedParagraph.split(/[။.]+/).map((part) => part.trim()).filter(Boolean).map((part) => part + "။");
    const englishSentences = splitEnglishSentences(paragraph);
    if (translatedParagraph && translatedSentences.length === englishSentences.length && translatedSentences[sentence.index]) {
      contextTranslation.textContent = "ဝါကျဘာသာပြန် — " + translatedSentences[sentence.index];
    } else {
      contextTranslation.textContent = translatedParagraph
        ? "စာပိုဒ်ဘာသာပြန် — " + translatedParagraph
        : "ဘာသာပြန်ကို မထည့်ရသေးပါ။";
    }
  }
  const myTranslation = $("#word-myanmar-translation");
  if (myTranslation) {
    myTranslation.textContent = entry?.my
      ? "စကားလုံးအဓိပ္ပာယ် — " + entry.my
      : "ဤစကားလုံးအတွက် offline အဘိဓာန်အချက်အလက် မထည့်ရသေးပါ။";
  }
  $("#pronounce-word").textContent = language === "my" ? "🔊 အသံထွက် နားထောင်ရန်" : "🔊 Hear pronunciation";
  $("#pronounce-word").setAttribute("aria-label", "Pronounce " + word);
  const card = $("#word-card");
  card.hidden = false;
  card.classList.add("word-card-floating");
  const anchor = wordButton?.getBoundingClientRect();
  const width = Math.min(420, window.innerWidth - 24);
  const left = anchor ? Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12)) : 12;
  card.style.left = `${left}px`;
  card.style.width = `${width}px`;
  card.style.top = "12px";
  requestAnimationFrame(() => {
    if (card.hidden) return;
    const height = card.getBoundingClientRect().height;
    const preferredTop = anchor ? anchor.bottom + 8 : 12;
    const top = preferredTop + height <= window.innerHeight - 12
      ? preferredTop
      : Math.max(12, (anchor?.top ?? 12) - height - 8);
    card.style.top = `${top}px`;
  });
}

function setLanguage(next) {
  language = next;
  writeLocalValue("le.language", next);
  document.documentElement.lang = next === "my" ? "my" : "en";
  $("#language-toggle").textContent = next === "en" ? "မြန်မာ" : "English";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[next][key]) element.innerHTML = translations[next][key];
  });
  $("#status-message").textContent = translations[next].voiceNote;
  updateSkill(activeSkill);
  renderPage();
  if (!$("#word-card").hidden) showWord($("#word-title").textContent, activeWordParagraphIndex);
}

function updateSkill(skill) {
  activeSkill = skill;
  document.querySelectorAll("[data-skill]").forEach((button) => {
    const active = button.dataset.skill === skill;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("#writing-exercise").hidden = skill !== "writing";
  $("#speaking-exercise").hidden = skill !== "speaking";
  $("#player-controls").hidden = skill === "writing" || skill === "speaking";
  $("#pdf-note").hidden = skill !== "reading" && skill !== "listening";
  const title = { reading:"readTitle", listening:"listeningTitle", writing:"writingTitle", speaking:"speakingTitle" }[skill];
  $("#panel-title").textContent = translations[language][title];
  const lessonLabels = {
    reading: language === "my" ? "စာဖတ်လေ့ကျင့်ခန်းတို" : "A SHORT READING",
    listening: language === "my" ? "နားထောင်လေ့ကျင့်ခန်း" : "LISTENING PRACTICE",
    writing: language === "my" ? "စာရေးလေ့ကျင့်ခန်း" : "WRITING PRACTICE",
    speaking: language === "my" ? "စကားပြောလေ့ကျင့်ခန်း" : "SPEAKING PRACTICE"
  };
  document.querySelector("[data-i18n='lessonType']").textContent = lessonLabels[skill];
}

let englishVoices = [];

function refreshEnglishVoices() {
  if (!("speechSynthesis" in window)) return;
  englishVoices = window.speechSynthesis.getVoices();
  const select = $("#voice-select");
  if (!select) return;
  const previous = select.value;
  const english = englishVoices.map((voice, index) => ({ voice, index })).filter((item) => /^en([_-]|$)/i.test(item.voice.lang));
  select.replaceChildren();
  const automatic = document.createElement("option");
  automatic.value = "";
  automatic.textContent = "Automatic (best available)";
  select.append(automatic);
  for (const item of english) {
    const option = document.createElement("option");
    option.value = String(item.index);
    option.textContent = item.voice.name + " · " + item.voice.lang + (item.voice.localService ? " · device" : " · system");
    select.append(option);
  }
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  else {
    const best = english.find((item) => /natural|neural|online|google|microsoft|samantha|aria|jenny|guy|ava/i.test(item.voice.name)) ?? english.find((item) => /^en-US$/i.test(item.voice.lang)) ?? english[0];
    if (best) select.value = String(best.index);
  }
}

function selectedEnglishVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const select = $("#voice-select");
  const chosen = select && select.value !== "" ? voices[Number(select.value)] : null;
  if (chosen && /^en([_-]|$)/i.test(chosen.lang)) return chosen;
  const english = voices.filter((voice) => /^en([_-]|$)/i.test(voice.lang));
  return english.find((voice) => /natural|neural|online|google|microsoft|samantha|aria|jenny|guy|ava/i.test(voice.name)) ?? english.find((voice) => /^en-US$/i.test(voice.lang)) ?? english[0] ?? null;
}

if ("speechSynthesis" in window) {
  refreshEnglishVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshEnglishVoices);
  $("#voice-select")?.addEventListener("change", () => {
    const voice = selectedEnglishVoice();
    $("#status-message").textContent = voice ? "Selected " + voice.name + " (" + voice.lang + "). Quality depends on your device's installed voices." : "No English voice is available. Check your device's text-to-speech settings.";
  });
}

function speakStory() {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  activeStoryUtterance = null;
  activeWordUtterance = null;
  clearSpeechHighlightTimer();
  window.speechSynthesis.cancel();
  clearSpeechHighlight();

  // Short paragraph utterances are more reliable on mobile speech engines than
  // one utterance containing an entire multi-thousand-word story.
  const paragraphs = [];
  const paragraphPattern = /[^\n]+/g;
  for (const match of story.matchAll(paragraphPattern)) {
    const text = match[0].trim();
    if (text) {
      paragraphs.push({ text, start: match.index + match[0].indexOf(text) });
      paragraphs[paragraphs.length - 1].index = paragraphs.length - 1;
    }
  }
  if (!paragraphs.length) {
    $("#status-message").textContent = translations[language].voiceNote;
    return;
  }

  const voice = selectedEnglishVoice();
  const rate = clampSpeechRate($("#speech-speed").value);
  let paragraphIndex = 0;

  const speakNextParagraph = () => {
    if (paragraphIndex >= paragraphs.length) {
      activeStoryUtterance = null;
      clearSpeechHighlight();
      $("#play-button").disabled = false;
      $("#status-message").textContent = translations[language].voiceNote;
      return;
    }
    const paragraph = paragraphs[paragraphIndex++];
    if (currentStoryParagraphIndex !== paragraph.index) {
      currentStoryParagraphIndex = paragraph.index;
      $("#word-card").hidden = true;
      renderStory();
      refreshCurrentStoryTranslation();
    }
    const utterance = new SpeechSynthesisUtterance(paragraph.text);
    activeStoryUtterance = utterance;
    utterance.lang = voice?.lang || "en-US";
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    let receivedBoundaryEvent = false;
    let utteranceStartedAt = 0;
    const estimatedDurationMs = Math.max(
      1000,
      (paragraph.text.trim().split(/\s+/).length / (2.4 * rate)) * 1000
    );
    utterance.onstart = () => {
      if (activeStoryUtterance !== utterance) return;
      $("#play-button").disabled = true;
      $("#status-message").textContent = language === "my" ? "နားထောင်နေသည်…" : "Playing story…";
      utteranceStartedAt = Date.now();
      // Some mobile TTS engines never emit word-boundary events. Use an
      // approximate character-position fallback only until a real boundary arrives.
      clearSpeechHighlightTimer();
      activeSpeechHighlightTimer = window.setInterval(() => {
        if (activeStoryUtterance !== utterance) {
          clearSpeechHighlightTimer();
          return;
        }
        if (receivedBoundaryEvent) {
          clearSpeechHighlightTimer();
          return;
        }
        const progress = Math.min(0.96, (Date.now() - utteranceStartedAt) / estimatedDurationMs);
        const estimatedCharIndex = Math.min(
          paragraph.text.length - 1,
          Math.max(0, Math.floor(progress * paragraph.text.length))
        );
        highlightSpeechWord(paragraph.start + estimatedCharIndex);
      }, 120);
    };
    utterance.onboundary = (event) => {
      if (activeStoryUtterance !== utterance) return;
      if (event.name === "word" || Number.isFinite(event.charIndex)) {
        receivedBoundaryEvent = true;
        clearSpeechHighlightTimer();
        highlightSpeechWord(paragraph.start + event.charIndex);
      }
    };
    utterance.onend = () => {
      if (activeStoryUtterance !== utterance) return;
      clearSpeechHighlightTimer();
      speakNextParagraph();
    };
    utterance.onerror = () => {
      if (activeStoryUtterance !== utterance) return;
      clearSpeechHighlightTimer();
      activeStoryUtterance = null;
      clearSpeechHighlight();
      $("#play-button").disabled = false;
      $("#status-message").textContent = translations[language].noSpeech;
    };
    window.speechSynthesis.speak(utterance);
  };

  speakNextParagraph();
}

function startSpeakingPractice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("#speech-result").textContent = translations[language].speakUnsupported;
    return;
  }
  try {
    speechRecognition?.abort();
    speechRecognition = new Recognition();
    speechRecognition.lang = "en-US";
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    $("#speech-result").textContent = language === "my" ? "နားထောင်နေသည်။ ဝါကျကို ပြောပါ…" : "Listening… Say: I learn a little every day.";
    speechRecognition.onresult = (event) => { $("#speech-result").textContent = event.results[0][0].transcript; };
    speechRecognition.onerror = () => { $("#speech-result").textContent = translations[language].permission; };
    speechRecognition.onend = () => { speechRecognition = null; };
    speechRecognition.start();
  } catch { $("#speech-result").textContent = translations[language].permission; }
}

document.querySelectorAll("[data-skill]").forEach((button) => button.addEventListener("click", () => {
  const page = button.dataset.skill;
  if (validPages.has(page) && currentPage() !== "skills") location.hash = `#/${page}`;
  updateSkill(page);
}));
$("#language-toggle").addEventListener("click", () => setLanguage(language === "en" ? "my" : "en"));
$("#toggle-story-translation").addEventListener("click", () => {
  const panel = $("#story-translation");
  panel.hidden = !panel.hidden;
  $("#toggle-story-translation").setAttribute("aria-expanded", String(!panel.hidden));
  if (activeListeningStoryId) {
    const selected = LISTENING_STORIES.find((item) => item.id === activeListeningStoryId);
    renderStoryTranslation(selected);
  }
});
$("#play-button").addEventListener("click", speakStory);
$("#back-to-story-library").addEventListener("click", () => {
  stopStoryNarration();
  location.hash = "#/listening";
});
$("#stop-button").addEventListener("click", () => {
  stopStoryNarration();
  $("#status-message").textContent = translations[language].voiceNote;
});
$("#story-previous").addEventListener("click", () => {
  if (currentStoryParagraphIndex <= 0) return;
  stopStoryNarration();
  currentStoryParagraphIndex -= 1;
  $("#word-card").hidden = true;
  renderStory();
  refreshCurrentStoryTranslation();
});
$("#story-next").addEventListener("click", () => {
  if (currentStoryParagraphIndex >= getStoryParagraphs().length - 1) return;
  stopStoryNarration();
  currentStoryParagraphIndex += 1;
  $("#word-card").hidden = true;
  renderStory();
  refreshCurrentStoryTranslation();
});
$("#close-word").addEventListener("click", () => { $("#word-card").hidden = true; });
document.addEventListener("pointerdown", (event) => {
  const card = $("#word-card");
  const tappedWord = event.target.closest(".lesson-word");
  if (card.hidden) {
    // Clear a stale marker if a previous touch did not produce a click event.
    dismissedWordButton = null;
    return;
  }
  if (event.target.closest("#word-card")) {
    dismissedWordButton = null;
    return;
  }
  if (tappedWord) {
    // Dismiss the existing card on this tap; require a separate tap to open another word.
    dismissedWordButton = tappedWord;
    card.hidden = true;
    return;
  }
  dismissedWordButton = null;
  card.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") $("#word-card").hidden = true;
});
window.addEventListener("resize", () => {
  const card = $("#word-card");
  if (!card.hidden) card.hidden = true;
});
$("#pronounce-word").addEventListener("click", () => pronounceWord($("#word-title").textContent));
$("#writing-input").value = readLocalValue("le.writingDraft", "");
$("#writing-count").textContent = `${countCharacters($("#writing-input").value)} ${translations[language].characters}`;
$("#writing-input").addEventListener("input", (event) => {
  writeLocalValue("le.writingDraft", event.target.value);
  $("#writing-count").textContent = `${countCharacters(event.target.value)} ${translations[language].characters}`;
});
$("#speak-button").addEventListener("click", startSpeakingPractice);
$("#pdf-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const status = $("#pdf-status");
  status.textContent = translations[language].pdfLoading;
  $("#pdf-file").disabled = true;
  try {
    // The PDF stays on-device; only the version-pinned parser module is fetched.
    const pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
    story = await extractPdfText(file, pdfjs);
    readingStory = story;
    renderStory();
    $("#word-card").hidden = true;
    status.textContent = translations[language].pdfSuccess;
    updateSkill("reading");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : translations[language].pdfError;
  } finally {
    $("#pdf-file").disabled = false;
    event.target.value = "";
  }
});

window.addEventListener("pagehide", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); speechRecognition?.abort(); });
renderStory();
updateSkill("reading");
setLanguage(language);
renderPage();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {
    $("#status-message").textContent = "Offline caching could not be enabled in this browser.";
  }));
}


// Keep the Smart Writing Lab highly visible until a sample has been exported.
const writingLabExportKey = "le.writingLab.sampleExported.v3";
function syncWritingLabEntryVisibility() {
  try {
    const exported = window.localStorage.getItem(writingLabExportKey) === "1";
    document.querySelectorAll("[data-writing-lab-entry]").forEach((entry) => {
      if (exported) entry.setAttribute("hidden", "");
      else entry.removeAttribute("hidden");
    });
  } catch {
    // Storage may be unavailable in private browsing; keep the entry visible.
  }
}
syncWritingLabEntryVisibility();
window.addEventListener("pageshow", syncWritingLabEntryVisibility);
window.addEventListener("storage", (event) => {
  if (event.key === writingLabExportKey || event.key === null) syncWritingLabEntryVisibility();
});
