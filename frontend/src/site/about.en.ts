import type { FounderBlock, Program } from "./about";

/** English of about.ts, same shape and order. Translated by Claude: the team should review it, and the rabbi the HALACHOT. */
export const FOUNDER_LEAD = "My personal commitment to avoid lashon hara and gossip about others is something I absorbed from my father, Rabbi Refael Halperin, of blessed memory. He raised us at home not to talk about others without a real need, and at the Shabbat table he would tap on his glass and add the Hebrew letters lamed-heh, the initials of \"lashon hara\", whenever someone began talking about other people with no real added value.";

export const FOUNDER_WHY = "In essence, I wanted to bring part of my father's education, and the responsibility he instilled in us, to as many people in the world as possible.";

export const FOUNDER: FounderBlock[] = [
  "From a young age, my father, of blessed memory, taught us not to talk about others, neither good nor bad, unless the words carry added value or a lesson worth having in life.",
  { kind: "headed", head: "The campaign \"Lashon hara doesn't speak to me!\"", text: "was born after I witnessed, up close, an unfortunate incident in which two people close to me fought and cut off contact because of something said about one of them, which in the end turned out to be exaggerated and out of all proportion. When I saw the rift and the pain caused by distorted words that had spun out of control, I felt I could not stand by, and I thought of a slogan that would remind people, and lead them not to speak lashon hara." },
  { kind: "choice", intro: "I hesitated for a long time over which sentence was right:", chosen: ["\"Lashon hara ", "doesn't speak", " to me\""], or: "or", rejected: ["\"Lashon hara, ", "don't speak", " to me\""], outro: "I understood that there is a very big difference between the two, and I decided the right path was personal commitment and taking responsibility, not preaching and demanding that others change their norms." },
  FOUNDER_WHY,
  "Today, especially with so many channels of communication and such vast exposure, guarding our tongue is becoming more significant and more fateful. It is no accident that it is said, \"Death and life are in the power of the tongue.\"",
  { kind: "questions", intro: "I am often asked:", items: ["What actually is lashon hara?", "What is gossip?", "How do I know whether what I'm saying is permitted or forbidden?", "And if it's clear to me that the story really happened, aren't I obliged to pass it on?"], outro: "Sadly, there is a great lack of knowledge on this subject, and that gap is what we want to address." },
  "We want to spread the message as widely as possible and deepen people's knowledge, because in the end I believe that most lashon hara is spread out of habit and lack of knowledge, not necessarily out of bad intent.",
  "This is something in our culture, and if we are wise enough to deal with it today, especially if we start at a young age, we will all gain a cleaner and more loving society, deeper friendships, and people who live here growing closer.",
  "Teenagers today have to cope with personal attacks, boycotts, humiliation and insults hurled at them, among other places and especially on social networks, in front of a great many people.\nIf we deal with the problem, both the virtual and the physical space will become safer, and in the end this will also save lives, because we all know today that words can kill. Literally.",
  "Anyone who wants their children not to speak lashon hara, and of course not to be hurt by lashon hara and gossip, must avoid it themselves, because everything starts with a personal example.",
  { kind: "poster", intro: "There is a very precise saying we should keep before our eyes:", line: ["Whoever speaks lashon hara ", "to you", ",\nwill speak lashon hara ", "about you", "!"], outro: "And the explanation is simple: the tongue has no bone. Whoever speaks lashon hara to you does not choose who to talk about, only who to talk to." },
  "Beyond its harmful effects, lashon hara is also a Torah prohibition: \"You shall not go about as a talebearer among your people\" (Leviticus 19:16). For this very reason it forbade us to speak lashon hara, as written in Psalms: \"Who is the man who desires life, who loves days to see good? Guard your tongue from evil and your lips from speaking deceit\" (Psalms 34:13), because whoever guards their tongue will themselves be far better off.",
  "The Chafetz Chaim taught us that if a person can lead another to speak even one word less of lashon hara, it is a great merit beyond measure.",
  "This teaching, together with the spiritual will of my late father, in which among other things he instructed our family to continue guarding our tongues, guides me in my work, and I see spreading the message as a mission and a personal calling for life.",
];

