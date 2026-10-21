export const LEVELS = [
  { id: "A1", name: "Beginner", my: "အစပြုသူ" },
  { id: "A2", name: "Elementary", my: "အခြေခံ" },
  { id: "B1", name: "Intermediate", my: "အလယ်အလတ်" },
  { id: "B2", name: "Upper-intermediate", my: "အလယ်အလတ်အဆင့်မြင့်" },
  { id: "C1", name: "Advanced", my: "အဆင့်မြင့်" },
  { id: "C2", name: "Proficient", my: "ကျွမ်းကျင်အဆင့်" }
];

export const VOCABULARY_CATEGORIES = [
  { id: "home", en: "Household items", my: "အိမ်သုံးပစ္စည်းများ", words: [
    ["chair", "ကုလားထိုင်", "Please sit on the chair."], ["table", "စားပွဲ", "The keys are on the table."],
    ["lamp", "မီးအိမ်", "Turn on the lamp."], ["mirror", "မှန်", "The mirror is beside the door."],
    ["pillow", "ခေါင်းအုံး", "I need a soft pillow."], ["blanket", "စောင်", "The blanket is warm."]
  ]},
  { id: "electrical", en: "Electrical appliances", my: "လျှပ်စစ်ပစ္စည်းများ", words: [
    ["fan", "ပန်ကာ", "The fan is running."], ["refrigerator", "ရေခဲသေတ္တာ", "Keep the milk in the refrigerator."],
    ["washing machine", "အဝတ်လျှော်စက်", "The washing machine is full."], ["television", "ရုပ်မြင်သံကြား", "We watch television at night."],
    ["iron", "မီးပူ", "The iron is hot."], ["charger", "အားသွင်းကိရိယာ", "My phone charger is here."]
  ]},
  { id: "kitchen", en: "Kitchen", my: "မီးဖိုချောင်", words: [
    ["spoon", "ဇွန်း", "Use a spoon to stir the soup."], ["fork", "ခက်ရင်း", "Put the fork beside the plate."],
    ["knife", "ဓား", "This knife is sharp."], ["plate", "ပန်းကန်ပြား", "The plate is clean."],
    ["kettle", "ရေနွေးအိုး", "The kettle is boiling."], ["frying pan", "ဒယ်အိုး", "Heat the frying pan."]
  ]},
  { id: "food", en: "Food and drink", my: "အစားအစာနှင့် သောက်စရာ", words: [
    ["rice", "ထမင်း၊ ဆန်", "We eat rice for lunch."], ["bread", "ပေါင်မုန့်", "I would like some bread."],
    ["water", "ရေ", "Please drink more water."], ["milk", "နို့", "The child drinks milk."],
    ["vegetable", "ဟင်းသီးဟင်းရွက်", "Fresh vegetables are healthy."], ["fruit", "သစ်သီး", "Fruit makes a good snack."]
  ]},
  { id: "clothing", en: "Clothing", my: "အဝတ်အစား", words: [
    ["shirt", "ရှပ်အင်္ကျီ", "My shirt is blue."], ["trousers", "ဘောင်းဘီရှည်", "These trousers are comfortable."],
    ["shoes", "ဖိနပ်", "Please take off your shoes."], ["jacket", "ဂျာကင်အင်္ကျီ", "Wear a jacket outside."],
    ["dress", "ဂါဝန်", "She is wearing a red dress."], ["belt", "ခါးပတ်", "My belt is black."]
  ]},
  { id: "school", en: "School and study", my: "ကျောင်းနှင့် စာသင်ကြားရေး", words: [
    ["notebook", "မှတ်စုစာအုပ်", "Write the answer in your notebook."], ["pencil", "ခဲတံ", "Use a pencil to draw."],
    ["eraser", "ခဲဖျက်", "I need an eraser."], ["lesson", "သင်ခန်းစာ", "Today's lesson is useful."],
    ["question", "မေးခွန်း", "Please answer the question."], ["dictionary", "အဘိဓာန်", "Look up the word in a dictionary."]
  ]}
];

