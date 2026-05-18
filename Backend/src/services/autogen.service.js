import axios from "axios";
import dotenv from "dotenv";
import { Poll, PollOption, Category, GeneratedPoll, User } from "../models/index.js";

dotenv.config();

// ─────────────────────────────────────────────
// UTILITY: Jaccard token similarity (duplicate checker)
// ─────────────────────────────────────────────
const calculateSimilarity = (a, b) => {
  const tokenize = (s) =>
    new Set(s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2));
  const w1 = tokenize(a);
  const w2 = tokenize(b);
  if (!w1.size || !w2.size) return 0;
  const intersection = new Set([...w1].filter((x) => w2.has(x)));
  return intersection.size / new Set([...w1, ...w2]).size;
};

// ─────────────────────────────────────────────
// UTILITY: Pure-JS Google News RSS parser (no deps)
// ─────────────────────────────────────────────
const parseGoogleNewsRSS = (xml) => {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const get = (tag) => {
      const r = m[1].match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return r ? r[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
    };
    const title = get("title");
    if (title) items.push({ title, pubDate: get("pubDate"), description: get("description") });
  }
  return items;
};

// ─────────────────────────────────────────────
// LIVE SOURCE 1 — PandaScore Esports API
// Fetches UPCOMING matches for Indian-popular esports titles
// ─────────────────────────────────────────────
const fetchEsportsEvents = async () => {
  const PANDASCORE_KEY = process.env.PANDASCORE_API_KEY || "n_Yb0vyFG6HJHpkswEA6F8UAdm_7I_waCzZcs0NMomKcpGDwz0g";
  const events = [];

  // Games popular in India — PandaScore slugs
  const games = [
    { slug: "cs2",        label: "CS2" },
    { slug: "valorant",   label: "Valorant" },
    { slug: "dota-2",     label: "Dota 2" },
    { slug: "codmobile",  label: "Call of Duty Mobile" },
  ];

  for (const game of games) {
    try {
      const { data } = await axios.get(
        `https://api.pandascore.co/${game.slug}/matches/upcoming`,
        {
          params: { per_page: 2, sort: "begin_at", page: 1 },
          headers: { Authorization: `Bearer ${PANDASCORE_KEY}` },
          timeout: 8000,
        }
      );

      for (const match of data.slice(0, 2)) {
        const team1 = match.opponents?.[0]?.opponent?.name || "Team A";
        const team2 = match.opponents?.[1]?.opponent?.name || "Team B";
        const tournament = match.league?.name || game.label;
        const rawDate = match.begin_at ? new Date(match.begin_at).toDateString() : "soon";

        events.push({
          category: "Esports",
          source: `PandaScore API — ${game.label}`,
          raw: `Upcoming ${game.label} match: ${team1} vs ${team2} in ${tournament} on ${rawDate}.`,
          team1,
          team2,
          tournament,
          game: game.label,
        });
      }
    } catch (err) {
      console.warn(`⚠️  PandaScore [${game.label}] error: ${err.message}`);
    }
  }

  // BGMI & Free Fire aren't on PandaScore — use dedicated India RSS fallback
  const bgmiFeeds = [
    { url: "https://news.google.com/rss/search?q=BGMI+tournament+India+2025&hl=en-IN&gl=IN&ceid=IN:en", label: "BGMI" },
    { url: "https://news.google.com/rss/search?q=Free+Fire+India+esports+2025&hl=en-IN&gl=IN&ceid=IN:en", label: "Free Fire" },
    { url: "https://news.google.com/rss/search?q=Mobile+Legends+India+esports&hl=en-IN&gl=IN&ceid=IN:en", label: "Mobile Legends" },
    { url: "https://news.google.com/rss/search?q=Clash+Royale+India+esports&hl=en-IN&gl=IN&ceid=IN:en", label: "Clash Royale" },
  ];

  for (const feed of bgmiFeeds) {
    try {
      const { data: xml } = await axios.get(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 8000,
      });
      const items = parseGoogleNewsRSS(xml).slice(0, 2);
      for (const item of items) {
        events.push({
          category: "Esports",
          source: `Google News India RSS — ${feed.label}`,
          raw: `${item.title}. ${item.description || ""}`.substring(0, 400),
          game: feed.label,
        });
      }
    } catch (err) {
      console.warn(`⚠️  RSS [${feed.label}] error: ${err.message}`);
    }
  }

  return events;
};

