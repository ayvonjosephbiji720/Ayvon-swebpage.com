export interface PrayerContentEntry {
  topic: string;
  reference: string;
  english: string;
  malayalam: string;
  explanation: string;
  reflection: string;
}

/**
 * A rotating pool of daily prayer content. Index is chosen deterministically
 * from the day of the year, so the same entry shows all day and repeats
 * every ~2 weeks. Malayalam renderings are best-effort common translations —
 * cross-check against your preferred Bible translation (e.g. the POC
 * Malayalam Bible) if precise wording matters to you. Feel free to edit or
 * extend this list with your own verses.
 */
export const PRAYER_CONTENT: PrayerContentEntry[] = [
  {
    topic: "Trusting God with Your Job Search",
    reference: "Proverbs 3:5-6",
    english:
      "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
    malayalam:
      "നിന്റെ പൂർണ്ണഹൃദയത്തോടെ യഹോവയിൽ ആശ്രയിക്കുക; സ്വന്ത ബുദ്ധിയിൽ ഊന്നരുതു. നിന്റെ എല്ലാ വഴികളിലും അവനെ അംഗീകരിക്ക; അവൻ നിന്റെ പാതകളെ നേരെയാക്കും.",
    explanation:
      "When the job search feels uncertain, this verse is a reminder that we don't have to have every answer figured out ourselves — we can lean on God's guidance instead of only our own plans.",
    reflection: "Where am I leaning on my own understanding instead of trusting God's timing today?",
  },
  {
    topic: "Strength for Interviews",
    reference: "Philippians 4:13",
    english: "I can do all things through him who strengthens me.",
    malayalam: "എന്നെ ശക്തിപ്പെടുത്തുന്നവനിലൂടെ എനിക്കു സകലവും ചെയ്‍വാൻ കഴിയും.",
    explanation:
      "Before a tough interview or assessment, this verse reframes confidence: it isn't about being perfect, it's about drawing strength from God in the moment.",
    reflection: "What upcoming challenge do I need to hand over instead of carrying alone?",
  },
  {
    topic: "Peace Over Anxiety",
    reference: "Philippians 4:6-7",
    english:
      "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds.",
    malayalam:
      "ഒന്നിനെക്കുറിച്ചും ഉത്കണ്ഠപ്പെടരുതു; എല്ലാറ്റിലും പ്രാർത്ഥനയാലും അപേക്ഷയാലും സ്തോത്രത്തോടുകൂടെ നിങ്ങളുടെ ആവശ്യങ്ങൾ ദൈവത്തെ അറിയിക്കട്ടെ. അപ്പോൾ സകലബുദ്ധിയേയും കവിയുന്ന ദൈവസമാധാനം നിങ്ങളുടെ ഹൃദയങ്ങളെയും ചിന്തകളെയും കാക്കും.",
    explanation:
      "Job hunting brings real anxiety — rejection emails, waiting for callbacks, financial pressure. This passage offers a practical exchange: bring the worry to God in prayer, and receive peace in return.",
    reflection: "What specific worry can I turn into a prayer right now instead of carrying it silently?",
  },
  {
    topic: "God's Plans for You",
    reference: "Jeremiah 29:11",
    english:
      "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
    malayalam:
      "നിങ്ങൾക്കുവേണ്ടി ഞാൻ നിരൂപിക്കുന്ന നിരൂപണങ്ങൾ എനിക്കറിയാം എന്നു യഹോവയുടെ അരുളപ്പാടു; അനർത്ഥത്തിന്നല്ല സമാധാനത്തിന്നായുള്ള നിരൂപണങ്ങളത്രേ; ആശാഭരിതമായോരു അന്ത്യം നിങ്ങൾക്കു നല്കുവാൻ തന്നേ.",
    explanation:
      "Rejections can make it feel like there's no plan at all. This verse reminds us that a season of closed doors doesn't mean there isn't a good purpose still unfolding.",
    reflection: "Can I trust that this season — even the hard parts — is part of a bigger plan?",
  },
  {
    topic: "Courage in Uncertainty",
    reference: "Joshua 1:9",
    english:
      "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.",
    malayalam:
      "ഞാൻ നിന്നോടു കല്പിച്ചതല്ലയോ? ബലവാനും ധൈര്യവാനുമായിരിക്ക; ഭയപ്പെടരുതു, ഭ്രമിക്കയും അരുതു; നീ എവിടെ പോയാലും നിന്റെ ദൈവമായ യഹോവ നിന്നോടുകൂടെ ഉണ്ടു.",
    explanation:
      "Starting something new — a new application, a new interview, a new season — takes courage. This is a call to move forward without fear because you're not doing it alone.",
    reflection: "What next step have I been putting off out of fear?",
  },
  {
    topic: "Refuge in Stress",
    reference: "Psalm 46:1",
    english: "God is our refuge and strength, a very present help in trouble.",
    malayalam: "ദൈവം നമ്മുടെ സങ്കേതവും ബലവും ആകുന്നു; കഷ്ടകാലത്തു ഏറ്റവും അടുത്ത തുണയും തന്നേ.",
    explanation:
      "On stressful days — deadlines, back-to-back interviews, a hard rejection — this verse offers a place to land: God is near in the trouble, not just after it passes.",
    reflection: "What would it look like to bring today's stress to God instead of just pushing through it?",
  },
  {
    topic: "God Works All Things for Good",
    reference: "Romans 8:28",
    english:
      "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    malayalam:
      "ദൈവത്തെ സ്നേഹിക്കുന്നവർക്കു, നിർണ്ണയപ്രകാരം വിളിക്കപ്പെട്ടവർക്കു തന്നേ, സകലവും നന്മെക്കായി കൂടിവ്യാപരിക്കുന്നു എന്നു നാം അറിയുന്നു.",
    explanation:
      "Even a rejection or a delay can eventually make sense in a bigger story. This verse doesn't promise every day feels good — it promises purpose underneath it.",
    reflection: "Looking back, is there a past 'no' that turned out to open a better door?",
  },
  {
    topic: "Seeking God First",
    reference: "Matthew 6:33",
    english:
      "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
    malayalam:
      "ദൈവരാജ്യവും അവന്റെ നീതിയും മുമ്പെ അന്വേഷിപ്പിൻ; അപ്പോൾ ഇവയൊക്കെയും കൂടെ നിങ്ങൾക്കു കിട്ടും.",
    explanation:
      "It's easy to let a job search become the center of everything. This verse invites a reordering: keep God first, and trust that the practical needs are still seen and provided for.",
    reflection: "What would change today if I put prayer before productivity?",
  },
  {
    topic: "Light in the Waiting",
    reference: "Psalm 27:1",
    english: "The LORD is my light and my salvation; whom shall I fear? The LORD is the stronghold of my life; of whom shall I be afraid?",
    malayalam:
      "യഹോവ എന്റെ പ്രകാശവും എന്റെ രക്ഷയും ആകുന്നു; ഞാൻ ആരെ ഭയപ്പെടും? യഹോവ എന്റെ ജീവന്റെ ബലം ആകുന്നു; ഞാൻ ആരെക്കുറിച്ചു പേടിക്കും?",
    explanation:
      "Waiting to hear back from a recruiter can feel like sitting in the dark. This verse points to a steady light that doesn't depend on the next email.",
    reflection: "What am I still waiting to hear back on, and can I release the outcome today?",
  },
  {
    topic: "A Spirit of Power, Not Fear",
    reference: "2 Timothy 1:7",
    english:
      "For God gave us a spirit not of fear but of power and love and self-control.",
    malayalam:
      "ഭീരുത്വത്തിന്റെ ആത്മാവിനെ അല്ല, ശക്തിയുടെയും സ്നേഹത്തിന്റെയും സുബോധത്തിന്റെയും ആത്മാവിനെ അത്രേ ദൈവം നമുക്കു തന്നിരിക്കുന്നതു.",
    explanation:
      "Interview nerves and self-doubt are real, but this verse reframes what God has actually given you: not timidity, but power, love, and a clear mind.",
    reflection: "Where do I need to swap out fear for the confidence God has already given me?",
  },
  {
    topic: "The Good Shepherd's Care",
    reference: "Psalm 23:1",
    english: "The LORD is my shepherd; I shall not want.",
    malayalam: "യഹോവ എന്റെ ഇടയൻ; എനിക്കു മുട്ടു വരികയില്ല.",
    explanation:
      "In seasons of financial uncertainty while job hunting, this simple verse is a reminder that provision comes from being cared for, not just from a paycheck.",
    reflection: "What need am I anxious about providing for myself that I could instead entrust to God?",
  },
  {
    topic: "Delight and Desires",
    reference: "Psalm 37:4",
    english: "Delight yourself in the LORD, and he will give you the desires of your heart.",
    malayalam: "യഹോവയിൽ ആനന്ദിക്ക; അവൻ നിന്റെ ഹൃദയത്തിന്റെ ആഗ്രഹങ്ങളെ നിനക്കു തരും.",
    explanation:
      "This isn't a formula for getting the exact job you want — it's a promise that as you draw close to God, your desires themselves are shaped and met in ways that satisfy.",
    reflection: "Am I pursuing this career path out of delight in God, or out of pressure and comparison?",
  },
  {
    topic: "Not Alone in Fear",
    reference: "Isaiah 41:10",
    english:
      "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
    malayalam:
      "ഭയപ്പെടേണ്ടാ, ഞാൻ നിന്നോടുകൂടെ ഉണ്ടു; ഭ്രമിക്കേണ്ടാ, ഞാൻ നിന്റെ ദൈവം ആകുന്നു; ഞാൻ നിന്നെ ശക്തീകരിക്കും, ഞാൻ നിന്നെ സഹായിക്കും, എന്റെ നീതിയുള്ള വലങ്കൈകൊണ്ടു ഞാൻ നിന്നെ താങ്ങും.",
    explanation:
      "On a day when the inbox is full of rejections, this is a direct promise: you are held, helped, and strengthened — not left to manage everything on your own strength.",
    reflection: "What would it look like to actively lean on God's help today instead of white-knuckling it?",
  },
  {
    topic: "New Mercies Every Morning",
    reference: "Lamentations 3:22-23",
    english:
      "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
    malayalam:
      "യഹോവയുടെ ദയകൾ തീർന്നുപോകാത്തതും അവന്റെ കരുണകൾ ഒടുങ്ങാത്തതും ആകുന്നു; അവ ഓരോ ഉഷസ്സിലും പുതുതായിരിക്കുന്നു; നിന്റെ വിശ്വസ്തത വലിയതു തന്നേ.",
    explanation:
      "Yesterday's setback doesn't have to define today. Every morning is a fresh start, not because the situation changed, but because God's mercy renews daily.",
    reflection: "What would it mean to start today fresh, without carrying yesterday's discouragement into it?",
  },
];

export function getTodaysPrayerContent(date: Date = new Date()): PrayerContentEntry {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return PRAYER_CONTENT[dayOfYear % PRAYER_CONTENT.length];
}