export const MISSION = [
  "\"Lashon Hara Doesn't Speak to Me\" is a nonprofit working to strengthen a positive culture of discourse in Israel and to promote the values of tolerance and mutual respect by raising awareness of the harm caused by lashon hara and shaming.",
  "The initiative was founded in 2007 by businessman David Halperin. It spread the message through giant billboards across the country, regular distribution of millions of stickers and bracelets to students in educational institutions, visits and product handouts at hospitals and army bases, and art exhibitions.\nWithin a short time the message became a common expression on many people's lips, crossing sectors and cultures.\nThe purpose of the campaign is a daily reminder of the damage caused by lashon hara, raising awareness of the power of words, and a statement of values by those who wear the message about their commitment to eradicating the phenomenon, because cultural change begins with each of us. The work is done by enlisting many partners and ambassadors, with the aim of creating an activist movement. The initiative has been a great success, has won broad public support across the country and at all ages, and the bracelets have become a sought-after fashion item.",
  "In recent years we have witnessed an escalation in accepted discourse. The phrase \"word of mouth\" takes on new meaning given the wide exposure of digital networks. Discourse turns hurtful quite easily and can lead to devastating results, when children who experience shaming and boycotts harm themselves, political debates take on a violent dimension, and there is a general decline in accepting others and different opinions.",
  "So, after 14 years of \"guerrilla\" activity born of doing, it was decided to formalize the work as a nonprofit, in order to expand it systematically and increase its influence on educating the next generation.",
  "The nonprofit's work comes from the belief that real cultural change will happen through education and personal example.\nThe nonprofit focuses on education and runs professional programs tailored to children and teenagers in kindergartens, schools, high schools and youth movements across the country. Graduates of our programs, along with many other volunteers, become part of a community of \"ambassadors\" committed to guarding the tongue, tolerance and respect for others, who act on the ground and on social networks to improve discourse. Alongside this, the nonprofit works, among other things, online, on social networks and in public media to reach as wide an audience as possible. The nonprofit partners with leading opinion shapers who have become its ambassadors, are also committed to the cause, and want to set a personal example.",
  "The nonprofit's work spans the world. To date the slogan has been translated into 19 languages, with more to come. The nonprofit is very active in English, including a website and distribution in the USA, as well as Instagram pages and distribution in other languages around the world.",
  "In 2020 the Lashon Hara Doesn't Speak to Me initiative won the prestigious Jerusalem Prize.",
];

export const MISSION_CALL = "Join us: together we can make a difference.";

export const DEFINITION = "Negative or hurtful speech about another person.";

export const WHAT_TEST = { intro: "If you're not sure what counts and what doesn't, there's a simple everyday test:", lines: ["If you wouldn't say it to the person's face,", "you'd better not say it behind their back."], after: "This definition includes slander, mockery, gossip (even a story that really happened), generalizing, shaming, incitement and public humiliation." };

export const WHAT_IS = [
  "The prohibition on spreading lashon hara and gossip appears in Jewish sources and has accompanied Jewish culture throughout history.\nThe book of Leviticus (19:16) says, \"You shall not go about as a talebearer among your people\", and Psalms (34:13) says, \"Who is the man who desires life, who loves days to see good? Guard your tongue from evil and your lips from speaking deceit.\" The laws of lashon hara were discussed at length by the Sages, Maimonides and others. Most famous in this regard was Rabbi Yisrael Meir HaCohen of Radin, who wrote the book \"Chafetz Chaim\", devoted entirely to the laws of lashon hara and their consequences. Jewish law forbids any bad speech about an individual or a group that publicizes their bad deeds, or that could harm or insult them. Likewise, gossip and talking behind someone's back are forbidden, whether the things said are bad or good.",
  "In essence, lashon hara is any talk about another person that has no significant added value and contributes nothing to learning about life.",
  "The damage of spreading lashon hara is hard to measure, which shows how serious it is. From the moment someone says something about another person, they have no control over what will spread about that person, how far it will reach, or what the consequences will be. In recent years especially we have witnessed some of the severe damage of lashon hara, including lost jobs, ruined reputations, financial harm and even the taking of lives. This is another reason to avoid talking about others without need, because we don't know what harm it may cause.",
  "The culture of speech reflects the society we live in, and in itself defines us as a human society. The wiser we are in \"cleaning\" it and using respectful, relevant discourse, the more tolerant and safe our society will be. We believe this goal can be reached through awareness of how we speak and what we say, how we hold discussions and bridge disputes, through educating the younger generation, reinforcing positive behavior as a role model, and spreading messages of unconditional love.",
];