export const SKILL_PRACTICE = {
  reading: {
    A1: { title: "Find the object", my: "ပစ္စည်းကို ရှာဖတ်ပါ", prompt: "The spoon is on the table.", task: "Read the sentence and identify two objects.", myTask: "ဝါကျကိုဖတ်ပြီး ပစ္စည်းအမည် ၂ ခုကို ရှာပါ။" },
    A2: { title: "Understand a description", my: "ဖော်ပြချက်ကို နားလည်ပါ", prompt: "The small fan is beside the window, but the lamp is on the desk.", task: "Where is the lamp?", myTask: "မီးအိမ်က ဘယ်နေရာမှာ ရှိသလဲ။" },
    B1: { title: "Read for detail", my: "အသေးစိတ်ဖတ်ရှုပါ", prompt: "Before leaving home, Nina unplugged the iron and checked that the kitchen tap was closed.", task: "Name the two things Nina checked.", myTask: "Nina စစ်ဆေးခဲ့သည့်အရာ ၂ ခုကို ပြောပါ။" },
    B2: { title: "Infer meaning", my: "အဓိပ္ပာယ်ကို ခန့်မှန်းပါ", prompt: "Although the refrigerator hummed quietly, the food inside remained fresh throughout the heatwave.", task: "Why was the refrigerator important?", myTask: "ရေခဲသေတ္တာက ဘာကြောင့် အရေးကြီးသလဲ။" },
    C1: { title: "Evaluate an argument", my: "အကြောင်းပြချက်ကို သုံးသပ်ပါ", prompt: "Energy-efficient appliances may cost more initially, yet lower electricity consumption can offset the purchase price over time.", task: "Summarize the claim and its supporting reason.", myTask: "အဓိကဆိုလိုချက်နှင့် ထောက်ခံအကြောင်းပြချက်ကို အကျဉ်းချုပ်ပါ။" },
    C2: { title: "Analyze nuance", my: "အဓိပ္ပာယ်ကွဲပြားမှုကို ခွဲခြမ်းစိတ်ဖြာပါ", prompt: "A carefully arranged kitchen can be functional without appearing austere; the distinction lies in how efficiently its essentials are organized.", task: "Explain the contrast between functional and austere.", myTask: "အသုံးဝင်ခြင်းနှင့် ခြိုးခြံရှင်းလင်းလွန်းခြင်းတို့၏ ကွာခြားချက်ကို ရှင်းပြပါ။" }
  },
  listening: {
    A1: { title: "Listen and choose", my: "နားထောင်ပြီး ရွေးပါ", prompt: "This is a spoon.", task: "Play the phrase and repeat it aloud.", myTask: "အသံကိုဖွင့်နားထောင်ပြီး လိုက်ပြောပါ။" },
    A2: { title: "Listen for location", my: "တည်နေရာကို နားထောင်ပါ", prompt: "The keys are under the chair.", task: "Listen and say where the keys are.", myTask: "သော့တွေ ဘယ်မှာရှိသလဲ နားထောင်ပြီး ပြောပါ။" },
    B1: { title: "Follow instructions", my: "ညွှန်ကြားချက်ကို လိုက်နာပါ", prompt: "Put the clean plates in the cupboard, then switch off the kettle.", task: "Repeat both actions in the correct order.", myTask: "လုပ်ဆောင်ချက် ၂ ခုကို အစဉ်လိုက် ပြန်ပြောပါ။" },
    B2: { title: "Catch key details", my: "အရေးကြီးအသေးစိတ်ကို ဖမ်းယူပါ", prompt: "The washing machine finishes in twenty minutes, so hang the clothes outside before it rains.", task: "What should happen first, and why?", myTask: "ဘာကို အရင်လုပ်သင့်ပြီး ဘာကြောင့်လဲ။" },
    C1: { title: "Identify the implication", my: "သွယ်ဝိုက်ဆိုလိုချက်ကို ဖော်ထုတ်ပါ", prompt: "You might want to unplug the heater before you leave; the room is already warm.", task: "What is the speaker indirectly suggesting?", myTask: "ပြောသူက သွယ်ဝိုက်ပြီး ဘာကို အကြံပြုသလဲ။" },
    C2: { title: "Interpret tone", my: "ပြောဟန်ကို အဓိပ္ပာယ်ဖော်ပါ", prompt: "Well, that is certainly an interesting place to keep the cooking oil.", task: "Explain two possible meanings depending on tone.", myTask: "ပြောဟန်အပေါ်မူတည်ပြီး ဖြစ်နိုင်သောအဓိပ္ပာယ် ၂ မျိုးကို ရှင်းပြပါ။" }
  },
  writing: {
    A1: { title: "Write a clear sentence", my: "ဝါကျတိုရေးပါ", prompt: "This is my chair.", task: "Copy the sentence, using a capital letter and a full stop.", myTask: "စာလုံးအကြီးနှင့် full stop ကို သုံးပြီး ကူးရေးပါ။" },
    A2: { title: "Describe a room", my: "အခန်းတစ်ခန်းကို ဖော်ပြပါ", prompt: "There is a lamp on the table.", task: "Write two sentences describing objects in a room.", myTask: "အခန်းထဲက ပစ္စည်းများအကြောင်း ဝါကျ ၂ ကြောင်းရေးပါ။" },
    B1: { title: "Write a sequence", my: "လုပ်ဆောင်ပုံအစဉ်ရေးပါ", prompt: "First, wash the vegetables. Next, cut them carefully.", task: "Add a final step using an ordering word.", myTask: "အစဉ်ပြစကားလုံးတစ်ခုသုံးပြီး နောက်ဆုံးအဆင့်ကို ရေးပါ။" },
    B2: { title: "Compare options", my: "ရွေးချယ်စရာများကို နှိုင်းယှဉ်ပါ", prompt: "A kettle is quicker, whereas a saucepan can serve several purposes.", task: "Write a balanced comparison using whereas or although.", myTask: "whereas သို့မဟုတ် although သုံးပြီး နှိုင်းယှဉ်ရေးပါ။" },
    C1: { title: "Write a persuasive paragraph", my: "အကြောင်းပြချက်ပါ စာပိုဒ်ရေးပါ", prompt: "Repairing an appliance can be more sustainable than replacing it.", task: "Write a paragraph with a claim, evidence, and conclusion.", myTask: "ဆိုလိုချက်၊ အထောက်အထားနှင့် နိဂုံးပါသော စာပိုဒ်ရေးပါ။" },
    C2: { title: "Refine your style", my: "ရေးဟန်ကို မြှင့်တင်ပါ", prompt: "The room was tidy, but it did not feel welcoming.", task: "Rewrite the sentence with more precise, nuanced language.", myTask: "ပိုမိုတိကျပြီး အဓိပ္ပာယ်နက်ရှိုင်းသော စကားလုံးများဖြင့် ပြန်ရေးပါ။" }
  },
  speaking: {
    A1: { title: "Name three things", my: "ပစ္စည်း ၃ ခု အမည်ပြောပါ", prompt: "I can see a chair.", task: "Say the sentence, then name two more objects.", myTask: "ဝါကျကိုပြောပြီး အခြားပစ္စည်း ၂ ခုကို အမည်ပြောပါ။" },
    A2: { title: "Describe where things are", my: "ပစ္စည်းတည်နေရာကို ပြောပါ", prompt: "The cup is next to the kettle.", task: "Describe the location of two objects near you.", myTask: "အနီးအနားရှိ ပစ္စည်း ၂ ခု၏ တည်နေရာကို ဖော်ပြပါ။" },
    B1: { title: "Explain a routine", my: "နေ့စဉ်လုပ်ရိုးလုပ်စဉ်ကို ပြောပါ", prompt: "Every evening, I tidy the kitchen before I relax.", task: "Speak for 30 seconds about a home routine.", myTask: "အိမ်တွင်းလုပ်ရိုးလုပ်စဉ်အကြောင်း စက္ကန့် ၃၀ ပြောပါ။" },
    B2: { title: "Give a recommendation", my: "အကြံပြုချက်ပေးပါ", prompt: "I would recommend an energy-saving appliance because…", task: "Give a recommendation and support it with two reasons.", myTask: "အကြောင်းပြချက် ၂ ခုနှင့်အတူ အကြံပြုပါ။" },
    C1: { title: "Handle a problem", my: "ပြဿနာကို ရှင်းပြဖြေရှင်းပါ", prompt: "The appliance has stopped working, even though it is plugged in.", task: "Explain the issue and propose a safe next step.", myTask: "ပြဿနာကိုရှင်းပြပြီး ဘေးကင်းသော နောက်တစ်ဆင့်ကို အကြံပြုပါ။" },
    C2: { title: "Discuss trade-offs", my: "အားသာချက်၊ အားနည်းချက် ဆွေးနွေးပါ", prompt: "Convenience should be weighed against energy use and repairability.", task: "Present a nuanced 60-second argument with a counterpoint.", myTask: "ဆန့်ကျင်ဘက်အမြင်တစ်ခုပါသော ၁ မိနစ်စာ ဆွေးနွေးချက်ပြောပါ။" }
  }
};

