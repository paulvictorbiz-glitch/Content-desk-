// Sample data — assets, planner posts, captions, topics, patterns.
// Loaded into window.DATA. Mutated through state.jsx (immutable updates).
// Dates are anchored to "today" so the prototype feels live.

(function () {
  const TODAY = new Date('2026-05-26T00:00:00');
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  // ─── Topics (user-defined categories) ─────────────────────────
  const topics = [
    { id: 'business', name: 'Business', color: '#c4513a', accent: 'terracotta', promptKey: 'business',
      desc: 'Leadership, AI, entrepreneurship voice', emoji: '◆' },
    { id: 'meditation', name: 'Meditation', color: '#5a7a8c', accent: 'slate',  promptKey: 'meditation',
      desc: 'Tai chi, presence, contemplative observations', emoji: '◇' },
    { id: 'martial-arts', name: 'Martial arts', color: '#6f8a4a', accent: 'olive', promptKey: 'martial',
      desc: 'Kung fu form, training discipline, lineage', emoji: '◈' },
    { id: 'neutral', name: 'Neutral', color: '#7a756d', accent: 'gray', promptKey: 'neutral',
      desc: 'Untagged — needs a manual topic assignment', emoji: '○' },
  ];

  // ─── Posting pattern ──────────────────────────────────────────
  // Two slots per day, alternating style across days.
  const pattern = {
    enabled: true,
    slots: [
      { id: 's1', time: '09:00', mediaType: 'video', defaultTopic: 'business',  label: 'Morning · business video' },
      { id: 's2', time: '18:00', mediaType: 'image', defaultTopic: 'meditation', label: 'Evening · meditation still' },
    ],
    rotation: 'alternate-by-day', // alt: 'fixed-per-slot'
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // all days
  };

  // ─── Asset library ────────────────────────────────────────────
  // Title pool taken from the user's existing sheet — kept realistic.
  const assetSeed = [
    ['Ai Agent Schedules Appointments Automatically',   'video', 'business',   -8],
    ['7 Years, $2 Million My Personal Growth Journey',   'video', 'business',   -8],
    ['Ai Agents Explained Your Personal Digital Assist', 'video', 'business',   -8],
    ['Cleaning Toilets A Meditation Practice',           'video', 'meditation', -8],
    ['Ai Animate Any Photo Instantly Runway MI Magic',   'video', 'business',   -8],
    ['Discover Your True Self Nature Of The Self',       'video', 'meditation', -7],
    ['Ai Art Oscar Wilde Legal Precedent Explained',     'video', 'business',   -7],
    ['Doppelganger Or Time Travel Life Message',         'video', 'meditation', -7],
    ['Ai Assistant Mitra Reschedule Order More',         'video', 'business',   -7],
    ['Embrace The Now Freedom In The Present Moment',    'video', 'meditation', -6],
    ['Ai Builds Stunning Websites Instantly',            'video', 'business',   -6],
    ['Finding Happiness Beyond One Source',              'video', 'meditation', -6],
    ['Ai Business Growth Build Companies In 30 Days',    'video', 'business',   -6],
    ['Finding Joy The Beauty Of Simple Moments',         'video', 'meditation', -6],
    ['Ai Champion Top Down Integration Strategy',        'video', 'business',   -5],
    ['From Atheist To Enlightenment Power Of Prayer',    'video', 'meditation', -5],
    ['Ai Chatbots Can Cost You Millions',                'video', 'business',   -5],
    ['Future Self Vision Your Wisdom Is Now',            'video', 'meditation', -5],
    ['Ai Chatbots Skyrocket Followers Fast',             'video', 'business',   -4],
    ['Joe Dispenza Meditation Change Your Life',         'video', 'meditation', -4],
    ['Ai Community Unlock Fastest Tools',                'video', 'business',   -4],
    ['Mothers Smile First Connection Of Consciousness',  'video', 'meditation', -4],
    ['Ai Creates Logos Instantly To Your Website',       'video', 'business',   -3],
    ['Motherhoods Sacrifice The Truth About Birth Pain', 'video', 'meditation', -3],
    ['Ai Creates Books Websites Marketing In Minutes',   'video', 'business',   -3],
    ['Natures Beauty A Serene Escape',                   'video', 'meditation', -3],
    ['Ai Creates Childrens Books In Minutes',            'video', 'business',   -2],
    ['Rishikesh Wisdom Shop An Unexpected Journey',      'video', 'meditation', -2],
    ['Ai Creates Custom Videos Heygen Demo',             'video', 'business',   -2],
    ['Rishikesh Yoga Wisdom Shop',                       'video', 'meditation', -2],
    ['Ai Creates Music Type A Prompt Make Hit Song',     'video', 'business',   -1],
    ['Ai Creates Viral Sales Videos Digital Avatars',    'video', 'business',   -1],
    ['Ai Creates Viral Video Script To Screen Minutes',  'video', 'business',   -1],
    ['First Impressions Win Deals Instant Designs',      'video', 'business',   -1],
    ['Discipline Returning To What Supports You',        'video', 'meditation',  0],
    ['Healing Does Not Begin Until You Stop Performing', 'image', 'meditation', -8],
    ['Time Does Not Heal What Awareness Will Not Touch', 'image', 'meditation', -8],
    ['First Time Stillness Was Loud',                    'image', 'meditation', -7],
    ['Stillness Is Not Absence Of Movement',             'image', 'meditation', -7],
    ['Money Does Not Care How You Hold It',              'image', 'business',   -7],
    ['Calm System Always Wins The Long Game',            'image', 'business',   -6],
    ['Yoga Is Not About Flexibility Of Spine',           'image', 'meditation', -6],
    ['Mind Quiets When Body Stops Performing',           'image', 'meditation', -5],
    ['Your First Million Is A Story You Stop Telling',   'image', 'business',   -5],
    ['Best Education Is What You Cannot Unlearn',        'image', 'business',   -4],
    ['Breath More Than A Function Subtle Tool',          'image', 'meditation', -4],
    ['Peace Begins Where Comparison Ends',               'image', 'meditation', -3],
    ['Searched For Peace Then Stopped Asking',           'image', 'business',   -3],
    ['Awareness Turns Effort Into Ease',                 'image', 'meditation', -2],
    ['Most Successful Practice Is Doing Less',           'image', 'business',   -2],
    ['Your Body Knows What Mind Cannot Solve',           'image', 'meditation', -1],
    ['Thought Successful People Hide The Same Doubt',    'image', 'business',   -1],
    ['Tension Held Is Tension Inherited',                'image', 'meditation',  0],
    ['Most Powerful Thing About Pain Is Direction',      'image', 'business',    0],
  ];

  const filenameFor = (title, type, i) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const ext = type === 'video' ? '.mp4' : (i % 4 === 0 ? '.HEIC' : '.jpg');
    return slug + ext;
  };

  // Best-effort topic from a real filename. Drive folders are organised by
  // media type, not topic, so the only signal is the name itself.
  // No keyword match → 'neutral' (e.g. IMG_1234.JPG) — these surface in the
  // UI for the user to tag manually.
  const TOPIC_KEYWORDS = {
    'martial-arts': ['kung fu', 'kungfu', 'martial', 'wushu', 'shaolin'],
    meditation: ['meditat', 'stillness', 'mindful', 'presence', 'breath', 'yoga',
      'tai chi', 'taichi', 'conscious', 'healing', 'prayer', 'enlighten',
      'spiritual', 'silence', 'serene', 'gratitude', 'peace', 'soul',
      'wisdom', ' calm', ' nature'],
    business: ['ai ', ' ai', 'a.i', 'business', 'agent', 'automat', 'marketing',
      'sales', 'revenue', 'growth', 'leader', 'entrepreneur', 'money', 'brand',
      'website', 'chatbot', 'profit', 'customer', 'strategy', 'scale', 'startup',
      'invest', 'ceo', 'client', 'company', 'productiv', 'hustle', 'income',
      'workflow', 'saas', 'funnel', 'lead'],
  };
  const topicFor = (name) => {
    const s = ' ' + (name || '').toLowerCase() + ' ';
    for (const topic of Object.keys(TOPIC_KEYWORDS)) {
      if (TOPIC_KEYWORDS[topic].some((w) => s.includes(w))) return topic;
    }
    return 'neutral';
  };
  const titleFor = (filename) =>
    filename.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim()
    || filename;

  // A date in the filename (month / day / year) means the asset has already
  // been organised/posted. Returns an ISO date string, or null.
  const pad2 = (n) => String(n).padStart(2, '0');
  const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7,
    aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const detectPostedDate = (filename) => {
    const s = filename || '';
    let m = s.match(/(20\d{2})[._\- ](0?[1-9]|1[0-2])[._\- ](0?[1-9]|[12]\d|3[01])(?!\d)/);
    if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
    m = s.match(/(?<!\d)(0?[1-9]|1[0-2])[._\-/](0?[1-9]|[12]\d|3[01])[._\-/](20\d{2})(?!\d)/);
    if (m) return `${m[3]}-${pad2(m[1])}-${pad2(m[2])}`;
    m = s.toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?[ _\-]+(\d{1,2})(?:st|nd|rd|th)?,?[ _\-]+(20\d{2})\b/);
    if (m && MONTHS[m[1]]) return `${m[3]}-${pad2(MONTHS[m[1]])}-${pad2(m[2])}`;
    m = s.match(/(?<!\d)(0?[1-9]|1[0-2])[._\-/](0?[1-9]|[12]\d|3[01])[._\-/](2\d)(?!\d)/);
    if (m) return `20${m[3]}-${pad2(m[1])}-${pad2(m[2])}`;
    return null;
  };

  // Manual topic tags persist in localStorage, keyed by Drive ID so they
  // survive a re-sync. window.CDPrefs is also used by the tagging UI.
  const PREFS_KEY = 'cd_topic_overrides';
  const readOverrides = () => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
    catch (e) { return {}; }
  };
  const writeOverrides = (o) => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(o)); } catch (e) {}
  };
  if (typeof window !== 'undefined') {
    window.CDPrefs = {
      getTopicOverrides: readOverrides,
      setTopicOverrides(driveIds, topic) {
        const o = readOverrides();
        driveIds.forEach((d) => { if (d) o[d] = topic; });
        writeOverrides(o);
      },
      clearTopicOverrides() { writeOverrides({}); },
    };
  }
  const overrides = (typeof localStorage !== 'undefined') ? readOverrides() : {};

  // Real Google Drive metadata when synced (drive-sync/sync.py writes
  // window.DRIVE_ASSETS); otherwise the demo seed above.
  const DRIVE = (typeof window !== 'undefined' && Array.isArray(window.DRIVE_ASSETS) && window.DRIVE_ASSETS.length)
    ? window.DRIVE_ASSETS : null;

  const assets = DRIVE
    ? DRIVE.map((d, i) => {
        const raw = (d.createdTime || d.modifiedTime || iso(TODAY) + 'T00:00:00')
          .replace('Z', '').slice(0, 19);
        // Guarantee at least "YYYY-MM-DDTHH:MM" — the UI slices [11,16].
        const uploadedAt = raw.length >= 16 ? raw : iso(TODAY) + 'T00:00:00';
        const ageDays = Math.round((TODAY - new Date(uploadedAt)) / 86400000);
        const postedDate = detectPostedDate(d.filename);
        return {
          id: 'a' + (i + 1).toString().padStart(4, '0'),
          title: titleFor(d.filename || 'Untitled'),
          filename: d.filename || 'untitled',
          type: d.type === 'image' ? 'image' : 'video',
          topic: overrides[d.driveId] || topicFor(d.filename),
          client: 'nikky-kho',
          driveId: d.driveId || '',
          driveFolder: d.driveFolder || '',
          sizeBytes: d.sizeBytes || 0,
          durationSec: null,
          uploadedAt,
          webViewLink: d.webViewLink || null,
          driveStatus: 'synced',
          isNew: ageDays >= 0 && ageDays <= 2,
          posted: !!postedDate,
          postedDate,
          sourceQuote: null,
        };
      })
    : assetSeed.map((s, i) => {
        const filename = filenameFor(s[0], s[1], i);
        const postedDate = detectPostedDate(filename);
        return {
          id: 'a' + (i + 1).toString().padStart(3, '0'),
          title: s[0],
          filename,
          type: s[1],
          topic: s[2],
          client: 'nikky-kho',
          driveId: '1' + Math.random().toString(36).slice(2, 12) + 'k',
          driveFolder: `Nikky/${s[1] === 'video' ? 'Videos' : 'Pictures'}/${s[2]}`,
          sizeBytes: s[1] === 'video' ? 8e6 + Math.floor(Math.random() * 25e6) : 1.2e6 + Math.floor(Math.random() * 3e6),
          durationSec: s[1] === 'video' ? 30 + Math.floor(Math.random() * 90) : null,
          uploadedAt: iso(addDays(TODAY, s[3])) + 'T' + (8 + i % 8) + ':' + (10 + (i * 7) % 50) + ':00',
          driveStatus: i === 5 ? 'pending' : 'synced',
          isNew: s[3] >= -1, // uploaded in last 2 days
          posted: !!postedDate,
          postedDate,
          sourceQuote: null,
        };
      });

  // ─── Caption snippets (mirrors the sheet's voice) ─────────────
  const captionsByTopic = {
    business: [
      'Leaders protect attention by outsourcing the rest. What you let touch your calendar shapes what you build.',
      'You cannot buy the self you are seeking. Seven years and millions later, the only thing that compounded was discipline.',
      'AI agents are the employees of the future — they don\'t ask for raises, they ask for clearer instructions.',
      'Your nervous system is a leading indicator. A calm system outlasts a smart one.',
      'I learned more about negotiation in an open-air bazaar than in any boardroom.',
      'Static assets die on social media. Run the prompt, ship the variant, learn in public.',
      'Building a company in 30 days isn\'t a dream — strategy, validation, and one obsessed week.',
      'AI adoption fails without a top-down strategy. Champions ship; committees postpone.',
      'British Airways paid millions for a broken chatbot. Chatbots that nurture pay back.',
      'I spent years chasing — your future self already holds the wisdom you seek. Close your eyes.',
      'Brand implementation used to take days. AI creates logos and deploys before lunch.',
      'No amount of money can fix a broken mindset. Fulfillment comes from values, not valuation.',
      'Wisdom isn\'t found in the most powerful texts but the simplest moments between meetings.',
      'Self-compassion is the most valuable currency. The economy you build inside compounds outside.',
    ],
    meditation: [
      'Discipline in yoga is not rigid control; it is a steady commitment to what supports you.',
      'Every country has its own way of thinking, selling, and solving. Travel quiets opinions.',
      'Attachment creates contraction in both body and mind, while awareness creates space.',
      'I learned more about business in an open-air bazaar than in a boardroom — because nobody was performing.',
      'The breath is more than a physical function; it is a subtle tool that allows you to listen.',
      'Exposure expands possibility. Every CEO should step outside their bubble — and stay until it pops.',
      'Joy hides in simple moments the mind overlooks. A breath, a sound, a smile that wasn\'t for anyone.',
      'The practice of yoga is ultimately about remembering that you are not your story.',
      'Atheism was my armor. Prayer shattered it and revealed what silence already knew.',
      'A mother\'s smile is the first moment consciousness recognizes itself.',
      'Tension in the body is often unprocessed emotion; through breath, you give it somewhere to go.',
      'Dr. Joe Dispenza merges meditation with neuroscience. Change your brain, change your life.',
      'Communities share tools before they reach the market. Staying connected is the practice.',
      'Brand implementation used to take days. AI creates logos and deploys, but presence still takes a lifetime.',
    ],
  };
  const hashtagsByTopic = {
    business: '#ai #leadership #mindset #entrepreneur',
    meditation: '#stillness #mindfulness #taichi #presence',
    'martial-arts': '#kungfu #taichi #lineage #discipline',
  };

  // ─── Planner posts ────────────────────────────────────────────
  // 6 weeks of posts, 2 per day. Some linked to assets, some empty.
  const posts = [];
  let postId = 1;
  for (let d = -14; d <= 28; d++) {
    const date = iso(addDays(TODAY, d));
    pattern.slots.forEach((slot, idx) => {
      // alternate topic by day index, slot idx flips it
      const baseAlt = ((d % 2) + 2) % 2; // 0 or 1
      const topicId = (baseAlt ^ idx) ? 'meditation' : 'business';
      const isPast = d < 0;
      const isToday = d === 0;

      // Find a fitting asset that hasn't been used yet (or allow reuse for the very past).
      const pool = assets.filter(a => a.type === slot.mediaType && a.topic === topicId);
      const used = new Set(posts.filter(p => p.assetId).map(p => p.assetId));
      let available = pool.filter(a => !used.has(a.id));
      // Skip linking for a couple slots to demonstrate "missing asset" state.
      const skipLink = (d === 2 && idx === 1) || (d === 5 && idx === 0) || (d === 14 && idx === 0);
      let asset = null;
      if (!skipLink) {
        asset = available[0] || pool[Math.floor(Math.random() * pool.length)];
      }

      // Caption status logic
      let captionStatus, captionText;
      if (d < -1) {
        captionStatus = 'final';
        captionText = pickCaption(topicId, postId);
      } else if (d <= 4) {
        // Mix of final/draft/empty in near future
        const r = (d + postId) % 4;
        if (r === 0) { captionStatus = 'empty'; captionText = ''; }
        else if (r === 1) { captionStatus = 'draft'; captionText = pickCaption(topicId, postId); }
        else { captionStatus = 'final'; captionText = pickCaption(topicId, postId); }
      } else {
        // Further future: mostly empty
        captionStatus = (d + postId) % 3 === 0 ? 'draft' : 'empty';
        captionText = captionStatus === 'empty' ? '' : pickCaption(topicId, postId);
      }
      if (skipLink) { captionStatus = 'empty'; captionText = ''; }

      const exportStatus = d < -3 && captionStatus === 'final' ? 'exported' : 'not';

      posts.push({
        id: 'p' + (postId++).toString().padStart(3, '0'),
        date,
        time: slot.time,
        slotId: slot.id,
        assetId: asset ? asset.id : null,
        type: slot.mediaType,
        topicId,
        captionStatus,
        captionText,
        captionVersions: captionText ? [
          { v: 1, at: addDays(TODAY, d - 1).toISOString().slice(0, 16) + ':22', text: captionText, by: 'llm' },
        ] : [],
        exportStatus,
        exportedAt: exportStatus === 'exported' ? iso(addDays(TODAY, -3)) : null,
        notes: '',
      });
    });
  }
  function pickCaption(topicId, salt) {
    const arr = captionsByTopic[topicId] || captionsByTopic.business;
    const base = arr[salt % arr.length];
    return base + '\n\n' + (hashtagsByTopic[topicId] || '');
  }

  // ─── Settings (LLM prompts, drive paths) ──────────────────────
  const settings = {
    drive: {
      videosRoot: 'Nikky Kho Social Media/Videos',
      picturesRoot: 'Nikky Kho Social Media/Pictures',
      organizeBy: 'topic',
    },
    prompts: {
      business: {
        model: 'claude-haiku-4-5',
        maxTokens: 512,
        temperature: 0.7,
        system: 'You are writing a LinkedIn-style caption for Nikky Kho (entrepreneur, AI builder, martial artist). Open with a sharp insight tied to "{{title}}". 3–5 short sentences. End with a CTA question. Tone: confident, crisp, leadership. Include 3 hashtags from #ai #leadership #mindset #entrepreneur #business #automation.',
      },
      meditation: {
        model: 'claude-haiku-4-5',
        maxTokens: 512,
        temperature: 0.7,
        system: 'You are writing an Instagram caption for Nikky Kho (Tai Chi master, kung fu practitioner). Open with a contemplative observation tied to "{{title}}". 3–5 short sentences. End with an invitation, not a CTA. Tone: warm, grounded, present. Include 3 hashtags from #meditation #mindfulness #taichi #presence #stillness #wisdom.',
      },
      'martial-arts': {
        model: 'claude-haiku-4-5',
        maxTokens: 512,
        temperature: 0.7,
        system: 'You are writing a caption tied to "{{title}}" for Nikky Kho — kung fu lineage, training discipline, embodied wisdom. 3–5 short sentences. Reverent but accessible. Include 2 hashtags.',
      },
    },
    renaming: {
      enabled: false,
      template: '{{date}}_nikky_{{topic}}{{seq}}.{{ext}}',
      applyOn: 'after-scheduled',
    },
    planable: {
      columns: ['date', 'time', 'caption', 'media_url', 'type', 'topic'],
      includeStatusColumn: false,
    },
  };

  // ─── Activity log ─────────────────────────────────────────────
  const activity = [
    { at: addDays(TODAY, -1).toISOString().slice(0, 16) + ':12', text: 'Uploaded 6 videos → Drive/Videos/business' },
    { at: addDays(TODAY, -1).toISOString().slice(0, 16) + ':58', text: 'Generated 4 captions (business)' },
    { at: addDays(TODAY, -2).toISOString().slice(0, 16) + ':30', text: 'Exported planable_may05-may24.csv (18 rows)' },
    { at: addDays(TODAY, -3).toISOString().slice(0, 16) + ':14', text: 'Linked asset to May 23 slot' },
    { at: addDays(TODAY, -4).toISOString().slice(0, 16) + ':02', text: 'Renamed 12 files to date format (dry run)' },
    { at: addDays(TODAY, -5).toISOString().slice(0, 16) + ':45', text: 'Updated business prompt template' },
  ];

  window.DATA = { TODAY, iso, addDays, topics, pattern, assets, posts, settings, activity, captionsByTopic, hashtagsByTopic };
})();