export const ACTIONS_INTRO = "Social change starts with us, with me. Each of us controls first of all what we ourselves say and do, so personal responsibility for changing the discourse is the source of ending the spread of lashon hara.";

export const ACTIONS: Array<{ head: string; body: string; say?: string; reply?: string }> = [
  { head: "Know some \"juicy\" gossip about someone? Stopping it is in your hands.", body: "Let's hold back from passing it on. We wouldn't want people telling such things about us." },
  { head: "Want to hold a discussion, offer criticism, express your opinion? Stick to the issue,", body: "respectfully. Keep the debate civil and give the other person room to speak. You don't have to agree with everyone and every idea, but it's worth listening: they may know at least one thing you hadn't thought of." },
  { head: "In a conversation where lashon hara begins?", body: "You can choose not to have lashon hara spoken around you, just as people ask others not to smoke or shout near them." },
  { head: "Read a hurtful comment online?", say: "Reply:", reply: "\"There's a nicer way to write that. Lashon hara doesn't speak to me.\"", body: "If a message isn't given a stage, it becomes pointless. We encourage boosting positive comments and expressing opinions in a civil way, and bringing down those who hurt us by ignoring them or with a sharp message. You can block and delete hurtful commenters if they are \"friends\" on social networks." },
  { head: "Asking for help:", body: "If lashon hara was spread about you, in writing or by word of mouth, it's worth going to the source or the platform where it was published and asking for a correction or removal." },
  { head: "When minors are involved:", body: "It's important to tell a supportive adult or family member who can help deal with it." },
];

/** Written from the Hebrew sources cited on each card. Needs the team's rabbi to approve it before going live. */
export const HALACHOT = [
  { title: "Even if it's true", text: "It is forbidden to speak badly of a person even when the story is completely true. And if a lie is added to it, that is already slander, which is far more serious.", source: "Chafetz Chaim, Lashon Hara 1:1" },
  { title: "In writing and by hint too", text: "The prohibition applies to speech and to writing, and also when things are said by hint rather than outright.", source: "Chafetz Chaim, Lashon Hara 1:8" },
  { title: "Even as a joke", text: "Someone who tells it in jest and lightheartedly, with no hatred at all, is still included in the prohibition.", source: "Maimonides, Laws of Character Traits 7:4" },
  { title: "Listening is forbidden too", text: "Hearing lashon hara is forbidden even without intending to believe it, because you are lending an ear. Unless the information truly concerns you going forward.", source: "Chafetz Chaim, Lashon Hara 6:2" },
  { title: "What you were told stays with you", text: "Someone whose friend told them something should not pass it on without permission, even when it contains no lashon hara.", source: "Chafetz Chaim, Lashon Hara 9:6" },
  { title: "When you may tell", text: "To help someone who was hurt, it is sometimes permitted to tell, but only under seven exact conditions. Among them: seeing it yourself, checking carefully that it really is harm, and first rebuking the person gently.", source: "Chafetz Chaim, Lashon Hara 10:1-2" },
  { title: "Even without a name", text: "Even if no name was mentioned, if the story makes it clear who it is about, it is lashon hara.", source: "Chafetz Chaim, Lashon Hara 3:4" },
  { title: "Even to the person's face", text: "The prohibition applies even when the things are said to the person's face, not only behind their back.", source: "Chafetz Chaim, Lashon Hara 3:1" },
  { title: "Even when you blame yourself too", text: "Someone who criticizes themselves on the same matter together with their friend is still within the prohibition.", source: "Chafetz Chaim, Lashon Hara 1:9" },
  { title: "Don't believe it", text: "Whoever accepts and believes lashon hara transgresses the commandment \"You shall not bear a false report.\"", source: "Chafetz Chaim, Lashon Hara 6:1" },
  { title: "When there's no way out", text: "Someone caught in such a conversation who cannot leave should show no sign of agreement. And if they can show an angry face so others understand they don't agree, even better.", source: "Chafetz Chaim, Lashon Hara 6:5" },
  { title: "If you can leave, leave", text: "It is forbidden to sit with people who habitually speak lashon hara and listen to them. And if they start and you can get up and leave, you leave.", source: "Chafetz Chaim, Lashon Hara 6:6; 9:4" },
  { title: "Even if said to their face", text: "Even if the teller said it in front of the person in question, that does not permit believing it, as long as we haven't heard an admission from that person.", source: "Chafetz Chaim, Lashon Hara 7:2" },
  { title: "Within the family too", text: "The prohibition applies to a man's own wife and her family as well, and many stumble in this.", source: "Chafetz Chaim, Lashon Hara 8:2" },
  { title: "Don't belittle what's lacking", text: "It is forbidden to shame a person for what they lack, in wisdom, strength or wealth.", source: "Chafetz Chaim, Lashon Hara 5:2" },
  { title: "Even praise needs measure", text: "Someone who overdoes praising a person may end up criticizing them: \"except for this one bad trait of theirs.\" And in front of many it is forbidden in any case, because envious people are found there.", source: "Chafetz Chaim, Lashon Hara 9:1-2" },
  { title: "Teach from a young age", text: "The breach comes from everyone being used from their youth to saying whatever they want. A parent who warns their children and accustoms them from a young age helps them guard themselves.", source: "Chafetz Chaim, Lashon Hara 9:5" },
  { title: "Even when it costs you", text: "The prohibition stands even when keeping it may cost you your livelihood. And the Sages said in the Midrash: for every moment a person seals their mouth, they merit the hidden light.", source: "Chafetz Chaim, Lashon Hara 1:6-7" },
];

