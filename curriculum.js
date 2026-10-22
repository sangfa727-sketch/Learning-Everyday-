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
    ["pillow", "ခေါင်းအုံး", "I need a soft pillow."], ["blanket", "စောင်", "The blanket is warm."], ["shelf", "စင်", "Put the books on the shelf."], ["curtain", "လိုက်ကာ", "Close the curtain at night."]
    ["sofa", "ဆိုဖာ", "The sofa is comfortable."],
    ["desk", "စာရေးစားပွဲ", "I do my homework at the desk."],
    ["drawer", "အံဆွဲ", "The keys are in the drawer."],
    ["wardrobe", "အဝတ်ဗီရို", "Her clothes are in the wardrobe."],
    ["door", "တံခါး", "Please close the door."],
    ["window", "ပြတင်းပေါက်", "Open the window for fresh air."],
    ["carpet", "ကော်ဇော", "The carpet is soft."],
    ["clock", "နာရီ", "The clock is on the wall."],
    ["basket", "ခြင်းတောင်း", "Put the toys in the basket."],
    ["bucket", "ရေပုံး", "Fill the bucket with water."],
    ["broom", "တံမြက်စည်း", "Use a broom to clean the floor."],
    ["mattress", "မွေ့ရာ", "This mattress is firm."],
  ]},
  { id: "electrical", en: "Electrical appliances", my: "လျှပ်စစ်ပစ္စည်းများ", words: [
    ["fan", "ပန်ကာ", "The fan is running."], ["refrigerator", "ရေခဲသေတ္တာ", "Keep the milk in the refrigerator."],
    ["washing machine", "အဝတ်လျှော်စက်", "The washing machine is full."], ["television", "ရုပ်မြင်သံကြား", "We watch television at night."],
    ["iron", "မီးပူ", "The iron is hot."], ["charger", "အားသွင်းကိရိယာ", "My phone charger is here."], ["microwave", "မိုက်ခရိုဝေ့ဖ်", "Heat the soup in the microwave."], ["vacuum cleaner", "ဖုန်စုပ်စက်", "Use the vacuum cleaner on the carpet."]
    ["air conditioner", "လေအေးပေးစက်", "The air conditioner keeps the room cool."],
    ["rice cooker", "ထမင်းပေါင်းအိုး", "The rice cooker is ready."],
    ["electric kettle", "လျှပ်စစ်ရေနွေးအိုး", "The electric kettle boils water quickly."],
    ["blender", "ဖျော်စက်", "Use the blender to make a smoothie."],
    ["toaster", "ပေါင်မုန့်ကင်စက်", "The toaster is on the counter."],
    ["oven", "မီးဖို", "Bake the bread in the oven."],
    ["electric fan", "လျှပ်စစ်ပန်ကာ", "Please switch off the electric fan."],
    ["speaker", "အသံချဲ့စက်", "The speaker plays music clearly."],
    ["camera", "ကင်မရာ", "This camera takes sharp photos."],
    ["printer", "ပရင်တာ", "The printer needs more paper."],
    ["electricity", "လျှပ်စစ်ဓာတ်အား", "Save electricity when you can."],
    ["switch", "ခလုတ်", "Turn off the light switch."],
  ]},
  { id: "kitchen", en: "Kitchen", my: "မီးဖိုချောင်", words: [
    ["spoon", "ဇွန်း", "Use a spoon to stir the soup."], ["fork", "ခက်ရင်း", "Put the fork beside the plate."],
    ["knife", "ဓား", "This knife is sharp."], ["plate", "ပန်းကန်ပြား", "The plate is clean."],
    ["kettle", "ရေနွေးအိုး", "The kettle is boiling."], ["frying pan", "ဒယ်အိုး", "Heat the frying pan."], ["cutting board", "လှီးဖြတ်ဘုတ်", "Place the carrot on the cutting board."], ["spatula", "ဟင်းလှန်ဇွန်း", "Use a spatula to turn the egg."]
    ["bowl", "ပန်းကန်လုံး", "Put the soup in a bowl."],
    ["cup", "ခွက်", "She poured tea into a cup."],
    ["mug", "လက်ကိုင်ခွက်", "This mug is full of coffee."],
    ["glass", "ဖန်ခွက်", "Please bring me a glass of water."],
    ["pot", "အိုး", "The pot is on the stove."],
    ["lid", "အဖုံး", "Put the lid on the pot."],
    ["chopping knife", "လှီးဓား", "Use the chopping knife carefully."],
    ["ladle", "ဟင်းခပ်ဇွန်း", "Use a ladle to serve the soup."],
    ["grater", "ခြစ်စက်", "Grate the cheese with a grater."],
    ["colander", "ရေစစ်ဇကာ", "Drain the pasta in a colander."],
    ["oven mitt", "မီးဖိုလက်အိတ်", "Wear an oven mitt to hold the hot tray."],
    ["dish soap", "ပန်းကန်ဆေးဆပ်ပြာ", "We need more dish soap."],
  ]},
  { id: "food", en: "Food and drink", my: "အစားအစာနှင့် သောက်စရာ", words: [
    ["rice", "ထမင်း၊ ဆန်", "We eat rice for lunch."], ["bread", "ပေါင်မုန့်", "I would like some bread."],
    ["water", "ရေ", "Please drink more water."], ["milk", "နို့", "The child drinks milk."],
    ["vegetable", "ဟင်းသီးဟင်းရွက်", "Fresh vegetables are healthy."], ["fruit", "သစ်သီး", "Fruit makes a good snack."], ["egg", "ကြက်ဥ", "I eat an egg for breakfast."], ["juice", "ဖျော်ရည်", "Would you like a glass of juice?"]
    ["noodles", "ခေါက်ဆွဲ", "We are having noodles for dinner."],
    ["chicken", "ကြက်သား", "The chicken is ready to eat."],
    ["fish", "ငါး", "He bought fresh fish at the market."],
    ["beef", "အမဲသား", "The beef is cooking slowly."],
    ["pork", "ဝက်သား", "She made pork curry for lunch."],
    ["potato", "အာလူး", "Cut the potato into small pieces."],
    ["tomato", "ခရမ်းချဉ်သီး", "Add a tomato to the salad."],
    ["onion", "ကြက်သွန်နီ", "Chop the onion carefully."],
    ["banana", "ငှက်ပျောသီး", "I eat a banana after breakfast."],
    ["orange", "လိမ္မော်သီး", "This orange is sweet."],
    ["sugar", "သကြား", "Would you like sugar in your tea?"],
    ["salt", "ဆား", "Add a little salt to the soup."],
  ]},
  { id: "clothing", en: "Clothing", my: "အဝတ်အစား", words: [
    ["shirt", "ရှပ်အင်္ကျီ", "My shirt is blue."], ["trousers", "ဘောင်းဘီရှည်", "These trousers are comfortable."],
    ["shoes", "ဖိနပ်", "Please take off your shoes."], ["jacket", "ဂျာကင်အင်္ကျီ", "Wear a jacket outside."],
    ["dress", "ဂါဝန်", "She is wearing a red dress."], ["belt", "ခါးပတ်", "My belt is black."], ["socks", "ခြေအိတ်", "These socks are clean."], ["hat", "ဦးထုပ်", "Wear a hat in the sun."]
    ["skirt", "စကတ်", "She wears a skirt to work."],
    ["shorts", "ဘောင်းဘီတို", "He wears shorts in hot weather."],
    ["sweater", "ဆွယ်တာ", "This sweater keeps me warm."],
    ["raincoat", "မိုးကာအင်္ကျီ", "Take a raincoat because it may rain."],
    ["uniform", "ယူနီဖောင်း", "The students wear a uniform."],
    ["scarf", "ပဝါ", "She wrapped a scarf around her neck."],
    ["gloves", "လက်အိတ်", "Wear gloves when it is cold."],
    ["boots", "ဘွတ်ဖိနပ်", "These boots are good for walking."],
    ["slippers", "ဖိနပ်ပါး", "I wear slippers at home."],
    ["cap", "ဦးထုပ်အနားတို", "He put on a cap."],
    ["pocket", "အိတ်ကပ်", "My phone is in my pocket."],
    ["button", "ကြယ်သီး", "One button is missing from my shirt."],
  ]},
  { id: "school", en: "School and study", my: "ကျောင်းနှင့် စာသင်ကြားရေး", words: [
    ["notebook", "မှတ်စုစာအုပ်", "Write the answer in your notebook."], ["pencil", "ခဲတံ", "Use a pencil to draw."],
    ["eraser", "ခဲဖျက်", "I need an eraser."], ["lesson", "သင်ခန်းစာ", "Today's lesson is useful."],
    ["question", "မေးခွန်း", "Please answer the question."], ["dictionary", "အဘိဓာန်", "Look up the word in a dictionary."], ["backpack", "ကျောပိုးအိတ်", "My backpack is heavy."], ["ruler", "ပေတံ", "Draw a straight line with a ruler."]
    ["textbook", "ပြဋ္ဌာန်းစာအုပ်", "Open your textbook to page ten."],
    ["blackboard", "သင်ပုန်း", "The teacher wrote on the blackboard."],
    ["whiteboard", "ဝှိုက်ဘုတ်", "Write the answer on the whiteboard."],
    ["marker", "မာကာ", "Please pass me the marker."],
    ["crayon", "ဖယောင်းရောင်စုံခဲတံ", "The child drew with a crayon."],
    ["scissors", "ကတ်ကြေး", "Use scissors to cut the paper."],
    ["glue", "ကော်", "Put some glue on the paper."],
    ["paper", "စက္ကူ", "Please give me a sheet of paper."],
    ["desk", "စာရေးစားပွဲ", "Each student has a desk."],
    ["classroom", "စာသင်ခန်း", "Our classroom is bright."],
    ["homework", "အိမ်စာ", "I finish my homework after dinner."],
    ["exam", "စာမေးပွဲ", "The exam begins at nine."],
  ]},

  { id: "bathroom", en: "Bathroom and personal care", my: "ရေချိုးခန်းနှင့် ကိုယ်ရေးကိုယ်တာ", words: [
    ["towel", "မျက်နှာသုတ်ပဝါ", "Please bring a clean towel."], ["soap", "ဆပ်ပြာ", "Wash your hands with soap."], ["toothbrush", "သွားတိုက်တံ", "My toothbrush is beside the sink."], ["toothpaste", "သွားတိုက်ဆေး", "We need more toothpaste."], ["shampoo", "ခေါင်းလျှော်ရည်", "This shampoo smells fresh."], ["comb", "ဘီး", "She keeps a comb in her bag."], ["hairbrush", "ဆံပင်ဖြီးဘီး", "I use a hairbrush every morning."], ["sink", "လက်ဆေးခွက်", "The sink is clean."]
    ["shower", "ရေပန်း", "I take a shower every morning."],
    ["bathtub", "ရေချိုးကန်", "The child is playing in the bathtub."],
    ["toilet", "အိမ်သာ", "The toilet is down the hall."],
    ["toilet paper", "အိမ်သာသုံးစက္ကူ", "Please replace the toilet paper."],
    ["tissue", "တစ်ရှူး", "Use a tissue to wipe your nose."],
    ["razor", "မုတ်ဆိတ်ရိတ်ဓား", "He keeps his razor in the cabinet."],
    ["lotion", "အသားအရေလိမ်းဆေး", "She applies lotion to her hands."],
    ["deodorant", "ချွေးနံ့ပျောက်ဆေး", "I use deodorant after a shower."],
    ["toothbrush holder", "သွားတိုက်တံထည့်ခွက်", "Put the toothbrush in its holder."],
    ["bath mat", "ရေချိုးခန်းဖျာ", "The bath mat is beside the shower."],
    ["hand sanitizer", "လက်သန့်ဆေးရည်", "Use hand sanitizer when needed."],
    ["nail clipper", "လက်သည်းညှပ်", "The nail clipper is in the drawer."],
  ]},
  { id: "transport", en: "Transport and travel", my: "သယ်ယူပို့ဆောင်ရေးနှင့် ခရီးသွား", words: [
    ["bus", "ဘတ်စ်ကား", "I take the bus to work."], ["train", "ရထား", "The train arrives at six."], ["bicycle", "စက်ဘီး", "She rides her bicycle to school."], ["motorbike", "ဆိုင်ကယ်", "Wear a helmet on a motorbike."], ["ticket", "လက်မှတ်", "Keep your ticket until the end of the trip."], ["station", "ဘူတာရုံ", "Meet me at the station."], ["traffic lights", "မီးပွိုင့်", "Stop when the traffic lights are red."], ["passenger", "ခရီးသည်", "Every passenger needs a seat."]
    ["car", "ကား", "My car is parked outside."],
    ["taxi", "တက္ကစီ", "We took a taxi to the airport."],
    ["airplane", "လေယာဉ်", "The airplane leaves at noon."],
    ["boat", "လှေ", "The boat crosses the river."],
    ["ship", "သင်္ဘော", "The ship arrived at the port."],
    ["helmet", "ဦးထုပ်ဆောင်း", "Always wear a helmet on a motorbike."],
    ["seat belt", "ထိုင်ခုံခါးပတ်", "Please fasten your seat belt."],
    ["platform", "ရထားစင်္ကြံ", "Wait on the correct platform."],
    ["airport", "လေဆိပ်", "We arrived at the airport early."],
    ["map", "မြေပုံ", "Use the map to find the hotel."],
    ["journey", "ခရီး", "The journey takes two hours."],
    ["luggage", "ခရီးဆောင်အိတ်များ", "Our luggage is in the car."],
  ]},
  { id: "weather", en: "Weather and nature", my: "ရာသီဥတုနှင့် သဘာဝ", words: [
    ["sunny", "နေသာသော", "It is sunny this morning."], ["cloudy", "တိမ်ထူသော", "The sky looks cloudy."], ["rainy", "မိုးရွာသော", "Take an umbrella on a rainy day."], ["windy", "လေတိုက်သော", "It is too windy to fly a kite."], ["storm", "မုန်တိုင်း", "The storm may arrive tonight."], ["river", "မြစ်", "The village is beside a river."], ["mountain", "တောင်", "We can see a mountain in the distance."], ["forest", "သစ်တော", "Many birds live in the forest."]
    ["sunshine", "နေရောင်ခြည်", "The plants need sunshine."],
    ["rain", "မိုး", "The rain stopped in the afternoon."],
    ["cloud", "တိမ်", "A dark cloud covered the sun."],
    ["thunder", "မိုးခြိမ်းသံ", "We heard thunder in the distance."],
    ["lightning", "လျှပ်စီး", "Lightning lit up the sky."],
    ["fog", "မြူ", "Thick fog covered the road."],
    ["breeze", "လေပြည်", "A cool breeze came through the window."],
    ["temperature", "အပူချိန်", "The temperature is rising today."],
    ["season", "ရာသီ", "The rainy season starts soon."],
    ["spring", "နွေဦးရာသီ", "Flowers bloom in spring."],
    ["summer", "နွေရာသီ", "Summer is very hot here."],
    ["winter", "ဆောင်းရာသီ", "Winter nights can be cold."],
  ]},
  { id: "work", en: "Work and occupations", my: "အလုပ်နှင့် အလုပ်အကိုင်", words: [
    ["teacher", "ဆရာ၊ ဆရာမ", "The teacher explains the lesson."], ["nurse", "သူနာပြု", "The nurse helps the patient."], ["farmer", "လယ်သမား", "The farmer grows rice."], ["driver", "ယာဉ်မောင်း", "The driver checks the bus."], ["manager", "မန်နေဂျာ", "The manager leads the team."], ["meeting", "အစည်းအဝေး", "Our meeting starts at nine."], ["salary", "လစာ", "She saves part of her salary."], ["schedule", "အချိန်ဇယား", "Check the schedule before you leave."]
    ["doctor", "ဆရာဝန်", "The doctor examined the patient."],
    ["engineer", "အင်ဂျင်နီယာ", "The engineer designed the bridge."],
    ["chef", "စားဖိုမှူး", "The chef prepared a delicious meal."],
    ["police officer", "ရဲအရာရှိ", "The police officer helped the family."],
    ["mechanic", "စက်ပြင်ဆရာ", "The mechanic repaired my car."],
    ["office", "ရုံး", "Our office opens at eight."],
    ["colleague", "လုပ်ဖော်ကိုင်ဖက်", "My colleague helped me with the report."],
    ["customer", "ဖောက်သည်", "The customer asked a question."],
    ["interview", "အင်တာဗျူး", "She has a job interview tomorrow."],
    ["task", "တာဝန်", "I finished the task before lunch."],
    ["report", "အစီရင်ခံစာ", "Please send the report today."],
    ["uniform", "အလုပ်ဝတ်စုံ", "The workers wear a uniform."],
  ]},
  { id: "health", en: "Health and feelings", my: "ကျန်းမာရေးနှင့် ခံစားချက်", words: [
    ["headache", "ခေါင်းကိုက်ခြင်း", "I have a mild headache."], ["fever", "ဖျားနာခြင်း", "He stayed home because of a fever."], ["tired", "ပင်ပန်းသော", "I feel tired after work."], ["thirsty", "ရေဆာသော", "I am thirsty after the walk."], ["worried", "စိုးရိမ်သော", "She is worried about the exam."], ["excited", "စိတ်လှုပ်ရှားပျော်ရွှင်သော", "We are excited about the trip."], ["appointment", "ချိန်းဆိုမှု", "I have a doctor's appointment tomorrow."], ["medicine", "ဆေးဝါး", "Take medicine only as directed."]
    ["cough", "ချောင်းဆိုးခြင်း", "His cough is getting better."],
    ["sore throat", "လည်ချောင်းနာခြင်း", "I have a sore throat today."],
    ["stomachache", "ဗိုက်နာခြင်း", "She has a stomachache after lunch."],
    ["dizzy", "မူးဝေသော", "I feel dizzy when I stand up quickly."],
    ["hungry", "ဗိုက်ဆာသော", "The children are hungry after school."],
    ["happy", "ပျော်ရွှင်သော", "I feel happy to see you."],
    ["sad", "ဝမ်းနည်းသော", "He felt sad after the film."],
    ["angry", "စိတ်ဆိုးသော", "She was angry about the mistake."],
    ["calm", "စိတ်အေးသော", "Take a breath and stay calm."],
    ["appointment card", "ချိန်းဆိုမှုကတ်", "Bring your appointment card to the clinic."],
    ["clinic", "ဆေးခန်း", "The clinic opens early."],
    ["rest", "အနားယူခြင်း", "You need rest after a long day."],
  ]},
  { id: "family", en: "Family and relationships", my: "မိသားစုနှင့် ဆက်ဆံရေး", words: [
    ["mother", "မိခင်", "My mother makes tea every morning."], ["father", "ဖခင်", "My father walks to work."],
    ["sister", "အစ်မ၊ ညီမ", "My sister is learning English."], ["brother", "အစ်ကို၊ ညီ", "My brother plays football after school."],
    ["grandmother", "အဘွား", "My grandmother tells wonderful stories."], ["grandfather", "အဘိုး", "My grandfather grows vegetables."],
    ["cousin", "ဝမ်းကွဲမောင်နှမ", "My cousin lives in another town."], ["relative", "ဆွေမျိုး", "We visit our relatives during the holiday."]
    ["parents", "မိဘများ", "My parents live near the river."],
    ["son", "သား", "Their son starts school this year."],
    ["daughter", "သမီး", "Her daughter loves drawing."],
    ["husband", "ခင်ပွန်း", "Her husband cooks dinner on Fridays."],
    ["wife", "ဇနီး", "His wife works at a school."],
    ["uncle", "ဦးလေး၊ ဦးကြီး", "My uncle visits us every month."],
    ["aunt", "အဒေါ်", "My aunt makes delicious noodles."],
    ["nephew", "တူ", "My nephew is learning to read."],
    ["niece", "တူမ", "My niece likes picture books."],
    ["baby", "ကလေးငယ်", "The baby is sleeping peacefully."],
    ["twins", "အမြွာ", "The twins look very similar."],
    ["in-laws", "ယောက္ခမဘက် ဆွေမျိုးများ", "We visited our in-laws last weekend."],
  ]},
  { id: "shopping", en: "Shopping and money", my: "ဈေးဝယ်ခြင်းနှင့် ငွေကြေး", words: [
    ["price", "ဈေးနှုန်း", "What is the price of this bag?"], ["cashier", "ငွေရှင်းကောင်တာဝန်ထမ်း", "The cashier gave me a receipt."],
    ["receipt", "ပြေစာ", "Please keep your receipt."], ["discount", "လျှော့ဈေး", "This shop offers a ten percent discount."],
    ["change", "အမ်းငွေ", "Here is your change."], ["basket", "ဈေးဝယ်ခြင်းတောင်း", "Put the fruit in the basket."],
    ["size", "အရွယ်အစား", "Do you have this shirt in a larger size?"], ["wallet", "ပိုက်ဆံအိတ်", "I keep my cards in my wallet."]
    ["shop assistant", "အရောင်းဝန်ထမ်း", "The shop assistant helped me choose a size."],
    ["price tag", "ဈေးနှုန်းတံဆိပ်", "Check the price tag before buying."],
    ["bargain", "ဈေးသက်သာသောပစ္စည်း", "This jacket was a real bargain."],
    ["expensive", "ဈေးကြီးသော", "That watch is too expensive."],
    ["cheap", "ဈေးပေါသော", "These notebooks are cheap."],
    ["afford", "တတ်နိုင်သည်", "I cannot afford a new phone yet."],
    ["coin", "ဒင်္ဂါး", "I found a coin on the floor."],
    ["banknote", "ငွေစက္ကူ", "He paid with a banknote."],
    ["credit card", "အကြွေးဝယ်ကတ်", "Can I pay by credit card?"],
    ["payment", "ငွေပေးချေမှု", "Your payment was successful."],
    ["refund", "ငွေပြန်အမ်းခြင်း", "I asked for a refund."],
    ["exchange", "လဲလှယ်ခြင်း", "Can I exchange this shirt for a larger one?"],
  ]},
  { id: "technology", en: "Technology and communication", my: "နည်းပညာနှင့် ဆက်သွယ်ရေး", words: [
    ["keyboard", "ကီးဘုတ်", "Use the keyboard to type your name."], ["screen", "မျက်နှာပြင်", "The screen is too bright."],
    ["password", "စကားဝှက်", "Never share your password."], ["email", "အီးမေးလ်", "I sent the document by email."],
    ["website", "ဝက်ဘ်ဆိုက်", "The school website has the timetable."], ["message", "စာတို", "I received your message this morning."],
    ["headphones", "နားကြပ်", "Use headphones to listen quietly."], ["battery", "ဘက်ထရီ", "My phone battery is almost empty."]
    ["laptop", "လက်ပ်တော့", "I use my laptop for studying."],
    ["tablet", "တက်ဘလက်", "The child reads on a tablet."],
    ["smartphone", "စမတ်ဖုန်း", "My smartphone needs charging."],
    ["app", "အက်ပ်", "Open the app to see your lessons."],
    ["download", "ဒေါင်းလုဒ်လုပ်သည်", "Download the file before travelling."],
    ["upload", "အပ်လုဒ်တင်သည်", "Please upload your homework."],
    ["internet", "အင်တာနက်", "The internet is slow today."],
    ["Wi-Fi", "ဝိုင်ဖိုင်", "The Wi-Fi signal is strong."],
    ["microphone", "မိုက်ခရိုဖုန်း", "Speak clearly into the microphone."],
    ["video call", "ဗီဒီယိုခေါ်ဆိုမှု", "We had a video call with our teacher."],
    ["file", "ဖိုင်", "Save the file on your computer."],
    ["update", "အပ်ဒိတ်လုပ်သည်", "Update the app when a new version is available."],
  ]},
  { id: "town", en: "Places in town", my: "မြို့တွင်းရှိ နေရာများ", words: [
    ["hospital", "ဆေးရုံ", "The hospital is near the main road."], ["market", "ဈေး", "We buy fresh vegetables at the market."],
    ["library", "စာကြည့်တိုက်", "I borrow books from the library."], ["bank", "ဘဏ်", "The bank opens at nine o'clock."],
    ["pharmacy", "ဆေးဆိုင်", "You can buy medicine at the pharmacy."], ["station", "ဘူတာရုံ", "We met at the bus station."],
    ["post office", "စာတိုက်", "I sent a parcel from the post office."], ["restaurant", "စားသောက်ဆိုင်", "They had lunch at a small restaurant."]
    ["school", "ကျောင်း", "The school is beside the park."],
    ["park", "ပန်းခြံ", "Children play in the park."],
    ["bus stop", "ဘတ်စ်ကားမှတ်တိုင်", "Meet me at the bus stop."],
    ["police station", "ရဲစခန်း", "The police station is near the market."],
    ["post box", "စာတိုက်ပုံး", "Put the letter in the post box."],
    ["hotel", "ဟိုတယ်", "We stayed at a small hotel."],
    ["bakery", "မုန့်ဖုတ်ဆိုင်", "The bakery sells fresh bread."],
    ["bridge", "တံတား", "The bridge crosses the river."],
    ["museum", "ပြတိုက်", "We visited the museum on Sunday."],
    ["cinema", "ရုပ်ရှင်ရုံ", "The cinema is showing a new film."],
    ["playground", "ကစားကွင်း", "The children ran to the playground."],
    ["fire station", "မီးသတ်စခန်း", "The fire station is next to the hospital."],
  ]},
  { id: "time", en: "Time and calendar", my: "အချိန်နှင့် ပြက္ခဒိန်", words: [
    ["morning", "နံနက်", "I study English in the morning."], ["afternoon", "နေ့လယ်ပိုင်း", "The meeting is in the afternoon."],
    ["evening", "ညနေပိုင်း", "We walk in the evening."], ["midnight", "သန်းခေါင်ယံ", "The train arrives just after midnight."],
    ["yesterday", "မနေ့က", "I finished the lesson yesterday."], ["tomorrow", "မနက်ဖြန်", "We will practise again tomorrow."],
    ["weekday", "ရုံးဖွင့်ရက်", "I usually work on weekdays."], ["weekend", "စနေ၊ တနင်္ဂနွေ", "We visit our grandparents at the weekend."]
    ["second", "စက္ကန့်", "Wait for one second."],
    ["minute", "မိနစ်", "The bus will arrive in five minutes."],
    ["hour", "နာရီ", "I read for one hour every evening."],
    ["day", "နေ့", "Have a nice day."],
    ["week", "တစ်ပတ်", "The course lasts one week."],
    ["month", "လ", "My birthday is next month."],
    ["year", "နှစ်", "She started learning English this year."],
    ["Monday", "တနင်္လာနေ့", "Our class meets on Monday."],
    ["Friday", "သောကြာနေ့", "We finish work early on Friday."],
    ["calendar", "ပြက္ခဒိန်", "Mark the date on the calendar."],
    ["date", "ရက်စွဲ", "What is the date today?"],
    ["holiday", "အားလပ်ရက်", "We visited our family during the holiday."],
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

export const EXTRA_SKILL_PRACTICE = {
reading:{
A1:{title:"Read a simple message",my:"စာတိုကို ဖတ်ပါ",prompt:"Tom has a blue bag and two books.",task:"What colour is Tom's bag, and how many books does he have?",myTask:"Tom ၏အိတ်က ဘာအရောင်လဲ၊ စာအုပ်ဘယ်နှအုပ်ရှိသလဲ။"},
A2:{title:"Follow a short note",my:"မှတ်စုတိုကို နားလည်ပါ",prompt:"Please put the clean cups in the cupboard before our guests arrive.",task:"What should be done before the guests arrive?",myTask:"ဧည့်သည်မရောက်ခင် ဘာလုပ်ရမလဲ။"},
B1:{title:"Find the main idea",my:"အဓိကအကြောင်းအရာကို ရှာပါ",prompt:"Maya cycles to work because the bus is slow and expensive.",task:"Give two reasons Maya changed her commute.",myTask:"Maya သွားလာပုံပြောင်းရသည့် အကြောင်းရင်း ၂ ခုကို ပြောပါ။"},
B2:{title:"Compare viewpoints",my:"အမြင်များကို နှိုင်းယှဉ်ပါ",prompt:"Some people buy durable products, while others choose cheaper items they can replace easily.",task:"Describe the two viewpoints and one trade-off.",myTask:"အမြင် ၂ မျိုးနှင့် အပေးအယူတစ်ခုကို ဖော်ပြပါ။"},
C1:{title:"Evaluate evidence",my:"အထောက်အထားကို သုံးသပ်ပါ",prompt:"Flexible schedules improved reported satisfaction, although the study did not measure productivity.",task:"What does the study support, and what remains uncertain?",myTask:"လေ့လာမှုက ဘာကို ထောက်ခံပြီး ဘာက မသေချာသေးသလဲ။"},
C2:{title:"Analyze the author's stance",my:"စာရေးသူ၏ ရပ်တည်ချက်ကို ခွဲခြမ်းပါ",prompt:"The proposal has merit, but its promised savings depend on assumptions that have yet to be tested.",task:"Explain the author's cautious stance and key qualification.",myTask:"စာရေးသူ၏ သတိထားသောအမြင်နှင့် ကန့်သတ်ချက်ကို ရှင်းပြပါ."}
},
listening:{
A1:{title:"Listen for a number",my:"နံပါတ်ကို နားထောင်ပါ",prompt:"I have three red apples.",task:"Say the number and colour you hear.",myTask:"ကြားရသော အရေအတွက်နှင့် အရောင်ကို ပြောပါ။"},
A2:{title:"Follow a direction",my:"လမ်းညွှန်ချက်ကို နားထောင်ပါ",prompt:"Walk past the bank and turn left at the pharmacy.",task:"Repeat both directions in order.",myTask:"လမ်းညွှန်ချက် ၂ ခုကို အစဉ်လိုက် ပြန်ပြောပါ။"},
B1:{title:"Catch a change of plan",my:"အစီအစဉ်ပြောင်းလဲမှုကို ဖမ်းယူပါ",prompt:"We planned to eat outside, but the rain means dinner will be indoors.",task:"What was the original plan, and what changed it?",myTask:"မူလအစီအစဉ်က ဘာလဲ၊ ဘာကြောင့်ပြောင်းသွားသလဲ။"},
B2:{title:"Notice the condition",my:"အခြေအနေကို နားထောင်ပါ",prompt:"You can borrow my laptop if you save your work and return it by Friday.",task:"Name both conditions for borrowing the laptop.",myTask:"လက်ပ်တော့ငှားရန် လိုအပ်သည့် အခြေအနေ ၂ ခုကို ပြောပါ။"},
C1:{title:"Recognize polite disagreement",my:"ယဉ်ကျေးသော သဘောမတူမှုကို နားလည်ပါ",prompt:"I see why that option appeals to you; I am not convinced it addresses the main risk.",task:"What does the speaker accept, and what do they question?",myTask:"ပြောသူက ဘာကို လက်ခံပြီး ဘာကို သံသယရှိသလဲ။"},
C2:{title:"Infer the speaker's priority",my:"ပြောသူ၏ ဦးစားပေးမှုကို ခန့်မှန်းပါ",prompt:"We could launch on Monday, but I would rather delay than release something our support team cannot maintain.",task:"Infer the speaker's priority and justify your answer.",myTask:"ပြောသူ၏ ဦးစားပေးမှုကို အကြောင်းပြချက်နှင့်တကွ ခန့်မှန်းပါ။"}
},
writing:{
A1:{title:"Write about a favourite thing",my:"ကြိုက်နှစ်သက်သောအရာအကြောင်း ရေးပါ",prompt:"My favourite food is rice.",task:"Write one sentence about a food you like.",myTask:"ကြိုက်သောအစားအစာအကြောင်း ဝါကျတစ်ကြောင်းရေးပါ။"},
A2:{title:"Describe your day",my:"တစ်နေ့တာကို ဖော်ပြပါ",prompt:"I wake up at seven and walk to school.",task:"Write three short sentences about your morning.",myTask:"မနက်ခင်းအကြောင်း ဝါကျတို ၃ ကြောင်းရေးပါ။"},
B1:{title:"Write a useful message",my:"အသုံးဝင်သောစာတိုရေးပါ",prompt:"Could you please send me the meeting time?",task:"Write a polite message asking for information and giving a reason.",myTask:"အချက်အလက်တောင်းပြီး အကြောင်းပြချက်ပါသော ယဉ်ကျေးသည့်စာတိုရေးပါ။"},
B2:{title:"Explain a decision",my:"ဆုံးဖြတ်ချက်ကို ရှင်းပြပါ",prompt:"I chose the train because it was reliable, even though it took longer.",task:"Write a paragraph explaining a choice with a concession.",myTask:"အလျှော့ပေးသည့်အချက်ပါသော ဆုံးဖြတ်ချက်ရှင်းလင်းစာပိုဒ်ရေးပါ။"},
C1:{title:"Write a balanced proposal",my:"မျှတသော အဆိုပြုချက်ရေးပါ",prompt:"A four-day workweek may improve wellbeing if workloads are redesigned realistically.",task:"Write a proposal with benefits, risks, and a practical safeguard.",myTask:"အကျိုးကျေးဇူး၊ အန္တရာယ်နှင့် လက်တွေ့ကာကွယ်ချက်ပါသော အဆိုပြုချက်ရေးပါ။"},
C2:{title:"Revise for precision",my:"တိကျမှုအတွက် ပြန်လည်ပြင်ဆင်ပါ",prompt:"The plan is good and will help many people.",task:"Rewrite with specific benefits and a carefully qualified claim.",myTask:"တိကျသောအကျိုးကျေးဇူးနှင့် ကန့်သတ်ဖော်ပြချက်ပါအောင် ပြန်ရေးပါ။"}
},
speaking:{
A1:{title:"Introduce yourself",my:"ကိုယ့်ကိုယ်ကို မိတ်ဆက်ပါ",prompt:"Hello, my name is Alex. I live in Mandalay.",task:"Say your name and where you live.",myTask:"မိမိအမည်နှင့် နေထိုင်ရာကို ပြောပါ။"},
A2:{title:"Ask for help politely",my:"ယဉ်ကျေးစွာ အကူအညီတောင်းပါ",prompt:"Excuse me, could you help me find the bus stop?",task:"Practise the request, then ask for a nearby place.",myTask:"တောင်းဆိုချက်ကို လေ့ကျင့်ပြီး အနီးရှိနေရာတစ်ခုကို မေးပါ။"},
B1:{title:"Tell a short story",my:"အဖြစ်အပျက်တိုကို ပြောပါ",prompt:"Last weekend, I visited a market and tried a new dish.",task:"Tell a 30-second story using first, then, and finally.",myTask:"first, then, finally သုံးပြီး စက္ကန့် ၃၀ စာ ပြောပါ။"},
B2:{title:"Compare two choices",my:"ရွေးချယ်စရာ ၂ ခုကို နှိုင်းယှဉ်ပါ",prompt:"I prefer public transport to driving because it is less stressful.",task:"Compare two options and support your preference with reasons.",myTask:"ရွေးချယ်စရာ ၂ ခုကို နှိုင်းယှဉ်ပြီး အကြောင်းပြချက်ပေးပါ။"},
C1:{title:"Respond to a concern",my:"စိုးရိမ်ချက်ကို တုံ့ပြန်ပါ",prompt:"That is a fair concern; we could reduce the risk by testing the idea on a small scale first.",task:"Acknowledge a concern and offer a reasoned response.",myTask:"စိုးရိမ်ချက်ကို အသိအမှတ်ပြုပြီး အကြောင်းပြချက်ရှိသော တုံ့ပြန်မှု ပေးပါ။"},
C2:{title:"Defend a nuanced position",my:"အမြင်တစ်ခုကို အချက်အလက်နှင့် ကာကွယ်ပြောဆိုပါ",prompt:"Convenience matters, but it should not automatically outweigh long-term cost, accessibility, or environmental impact.",task:"Give a 60-second argument with a counterargument and qualified conclusion.",myTask:"ဆန့်ကျင်ဘက်အမြင်နှင့် ကန့်သတ်ထားသော နိဂုံးပါသည့် ၁ မိနစ်စာ အကြောင်းပြချက်ပြောပါ။"}
}
};

export const ALPHABET = Object.freeze([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."abcdefghijklmnopqrstuvwxyz"]);

export const CURSIVE_GLYPHS = Object.freeze({
  A: "𝒜", B: "ℬ", C: "𝒞", D: "𝒟", E: "ℰ", F: "ℱ", G: "𝒢", H: "ℋ", I: "ℐ",
  J: "𝒥", K: "𝒦", L: "ℒ", M: "ℳ", N: "𝒩", O: "𝒪", P: "𝒫", Q: "𝒬", R: "ℛ",
  S: "𝒮", T: "𝒯", U: "𝒰", V: "𝒱", W: "𝒲", X: "𝒳", Y: "𝒴", Z: "𝒵",
  a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "ℯ", f: "𝒻", g: "ℊ", h: "𝒽", i: "𝒾",
  j: "𝒿", k: "𝓀", l: "𝓁", m: "𝓂", n: "𝓃", o: "ℴ", p: "𝓅", q: "𝓆", r: "𝓇",
  s: "𝓈", t: "𝓉", u: "𝓊", v: "𝓋", w: "𝓌", x: "𝓍", y: "𝓎", z: "𝓏"
});

const BASE_LETTER_GUIDES = {
  A: { style: "Print uppercase", start: "Start at the top, move down-left, lift, then down-right; add the middle bar.", my: "အပေါ်ဆုံးမှစ၍ ဘယ်အောက်သို့ ဆင်းပါ။ လက်မြှောက်ပြီး ညာအောက်သို့ ဆင်းကာ အလယ်မျဉ်းဆွဲပါ။", paths: ["M50 12 L20 88", "M50 12 L80 88", "M32 61 L68 61"] },
  a: { style: "Print lowercase", start: "Begin with the round bowl, move counter-clockwise, close the shape, then draw the right stem.", my: "ဝိုင်းပုံကို ဘယ်ဘက်မှစ၍ လှည့်ဆွဲပြီး ပိတ်ပါ။ ထို့နောက် ညာဘက်တိုင်ကို ဆွဲပါ။", paths: ["M68 48 C68 26 30 26 30 51 C30 76 68 76 68 51 L68 27 L68 78"] },
  B: { style: "Print uppercase", start: "Draw the vertical stem from top to bottom, then make the upper and lower bowls.", my: "အပေါ်မှအောက်သို့ တိုင်ကို အရင်ဆွဲပြီး အပေါ်ဝိုင်းနှင့် အောက်ဝိုင်းကို ဆက်ဆွဲပါ။", paths: ["M28 12 L28 88", "M28 14 C78 8 78 47 29 48", "M29 48 C85 43 84 89 28 88"] },
  b: { style: "Print lowercase", start: "Draw the tall stem downwards, then form the bowl from the middle toward the right.", my: "တိုင်ရှည်ကို အပေါ်မှအောက်သို့ ဆွဲပြီး အလယ်မှညာဘက်သို့ ဝိုင်းပုံဆွဲပါ။", paths: ["M30 12 L30 88", "M30 56 C30 27 72 30 72 57 C72 82 31 81 30 56"] },
  C: { style: "Print uppercase", start: "Start near the top-right, curve left and down, then sweep back toward the right.", my: "အပေါ်ညာဘက်မှစ၍ ဘယ်ဘက်သို့ကွေးဆွဲ၊ အောက်သို့ဆင်းပြီး ညာဘက်သို့ ပြန်ကွေးပါ။", paths: ["M78 25 C45 0 19 24 20 50 C19 79 47 98 78 75"] },
  c: { style: "Print lowercase", start: "Start near the upper-right of the bowl, curve left and down, then return toward the opening.", my: "ဝိုင်းပုံ၏ အပေါ်ညာဘက်မှစ၍ ဘယ်ဘက်၊ အောက်ဘက်သို့ ကွေးဆွဲပြီး အဖွင့်နေရာသို့ ပြန်တက်ပါ။", paths: ["M72 35 C46 17 26 34 27 53 C27 76 49 83 72 68"] }
};

const ADDITIONAL_STROKE_PATHS = {
  D: ["M24 12 L24 88", "M24 14 C79 8 82 88 24 88"],
  d: ["M68 50 C68 26 30 26 30 51 C30 76 68 76 68 51", "M68 12 L68 88"],
  E: ["M25 12 L25 88", "M25 14 L75 14", "M25 50 L65 50", "M25 88 L75 88"],
  e: ["M28 52 L71 52 C70 28 31 26 28 52 C25 78 52 83 71 67"],
  F: ["M25 88 L25 14 L75 14", "M25 48 L65 48"],
  f: ["M31 88 L31 29 C31 7 61 6 66 27", "M15 48 L58 48"],
  G: ["M78 24 C50 1 21 20 21 50 C21 80 51 97 78 75 L78 53 L54 53"],
  g: ["M68 50 C68 26 30 26 30 51 C30 76 68 76 68 51", "M68 45 L68 78 C68 98 39 98 29 85"],
  H: ["M22 12 L22 88", "M78 12 L78 88", "M22 50 L78 50"],
  h: ["M30 12 L30 88", "M30 55 C30 28 70 30 70 55 L70 88"],
  I: ["M25 14 L75 14", "M50 14 L50 88", "M25 88 L75 88"],
  i: ["M45 45 L45 78", "M45 22 L45.1 22"],
  J: ["M25 14 L78 14", "M63 14 L63 69 C63 98 26 96 22 72"],
  j: ["M52 45 L52 80 C52 98 30 98 25 86", "M52 22 L52.1 22"],
  K: ["M25 12 L25 88", "M75 14 L28 52", "M43 42 L78 88"],
  k: ["M30 12 L30 88", "M68 45 L31 62", "M45 56 L72 80"],
  L: ["M26 12 L26 88 L76 88"],
  l: ["M45 12 L45 88"],
  M: ["M18 88 L18 14 L50 58 L82 14 L82 88"],
  m: ["M24 78 L24 45", "M24 55 C24 30 48 30 48 55 L48 78", "M48 55 C48 30 72 30 72 55 L72 78"],
  N: ["M22 88 L22 14", "M22 14 L78 88", "M78 88 L78 14"],
  n: ["M30 78 L30 45", "M30 55 C30 30 70 30 70 55 L70 78"],
  O: ["M50 12 C12 12 12 88 50 88 C88 88 88 12 50 12 Z"],
  o: ["M50 30 C20 30 20 78 50 78 C80 78 80 30 50 30 Z"],
  P: ["M25 88 L25 14", "M25 14 C78 7 79 49 25 49"],
  p: ["M30 42 L30 96", "M30 55 C30 30 70 30 70 55 C70 78 30 80 30 55"],
  Q: ["M50 12 C12 12 12 88 50 88 C88 88 88 12 50 12 Z", "M58 65 L82 91"],
  q: ["M68 50 C68 26 30 26 30 51 C30 76 68 76 68 51", "M68 45 L68 96"],
  R: ["M25 88 L25 14", "M25 14 C78 7 79 49 25 49", "M43 49 L78 88"],
  r: ["M30 78 L30 45", "M30 56 C31 35 49 36 59 43"],
  S: ["M76 22 C51 2 22 15 25 34 C28 49 72 47 75 65 C79 89 44 98 22 76"],
  s: ["M69 36 C51 22 29 31 30 45 C31 57 66 51 68 65 C71 83 45 85 28 72"],
  T: ["M18 14 L82 14", "M50 14 L50 88"],
  t: ["M44 18 L44 67 C44 82 58 83 66 74", "M24 43 L65 43"],
  U: ["M22 14 L22 62 C22 98 78 98 78 62 L78 14"],
  u: ["M30 45 L30 62 C30 86 68 86 68 62 L68 45", "M68 45 L68 78"],
  V: ["M20 14 L50 88", "M50 88 L80 14"],
  v: ["M25 45 L45 78", "M45 78 L70 45"],
  W: ["M14 14 L30 88 L50 48 L70 88 L86 14"],
  w: ["M20 45 L32 78 L48 52 L62 78 L78 45"],
  X: ["M22 14 L78 88", "M78 14 L22 88"],
  x: ["M28 45 L70 78", "M70 45 L28 78"],
  Y: ["M20 14 L50 48", "M80 14 L50 48", "M50 48 L50 88"],
  y: ["M27 45 L44 78", "M65 45 L44 78 L32 96"],
  Z: ["M22 14 L78 14", "M78 14 L22 88", "M22 88 L78 88"],
  z: ["M28 45 L70 45", "M70 45 L28 78", "M28 78 L70 78"]
};

const ADDITIONAL_LETTER_GUIDES = Object.fromEntries(
  Object.entries(ADDITIONAL_STROKE_PATHS).map(([letter, paths]) => {
    const uppercase = letter === letter.toUpperCase();
    return [letter, {
      style: uppercase ? "Print uppercase" : "Print lowercase",
      start: "Follow the animated strokes in order, lifting your pen between separate strokes.",
      my: "လှုပ်ရှားမှုလမ်းညွှန်ကို အစဉ်လိုက်လိုက်နာပြီး မျဉ်းတစ်ကြောင်းစီပြီးတိုင်း လိုအပ်သလို ဘောပင်ကို မြှောက်ပါ။",
      paths
    }];
  })
);

export const LETTER_GUIDES = { ...BASE_LETTER_GUIDES, ...ADDITIONAL_LETTER_GUIDES };

export function getPractice(skill, level, exerciseIndex = 0) {
  if (exerciseIndex === 0) return SKILL_PRACTICE[skill]?.[level] ?? null;
  if (exerciseIndex === 1) return EXTRA_SKILL_PRACTICE[skill]?.[level] ?? null;
  return null;
}

export function getPracticeCount(skill, level) {
  return Number(Boolean(getPractice(skill, level, 0))) + Number(Boolean(getPractice(skill, level, 1)));
}