export const LETTER_GUIDES = {
  A: { style: "Print uppercase", start: "Start at the top, move down-left, lift, then down-right; add the middle bar.", my: "အပေါ်ဆုံးမှစ၍ ဘယ်အောက်သို့ ဆင်းပါ။ လက်မြှောက်ပြီး ညာအောက်သို့ ဆင်းကာ အလယ်မျဉ်းဆွဲပါ။", paths: ["M50 12 L20 88", "M50 12 L80 88", "M32 61 L68 61"] },
  a: { style: "Print lowercase", start: "Begin with the round bowl, move counter-clockwise, close the shape, then draw the right stem.", my: "ဝိုင်းပုံကို ဘယ်ဘက်မှစ၍ လှည့်ဆွဲပြီး ပိတ်ပါ။ ထို့နောက် ညာဘက်တိုင်ကို ဆွဲပါ။", paths: ["M68 48 C68 26 30 26 30 51 C30 76 68 76 68 51 L68 27 L68 78"] },
  B: { style: "Print uppercase", start: "Draw the vertical stem from top to bottom, then make the upper and lower bowls.", my: "အပေါ်မှအောက်သို့ တိုင်ကို အရင်ဆွဲပြီး အပေါ်ဝိုင်းနှင့် အောက်ဝိုင်းကို ဆက်ဆွဲပါ။", paths: ["M28 12 L28 88", "M28 14 C78 8 78 47 29 48", "M29 48 C85 43 84 89 28 88"] },
  b: { style: "Print lowercase", start: "Draw the tall stem downwards, then form the bowl from the middle toward the right.", my: "တိုင်ရှည်ကို အပေါ်မှအောက်သို့ ဆွဲပြီး အလယ်မှညာဘက်သို့ ဝိုင်းပုံဆွဲပါ။", paths: ["M30 12 L30 88", "M30 56 C30 27 72 30 72 57 C72 82 31 81 30 56"] },
  C: { style: "Print uppercase", start: "Start near the top-right, curve left and down, then sweep back toward the right.", my: "အပေါ်ညာဘက်မှစ၍ ဘယ်ဘက်သို့ကွေးဆွဲ၊ အောက်သို့ဆင်းပြီး ညာဘက်သို့ ပြန်ကွေးပါ။", paths: ["M78 25 C45 0 19 24 20 50 C19 79 47 98 78 75"] },
  c: { style: "Print lowercase", start: "Start near the upper-right of the bowl, curve left and down, then return toward the opening.", my: "ဝိုင်းပုံ၏ အပေါ်ညာဘက်မှစ၍ ဘယ်ဘက်၊ အောက်ဘက်သို့ ကွေးဆွဲပြီး အဖွင့်နေရာသို့ ပြန်တက်ပါ။", paths: ["M72 35 C46 17 26 34 27 53 C27 76 49 83 72 68"] }
};

export function getPractice(skill, level) {
  return SKILL_PRACTICE[skill]?.[level] ?? null;
}
