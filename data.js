// All practice content is original and written for this site.
const SPEAKING = {
  1: [
    ["Home", "Do you live in a house or a flat?"],
    ["Home", "What is your favourite room in your home, and why?"],
    ["Work & study", "Do you work, or are you a student?"],
    ["Work & study", "What do you enjoy most about your work or studies?"],
    ["Hometown", "What is your hometown best known for?"],
    ["Hometown", "Has your hometown changed much since you were a child?"],
    ["Food", "What kind of food do you usually eat at home?"],
    ["Food", "Do you prefer cooking for yourself or eating out?"],
    ["Free time", "What do you usually do at the weekend?"],
    ["Free time", "Is there a hobby you would like to try in the future?"],
    ["Technology", "How often do you use your phone each day?"],
    ["Technology", "Is there an app you could not live without?"],
    ["Weather", "What is your favourite season, and why?"],
    ["Travel", "How do you usually travel to work or school?"],
    ["Music", "What kind of music do you listen to most?"],
    ["Reading", "Did you enjoy reading when you were a child?"]
  ],
  2: [
    ["Describe a teacher who had a strong influence on you.", ["who the teacher was", "what they taught", "what they were like", "and explain why they influenced you so much"]],
    ["Describe a place you visited that you would like to return to.", ["where it is", "when you went there", "what you did there", "and explain why you would like to go back"]],
    ["Describe a skill you would like to learn.", ["what the skill is", "why you want to learn it", "how you would learn it", "and explain how it would be useful to you"]],
    ["Describe a time you helped someone.", ["who you helped", "what the situation was", "how you helped them", "and explain how you felt afterwards"]],
    ["Describe a book or film that made you think.", ["what it was about", "when you read or watched it", "who you would recommend it to", "and explain why it made such an impression on you"]],
    ["Describe an important decision you made.", ["what the decision was", "when you made it", "who you talked to about it", "and explain whether it was the right choice"]]
  ],
  3: [
    ["Education", "Do you think teachers will be replaced by technology in the future?"],
    ["Education", "What makes someone a good teacher, in your opinion?"],
    ["Travel", "Why do some people prefer to travel alone rather than in a group?"],
    ["Travel", "How has tourism affected places in your country?"],
    ["Work", "Is it better to have one career for life or to change jobs often?"],
    ["Work", "Should people be able to work from home whenever they want?"],
    ["Society", "Why do you think people today are less likely to know their neighbours?"],
    ["Society", "How can governments encourage people to help others?"],
    ["Media", "Do people read less than they used to? Why?"],
    ["Environment", "Whose responsibility is it to protect the environment: individuals or governments?"],
    ["Technology", "Are children today too dependent on screens?"],
    ["Decisions", "Do young people make decisions differently from older people?"]
  ]
};