// ─────────────────────────────────────────────
// LIVE SOURCE 2 — Google News India RSS (Sports/IPL/Cricket)
// ─────────────────────────────────────────────
const fetchSportsEvents = async () => {
  const feeds = [
    { url: "https://news.google.com/rss/search?q=IPL+2025+match+India&hl=en-IN&gl=IN&ceid=IN:en",          label: "IPL 2025" },
    { url: "https://news.google.com/rss/search?q=Team+India+cricket+match+2025&hl=en-IN&gl=IN&ceid=IN:en", label: "Team India Cricket" },
    { url: "https://news.google.com/rss/search?q=Indian+Super+League+ISL+football&hl=en-IN&gl=IN&ceid=IN:en", label: "ISL Football" },
    { url: "https://news.google.com/rss/search?q=Pro+Kabaddi+League+2025+India&hl=en-IN&gl=IN&ceid=IN:en", label: "Pro Kabaddi" },
    { url: "https://news.google.com/rss/search?q=India+BWF+badminton+2025&hl=en-IN&gl=IN&ceid=IN:en",      label: "Badminton India" },
  ];

  const events = [];
  for (const feed of feeds) {
    try {
      const { data: xml } = await axios.get(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 8000,
      });
      const items = parseGoogleNewsRSS(xml).slice(0, 2);
      for (const item of items) {
        events.push({
          category: "Sports",
          source: `Google News India RSS — ${feed.label}`,
          raw: `${item.title}. ${item.description || ""}`.substring(0, 400),
        });
      }
    } catch (err) {
      console.warn(`⚠️  RSS [${feed.label}] error: ${err.message}`);
    }
  }
  return events;
};

// ─────────────────────────────────────────────
// LIVE SOURCE 3 — Technology (India-focused)
// ─────────────────────────────────────────────
const fetchTechEvents = async () => {
  const feeds = [
    { url: "https://news.google.com/rss/search?q=AI+startup+India+funding+2025&hl=en-IN&gl=IN&ceid=IN:en",     label: "AI Startups India" },
    { url: "https://news.google.com/rss/search?q=OpenAI+Google+Apple+India+tech+2025&hl=en-IN&gl=IN&ceid=IN:en", label: "Big Tech India" },
    { url: "https://news.google.com/rss/search?q=India+fintech+unicorn+2025&hl=en-IN&gl=IN&ceid=IN:en",         label: "India Fintech" },
  ];

  const events = [];
  for (const feed of feeds) {
    try {
      const { data: xml } = await axios.get(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 8000,
      });
      const items = parseGoogleNewsRSS(xml).slice(0, 2);
      for (const item of items) {
        events.push({
          category: "Technology",
          source: `Google News India RSS — ${feed.label}`,
          raw: `${item.title}. ${item.description || ""}`.substring(0, 400),
        });
      }
    } catch (err) {
      console.warn(`⚠️  RSS [${feed.label}] error: ${err.message}`);
    }
  }
  return events;
};

// ─────────────────────────────────────────────
// LIVE SOURCE 4 — YouTube India creators
// ─────────────────────────────────────────────
const fetchYouTubeEvents = async () => {
  const feeds = [
    { url: "https://news.google.com/rss/search?q=CarryMinati+OR+Technical+Guruji+OR+Sourav+Joshi+YouTube+India&hl=en-IN&gl=IN&ceid=IN:en", label: "Indian YouTubers" },
    { url: "https://news.google.com/rss/search?q=MrBeast+OR+PewDiePie+YouTube+subscribers+milestone+2025&hl=en-IN&gl=IN&ceid=IN:en",        label: "Global YouTube Milestones" },
  ];

  const events = [];
  for (const feed of feeds) {
    try {
      const { data: xml } = await axios.get(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 8000,
      });
      const items = parseGoogleNewsRSS(xml).slice(0, 2);
      for (const item of items) {
        events.push({
          category: "YouTube",
          source: `Google News India RSS — ${feed.label}`,
          raw: `${item.title}. ${item.description || ""}`.substring(0, 400),
        });
      }
    } catch (err) {
      console.warn(`⚠️  RSS [${feed.label}] error: ${err.message}`);
    }
  }
  return events;
};

// ─────────────────────────────────────────────
// LIVE SOURCE 5 — Politics India
// ─────────────────────────────────────────────
const fetchPoliticsEvents = async () => {
  const feeds = [
    { url: "https://news.google.com/rss/search?q=India+state+election+2025&hl=en-IN&gl=IN&ceid=IN:en",       label: "India Elections" },
    { url: "https://news.google.com/rss/search?q=Indian+parliament+policy+bill+2025&hl=en-IN&gl=IN&ceid=IN:en", label: "India Parliament" },
  ];

  const events = [];
  for (const feed of feeds) {
    try {
      const { data: xml } = await axios.get(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 8000,
      });
      const items = parseGoogleNewsRSS(xml).slice(0, 2);
      for (const item of items) {
        events.push({
          category: "Politics",
          source: `Google News India RSS — ${feed.label}`,
          raw: `${item.title}. ${item.description || ""}`.substring(0, 400),
        });
      }
    } catch (err) {
      console.warn(`⚠️  RSS [${feed.label}] error: ${err.message}`);
    }
  }
  return events;
};

