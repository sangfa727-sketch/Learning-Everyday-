import { lookupWord, tokenizeStory, countCharacters, clampSpeechRate } from "./learning-core.js";
import { readLocalValue, writeLocalValue } from "./local-state.js";
import { extractPdfText } from "./pdf-import.js";

const $ = (selector) => document.querySelector(selector);
const DEFAULT_STORY = "Maya has a small garden. Every morning, she waters the flowers. A yellow bird visits the garden and sings in the tree. Maya feels happy when she hears the song.";
let readingStory = DEFAULT_STORY;
let story = DEFAULT_STORY;
let activeListeningStoryId = null;
let activeStoryTranslations = [];
let activeWordParagraphIndex = 0;
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
      "အပင်များသည် ရေတစ်ခုတည်းသာ မလိုအပ်ကြောင်း အဘွားက သင်ပေးခဲ့သည်။ နေရောင်၊ ကောင်းမွန်သောမြေဆီလွှာနှင့် ကြီးထွားရန်အချိန်လည်း လိုအပ်သည်။ Maya သည် ပေါင်းပင်များကို ညင်သာစွာဖယ်ရှားပြီး ခြောက်သွေ့သောသစ်ရွက်များကို မြေထဲထည့်ကာ ပန်းပင်ငယ်များကို လေပြင်းနှင့်ဝေးရာသို့ ရွှေ့ပေးသည်။ အပင်တစ်ပင် အားနည်းနေပုံရလျှင် စွန့်ပစ်မည့်အစား ဘာလိုအပ်သလဲဟု စဉ်းစားပြီး ပြန်လည်ကောင်းမွန်လာရန် ကူညီသည်။",
      "ပူနွေးသော မနက်ခင်းတစ်ခုတွင် Maya သည် သရက်ပင်မှ အသံပျော့ပျော့တစ်ခုကို ကြားလိုက်သည်။ အဝါရောင်ငှက်ကလေးတစ်ကောင်သည် သစ်ကိုင်းပေါ်တွင် ထိုင်ပြီး ဥယျာဉ်ကို လှည့်ကြည့်နေသည်။ Maya က အနီးသို့သွားချင်သော်လည်း အဘွားက တိတ်တိတ်နေပြီး ငှက်ကလေးကို နေရာလွတ်ပေးရန် သတိပေးသည်။ Maya သည် တံခါးဝမှ စောင့်ကြည့်နေသည်။ မကြာမီ ငှက်ကလေးသည် သာယာသော သီချင်းတိုလေးဆိုပြီး ရေတိမ်ပန်းကန်မှ ရေသောက်ရန် ဆင်းလာသည်။",
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
      "စနေနေ့တွင် မိသားစုက မနက်စာကို အတူပြင်ဆင်ရန် စီစဉ်ထားသောကြောင့် Nora သည် စောစောနိုးလာသည်။ အမေက ဈေးဝယ်စာရင်းတိုတစ်ခုနှင့် အဝတ်အိတ်တစ်လုံး ပေးသည်။ Nora သည် မထွက်ခင် စာရင်းကို စစ်ဆေးသည်။ ပန်းသီး၊ ငှက်ပျောသီး၊ ပေါင်မုန့်၊ ကြက်ဥနှင့် နံနံပင်စည်းငယ်တစ်စည်း လိုအပ်သည်။ ပိုက်ဆံအိတ်ထဲက ငွေကို ရေတွက်ပြီး ရင်းနှီးနေသောလမ်းအတိုင်း ဈေးသို့ လမ်းလျှောက်သွားသည်။",
      "ဈေးထဲတွင် အသံများနှင့် အနံ့များ ပြည့်နှက်နေပြီဖြစ်သည်။ ဈေးသည်များက သစ်သီးရောင်စုံများကို အတန်းလိုက်စီထားပြီး မုန့်ဖုတ်သူက ပေါင်မုန့်ပူပူများကို သစ်သားစင်ပေါ်တင်ထားသည်။ ဈေးဝယ်သူများက ဈေးနှုန်းများကို နှိုင်းယှဉ်ကြသည်။ Nora သည် သစ်သီးသည် ဦးလင်းကို နှုတ်ဆက်ပြီး အနာအဆာမရှိသော ပန်းသီးများ ရွေးရန် အကူအညီတောင်းသည်။ ငှက်ပျောသီးမှည့်သည် အညိုစက်အနည်းငယ်ပါသော အဝါရောင်အခွံရှိတတ်ကြောင်း သူက ရှင်းပြသဖြင့် Nora သည် စည်းငယ်တစ်စည်း ရွေးလိုက်သည်။",
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
      "မိုးလျော့လာသောအခါ Ben သည် စက္ကူနှင့် ရောင်စုံခဲတံများကို ယူလာသည်။ လွန်ခဲ့သောနှစ်များက လမ်းပုံစံကို သူ စိတ်ကူးဖြင့် ဆွဲသည်။ အိမ်ငယ်များ၊ လမ်းကျဉ်းတစ်လမ်းနှင့် မြစ်ကိုဖြတ်သည့် တံတားဟောင်းတစ်ခု ပါဝင်သည်။ အဘိုးက အသေးစိတ်များ ထည့်ရန် ကူညီသော်လည်း Ben ကိုယ်တိုင် ရွေးချယ်ခွင့်ပေးသည်။ နောက်ပိုင်းတွင် ဇာတ်လမ်းများကို မှတ်မိစေရန် ပုံများအောက်တွင် စာတန်းတိုများ ရေးကြသည်။",
      "သူတို့ အလုပ်လုပ်နေစဉ် ဓာတ်ပုံများက အသုံးဝင်သော အသေးစိတ်အချက်အလက်များကို ပြနိုင်သော်လည်း ဇာတ်လမ်းတစ်ခုလုံးကို မဖော်ပြနိုင်ကြောင်း အဘိုးက ရှင်းပြသည်။ ဥပမာ ဓာတ်ပုံတစ်ပုံက တံတားအသစ်ကို ပြနိုင်သော်လည်း လူများ ဘာကြောင့်တံတားလိုအပ်ခဲ့ကြောင်း သို့မဟုတ် တံတားဆောက်ခြင်းက သူတို့ဘဝကို မည်သို့ပြောင်းလဲစေခဲ့ကြောင်း မရှင်းပြနိုင်ပါ။ Ben သည် ထိုအတွေးကို မှတ်စုစာအုပ်တွင် ရေးမှတ်သည်။ ဓာတ်ပုံကို ဘယ်သူရိုက်ခဲ့သလဲ၊ ဘယ်အချိန်က ရိုက်ခဲ့သလဲ၊ ဘာတွေ မပါဝင်နိုင်သလဲဟု မေးခြင်းက ပိုမိုသေချာနားလည်စေနိုင်ကြောင်း သူ သိလာသည်။",
      "နောက်မနက်တွင် Ben သည် သူ၏ပုံများကို အနီးအနားတွင်နေသော သူငယ်ချင်းတစ်ဦးအား ပြသည်။ လမ်းဘေးတွင် ယခင်က သစ်ပင်ကြီးတစ်ပင် ရှိခဲ့ပြီး နောက်ပိုင်း ခုတ်လှဲခဲ့ကြောင်း သူငယ်ချင်းက မှတ်မိသည်။ သူတို့သည် ပုံထဲတွင် သစ်ပင်ကို ထည့်ပြီး လူများက အိမ်များနှင့် ဆိုင်များ ဆောက်လာသောအခါ လမ်းများ မည်သို့ပြောင်းလဲလာကြောင်း ဆွေးနွေးကြသည်။ Ben သည် မူရင်းပုံကို သိမ်းထားပြီး မှတ်ချက်များပါသော ဒုတိယပုံတစ်ပုံကို ဆွဲသည်။ မိုးရွာသောနေ့လယ်ခင်းက ဆက်လက်လုပ်ချင်သော စီမံကိန်းတစ်ခု ပေးခဲ့သဖြင့် သူ ဂုဏ်ယူမိသည်။",
      "ညနေစောင်းချိန်တွင် မိုးတိတ်သွားပြီး မိုးတိမ်များကြားမှ ကောင်းကင်ပွင့်လာသည်။ ကွင်းမှာ ရွှံ့များနေသဖြင့် Ben ဘောလုံးမကစားနိုင်သေးသော်လည်း တစ်နေ့တာ အလဟဿဖြစ်သွားသည်ဟု မခံစားတော့ပါ။ သူသည် မိသားစုသမိုင်းကို သိလာပြီး ပုံဆွဲလေ့ကျင့်ကာ အာရုံစိုက်နားထောင်ခဲ့သည်။ ပုံများကို ဖိုင်တွဲထဲထည့်ပြီး နောက်အပတ်တွင် အဘိုးထံမှ နောက်ထပ်ဇာတ်လမ်းတစ်ပုဒ် နားထောင်ရန် ဆုံးဖြတ်လိုက်သည်။"
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
      "Lina သည် ကျောင်းမှ အိမ်ပြန်လာစဉ် ပိတ်ထားသောဆိုင်အနီးမှ ခွေးကလေး၏ ညည်းသံကို ကြားလိုက်သည်။ ကတ်ထူသေတ္တာဘေးတွင် ခြေဖဝါးဖြူသော အညိုရောင်ခွေးကလေးတစ်ကောင် ထိုင်နေသည်။ ပင်ပန်းပြီး ကြောက်ရွံ့နေပုံရကာ အနီးတွင် ပိုင်ရှင်မရှိပါ။ Lina က ချက်ချင်းကောက်ချီချင်သော်လည်း ကြောက်နေသောတိရစ္ဆာန်များကို အလျင်စလို လှုပ်ရှားပါက ပိုမိုထိခိုက်နိုင်ကြောင်း သတိရလိုက်သည်။",
      "သူမသည် အနည်းငယ်အကွာတွင် ရပ်ပြီး နူးညံ့သောအသံဖြင့် ပြောသည်။ ခွေးကလေးသည် တုန်ခါမှုရပ်ပြီး သူမကိုကြည့်သော်လည်း အနီးသို့ မလာသေးပါ။ Lina သည် အနီးရှိ လက်ဖက်ရည်ဆိုင်သို့သွားပြီး ဆိုင်ရှင်ကို အကူအညီတောင်းသည်။ ဆိုင်ရှင်က ရေသန့်ပန်းကန်တစ်လုံး ယူလာပြီး တိရစ္ဆာန်များကို စောင့်ရှောက်တတ်သော အိမ်နီးချင်းတစ်ဦးကို ခေါ်သည်။ သူတို့သည် ခွေးကလေး လူများဝိုင်းမနေဘဲ ရေသောက်နိုင်ကြောင်း သေချာစေသည်။",
      "အိမ်နီးချင်းက ခွေးကလေး၏ လည်ပတ်တွင် ဖုန်းနံပါတ်ရေးထားသော အမှတ်ပြားငယ်တစ်ခု ပါနေသည်ကို သတိထားမိသည်။ သူက ထိုနံပါတ်ကို ဖုန်းဆက်ပြီး တွေ့ရှိသည့်နေရာကို ရှင်းပြသည်။ စောင့်နေစဉ် Lina သည် ယာဉ်အသွားအလာကို စစ်ဆေးပြီး ဆိုင်ရှင်များကို ပိုင်ရှင်တစ်ဦးဦး လာရှာနေသလားဟု မေးသည်။ ပိုင်ရှင်၏ ဖုန်းနံပါတ်ကို အင်တာနက်ပေါ် မတင်ခဲ့ပါ။ ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို သတိထားမျှဝေရမည်ကို သူမ နားလည်သည်။",
      "မကြာမီ စိုးရိမ်နေသော ဖခင်တစ်ဦးနှင့် သမီးငယ်တစ်ဦး ဆိုင်သို့ အမြန်ရောက်လာသည်။ သမီးငယ်က ခွေးကလေးကို ချက်ချင်းမှတ်မိပြီး Milo ဟု ခေါ်လိုက်သည်။ ခွေးကလေးသည် အမြီးလှုပ်ကာ သူမဆီ ပြေးသွားသည်။ ဖခင်က Lina နှင့် အိမ်နီးချင်းကို ကျေးဇူးတင်ပြီး မိသားစုက ဈေးဝယ်ပစ္စည်းများ အိမ်ထဲသယ်နေစဉ် တံခါးဖွင့်နေရာမှ Milo ထွက်ပြေးသွားကြောင်း ရှင်းပြသည်။",
      "နောက်တစ်ပတ်တွင် Lina သည် ပျောက်နေသောတိရစ္ဆာန်များကို ကူညီပုံအကြောင်း ကျောင်းကြေညာဘုတ်အတွက် ပိုစတာငယ်တစ်ခု ပြုလုပ်သည်။ သူမက အဆင့်သုံးဆင့် ရေးထားသည်။ စိတ်တည်ငြိမ်ပါ၊ လုံခြုံသောအကွာအဝေးတွင်နေပါ၊ ယုံကြည်ရသောလူကြီးတစ်ဦးထံ အကူအညီတောင်းပါ။ တိရစ္ဆာန်တစ်ကောင်ကို ယာဉ်အသွားအလာထဲသို့ မောင်းလိုက်ခြင်း သို့မဟုတ် လမ်းညွှန်မှုမရှိဘဲ ဒဏ်ရာကို ကုသရန် ကြိုးစားခြင်း မပြုရကြောင်း ဆရာမက အတန်းသားများကို သတိပေးသည်။ တိရစ္ဆာန်သည် ပြင်းထန်စွာ ထိခိုက်ထားပုံရလျှင် ကိုယ်တိုင်ကယ်ဆယ်ရန် မကြိုးစားဘဲ တာဝန်ရှိသောလူကြီး သို့မဟုတ် တိရစ္ဆာန်စောင့်ရှောက်ရေးဝန်ဆောင်မှုထံ ဆက်သွယ်သင့်သည်။",
      "လည်ပတ်နှင့် ဖုန်းနံပါတ်က အိမ်မွေးတိရစ္ဆာန်ကို အိမ်ပြန်ရောက်စေနိုင်သော်လည်း အချက်အလက်များ ဖတ်လို့ရနေသေးကြောင်း ပိုင်ရှင်များ စစ်ဆေးရမည်ကို Lina သင်ယူခဲ့သည်။ သူမ၏မိသားစုသည် မိမိတို့၏ အိမ်မွေးတိရစ္ဆာန်အမှတ်ပြားတွင် လက်ရှိဆက်သွယ်ရန်နံပါတ်ကို ထည့်ပြီး ခြံတံခါးကို သေချာပိတ်နိုင်ကြောင်း စစ်ဆေးသည်။ Lina သည် မိမိကိုယ်ကို သူရဲကောင်းတစ်ဦးဟု မထင်ပါ။ အလျင်စလိုမလုပ်ဘဲ အကူအညီတောင်းပြီး အတွေ့အကြုံရှိသူများ၏ လမ်းညွှန်မှုကို လိုက်နာနိုင်ခဲ့သည့်အတွက် ဝမ်းသာသည်။",
      "မပြန်မီ ဖခင်သည် Milo ၏ လည်ပတ်ကို စစ်ဆေးပြီး တံခါးကို ပြုပြင်ကာ ပိုမိုလုံခြုံသော အမှတ်ပြားတစ်ခု တပ်ပေးမည်ဟု ကတိပေးသည်။ Lina ပျော်ရွှင်သော်လည်း အရေးကြီးသော သင်ခန်းစာတစ်ခုလည်း ရရှိခဲ့သည်။ တိရစ္ဆာန်ကို ကူညီရာတွင် စိတ်တည်ငြိမ်ရန်၊ တာဝန်ယူနိုင်သော လူကြီးများထံ အကူအညီတောင်းရန်နှင့် တိရစ္ဆာန်အပြင် ပတ်ဝန်းကျင်ရှိလူများ၏ လုံခြုံရေးကိုပါ ဂရုစိုက်ရန် လိုအပ်သည်။ Milo သည် ချစ်ခင်သူများထံ ပြန်ရောက်သွားသဖြင့် Lina ဝမ်းသာစွာ အိမ်ဆက်ပြန်ခဲ့သည်။"
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
      "လမ်းညွှန်သည် လယ်သမားများ အသုံးပြုခဲ့သော ကိရိယာများဖြင့် စတင်ပြသသည်။ သစ်သားထွန်တစ်ခု၊ အသုံးများ၍ ဟောင်းနွမ်းနေသော တံစဉ်တစ်ခုနှင့် မြေအိုးတစ်လုံးကို မှန်နောက်တွင် ထားရှိထားသည်။ ခေတ်မီစက်များ မပေါ်ပေါက်မီ မိသားစုများက အစားအစာကို မည်သို့စိုက်ပျိုးခဲ့ကြောင်း ရှင်းပြသည်။ ကျောင်းသားများသည် ရှေးကိရိယာများကို ယနေ့လယ်ယာကိရိယာများနှင့် နှိုင်းယှဉ်ပြီး ရိုးရှင်းသော်လည်း သေချာစွာ ဒီဇိုင်းဆွဲထားကြောင်း သတိပြုမိကြသည်။",
      "နောက်အခန်းတွင် မြေပုံများ၊ စာများနှင့် အဖြူအမည်းဓာတ်ပုံများကို တွေ့ရသည်။ ဓာတ်ပုံတစ်ပုံတွင် မြစ်ဘေးရှိ လူစည်ကားသောဈေးကို ပြထားပြီး အခြားတစ်ပုံတွင် သစ်သားစားပွဲများရှိသော စာသင်ခန်းထဲ၌ ကလေးများ သင်ယူနေကြသည်။ ကျောင်းသားများက လူများ မည်သို့ခရီးသွားကြသလဲ၊ စာများသည် ဝေးလံသောမြို့များသို့ မည်သို့ရောက်သလဲ၊ လမ်းအမည်အချို့ ဘာကြောင့်ကွဲပြားသလဲဟု မေးကြသည်။ လမ်းညွှန်က ရက်စွဲများကို အလွတ်ကျက်ရုံမဟုတ်ဘဲ မေးခွန်းမေးရန် အားပေးသည်။",
      "Sam သည် မှတ်စုစာအုပ်အတွက် ကျောင်းခေါင်းလောင်းဟောင်းတစ်လုံးကို ရွေးချယ်သည်။ ထိုခေါင်းလောင်းက ကလေးများကို စာသင်ချိန်ခေါ်ရန်နှင့် အစည်းအဝေးစတင်တော့မည်ကို လူများအား အသိပေးရန် အသုံးပြုခဲ့ကြောင်း သူ သိလာသည်။ လွန်ခဲ့သောနှစ်များက ထိုအသံသည် မြို့တစ်ဝန်း ပျံ့နှံ့သွားပုံကို သူ စိတ်ကူးကြည့်သည်။ သူ့သူငယ်ချင်း Aye က ယက်လုပ်ခြင်းပုံစံက ထိုခြင်းကို ဘယ်ရွာက ပြုလုပ်ကြောင်း ဖော်ပြနိုင်သည့် ခြင်းတစ်လုံးကို ရွေးသည်။",
      "Ms Rose သည် ကျောင်းသားများကို ဒုတိယတာဝန်တစ်ခု ပေးသည်။ ပြတိုက်က ဖြေရှင်းပေးနိုင်မည့် မေးခွန်းနှစ်ခုနှင့် ထပ်မံသုတေသနလုပ်ရန် လိုသေးသော မေးခွန်းတစ်ခုကို ရေးရန်ဖြစ်သည်။ Sam က ခေါင်းလောင်းဟောင်းကို ဘယ်နှစ်ကြိမ် တီးခဲ့သလဲဟု မေးပြီး Aye က ခြင်းကို ဘယ်သူယက်လုပ်ခဲ့သလဲ၊ ဘယ်လောက်ကြာခဲ့သလဲဟု သိချင်သည်။ လမ်းညွှန်က အဖြေအားလုံးကို မသိခဲ့ခြင်းကြောင့် သင်ယူမှုသည် ပြည့်စုံသောရှင်းလင်းချက်တစ်ခုမှမဟုတ်ဘဲ မေးခွန်းတစ်ခုမှ စတင်တတ်ကြောင်း ကျောင်းသားများ နားလည်လာသည်။",
      "နောက်ပိုင်းတွင် အတန်းသားများသည် သူတို့၏မှတ်စုများကို မြို့အကြောင်းရေးထားသော စာအုပ်တိုတစ်အုပ်နှင့် နှိုင်းယှဉ်ကြသည်။ အချက်အလက်အချို့ ကိုက်ညီသော်လည်း အချို့ကို ပြင်ဆင်ရန် လိုအပ်သည်။ အဆိုတစ်ခု၏ ရင်းမြစ်ကို စစ်ဆေးရန်နှင့် ခန့်မှန်းချက်ကို အမှန်တရားအဖြစ် မယူဆရန် သင်ယူကြသည်။ ပြတိုက်များသည် အနာဂတ်လာရောက်သူများ လေ့လာနိုင်ရန် ပစ္စည်းများကို ထိန်းသိမ်းထားသော်လည်း သေချာသောမေးခွန်းများမေးပြီး ယုံကြည်စိတ်ချရသော အချက်အလက်များနှင့် ဆက်စပ်သောအခါ ပစ္စည်းတစ်ခုချင်းစီသည် ပိုမိုအဓိပ္ပာယ်ရှိလာကြောင်း ဆရာမက ရှင်းပြသည်။ ကျောင်းသားများသည် မိသားစုနှင့်အတူ ပြန်လာပြီး ရှာဖွေတွေ့ရှိခဲ့သည်များကို မျှဝေရန် စီစဉ်ကြသည်။",
      "ကျောင်းပြန်ရောက်သောအခါ အတန်းသားများသည် လေ့လာခဲ့သည်များကို မျှဝေကြသည်။ Sam က ခေါင်းလောင်းအကြောင်း ရှင်းပြပြီး Aye က ခြင်းပုံကြမ်းကို ပြသည်။ ဆရာမ Rose က ကိုယ်တိုင်မြင်ခဲ့သော အချက်အလက်နှင့် စိတ်ကူးဖြင့် ခန့်မှန်းထားသောအရာများကို ခွဲခြားရန် ပြောသည်။ သမိုင်းဆိုသည်မှာ ရက်စွဲစာရင်းတစ်ခုသာ မဟုတ်ဘဲ သာမန်လူများ၊ သူတို့၏အလုပ်နှင့် ဆုံးဖြတ်ချက်များကို နားလည်ရန် နည်းလမ်းတစ်ခုဖြစ်ကြောင်း ကျောင်းသားများ သိလာကြသည်။"
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
      "လအနည်းငယ်ကြာသောအခါ စာကြည့်တိုက်သည် စာအုပ်ငှားသည့်နေရာထက် ပိုမိုအရေးပါလာသည်။ ကျောင်းသားများသည် အိမ်စာပြီးစေရန် တွေ့ဆုံကြပြီး လူကြီးများက ဒေသခံပုံပြင်များ မျှဝေကြသည်။ အိမ်နီးချင်းများက လူထုလှုပ်ရှားမှုများကို ကြေညာဘုတ်တွင် အသိပေးကြသည်။ မုန်တိုင်းကြောင့် အမိုးတစ်စိတ်တစ်ပိုင်း ပျက်စီးသွားသောအခါ စေတနာ့ဝန်ထမ်းများက ပြုပြင်ရေးစီစဉ်ပြီး အလုပ်ပြီးသည်အထိ စာအုပ်များကို ခြောက်သွေ့သောအခန်းသို့ ရွှေ့ထားကြသည်။",
      "စာကြည့်တိုက်ကို လူပိုများများအတွက် အသုံးဝင်စေရန် စေတနာ့ဝန်ထမ်းများက စာဖတ်သူများ ဘာတွေသင်ယူချင်ကြသလဲဟု မေးကြသည်။ ကလေးငယ်များက ပုံစာအုပ်များနှင့် သိပ္ပံလှုပ်ရှားမှုလွယ်လွယ်များကို တောင်းဆိုကြပြီး ကျောင်းသားကြီးများက အဘိဓာန်များနှင့် အဆင့်လိုက်အင်္ဂလိပ်စာဖတ်စာအုပ်များကို လိုချင်ကြသည်။ လူကြီးများက ဥယျာဉ်စိုက်ပျိုးခြင်း၊ ကျန်းမာရေးနှင့် အသေးစားစီးပွားရေးအကြောင်း လက်တွေ့အသုံးဝင်သောစာအုပ်များကို လိုချင်ကြသည်။ အရာအားလုံးကို တစ်ကြိမ်တည်း မဝယ်နိုင်သောကြောင့် စာဖတ်သူအများဆုံးကို အထောက်အကူပြုမည့် စာအုပ်အနည်းငယ်ကို ရွေးချယ်ရန် တောင်းဆိုချက်များကို အသုံးပြုကြသည်။",
      "စာကြည့်တိုက်တွင် အပတ်စဉ် စာဖတ်ဝိုင်းတစ်ခုကိုလည်း စတင်ခဲ့သည်။ လူတစ်ဦးစီသည် စာပိုဒ်တိုတစ်ခုကို ဖတ်နိုင်သလို အခြားစေတနာ့ဝန်ထမ်းတစ်ဦး ဖတ်ပြသည်ကိုလည်း နားထောင်နိုင်သည်။ စကားလုံးအသစ်များ မသိပါက ရှက်ရွံ့စရာမလိုဘဲ မေးရန် သင်ယူသူအသစ်များကို အားပေးသည်။ ဘယ်စာအုပ်များကို အများဆုံးငှားကြောင်း မှတ်တမ်းတင်သော်လည်း စာဖတ်သူတစ်ဦးချင်း၏ အမည် သို့မဟုတ် ဖတ်ရှုမှုရွေးချယ်ချက်များကို လူသိရှင်ကြား မဖော်ပြကြပါ။ စာကြည့်တိုက်ကောင်းတစ်ခုတွင် စာအုပ်နှင့်စင်များသာမက လေးစားမှု၊ ကိုယ်ရေးကိုယ်တာလုံခြုံမှုနှင့် အသင်းဝင်များ၏အသံကို နားထောင်တတ်ခြင်းတို့လည်း လိုအပ်ကြောင်း ရွာသားများ သိလာကြသည်။",
      "နှစ်ကုန်တွင် ရွာသားများသည် အခမ်းအနားငယ်တစ်ခု ကျင်းပကြသည်။ Mr Daniel က လူတိုင်းကို ကျေးဇူးတင်သော်လည်း စာကြည့်တိုက်တစ်ခုသည် ဆက်လက်ဂရုစိုက်မှု လိုအပ်ကြောင်း သတိပေးသည်။ စာအုပ်အသစ်များကို ဖြည်းဖြည်းချင်းထည့်ရန်၊ ငှားထားသောစာအုပ်များကို ပုံမှန်စစ်ဆေးရန်နှင့် စေတနာ့ဝန်ထမ်းအသစ်များ ဖိတ်ခေါ်ရန် စီစဉ်ကြသည်။ လူများစွာက အသုံးဝင်သောအရာတစ်ခုစီ ပံ့ပိုးခဲ့သောကြောင့် စာကြည့်တိုက် ကြီးထွားလာကြောင်း ကလေးများ နားလည်ကြသည်။ စာကြည့်တိုက်သည် သေးငယ်သော်လည်း ရွာတစ်ရွာလုံးပိုင်ဆိုင်ပြီး လူတိုင်းအတူတကွ သင်ယူနိုင်သောနေရာ ဖြစ်လာသည်။"
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      location.hash = `#/listening/${item.id}`;
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
  if (!library || !panel || !back) return;
  const route = location.hash.slice(1).split("/").filter(Boolean);
  if (page !== "listening") {
    library.hidden = true;
    panel.hidden = false;
    back.hidden = true;
    if (activeListeningStoryId) {
      story = readingStory;
      activeStoryTranslations = [];
      activeListeningStoryId = null;
      renderStory();
    }
    return;
  }
  const selected = LISTENING_STORIES.find((item) => item.id === route[1]);
  if (!selected) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    activeListeningStoryId = null;
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
    activeListeningStoryId = selected.id;
    story = selected.text;
    activeStoryTranslations = selected.paragraphTranslations || [];
    renderStory();
    $("#word-card").hidden = true;
    $("#status-message").textContent = translations[language].voiceNote;
  }
  library.hidden = true;
  panel.hidden = false;
  back.hidden = false;
  $("#panel-title").textContent = language === "my" ? selected.myTitle : selected.title;
  $(".panel-heading .eyebrow").textContent = language === "my" ? "နားထောင်လေ့ကျင့်ခန်း" : "LISTENING STORY";
  $("#lesson-level-tag").textContent = `${selected.level} · ${selected.level === "A1" ? (language === "my" ? "အစပြုသူ" : "Beginner") : selected.level === "A2" ? (language === "my" ? "အခြေခံ" : "Elementary") : (language === "my" ? "အလယ်အလတ်" : "Intermediate")}`;
  $(".lesson-number").textContent = language === "my" ? "ပုံပြင်" : "STORY";
}