// Listening: each line is [speaker, text]. Text is written so text-to-speech reads it naturally.
const LISTENING = [
  {
    title: "Part 1 – Booking a cycling tour",
    kind: "Part 1 · Conversation · Form completion",
    intro: "You will hear a phone call between a tour company and a customer. Complete the booking form. Write ONE WORD AND/OR A NUMBER for each answer.",
    lines: [
      ["A", "Good morning, Riverside Cycle Tours. How can I help?"],
      ["B", "Hi, I'd like to book a guided tour for this weekend, please."],
      ["A", "Of course. Can I take your name?"],
      ["B", "Yes, it's Hannah Pryce. That's P, R, Y, C, E."],
      ["A", "Thank you. And how many people will be in your group?"],
      ["B", "There'll be four of us. No, sorry, five. My cousin has decided to come."],
      ["A", "Five, lovely. We have the coastal route on Saturday, and the forest route on Sunday."],
      ["B", "We'd prefer the forest route, I think."],
      ["A", "Good choice. That one starts at nine thirty in the morning, from the old railway station."],
      ["B", "And how long does it take?"],
      ["A", "About three hours, including a stop at a café."],
      ["B", "Great. How much is it?"],
      ["A", "It's eighteen pounds per person, and that includes helmet hire."],
      ["B", "Perfect. Do we need to bring anything?"],
      ["A", "Just a waterproof jacket. The forecast isn't great. Can I take a contact number?"],
      ["B", "Sure. It's 0, 7, 7, 0, 0. 9, 1, 5. 4, 2, 8."],
      ["A", "Thank you, Hannah. You're all booked. See you on Sunday."]
    ],
    questions: [
      { q: "Customer's surname:", a: ["pryce"] },
      { q: "Number of people:", a: ["5", "five"] },
      { q: "Route chosen: the ______ route", a: ["forest"] },
      { q: "Start time:", a: ["9:30", "9.30", "930", "nine thirty", "half past nine"] },
      { q: "Meeting point: the old ______ station", a: ["railway"] },
      { q: "Tour length: about ______ hours", a: ["3", "three"] },
      { q: "Price per person: £", a: ["18", "eighteen"] },
      { q: "Bring a ______ jacket", a: ["waterproof"] },
      { q: "Last three digits of phone number:", a: ["428"] }
    ]
  },
  {
    title: "Part 2 – Community centre welcome talk",
    kind: "Part 2 · Monologue · Multiple choice",
    intro: "You will hear a manager giving new members information about a community centre. Choose the correct answer for each question.",
    lines: [
      ["A", "Hello everyone, and welcome to Marlow Green Community Centre. My name's Daniel, and I'm the centre manager."],
      ["A", "Let me start with a little history. The building was originally a primary school, and many people assume it then became a library. In fact it stood empty for ten years, before local residents raised the money to reopen it as a community centre."],
      ["A", "We're open seven days a week. On weekdays the doors open at eight in the morning, and at weekends we open an hour later, at nine. We close at ten every evening, except Sunday, when we close at six."],
      ["A", "Our most popular activity used to be the yoga class, but this year the pottery workshop has overtaken it, and there's now a waiting list. The language café on Thursdays is growing quickly too."],
      ["A", "If you'd like to book a room for a private event, please don't phone the front desk, as they can't take bookings. You'll need to use the form on our website, and we'll confirm by email within two days."],
      ["A", "Finally, parking. The car park behind the building is reserved for staff and disabled visitors. Everyone else should use the public car park on Mill Lane, which is free for the first two hours."],
      ["A", "Thanks for listening, and I hope you enjoy being part of the centre."]
    ],
    questions: [
      { q: "Before it became a community centre, the building was most recently", opts: ["a primary school", "a library", "unused"], a: 2 },
      { q: "At weekends the centre opens at", opts: ["8 a.m.", "9 a.m.", "10 a.m."], a: 1 },
      { q: "The most popular activity this year is", opts: ["yoga", "pottery", "the language café"], a: 1 },
      { q: "To book a room, members should", opts: ["call the front desk", "send an email", "fill in an online form"], a: 2 },
      { q: "Most visitors should park", opts: ["behind the building", "on Mill Lane", "on the street outside"], a: 1 },
      { q: "On Sundays the centre closes at", opts: ["6 p.m.", "9 p.m.", "10 p.m."], a: 0 }
    ]
  },
  {
    title: "Part 4 – Lecture on bees in cities",
    kind: "Part 4 · Academic lecture · Sentence completion",
    intro: "You will hear part of a lecture about bees living in cities. Complete the sentences. Write ONE WORD ONLY for each answer.",
    lines: [
      ["A", "Today I want to look at a question that surprises many people: can bees do well in cities?"],
      ["A", "For a long time, researchers assumed that urban areas were poor habitats for bees. However, recent surveys have found that some cities contain a greater variety of bee species than the farmland around them."],
      ["A", "One reason is diversity of plants. Modern farms often grow a single crop, which flowers for only a few weeks. City gardens, in contrast, contain hundreds of plant species, so something is in flower from early spring until late autumn."],
      ["A", "A second reason is chemicals. Pesticides are used far less intensively in towns than on farms, so urban bees are exposed to lower levels."],
      ["A", "Cities are also slightly warmer than the countryside. This extends the season during which bees can search for food, although very high temperatures can be harmful to them."],
      ["A", "It's not all good news, though. Most wild bees don't live in hives. Around seventy percent of species nest in the ground, and in cities, bare soil is hard to find because so much land is covered in concrete."],
      ["A", "There is also a risk in keeping too many honeybee hives on rooftops. Honeybees can compete with wild species for nectar, and they may spread disease."],
      ["A", "So the best thing city residents can do is not to buy a hive, but simply to plant more flowers."]
    ],
    questions: [
      { q: "Some cities have a greater variety of bee species than nearby ______.", a: ["farmland", "farms"] },
      { q: "Modern farms often grow a ______ crop.", a: ["single"] },
      { q: "In city gardens, plants flower from early spring until late ______.", a: ["autumn"] },
      { q: "Urban bees are exposed to lower levels of ______.", a: ["pesticides", "pesticide", "chemicals"] },
      { q: "Most wild bee species nest in the ______.", a: ["ground", "soil"] },
      { q: "In cities, much of the land is covered in ______.", a: ["concrete"] },
      { q: "Rooftop honeybees may spread ______ to wild bees.", a: ["disease", "diseases"] },
      { q: "Residents are advised to plant more ______.", a: ["flowers"] }
    ]
  }
];

// [spoken text, accepted written form]
const DICTATION = [
  "The library closes at half past eight on weekdays.",
  "Please write your surname in capital letters.",
  "The lecture has been moved to room fourteen on the second floor.",
  "Most students found the second experiment more difficult than the first.",
  "You can collect your ticket from the office opposite the station.",
  "The museum is free for children under sixteen.",
  "Applications must be received by the thirtieth of September.",
  "Although the journey was long, the scenery was beautiful.",
  "The government has announced plans to reduce traffic in the city centre.",
  "Researchers measured the temperature every fifteen minutes.",
  "There is a ten percent discount for groups of twelve or more.",
  "Regular exercise improves both memory and concentration."
];