// ─────────────────────────────────────────────
// AI GENERATOR — Groq LLM turns a raw news snippet into a prediction poll
// ─────────────────────────────────────────────
const generatePollWithGroq = async (event, apiKey) => {
  const systemPrompt = `You are an expert prediction market analyst specializing in India. 
Given a raw news snippet, generate a fun, engaging prediction poll in strict JSON.
Rules:
- "extracted_title": a YES/NO style question, max 80 chars, must be India-relevant when possible
- "extracted_description": 1-sentence resolution criteria (when/how it resolves)
- "options": exactly 2 options e.g. ["Yes", "No"] or ["Team A wins", "Team B wins"]
- "confidence": your confidence score 0.0–1.0

Respond ONLY with valid JSON. No markdown, no explanation.`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `News snippet:\n${event.raw}` },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return JSON.parse(response.data.choices[0].message.content);
};

// ─────────────────────────────────────────────
// OFFLINE FALLBACK — keyword-based poll builder (when Groq unavailable)
// ─────────────────────────────────────────────
const buildOfflinePoll = (event) => {
  const t = event.raw.toLowerCase();

  const esports = () => {
    if (event.team1 && event.team2) {
      return {
        extracted_title: `Will ${event.team1} defeat ${event.team2} in ${event.game || "the tournament"}?`,
        extracted_description: `Resolves YES if ${event.team1} wins the official match result in ${event.tournament || event.game}.`,
        options: [`${event.team1} wins`, `${event.team2} wins`],
        confidence: 0.88,
      };
    }
    if (t.includes("bgmi") || t.includes("battlegrounds"))
      return { extracted_title: "Will the top Indian squad win the BGMI grand finals?", extracted_description: "Resolves based on official Krafton BGMI tournament results.", options: ["Yes, they win", "No, they lose"], confidence: 0.87 };
    if (t.includes("free fire") || t.includes("ffws"))
      return { extracted_title: "Will an Indian team qualify in the Free Fire World Series?", extracted_description: "Resolves based on Garena official FFWS standings.", options: ["Yes, qualifies", "No, eliminated"], confidence: 0.86 };
    if (t.includes("valorant") || t.includes("vct"))
      return { extracted_title: "Will a South Asian team make it to VCT Masters?", extracted_description: "Resolves based on Riot Games official VCT tournament results.", options: ["Yes", "No"], confidence: 0.85 };
    if (t.includes("cs2") || t.includes("counter-strike"))
      return { extracted_title: "Will the top seed win in the upcoming CS2 major matchup?", extracted_description: "Resolves based on HLTV official match results.", options: ["Yes, top seed wins", "No, upset occurs"], confidence: 0.84 };
    return { extracted_title: "Will the favourite team win in this esports tournament match?", extracted_description: "Resolves based on official tournament organizer results.", options: ["Yes", "No"], confidence: 0.82 };
  };

  const sports = () => {
    if (t.includes("ipl") || t.includes("rcb") || t.includes("csk") || t.includes("mi"))
      return { extracted_title: "Will the batting team score over 180 runs in this IPL match?", extracted_description: "Resolves based on official BCCI IPL match scorecards on Cricbuzz.", options: ["Yes, over 180", "No, under 180"], confidence: 0.89 };
    if (t.includes("india") && t.includes("cricket"))
      return { extracted_title: "Will Team India win their next international cricket match?", extracted_description: "Resolves based on official ICC match result reports.", options: ["Yes, India wins", "No, India loses"], confidence: 0.88 };
    if (t.includes("kabaddi") || t.includes("pkl"))
      return { extracted_title: "Will the home team win in the upcoming PKL match?", extracted_description: "Resolves based on official Pro Kabaddi League result sheets.", options: ["Yes, home wins", "No, away wins"], confidence: 0.85 };
    if (t.includes("badminton") || t.includes("sindhu") || t.includes("srikanth"))
      return { extracted_title: "Will the Indian shuttler advance to the next round in BWF?", extracted_description: "Resolves based on official BWF tournament draw results.", options: ["Yes, advances", "No, eliminated"], confidence: 0.84 };
    if (t.includes("football") || t.includes("isl"))
      return { extracted_title: "Will the match in ISL end with more than 2 goals scored?", extracted_description: "Resolves based on official ISL match scoreline.", options: ["Yes, over 2 goals", "No, 2 or fewer"], confidence: 0.83 };
    return { extracted_title: "Will the favourite team win in this Indian sports match?", extracted_description: "Resolves based on official sports body results.", options: ["Yes", "No"], confidence: 0.80 };
  };

  const tech = () => {
    if (t.includes("openai") || t.includes("gpt"))
      return { extracted_title: "Will OpenAI announce a new major AI model this quarter?", extracted_description: "Resolves YES if OpenAI officially announces a new major LLM release.", options: ["Yes", "No"], confidence: 0.87 };
    if (t.includes("apple") || t.includes("iphone"))
      return { extracted_title: "Will Apple's next device launch in India exceed ₹1 lakh?", extracted_description: "Resolves based on Apple India Store official pricing announcement.", options: ["Yes, above ₹1L", "No, below ₹1L"], confidence: 0.85 };
    if (t.includes("startup") || t.includes("funding") || t.includes("unicorn"))
      return { extracted_title: "Will an Indian startup achieve unicorn status this month?", extracted_description: "Resolves based on funding announcements on YourStory or Entrackr.", options: ["Yes", "No"], confidence: 0.84 };
    if (t.includes("google") || t.includes("gemini"))
      return { extracted_title: "Will Google release a major Gemini model update this month?", extracted_description: "Resolves based on official Google AI blog or I/O announcements.", options: ["Yes", "No"], confidence: 0.83 };
    return { extracted_title: "Will this Indian tech development ship on schedule?", extracted_description: "Resolves based on official company announcements.", options: ["Yes", "No"], confidence: 0.80 };
  };

  const youtube = () => {
    if (t.includes("carryminati"))
      return { extracted_title: "Will CarryMinati upload a new video with 10M+ views this week?", extracted_description: "Resolves based on YouTube public view counter 7 days after upload.", options: ["Yes", "No"], confidence: 0.86 };
    if (t.includes("technical guruji") || t.includes("guruji"))
      return { extracted_title: "Will Technical Guruji hit his next subscriber milestone this month?", extracted_description: "Resolves based on SocialBlade live subscriber tracking.", options: ["Yes", "No"], confidence: 0.85 };
    if (t.includes("mrbeast"))
      return { extracted_title: "Will MrBeast's next video cross 100M views in 48 hours?", extracted_description: "Resolves based on public YouTube view counter 48 hours after upload.", options: ["Yes", "No"], confidence: 0.84 };
    if (t.includes("sourav joshi") || t.includes("elvish"))
      return { extracted_title: "Will this Indian YouTuber cross 5M views on their next upload?", extracted_description: "Resolves based on public YouTube analytics.", options: ["Yes, above 5M", "No, below 5M"], confidence: 0.83 };
    return { extracted_title: "Will this Indian YouTube creator cross their next milestone?", extracted_description: "Resolves based on SocialBlade or public YouTube subscriber count.", options: ["Yes", "No"], confidence: 0.80 };
  };

  const politics = () => {
    if (t.includes("election") || t.includes("vote") || t.includes("bjp") || t.includes("congress"))
      return { extracted_title: "Will the ruling alliance win a majority in the next state election?", extracted_description: "Resolves based on official Election Commission of India results.", options: ["Yes, majority", "No, hung assembly"], confidence: 0.85 };
    if (t.includes("parliament") || t.includes("bill") || t.includes("lok sabha"))
      return { extracted_title: "Will the Indian Parliament pass this new policy bill this session?", extracted_description: "Resolves based on official Lok Sabha session records.", options: ["Yes, passed", "No, deferred"], confidence: 0.84 };
    return { extracted_title: "Will this Indian political development resolve in favour of the ruling party?", extracted_description: "Resolves based on official government announcements.", options: ["Yes", "No"], confidence: 0.80 };
  };

  const map = { Esports: esports, Sports: sports, Technology: tech, YouTube: youtube, Politics: politics };
  return (map[event.category] || (() => ({ extracted_title: "Will this trending India event resolve positively?", extracted_description: "Resolves based on public reports.", options: ["Yes", "No"], confidence: 0.78 })))();
};

