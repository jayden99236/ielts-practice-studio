// The main lesson library. All sentences are original and written for this site.
// Each item is "examiner question | model answer", or just a model sentence.
(() => {
const add = (id, level, title, blurb, items) => LESSONS.push({
  id, level, title, blurb,
  items: items.map(s => {
    const i = s.indexOf(" | ");
    return i < 0 ? { a: s } : { q: s.slice(0, i), a: s.slice(i + 3) };
  })
});

/* ===================== PART 1: familiar topics ===================== */

add("p1-work", "Part 1", "Work", "Talking about your job, colleagues and career plans.", [
  "What do you do for a living? | I work as an accountant for a small company in the city centre.",
  "Why did you choose that job? | Mainly because I've always been good with numbers, and the hours suit me.",
  "What do you like most about your job? | The best part is that no two days are ever the same.",
  "Is there anything you dislike about it? | The only downside is the long commute, which takes over an hour each way.",
  "Do you get on well with your colleagues? | Yes, we're a close team, and we often have lunch together.",
  "Would you like to change jobs in the future? | Possibly. I'd like to run my own business one day.",
  "Is your job difficult? | It can be stressful at the end of the month, but most of the time it's manageable.",
  "What did you want to be when you were a child? | I dreamed of becoming a pilot, although I'm actually afraid of heights."
]);

add("p1-study", "Part 1", "Studies", "Describing your course, your subjects and how you learn.", [
  "What are you studying? | I'm doing a degree in civil engineering, and I'm halfway through the course.",
  "Why did you choose that subject? | I chose it because I've always been curious about how bridges and buildings stay up.",
  "What's the most difficult part of your course? | The mathematics is quite demanding, so I have to revise almost every evening.",
  "Do you prefer studying alone or with others? | I concentrate better on my own, but group work is useful before exams.",
  "Where do you usually study? | I tend to study in the library, since it's much quieter than my flat.",
  "What will you do when you finish your studies? | I'm hoping to find a job abroad and gain some international experience.",
  "Do you enjoy your course? | On the whole, yes, although some of the lectures are a bit dry.",
  "Who was your favourite teacher at school? | My history teacher, because she made every lesson feel like a story."
]);

add("p1-home", "Part 1", "Home and accommodation", "Rooms, neighbours and where you would like to live.", [
  "What kind of home do you live in? | I rent a two-bedroom apartment on the edge of town.",
  "Which is your favourite room? | Definitely the kitchen, because that's where everyone ends up chatting.",
  "How long have you lived there? | I've been living there for about four years now.",
  "Is there anything you'd like to change about your home? | I wish it had a balcony, as I'd love somewhere to grow plants.",
  "Do you know your neighbours? | Only to say hello to; people in my building tend to keep to themselves.",
  "What can you see from your windows? | Nothing special, I'm afraid, just a car park and a row of shops.",
  "Do you plan to move in the future? | Eventually, yes. I'd like to buy a place with a small garden.",
  "What makes a house feel like a home? | For me, it's the photographs, the books and the smell of cooking."
]);

add("p1-hometown", "Part 1", "Your hometown", "Describing where you grew up and how it has changed.", [
  "Where is your hometown? | It's a port city on the west coast, about two hours from the capital.",
  "What is it known for? | It's famous for its seafood and for a music festival held every summer.",
  "Is it a good place for young people? | Not really. There's very little to do in the evenings, so many of them move away.",
  "How has it changed since you were a child? | It has grown enormously, and the old market has been replaced by a shopping centre.",
  "What's the best time of year to visit? | I'd recommend the spring, when the weather is mild and the streets are less crowded.",
  "Is there much traffic? | During rush hour it's terrible, but otherwise it's easy to get around.",
  "Would you like to live there in the future? | I'd love to retire there, but for now the jobs are elsewhere.",
  "What would you show a visitor first? | I'd take them straight to the harbour to watch the fishing boats come in."
]);

add("p1-family", "Part 1", "Family and friends", "The people closest to you and how you spend time together.", [
  "Do you have a large family? | Not especially. There are just five of us, including my grandmother.",
  "Who are you closest to in your family? | Probably my older sister, since we share the same sense of humour.",
  "How often do you see your relatives? | We get together for birthdays and holidays, so about once a month.",
  "Do you take after your mother or your father? | People say I look like my father, but I have my mother's personality.",
  "How did you meet your best friend? | We sat next to each other on the first day of secondary school.",
  "What do you usually do with your friends? | Nothing fancy. We mostly cook dinner together or watch a match.",
  "Do you prefer having a few close friends or many? | A few close ones. I'd rather have two people I can rely on.",
  "Is it easy for you to make new friends? | It takes me a while to open up, but once I do, the friendships last."
]);

add("p1-food", "Part 1", "Food and cooking", "Meals, restaurants and what you like to eat.", [
  "What's your favourite food? | I can never say no to a bowl of noodles with plenty of chilli.",
  "Can you cook? | I can manage the basics, but I wouldn't invite anyone to dinner just yet.",
  "Who does most of the cooking in your home? | My father does, and he takes it very seriously.",
  "Do you often eat out? | Maybe twice a month. It's become rather expensive lately.",
  "Is there any food you really dislike? | I've never been able to eat mushrooms; it's the texture I can't stand.",
  "What do people usually eat in your country? | Rice is served with almost every meal, along with vegetables and fish.",
  "Have your eating habits changed? | Yes, I eat far less sugar than I did as a teenager.",
  "Do you prefer home-cooked food or restaurant food? | Home-cooked, without a doubt. Nothing beats my grandmother's soup."
]);

add("p1-tech", "Part 1", "Technology and the internet", "Phones, apps and how you use technology every day.", [
  "What technology do you use most? | My laptop, since I need it for work as well as for entertainment.",
  "How much time do you spend online? | Far too much, to be honest. Probably five or six hours a day.",
  "What do you mainly use the internet for? | Mostly for keeping in touch with friends and reading the news.",
  "Is there an app you couldn't live without? | The map on my phone. I have absolutely no sense of direction.",
  "Do you ever switch your phone off? | Only when I'm at the cinema, or when I really need to concentrate.",
  "Are you good with computers? | I'm reasonably confident, although I always ask my brother when something breaks.",
  "Do you shop online? | For books and electronics, yes, but I prefer to try clothes on first.",
  "Has technology made your life easier? | In most ways it has, but I do miss writing letters by hand."
]);

add("p1-transport", "Part 1", "Travel and transport", "Getting around, holidays and journeys.", [
  "How do you usually get around? | I cycle whenever I can, because it's faster than sitting in traffic.",
  "Is public transport good where you live? | The trains are reliable, but the buses are often late.",
  "Do you enjoy long journeys? | I do, as long as I have a window seat and something to read.",
  "Where did you go on your last holiday? | I spent a week hiking in the mountains with two old friends.",
  "Do you prefer travelling alone or with others? | With others. Sharing the experience makes it more memorable.",
  "What do you always pack when you travel? | A pair of comfortable shoes and a spare phone charger.",
  "Is there a country you would love to visit? | I've always wanted to see the northern lights in Norway.",
  "Have you ever missed a flight or a train? | Once. I overslept and had to buy a completely new ticket."
]);

add("p1-weather", "Part 1", "Weather and seasons", "Climate, seasons and how the weather affects you.", [
  "What's the weather like in your country? | It's hot and humid for most of the year, with a short rainy season.",
  "Which season do you like least? | Winter, because it gets dark so early in the afternoon.",
  "Does the weather affect your mood? | Very much so. I feel far more energetic when the sun is shining.",
  "What do you do on rainy days? | I usually stay in, make a pot of tea and catch up on a series.",
  "Have you ever seen snow? | Only once, on a school trip, and I remember being amazed by how quiet it was.",
  "Do you check the weather forecast? | Every morning, although it's wrong about half the time.",
  "Would you rather live somewhere hot or cold? | Somewhere cool. You can always put on another jumper.",
  "Has the climate in your area changed? | The summers seem to be getting longer and drier every year."
]);

add("p1-sport", "Part 1", "Sport and health", "Exercise, staying healthy and sports you follow.", [
  "Do you play any sports? | I play badminton with my colleagues every Thursday after work.",
  "Did you do much sport at school? | Not willingly. I was always the last one to be picked for a team.",
  "Do you watch sport on television? | Only the big tournaments, like the World Cup or the Olympics.",
  "How do you stay healthy? | I try to walk everywhere and get at least seven hours of sleep.",
  "Is there a sport you'd like to try? | I'd love to have a go at rock climbing, if I can find the courage.",
  "Do you think you have a healthy diet? | It's fairly balanced, apart from my weakness for chocolate.",
  "How do you relax after a busy day? | A hot shower and half an hour of music usually does the trick.",
  "Are people in your country active? | Less than they used to be, since so many jobs involve sitting at a desk."
]);

add("p1-media", "Part 1", "Films, TV and reading", "What you watch and read, and why.", [
  "What kind of films do you enjoy? | I'm a big fan of thrillers, especially ones with an unexpected ending.",
  "How often do you go to the cinema? | Hardly ever these days, as it's so easy to watch things at home.",
  "Is there a series you're watching at the moment? | Yes, a detective drama. I'm completely hooked on it.",
  "Do you read much? | I get through about a book a month, mostly on the train.",
  "Do you prefer paper books or e-books? | Paper, every time. I like being able to turn the pages.",
  "Do you read the news every day? | I glance at the headlines over breakfast, but I rarely read whole articles.",
  "Was there a book you loved as a child? | There was one about a boy and a dragon that I must have read ten times.",
  "Do you ever watch films in English? | Quite often, with subtitles, as it's a painless way to learn."
]);

add("p1-shopping", "Part 1", "Shopping and money", "Spending, saving and where you shop.", [
  "Do you enjoy shopping? | Only when I know exactly what I'm looking for.",
  "Where do you buy most of your clothes? | Mostly online, because the shops near me have very little choice.",
  "Are you good at saving money? | I'm getting better. I put a little aside at the start of every month.",
  "What was the last thing you bought? | A second-hand bicycle, which turned out to be a real bargain.",
  "Do you prefer small shops or large malls? | Small shops. The service is more personal and you find unusual things.",
  "Have you ever bought something you regretted? | Yes, an expensive coat that I've worn exactly twice.",
  "Do you usually pay by card or in cash? | Almost always by card. I hardly carry any cash nowadays.",
  "Is it important to buy well-known brands? | Not to me. I care more about quality than about the label."
]);

add("p1-childhood", "Part 1", "Childhood and memories", "Looking back, using past forms and 'used to'.", [
  "Where did you grow up? | I grew up in a quiet village surrounded by rice fields.",
  "What games did you play as a child? | We used to play hide and seek in the street until it got dark.",
  "Did you enjoy primary school? | I loved it, mostly because of the long breaks and the school garden.",
  "What is your earliest memory? | I remember falling off my bicycle and my grandfather picking me up.",
  "Were you a well-behaved child? | Not always. I was forever climbing trees and tearing my clothes.",
  "Did you have a favourite toy? | I had a wooden train that I refused to share with anyone.",
  "Do you still see your childhood friends? | A couple of them. We've managed to stay in touch over the years.",
  "Would you like to be a child again? | For a day, perhaps. It would be nice to have no responsibilities."
]);

add("p1-nature", "Part 1", "Nature and the environment", "Parks, animals and everyday green habits.", [
  "Do you like spending time outdoors? | Very much. I feel calmer as soon as I'm surrounded by trees.",
  "Are there many parks where you live? | There's one large park by the river, and it's packed at weekends.",
  "Do you have any pets? | We have an elderly cat who sleeps for about twenty hours a day.",
  "What's your favourite animal? | I've always been fascinated by elephants, because they never forget.",
  "Do you recycle? | I do my best. We separate paper, glass and plastic at home.",
  "Have you ever grown your own vegetables? | I tried growing tomatoes once, but the birds ate most of them.",
  "Do you prefer the mountains or the sea? | The sea. There's something relaxing about the sound of the waves.",
  "Is pollution a problem in your city? | Unfortunately, yes. On some days you can barely see the hills."
]);

add("p1-routine", "Part 1", "Routines, sleep and time", "Daily habits, punctuality and how you organise your day.", [
  "What time do you usually get up? | Around half past six, though I'd happily sleep until nine.",
  "What's the busiest part of your day? | The morning, without question. Everything seems to happen before noon.",
  "Are you usually on time? | I try to be. I'd rather arrive ten minutes early than keep someone waiting.",
  "Do you get enough sleep? | During the week, not really. I catch up at the weekend.",
  "How do you plan your day? | I write a short list the night before and tick things off as I go.",
  "What do you do in the evenings? | I normally cook, tidy up and then read for a while before bed.",
  "Is your weekend routine different? | Completely. I don't set an alarm and I take my time over breakfast.",
  "Would you like to change your daily routine? | I'd like to start exercising in the mornings instead of after work."
]);

add("p1-arts", "Part 1", "Music, art and hobbies", "Creative interests and things you do for fun.", [
  "Do you play a musical instrument? | I used to play the violin, but I gave it up when I was fourteen.",
  "What kind of music do you listen to when you study? | Something without words, like classical music or film soundtracks.",
  "Have you been to a concert recently? | Yes, I saw a local band last month and they were surprisingly good.",
  "Are you interested in art? | I enjoy looking at paintings, although I can't draw to save my life.",
  "Do you often visit museums? | Only when I'm travelling. I rarely go to the ones in my own city.",
  "Do you take many photographs? | Hundreds, mostly of food and sunsets, like everybody else.",
  "Is there a hobby you've had for a long time? | I've been collecting old postcards since I was about ten.",
  "What hobby would you like to take up? | I'm thinking of joining a pottery class to do something with my hands."
]);

/* ===================== PART 2: model long turns ===================== */

add("p2-person", "Part 2", "Describe a person you admire", "A complete model answer, one sentence at a time.", [
  "The person I'd like to describe is my uncle, who taught me how to swim.",
  "He's in his late fifties now, but he has more energy than most people half his age.",
  "He worked as a fisherman for thirty years before opening a small cafe by the beach.",
  "What strikes you first about him is his laugh, which you can hear from across the street.",
  "He's incredibly patient, and he never loses his temper, even when things go wrong.",
  "I remember one summer when he spent every morning teaching me to dive off the rocks.",
  "He always says that the sea rewards people who respect it.",
  "I admire him because he has worked hard all his life without ever complaining."
]);

add("p2-place", "Part 2", "Describe a place you love", "Setting a scene with detail and feeling.", [
  "I'm going to talk about a small lake that's about an hour's drive from my home.",
  "I first went there on a school trip, and I've been going back ever since.",
  "It's surrounded by pine trees, so the air always smells fresh and clean.",
  "Early in the morning, the water is so still that it looks like a mirror.",
  "There's a wooden path that runs all the way around the edge of the lake.",
  "Most people go there to fish, but I just like to sit and watch the birds.",
  "It's the one place where I can completely switch off from work.",
  "Whenever I feel stressed, I close my eyes and picture myself standing there."
]);

add("p2-object", "Part 2", "Describe something you own", "Talking about an object that matters to you.", [
  "The object I've chosen to describe is a watch that belonged to my grandfather.",
  "It isn't worth much money, but it means a great deal to me.",
  "It has a brown leather strap and a small scratch on the glass.",
  "He wore it every single day for more than forty years.",
  "My mother gave it to me on the day I graduated from university.",
  "I don't wear it very often, because I'm terrified of losing it.",
  "Every time I wind it up, I'm reminded of the stories he used to tell.",
  "If my house were on fire, it's the first thing I would save."
]);

add("p2-event", "Part 2", "Describe a special event", "Sequencing a story from start to finish.", [
  "I'd like to tell you about my cousin's wedding, which took place last spring.",
  "It was held in a garden on the outskirts of the city.",
  "More than two hundred guests had been invited, so the place was packed.",
  "Just before the ceremony began, the sky turned dark and it started to pour.",
  "Everyone rushed inside, carrying chairs and flowers as fast as they could.",
  "In the end, the rain made the whole day even more memorable.",
  "We danced until midnight, and nobody wanted to go home.",
  "It reminded me how important it is to celebrate with the people you love."
]);

add("p2-activity", "Part 2", "Describe a hobby or activity", "Explaining what you do, how, and why you enjoy it.", [
  "I'm going to describe something I've recently taken up, which is baking bread.",
  "I started about a year ago, after watching a video online.",
  "My first few loaves were as hard as bricks, to be honest.",
  "It took me several months to work out what I was doing wrong.",
  "These days I bake every Sunday morning while the rest of the family is asleep.",
  "The part I enjoy most is kneading the dough, because it helps me clear my head.",
  "There's nothing quite like the smell of fresh bread filling the kitchen.",
  "It has taught me to be patient, since you simply can't rush the process."
]);

add("p2-media", "Part 2", "Describe a book or film", "Summarising a story and giving your reaction.", [
  "The film I want to talk about is a documentary about life in the deep ocean.",
  "A friend recommended it to me, and I watched it one evening last winter.",
  "It follows a team of scientists as they explore places no one has ever seen.",
  "What impressed me most was the photography, which was absolutely stunning.",
  "Some of the creatures looked as though they had come from another planet.",
  "Until then, I hadn't realised how little we know about our own seas.",
  "By the end, I felt both amazed and slightly worried about the future.",
  "I'd recommend it to anyone, even people who don't normally watch documentaries."
]);

add("p2-challenge", "Part 2", "Describe a challenge or decision", "Talking about difficulty, choices and what you learned.", [
  "I'd like to describe the time I decided to move to another city for work.",
  "I had been offered a better job, but it meant leaving my family behind.",
  "I spent weeks going back and forth, unable to make up my mind.",
  "In the end, it was my father who encouraged me to take the risk.",
  "The first few months were tough, because I didn't know a single person there.",
  "Little by little, I made friends and began to feel at home.",
  "If I hadn't gone, I would always have wondered what might have happened.",
  "Looking back, it was the hardest but also the best decision I've ever made."
]);

add("p2-future", "Part 2", "Describe a plan or ambition", "Future forms, hopes and conditions.", [
  "Something I'm hoping to do in the next few years is open a small bookshop.",
  "It's an idea I've had at the back of my mind since I was a teenager.",
  "I'd like it to have a cafe in the corner, where people can sit and read.",
  "Of course, I'll need to save a considerable amount of money first.",
  "I'm planning to take a short course in business management next year.",
  "My friends think I'm being unrealistic, but I'm determined to give it a try.",
  "Even if it doesn't succeed, at least I'll know that I did my best.",
  "By the time I'm forty, I hope to be doing something I truly love."
]);

/* ===================== PART 3: discussion ===================== */

add("p3-education", "Part 3", "Education", "Longer answers about schools, teachers and learning.", [
  "What makes a good teacher? | A good teacher is someone who can explain difficult ideas in a simple way.",
  "Should children have homework? | A little is useful, but too much leaves them no time to play or rest.",
  "Is university education necessary for success? | Not necessarily. Plenty of successful people learned their skills on the job.",
  "Will technology replace teachers? | I doubt it, because machines can give information but they can't inspire people.",
  "Should schools teach practical skills? | Definitely. Young people ought to know how to cook and manage their money.",
  "Is it better to study at home or abroad? | Studying abroad broadens your mind, but it isn't affordable for everyone.",
  "Are exams the best way to measure ability? | They test memory under pressure rather than real understanding.",
  "How has education changed in your country? | Classes are smaller than they used to be, and there's far more group work."
]);

add("p3-work", "Part 3", "Work and careers", "Discussing jobs, employers and working life.", [
  "Why do some people change jobs often? | Usually because they're looking for a higher salary or a new challenge.",
  "Is job satisfaction more important than money? | I'd say so, since we spend about a third of our lives at work.",
  "What are the benefits of working from home? | You save time on travelling, and you can organise the day as you like.",
  "Are there any drawbacks to working from home? | It can be lonely, and it's harder to separate work from family life.",
  "Which jobs will disappear in the future? | Routine jobs, such as data entry, are likely to be done by computers.",
  "Should people retire at a fixed age? | I think it should be flexible, depending on their health and the type of work.",
  "What qualities do employers look for? | Above all, they want people who are reliable and willing to learn.",
  "Is it good to work for the same company all your life? | It offers security, but you may miss out on wider experience."
]);

add("p3-technology", "Part 3", "Technology and society", "Opinions about the digital world.", [
  "How has the internet changed communication? | It has made it instant, though some would argue it's also made it shallower.",
  "Are people too dependent on their phones? | I'm afraid so. Many of us panic if the battery runs out.",
  "Should children be allowed to use social media? | Only with supervision, as they may not recognise the risks.",
  "Will robots do most of our work one day? | They may take over physical tasks, but creative work will remain human.",
  "Is online information reliable? | It varies enormously, so people need to learn to check their sources.",
  "Has technology made people less sociable? | In some ways, yet it also connects people who would otherwise be isolated.",
  "What is the greatest invention of the last century? | In my view it's the vaccine, since it has saved millions of lives.",
  "Do older people struggle with new technology? | Some do, but many are keen to learn if someone shows them patiently."
]);

add("p3-environment", "Part 3", "The environment", "Causes, effects and solutions.", [
  "What is the biggest environmental problem today? | Without doubt it's climate change, because it affects every country on earth.",
  "Whose responsibility is it to protect the environment? | Governments make the laws, but individuals have to change their habits too.",
  "Why don't more people use public transport? | In many places it's slow and crowded, so driving is simply more convenient.",
  "How can cities reduce pollution? | They could plant more trees and limit the number of cars in the centre.",
  "Should plastic bags be banned? | I believe they should, as there are plenty of alternatives available.",
  "Are people more aware of green issues now? | Much more than in the past, especially the younger generation.",
  "Is it too late to solve these problems? | I don't think so, provided that we act quickly and work together.",
  "What can individuals do to help? | Small things add up, such as wasting less food and saving electricity."
]);

add("p3-cities", "Part 3", "Cities and housing", "Urban life, the countryside and where people live.", [
  "Why do people move to big cities? | Mostly for work, since that's where the best-paid jobs are found.",
  "What problems are caused by overcrowding? | Housing becomes unaffordable, and public services are put under strain.",
  "Is life better in the countryside? | It's quieter and healthier, but there are fewer opportunities for young people.",
  "How will cities change in the future? | I expect buildings will get taller and more people will live alone.",
  "Should old buildings be preserved? | Yes, because they give a city its character and connect us to the past.",
  "Why are house prices so high? | Demand is far greater than supply, particularly in capital cities.",
  "What makes a city a good place to live? | Clean air, safe streets and reliable transport matter more than anything.",
  "Do people know their neighbours less than before? | I think so. We're all so busy that we hardly have time to talk."
]);

add("p3-health", "Part 3", "Health and lifestyle", "Discussing diet, exercise and public health.", [
  "Why are people less active than in the past? | So much of modern life, from work to entertainment, is done sitting down.",
  "Should governments tax unhealthy food? | It might discourage some people, although education would be more effective.",
  "How can schools encourage healthy habits? | They could offer better meals and give pupils more time for sport.",
  "Is stress a bigger problem nowadays? | It appears to be, perhaps because we are expected to be available all the time.",
  "Do people rely too much on medicine? | Sometimes. A good night's sleep can do more than a tablet.",
  "Why is fast food so popular? | It's cheap, it's quick, and it's advertised absolutely everywhere.",
  "Who should pay for healthcare? | Ideally it should be funded by taxes, so that nobody is left without treatment.",
  "Will people live longer in the future? | Probably, but living longer is not the same as living well."
]);

add("p3-media", "Part 3", "Media and advertising", "News, influence and what we choose to believe.", [
  "Where do most people get their news? | These days it's mainly from their phones rather than from newspapers.",
  "Can we trust what we read online? | Not always, so it's worth comparing several different sources.",
  "How does advertising influence people? | It persuades us that we need things we had never even thought about.",
  "Should advertising aimed at children be controlled? | Absolutely, because children can't tell the difference between facts and selling.",
  "Are famous people good role models? | A few are, but many are admired for their wealth rather than their character.",
  "Why do people enjoy reading about celebrities? | I suppose it's a form of escape from their own everyday worries.",
  "Will printed newspapers disappear? | They're certainly declining, although some readers will always prefer paper.",
  "Is there too much bad news in the media? | There is, since dramatic stories attract far more attention than good ones."
]);

add("p3-society", "Part 3", "Family and society", "Generations, values and how communities change.", [
  "How have families changed in recent years? | They've become smaller, and grandparents often live far away.",
  "Who should look after elderly people? | Families should do what they can, with proper support from the state.",
  "Are young people today more independent? | In some respects, yet many live with their parents for longer.",
  "What can the old learn from the young? | They can learn to be more open to new ideas and new technology.",
  "Is it harder to raise children nowadays? | Parents face more pressure, especially when both of them work full time.",
  "Why is volunteering important? | It brings people together and helps those who have been left behind.",
  "Do people help each other less than before? | In large cities, perhaps, but in emergencies people are remarkably generous.",
  "How can communities become closer? | Shared spaces, like parks and libraries, give people a reason to meet."
]);

add("p3-culture", "Part 3", "Culture and tourism", "Traditions, travel and their effects.", [
  "Why is it important to keep traditions alive? | They remind us where we come from and give us a sense of belonging.",
  "Does tourism benefit local people? | It creates jobs, but it can also push prices up for residents.",
  "How can tourists show respect for local culture? | By learning a few words of the language and following local customs.",
  "Are traditional festivals losing their meaning? | To some extent. They've become more about shopping than about family.",
  "Should museums be free? | I think so, as culture should be open to everybody, not just the wealthy.",
  "Why do people like visiting historical places? | Standing where history happened makes the past feel real.",
  "Is international travel good for the world? | It builds understanding between nations, despite the damage to the environment.",
  "Will everyone speak the same language one day? | I hope not, because every language carries a unique way of seeing the world."
]);

add("p3-compare", "Part 3", "Comparing past and present", "Language for change over time.", [
  "Life is considerably faster than it was a generation ago.",
  "In the past, people tended to stay in one job for their whole career.",
  "Nowadays, by contrast, it's common to change direction several times.",
  "Children used to play outside far more than they do today.",
  "Shopping has become much more convenient since the arrival of the internet.",
  "People are living longer than ever before, thanks to modern medicine.",
  "There used to be a stronger sense of community in most neighbourhoods.",
  "Compared with my parents' generation, we have many more choices but less free time."
]);

add("p3-speculate", "Part 3", "Speculating about the future", "Language for predictions and possibility.", [
  "It's quite likely that most cars will be electric within twenty years.",
  "I wouldn't be surprised if people worked only four days a week.",
  "There's a good chance that cash will disappear altogether.",
  "I doubt whether traditional shops will survive much longer.",
  "It's hard to predict, but I imagine cities will become greener.",
  "Unless something changes, the problem is bound to get worse.",
  "In all probability, children will learn mainly through screens.",
  "Who knows? We might even be taking holidays in space."
]);

add("p3-balance", "Part 3", "Agreeing, disagreeing and balancing", "Polite ways to weigh up two sides.", [
  "I completely agree, and I'd go even further than that.",
  "I see your point, but I'm not sure I'd go that far.",
  "That may be true in some cases; however, it isn't always so.",
  "There are strong arguments on both sides of this question.",
  "While I understand that view, I look at it rather differently.",
  "To a certain extent, yes, but it depends on the circumstances.",
  "I'm afraid I have to disagree, because the evidence points the other way.",
  "On balance, I think the benefits are greater than the costs."
]);

/* ===================== CORE SKILLS ===================== */

add("cs-stress", "Core skills", "Word stress", "Long words where the stress is easy to misplace.", [
  "Photography is an interesting and relaxing hobby.",
  "The economy has developed rapidly in recent years.",
  "She is responsible for the advertising department.",
  "It's necessary to communicate clearly and politely.",
  "The environment is a controversial political issue.",
  "He has a good vocabulary and excellent pronunciation.",
  "Education gives people the opportunity to be independent.",
  "I'd like to record a record of everything we produce."
]);

add("cs-linking", "Core skills", "Connected speech", "Linking words together so your English flows.", [
  "I'm going to pick it up on my way home.",
  "Could you tell me what time it opens?",
  "We ended up eating out after all.",
  "First of all, I'd like to thank all of you.",
  "It's not as easy as it looks, is it?",
  "I've got a lot of work to get on with.",
  "Would you mind turning it off for a minute?",
  "As soon as I got in, I put the kettle on."
]);

add("cs-questions", "Core skills", "Questions and intonation", "Rising and falling tones in questions and replies.", [
  "Could you say that again, please?",
  "Do you mean in general, or in my own country?",
  "It was a wonderful day, wasn't it?",
  "You've been there before, haven't you?",
  "Would you like me to give an example?",
  "Really? I had no idea it was so expensive.",
  "Is that what most people think, or is it just me?",
  "How long does it take to get there by train?"
]);

add("cs-numbers", "Core skills", "Numbers, dates and figures", "Saying years, prices, fractions and percentages clearly.", [
  "I was born in 1998 and started school in 2004.",
  "The population of my city is about 3 million.",
  "Around 60 percent of students live at home.",
  "The ticket costs 15 dollars and 50 cents.",
  "The flight leaves at 6:45 in the morning.",
  "Prices have gone up by a third since 2020.",
  "My flat is on the 12th floor of a 30 storey building.",
  "It takes 2 and a half hours to drive 180 kilometres."
]);

add("cs-conditionals", "Core skills", "Conditionals and wishes", "Showing a wider range of grammar when you speak.", [
  "If I have time this weekend, I'll visit my grandparents.",
  "If I won a lot of money, I would travel around the world.",
  "If I had studied harder, I would have passed the exam.",
  "I wish I could speak more languages.",
  "If only I had started learning English earlier.",
  "Unless it rains, we'll have lunch in the garden.",
  "I would have called you if I had known you were in town.",
  "Had I known how difficult it was, I might not have tried."
]);

add("cs-natural", "Core skills", "Natural expressions", "Everyday phrases that make you sound less like a textbook.", [
  "I'm not really into football, to tell you the truth.",
  "It's not my cup of tea, but I can see why people like it.",
  "I was over the moon when I heard the news.",
  "It cost an arm and a leg, but it was worth every penny.",
  "I see my old classmates once in a blue moon.",
  "At the end of the day, it's a matter of personal taste.",
  "That subject has always been close to my heart.",
  "I'm snowed under with work at the moment."
]);

add("cs-paraphrase", "Core skills", "Paraphrasing and explaining", "What to say when you can't find the exact word.", [
  "I can't remember the word, but it's a kind of small boat.",
  "It's the thing you use to open a bottle.",
  "What I'm trying to say is that money isn't everything.",
  "In other words, it wasn't as simple as it sounded.",
  "It's similar to a guitar, only smaller and with four strings.",
  "How can I put it? He's careful with money.",
  "It's the opposite of what most people expect.",
  "Let me give you an example to make that clearer."
]);

add("cs-pairs", "Core skills", "Vowel and consonant pairs", "Sounds that are easily confused.", [
  "The ship carried sheep across the sea.",
  "Please fill the glass and feel how cold it is.",
  "He left his cap in the cab.",
  "I bought a thick book and sold a thin one.",
  "The vet was wet after walking through the valley.",
  "They chose the cheap shoes in the shop.",
  "The collector gave the correct change to the right lady.",
  "The bird heard a word and turned towards the world."
]);
})();