export const PROGRAMS: Program[] = [
  {
    title: "Heroes of Light in Schools",
    lead: "An Israeli hero: a story of courage,\ninspiration and choosing good",
    body: ["A moving, inspiring talk by an IDF hero, a soldier severely wounded during his service who chose not to give in to his injury, rebuilt his life and turned his personal story into a mission of giving and meaning.\nToday, as an ambassador of Lashon Hara Doesn't Speak to Me, he visits schools and educational institutions, shares his story of heroism and delivers a powerful message about willpower, coping with crises, choosing life and, above all, the power each of us has to choose good words, mutual respect and unity."],
    notes: ["Suited to students and teenagers,\ngiven to grade 7 and up", "After the talk, about 45 minutes long,\nthe famous silicone bracelets are handed out to all students"],
  },
  {
    title: "A talk by David Halperin\nFounder of Lashon Hara Doesn't Speak to Me",
    lead: "",
    body: [
      "How did a slogan that started as one sticker in 2007 become common property, an expression known in almost every home in Israel, and a social movement touching hundreds of thousands of people in Israel and around the world?\nIn a personal, fascinating and inspiring talk, David Halperin shares the story behind founding the nonprofit and the journey of turning a simple message into a worldview: the power of words to shape reality, influence people and change lives.",
      "Through stories, real-life examples and insights that touch us all, we'll discuss lashon hara, gossip, boycotts and shaming, and discover how easy it is to hurt someone with a single word, and how great the power of a good word can be.",
      "But this isn't only a talk about what not to say.\nIt's an invitation to change how we look at the world and the people around us:\nto learn to see the good in others, to choose encouragement over criticism, to strengthen rather than weaken, to connect rather than divide.\nBecause real social change doesn't start with big slogans. It starts with a small decision by each of us, from today, to choose different words.",
    ],
    notes: ["This talk is approved under the Gefen program,\nprogram number 69557"],
  },
];

export const SHOP_INTRO = "Welcome to the official store of\n\"Lashon Hara Doesn't Speak to Me\"\nSales on the site allow us to keep handing out products for free to schools and educational institutions.";

export const SHIPPING_NOTE = "On orders over ₪100,\nfree shipping to pickup points across Israel";