// ─────────────────────────────────────────────
// MAIN EXPORT — triggerAutonomousCrawl
// Fetches ALL live events → generates polls via Groq → publishes high-priority ones
// ─────────────────────────────────────────────
export const triggerAutonomousCrawl = async () => {
  console.log("🤖 CrowdPulse Autonomous Crawler — fetching live India events...");
  const groqKey = process.env.GROQ_API_KEY;

  // ── 1. Fetch events from all live APIs in parallel ──
  const [esports, sports, tech, youtube, politics] = await Promise.all([
    fetchEsportsEvents(),
    fetchSportsEvents(),
    fetchTechEvents(),
    fetchYouTubeEvents(),
    fetchPoliticsEvents(),
  ]);

  const allEvents = [...esports, ...sports, ...tech, ...youtube, ...politics];
  console.log(`📦 Discovered ${allEvents.length} live events from APIs.`);

  if (!allEvents.length) {
    console.warn("⚠️  No live events fetched — check network / API keys.");
    return [];
  }

  const activePolls = await Poll.findAll({ where: { status: "active" } });
  const createdItems = [];

  // ── 2. Turn each event into a prediction poll ──
  for (const event of allEvents) {
    try {
      let pollData = null;

      // Try Groq LLM first
      if (groqKey) {
        try {
          pollData = await generatePollWithGroq(event, groqKey);
          console.log(`✅ Groq generated poll for [${event.category}]: ${pollData.extracted_title}`);
        } catch (groqErr) {
          console.warn(`⚠️  Groq failed for [${event.category}], using keyword fallback: ${groqErr.message}`);
        }
      }

      // Keyword fallback if Groq failed
      if (!pollData) {
        pollData = buildOfflinePoll(event);
        console.log(`🔧 Offline poll built for [${event.category}]: ${pollData.extracted_title}`);
      }

      const title = (pollData.extracted_title || "").substring(0, 120);
      if (!title) continue;

      // ── 3. Duplicate detection ──
      let maxRisk = 0;
      for (const p of activePolls) {
        const sim = calculateSimilarity(title, p.title);
        if (sim > maxRisk) maxRisk = sim;
      }
      if (maxRisk > 0.6) {
        console.log(`⏭️  Skipping duplicate (risk ${maxRisk.toFixed(2)}): "${title}"`);
        continue;
      }

      const confidence = Math.min(1, Math.max(0, pollData.confidence || 0.8));
      const priorityScore = parseFloat(
        (confidence * 50 + (1 - maxRisk) * 30 + Math.random() * 20).toFixed(2)
      );

      // ── 4. Save to moderation queue ──
      const generated = await GeneratedPoll.create({
        title,
        description: (pollData.extracted_description || "Resolves based on public verified reports.").substring(0, 500),
        categoryName: event.category,
        options: Array.isArray(pollData.options) ? pollData.options : ["Yes", "No"],
        confidenceScore: confidence,
        priorityScore,
        duplicateRisk: parseFloat(maxRisk.toFixed(2)),
        moderationStatus: "pending_review",
      });

      // ── 5. Auto-publish high-priority polls ──
      if (priorityScore >= 78 && maxRisk < 0.20) {
        await approveAndPublishPoll(generated.id);
        console.log(`🚀 Auto-published: "${title}"`);
      }

      createdItems.push(generated);
    } catch (err) {
      console.error(`❌ Error for [${event.category}]:`, err.message);
    }
  }

  console.log(`✅ Done — ${createdItems.length} polls processed.`);
  return createdItems;
};