function renderStory() {
  const container = $("#lesson-text");
  container.replaceChildren();
  let paragraphIndex = 0;
  for (const part of tokenizeStory(story)) {
    if (!part.word) {
      paragraphIndex += (part.text.match(/\n\s*\n/g) || []).length;
      container.append(document.createTextNode(part.text));
      continue;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-word";
    button.textContent = part.text;
    button.setAttribute("aria-label", `Look up ${part.word}`);
    const wordParagraphIndex = paragraphIndex;
    button.addEventListener("click", () => showWord(part.word, wordParagraphIndex));
    container.append(button);
  }
}

function pronounceWord(word) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    $("#status-message").textContent = translations[language].noSpeech;
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  const voice = selectedEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = clampSpeechRate($("#speech-speed")?.value ?? 0.85);
  utterance.onerror = () => { $("#status-message").textContent = translations[language].noSpeech; };
  window.speechSynthesis.speak(utterance);
}

function showWord(word, paragraphIndex = 0) {
  activeWordParagraphIndex = paragraphIndex;
  const entry = lookupWord(word);
  $("#word-title").textContent = word;
  $("#word-definition").textContent = entry ? entry.meaning + ". " + entry.usage : translations[language].unknown;
  const contextTranslation = $("#word-context-translation");
  if (contextTranslation) {
    const translated = activeStoryTranslations[paragraphIndex];
    contextTranslation.textContent = translated
      ? "စာပိုဒ်၏ မြန်မာဘာသာပြန် — " + translated
      : "စာပိုဒ်၏ မြန်မာဘာသာပြန် — ဤစာပိုဒ်အတွက် ဘာသာပြန်ကို မထည့်ရသေးပါ။";
  }
  const myTranslation = $("#word-myanmar-translation");
  if (myTranslation) {
    myTranslation.textContent = entry?.my
      ? "မြန်မာအဓိပ္ပာယ် — " + entry.my
      : "မြန်မာအဓိပ္ပာယ် — ဤစကားလုံးအတွက် offline အဘိဓာန်အချက်အလက် မထည့်ရသေးပါ။";
  }
  $("#pronounce-word").textContent = language === "my" ? "🔊 အသံထွက် နားထောင်ရန်" : "🔊 Hear pronunciation";
  $("#pronounce-word").setAttribute("aria-label", "Pronounce " + word);
  $("#word-card").hidden = false;
  pronounceWord(word);
  $("#word-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
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
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(story);
  const voice = selectedEnglishVoice();
  utterance.lang = voice?.lang || "en-US";
  if (voice) utterance.voice = voice;
  utterance.rate = clampSpeechRate($("#speech-speed").value);
  utterance.onstart = () => { $("#play-button").disabled = true; $("#status-message").textContent = language === "my" ? "နားထောင်နေသည်…" : "Playing story…"; };
  utterance.onend = () => { $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; };
  utterance.onerror = () => { $("#play-button").disabled = false; $("#status-message").textContent = translations[language].noSpeech; };
  window.speechSynthesis.speak(utterance);
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
$("#play-button").addEventListener("click", speakStory);
$("#back-to-story-library").addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  location.hash = "#/listening";
});
$("#stop-button").addEventListener("click", () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); $("#play-button").disabled = false; $("#status-message").textContent = translations[language].voiceNote; });
$("#close-word").addEventListener("click", () => { $("#word-card").hidden = true; });
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