// ─────────────────────────────────────────────
// EXPORT — approveAndPublishPoll
// Promotes a GeneratedPoll from the queue into a live active Poll
// ─────────────────────────────────────────────
export const approveAndPublishPoll = async (generatedId) => {
  const gp = await GeneratedPoll.findByPk(generatedId);
  if (!gp) throw new Error("Generated poll not found");

  // Ensure category exists
  let category = await Category.findOne({ where: { name: gp.categoryName } });
  if (!category) {
    category = await Category.create({
      name: gp.categoryName,
      description: `Auto-curated predictions for ${gp.categoryName}, India.`,
      minCoinRequirement: 50,
    });
  }

  // Use earliest registered user as system publisher
  const systemUser = await User.findOne({ order: [["createdAt", "ASC"]] });
  if (!systemUser) throw new Error("No users exist yet — cannot publish poll.");

  const poll = await Poll.create({
    creator_id: systemUser.id,
    category_id: category.id,
    title: gp.title,
    description: gp.description,
    creationCost: category.minCoinRequirement,
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  const split = category.minCoinRequirement / gp.options.length;
  for (const optName of gp.options) {
    await PollOption.create({ poll_id: poll.id, name: optName, totalStaked: split });
  }

  gp.moderationStatus = "approved";
  await gp.save();
  return poll;
};
