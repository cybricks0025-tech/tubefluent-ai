// Professional Online English Tutor Lexicon, Phrase Matcher & Sentence Coach
// 專為「線上真人感英文家教」設計：精準標記道地片語 (Phrasal Verbs / Idioms / Collocations) 與 B2-C2 專業高階字彙，拒絕標記國小國中基礎字。

export const BASIC_WORDS = new Set([
  // Function words, pronouns, determiners, prepositions, auxiliaries
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would',
  'there', 'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when',
  'make', 'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
  'day', 'most', 'very', 'was', 'were', 'are', 'been', 'has', 'had', 'going',
  'really', 'something', 'things', 'thing', 'lot', 'where', 'much', 'more',
  'those', 'being', 'through', 'should', 'actually', 'every', 'little', 'around',
  'himself', 'herself', 'itself', 'themselves', 'ourselves', 'yourself', 'yourselves',
  'myself', 'someone', 'anyone', 'everyone', 'everybody', 'somebody', 'nobody',
  'nothing', 'anything', 'everything', 'somewhere', 'anywhere', 'everywhere',
  'another', 'between', 'without', 'against', 'already', 'whether', 'however',
  'instead', 'outside', 'inside', 'forward', 'behind', 'together', 'perhaps',
  'always', 'never', 'often', 'sometimes', 'usually', 'almost', 'enough',
  'quite', 'rather', 'pretty', 'maybe', 'probably', 'especially', 'certainly',
  'before', 'during', 'within', 'across', 'toward', 'towards', 'around', 'though',
  'although', 'unless', 'until', 'while', 'since', 'because', 'whereas',

  // Common A1-B1 everyday nouns, verbs, adjectives (and inflections) that a real tutor wouldn't highlight alone
  'welcome', 'welcomed', 'welcoming', 'hello', 'thank', 'thanks', 'sorry', 'please',
  'morning', 'afternoon', 'evening', 'tonight', 'today', 'tomorrow', 'yesterday',
  'minute', 'minutes', 'second', 'seconds', 'hour', 'hours', 'week', 'weeks',
  'month', 'months', 'years', 'night', 'nights', 'weekend', 'moment', 'moments',
  'number', 'numbers', 'letter', 'letters', 'word', 'words', 'sentence', 'sentences',
  'question', 'questions', 'answer', 'answers', 'example', 'examples', 'problem', 'problems',
  'reason', 'reasons', 'result', 'results', 'change', 'changes', 'changed', 'changing',
  'start', 'starts', 'started', 'starting', 'begin', 'begins', 'began', 'beginning',
  'finish', 'finished', 'end', 'ends', 'ended', 'ending', 'stop', 'stopped', 'stopping',
  'continue', 'continued', 'keep', 'keeps', 'kept', 'keeping', 'stay', 'stayed', 'staying',
  'leave', 'leaves', 'left', 'leaving', 'move', 'moves', 'moved', 'moving',
  'live', 'lives', 'lived', 'living', 'life', 'world', 'country', 'countries',
  'city', 'cities', 'town', 'place', 'places', 'home', 'house', 'houses', 'room', 'rooms',
  'school', 'schools', 'college', 'university', 'universities', 'class', 'classes',
  'student', 'students', 'teacher', 'teachers', 'friend', 'friends', 'family', 'families',
  'parent', 'parents', 'mother', 'father', 'daughter', 'daughters', 'son', 'sons',
  'child', 'children', 'baby', 'babies', 'wife', 'husband', 'woman', 'women', 'man', 'men',
  'girl', 'girls', 'boy', 'boys', 'person', 'people', 'human', 'humans', 'body', 'bodies',
  'hand', 'hands', 'head', 'heads', 'eye', 'eyes', 'face', 'faces', 'heart', 'hearts',
  'mind', 'minds', 'brain', 'brains', 'voice', 'voices', 'sound', 'sounds',
  'water', 'food', 'foods', 'money', 'dollar', 'dollars', 'book', 'books', 'paper', 'papers',
  'page', 'pages', 'picture', 'pictures', 'image', 'images', 'video', 'videos',
  'music', 'song', 'songs', 'movie', 'movies', 'game', 'games', 'story', 'stories',
  'computer', 'computers', 'phone', 'phones', 'screen', 'screens', 'internet', 'website',
  'company', 'companies', 'business', 'businesses', 'office', 'market', 'markets',
  'product', 'products', 'service', 'services', 'system', 'systems', 'program', 'programs',
  'group', 'groups', 'team', 'teams', 'member', 'members', 'part', 'parts', 'side', 'sides',
  'point', 'points', 'line', 'lines', 'area', 'areas', 'level', 'levels', 'kind', 'kinds',
  'type', 'types', 'sort', 'form', 'forms', 'case', 'cases', 'fact', 'facts', 'idea', 'ideas',
  'information', 'knowledge', 'power', 'energy', 'nature', 'future', 'history', 'science',
  'language', 'english', 'chinese', 'spanish', 'french', 'german', 'japanese',
  'experience', 'experiences', 'experienced', 'difficult', 'difficulty', 'option', 'options',
  'government', 'governments', 'craziness', 'supposed', 'output', 'outputs', 'input', 'inputs',

  // Common verbs & inflections
  'become', 'becomes', 'became', 'becoming', 'seem', 'seems', 'seemed', 'feel', 'feels', 'felt', 'feeling',
  'try', 'tries', 'tried', 'trying', 'call', 'calls', 'called', 'calling',
  'ask', 'asks', 'asked', 'asking', 'need', 'needs', 'needed', 'needing',
  'help', 'helps', 'helped', 'helping', 'talk', 'talks', 'talked', 'talking',
  'speak', 'speaks', 'spoke', 'spoken', 'speaking', 'tell', 'tells', 'told', 'telling',
  'mean', 'means', 'meant', 'meaning', 'show', 'shows', 'showed', 'shown', 'showing',
  'hear', 'hears', 'heard', 'hearing', 'listen', 'listens', 'listened', 'listening',
  'watch', 'watches', 'watched', 'watching', 'play', 'plays', 'played', 'playing',
  'run', 'runs', 'ran', 'running', 'walk', 'walks', 'walked', 'walking',
  'sit', 'sits', 'sat', 'sitting', 'stand', 'stands', 'stood', 'standing',
  'put', 'puts', 'putting', 'set', 'sets', 'setting', 'bring', 'brings', 'brought', 'bringing',
  'hold', 'holds', 'held', 'holding', 'write', 'writes', 'wrote', 'written', 'writing',
  'read', 'reads', 'reading', 'learn', 'learns', 'learned', 'learning',
  'study', 'studies', 'studied', 'studying', 'teach', 'teaches', 'taught', 'teaching',
  'understand', 'understands', 'understood', 'understanding',
  'remember', 'remembers', 'remembered', 'remembering', 'forget', 'forgot', 'forgotten',
  'believe', 'believes', 'believed', 'believing', 'happen', 'happens', 'happened', 'happening',
  'appear', 'appears', 'appeared', 'create', 'creates', 'created', 'creating',
  'build', 'builds', 'built', 'building', 'make', 'makes', 'made', 'making',
  'find', 'finds', 'found', 'finding', 'lose', 'loses', 'lost', 'losing',
  'pay', 'pays', 'paid', 'paying', 'buy', 'buys', 'bought', 'buying',
  'sell', 'sells', 'sold', 'selling', 'send', 'sends', 'sent', 'sending',
  'spend', 'spends', 'spent', 'spending', 'grow', 'grows', 'grew', 'grown', 'growing',
  'open', 'opens', 'opened', 'opening', 'close', 'closes', 'closed', 'closing',
  'turn', 'turns', 'turned', 'turning', 'love', 'loves', 'loved', 'loving',
  'like', 'likes', 'liked', 'liking', 'hope', 'hopes', 'hoped', 'hoping',
  'wait', 'waits', 'waited', 'waiting', 'pass', 'passes', 'passed', 'passing',
  'reach', 'reaches', 'reached', 'reaching', 'expect', 'expected', 'expecting',
  'decide', 'decided', 'choose', 'chose', 'chosen', 'follow', 'followed', 'following',
  'thought', 'thoughts', 'thinking', 'knew', 'known', 'knowing', 'given', 'giving', 'gave',
  'taken', 'taking', 'took', 'seen', 'seeing', 'saw', 'done', 'doing', 'did', 'does',
  'went', 'gone', 'came', 'coming', 'got', 'gotten', 'getting', 'having',

  // Common A1-B1 adjectives & adverbs
  'great', 'greater', 'greatest', 'small', 'smaller', 'smallest', 'large', 'larger', 'largest',
  'high', 'higher', 'highest', 'low', 'lower', 'lowest', 'long', 'longer', 'longest',
  'short', 'shorter', 'shortest', 'old', 'older', 'oldest', 'young', 'younger', 'youngest',
  'important', 'different', 'possible', 'available', 'able', 'likely', 'free', 'true',
  'real', 'right', 'wrong', 'best', 'better', 'worse', 'worst', 'sure', 'clear',
  'easy', 'easier', 'easiest', 'hard', 'harder', 'hardest', 'strong', 'stronger', 'strongest',
  'whole', 'full', 'empty', 'early', 'earlier', 'late', 'later', 'latest', 'fast', 'faster',
  'slow', 'slowly', 'quickly', 'easily', 'simply', 'nearly', 'finally', 'suddenly',
  'together', 'forever', 'tonight', 'alright', 'okay', 'yeah', 'well', 'nice', 'happy',
  'ready', 'simple', 'single', 'special', 'certain', 'common', 'general', 'public', 'personal',
  'social', 'local', 'national', 'international', 'political', 'economic', 'financial',
  'medical', 'physical', 'mental', 'natural', 'human', 'actual', 'normal', 'similar',
  'various', 'several', 'popular', 'modern', 'traditional', 'final', 'main', 'major',
  'recent', 'current', 'entire', 'total', 'complete', 'completely', 'totally', 'exactly',
  'directly', 'immediately', 'recently', 'currently', 'usually', 'normally', 'naturally',
  'basic', 'basically', 'pretty', 'super', 'crazy', 'amazing', 'awesome', 'wonderful',
  'beautiful', 'bright', 'dark', 'light', 'heavy', 'heavier', 'deep', 'deeper', 'wide',

  // Numbers & Proper Nouns from cached videos
  'zero', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'twenty', 'thirty', 'forty', 'fifty', 'hundred', 'thousand', 'million', 'billion', 'trillion',
  'third', 'fourth', 'fifth', 'stanford', 'reed', 'kelsey', 'lela', 'josh', 'kaufman',
  'urban', 'jensen', 'huang', 'nvidia', 'cuda', 'blackwell', 'rubin', 'dlss', 'olaf',
  'gustavo', 'rocha', 'marssi', 'draw', 'transcriber', 'reviewer', 'translator', 'laughter', 'applause'
]);

/**
 * Curated High-Value Idioms, Phrasal Verbs & Spoken Expressions
 * Ordered so longer / more specific phrases match first.
 */
export const TUTOR_PHRASES = [
  {
    regex: /\btruth\s+be\s+told\b/i,
    lemma: 'truth be told',
    pos: 'phr.',
    phonetic: '/truθ bi toʊld/',
    level: '演講高頻片語',
    meaning: '說實話、坦白說（母語者在演講或分享個人故事時的經典破題轉折，語氣比 honestly 更真誠有戲劇張力）',
    exampleEn: 'Truth be told, our initial prototype failed three times before we found the right architecture.',
    exampleZh: '說實話，我們的初代原型失敗了三次，才找到正確的系統架構。'
  },
  {
    regex: /\bno\s+big\s+deal\b/i,
    lemma: 'no big deal',
    pos: 'phr.',
    phonetic: '/noʊ bɪɡ dil/',
    level: '道地口語慣用語',
    meaning: '沒什麼大不了、小事一樁（演講中常用來展現幽默自謙，瞬間拉近與聽眾的距離）',
    exampleEn: 'Mistakes during rehearsals are no big deal as long as we learn from them.',
    exampleZh: '彩排時出錯沒什麼大不了，只要我們能從中汲取經驗。'
  },
  {
    regex: /\bconnect(?:s|ed|ing)?\s+the\s+dots\b/i,
    lemma: 'connect the dots',
    pos: 'phr.',
    phonetic: '/kəˈnɛkt ðə dɑts/',
    level: '核心慣用語',
    meaning: '把過往的點滴串連起來、融會貫通（Steve Jobs 最著名的演講隱喻：人生當下看似無關的經歷，回頭看都會串連成有意義的軌跡）',
    exampleEn: 'You cannot connect the dots looking forward; you can only connect them looking backward.',
    exampleZh: '你無法預先把未來的點滴串連起來，唯有回首過往時才能看清脈絡。'
  },
  {
    regex: /\b(?:drop|drops|dropped|dropping)\s+out(?:\s+of)?\b/i,
    lemma: 'drop out (of)',
    pos: 'phr.',
    phonetic: '/drɑp‿aʊt/',
    level: '必學動詞片語',
    meaning: '休學、退學、中途退出（連音讀作 dro-pout；名詞 dropout 指輟學生，常搭配 drop out of college）',
    exampleEn: 'He decided to drop out of graduate school to launch an AI startup.',
    exampleZh: '他決定從研究所休學，創辦一家人工智慧新創公司。'
  },
  {
    regex: /\b(?:drop|drops|dropped|dropping)[- ]in(?:\s+on)?\b/i,
    lemma: 'drop in / drop-in',
    pos: 'phr.',
    phonetic: '/drɑp‿ɪn/',
    level: '道地片語',
    meaning: '旁聽、順道拜訪（動詞 drop in on a class 指不註冊學分而去旁聽課程；名詞 drop-in 指旁聽生）',
    exampleEn: 'Once I dropped out, I could drop in on the calligraphy classes that truly fascinated me.',
    exampleZh: '退學之後，我反而能去旁聽那些真正令我著迷的書法課。'
  },
  {
    regex: /\b(?:turn|turns|turned|turning)\s+out(?:\s+to\s+be)?\b/i,
    lemma: 'turn out (to be)',
    pos: 'phr.',
    phonetic: '/tɝn‿aʊt tə bi/',
    level: '高頻口語片語',
    meaning: '結果卻是⋯、後來證明是⋯（用來描述事情發展出乎意料的最終結果）',
    exampleEn: 'What seemed like a detour at the time turned out to be the most valuable experience of my career.',
    exampleZh: '當時看似繞遠路的經歷，後來卻證明是我職涯中最寶貴的養分。'
  },
  {
    regex: /\b(?:stumble|stumbles|stumbled|stumbling)\s+into\b/i,
    lemma: 'stumble into',
    pos: 'phr.',
    phonetic: '/ˈstʌmbəl ˈɪntə/',
    level: 'C1 生動片語',
    meaning: '無意間接觸到、誤打誤撞踏入（比 find 或 discover 更具畫面感，強調非刻意規畫的意外收穫）',
    exampleEn: 'Much of what I stumbled into by following my curiosity proved priceless later on.',
    exampleZh: '許多我當初跟隨好奇心而誤打誤撞接觸的事物，後來都證明價值連城。'
  },
  {
    regex: /\b(?:pass|passes|passed|passing)\s+the\s+baton\b/i,
    lemma: 'pass the baton',
    pos: 'phr.',
    phonetic: '/pæs ðə bəˈtɑn/',
    level: '演講高階慣用語',
    meaning: '交棒、傳承重任（源自田徑接力賽棒 baton，職場與演講中用來比喻世代或職務交替）',
    exampleEn: 'After ten years of leading the division, she was ready to pass the baton to the next generation.',
    exampleZh: '帶領部門十年後，她準備好將重任交棒給下一代。'
  },
  {
    regex: /\b(?:settle|settles|settled|settling)\s+for\b|\bdon't\s+settle\b/i,
    lemma: 'settle (for)',
    pos: 'phr.',
    phonetic: '/ˈsɛtəl fɔr/',
    level: '職場與演講高頻',
    meaning: '將就、妥協於（次等的事物）；單用 Don\'t settle 則意為「絕不將就、不要輕易妥協」',
    exampleEn: 'Keep looking for work you truly love, and never settle for mediocrity.',
    exampleZh: '持續尋找你真正熱愛的工作，絕不要向平庸妥協。'
  },
  {
    regex: /\b(?:drown|drowns|drowned|drowning)\s+out\b/i,
    lemma: 'drown out',
    pos: 'phr.',
    phonetic: '/draʊn‿aʊt/',
    level: 'B2 精準片語',
    meaning: '蓋過、淹沒（聲音或內心的想法，例如別人的雜音蓋過自己內心的聲音）',
    exampleEn: 'Don\'t let the noise of others\' opinions drown out your own inner voice.',
    exampleZh: '別讓他人意見的雜音，蓋過了你內心真正的聲音。'
  },
  {
    regex: /\bstay\s+hungry,?\s+stay\s+foolish\b/i,
    lemma: 'Stay hungry. Stay foolish.',
    pos: 'phr.',
    phonetic: '/steɪ ˈhʌŋɡri steɪ ˈfulɪʃ/',
    level: '經典名言片語',
    meaning: '求知若飢，虛心若愚（保持對新知的強烈渴望，並以初學者的謙遜勇敢嘗試）',
    exampleEn: 'In a rapidly evolving AI era, the best mindset is still to stay hungry, stay foolish.',
    exampleZh: '在快速演進的 AI 時代，最佳的心態依然是「求知若飢，虛心若愚」。'
  },
  {
    regex: /\b(?:pull|pulls|pulled|pulling)\s+an?\s+all[- ]nighter(?:s)?\b/i,
    lemma: 'pull an all-nighter',
    pos: 'phr.',
    phonetic: '/pʊl ən ˈɔlˌnaɪtɚ/',
    level: '母語高頻慣用語',
    meaning: '熬夜通宵趕工／苦讀（動詞必搭配 pull，常見於校園趕論文或科技業趕專案上線）',
    exampleEn: 'We had to pull an all-nighter to fix the critical production bug before launch.',
    exampleZh: '我們不得不通宵熬夜，在產品發布前修復那個嚴重的正式環境臭蟲。'
  },
  {
    regex: /\boff\s+the\s+hook\b/i,
    lemma: 'off the hook',
    pos: 'phr.',
    phonetic: '/ɔf ðə hʊk/',
    level: '道地口語慣用語',
    meaning: '脫身、免於受罰或擺脫壓力（字面為魚兒「脫鉤」，口語指終於交差、鬆了一口氣）',
    exampleEn: 'Once the thesis was finally handed in, I felt completely off the hook.',
    exampleZh: '論文終於交出去的那一刻，我覺得整個人徹底解脫了。'
  },
  {
    regex: /\b(?:hand|hands|handed|handing)\s+(?:it\s+|them\s+)?in\b/i,
    lemma: 'hand in',
    pos: 'phr.',
    phonetic: '/hænd‿ɪn/',
    level: '實用動詞片語',
    meaning: '繳交、提交（作業、報告、辭呈等，同義於正式用字 submit）',
    exampleEn: 'Please hand in your quarterly architecture review by Friday afternoon.',
    exampleZh: '請在週五下午前提交你的季度架構審查報告。'
  },
  {
    regex: /\b(?:spread|spreads|spreading)\s+(?:the\s+work\s+|it\s+)?out\b/i,
    lemma: 'spread (something) out',
    pos: 'phr.',
    phonetic: '/sprɛd‿aʊt/',
    level: '實用動詞片語',
    meaning: '平均分配、分散開來（把工作量或時間分攤開，避免集中在最後一刻）',
    exampleEn: 'Instead of cramming at the last minute, try to spread the workload out evenly across the sprint.',
    exampleZh: '與其在最後一刻臨時抱佛腳，不如把工作量平均分攤到整個開發衝刺期。'
  },
  {
    regex: /\binstant\s+gratification\b/i,
    lemma: 'instant gratification',
    pos: 'phr.',
    phonetic: '/ˈɪnstənt ˌɡrætəfəˈkeɪʃən/',
    level: 'C1 心理與行為詞組',
    meaning: '即時享樂、立即滿足感（拖延症的核心誘因：大腦偏好眼前立刻能獲得快感的事，而逃避長期目標）',
    exampleEn: 'Social media algorithms are engineered to hijack our desire for instant gratification.',
    exampleZh: '社群媒體演算法的設計目的，就是綁架我們對「即時滿足感」的渴望。'
  },
  {
    regex: /\bwake[- ]up\s+call\b/i,
    lemma: 'wake-up call',
    pos: 'phr.',
    phonetic: '/ˈweɪkʌp kɔl/',
    level: 'B2 核心慣用語',
    meaning: '當頭棒喝、警鐘（原指飯店晨間叫醒電話，引申為讓人突然警醒、意識到危機的事件）',
    exampleEn: 'Missing that major client deadline served as a serious wake-up call for the entire engineering team.',
    exampleZh: '錯過那次重要客戶的截止期限，為整個工程團隊敲響了一記警鐘。'
  },
  {
    regex: /\b(?:sink|sinks|sank|sunk|sinking)\s+in\b/i,
    lemma: 'sink in',
    pos: 'phr.',
    phonetic: '/sɪŋk‿ɪn/',
    level: '道地口語片語',
    meaning: '（真相或嚴重性）逐漸被理解、滲入腦海（主詞常為事情、消息或事實）',
    exampleEn: 'It took a few moments for the scale of the breakthrough to really sink in.',
    exampleZh: '大家過了好一會兒，才真正意識到這項突破的規模有多麼巨大。'
  },
  {
    regex: /\b(?:give|gives|gave|given|giving)\s+in(?:\s+to)?\b/i,
    lemma: 'give in (to)',
    pos: 'phr.',
    phonetic: '/ɡɪv‿ɪn/',
    level: '必學動詞片語',
    meaning: '屈服、讓步、向（誘惑或壓力）妥協（注意與 give up「放棄目標」不同，give in 是「抵擋不住而退讓」）',
    exampleEn: 'Whenever the deadline is far away, the rational decision-maker easily gives in to distraction.',
    exampleZh: '每當截止日還很遙遠時，大腦裡的理性決策者很容易向分心誘惑屈服。'
  },
  {
    regex: /\b(?:figure|figures|figured|figuring)\s+(?:it\s+|this\s+|that\s+|things\s+)?out\b/i,
    lemma: 'figure out',
    pos: 'phr.',
    phonetic: '/ˈfɪɡjər‿aʊt/',
    level: '職場與口語極高頻',
    meaning: '想出解決辦法、弄明白、搞懂（外商會議與日常口語最常代替 solve / understand 的道地片語）',
    exampleEn: 'Give me twenty minutes to inspect the logs and figure out why the latency spiked.',
    exampleZh: '給我二十分鐘檢查系統日誌，找出延遲飆升的原因。'
  },
  {
    regex: /\bfrom\s+scratch\b/i,
    lemma: 'from scratch',
    pos: 'phr.',
    phonetic: '/frʌm skrætʃ/',
    level: 'B2 核心慣用語',
    meaning: '從零開始、白手起家（不依賴現成模板，從最基礎處開始打造或學習）',
    exampleEn: 'Learning a new skill from scratch feels intimidating until you break it into smaller steps.',
    exampleZh: '從零開始學習一項新技能看似令人生畏，直到你將它拆解成微小的步驟。'
  },
  {
    regex: /\blearning\s+curve\b/i,
    lemma: 'learning curve',
    pos: 'phr.',
    phonetic: '/ˈlɝnɪŋ kɝv/',
    level: '科技與教育高頻詞組',
    meaning: '學習曲線（常搭配 steep learning curve，形容初期上手門檻高、需要密集投入的學習階段）',
    exampleEn: 'By focusing on the most frequent sub-skills, you can flatten the initial learning curve dramatically.',
    exampleZh: '透過專注於最高頻的核心子技能，你能大幅降低初期的學習曲線門檻。'
  },
  {
    regex: /\b(?:break|breaks|broke|broken|breaking)\s+(?:it\s+|them\s+|things\s+)?down\b/i,
    lemma: 'break down',
    pos: 'phr.',
    phonetic: '/breɪk daʊn/',
    level: '外商會議必備片語',
    meaning: '拆解、細分（把龐大複雜的問題或技能，拆解成可執行的小區塊，名詞即為 breakdown）',
    exampleEn: 'Let\'s break down this complex skill into four manageable components.',
    exampleZh: '讓我們把這項複雜的技能拆解成四個易於掌握的子部分。'
  },
  {
    regex: /\b(?:pick|picks|picked|picking)\s+(?:it\s+|them\s+)?up\b/i,
    lemma: 'pick up',
    pos: 'phr.',
    phonetic: '/pɪk‿ʌp/',
    level: '道地多義片語',
    meaning: '自然學會、上手（新技能或語言）；亦可指「拿起」或「順道接送」',
    exampleEn: 'Once you master those four chords, you can pick up hundreds of pop songs effortlessly.',
    exampleZh: '一旦你掌握這四個和弦，就能輕鬆上手數百首流行歌曲。'
  },
  {
    regex: /\b(?:stick|sticks|stuck|sticking)\s+with\b/i,
    lemma: 'stick with',
    pos: 'phr.',
    phonetic: '/stɪk wɪð/',
    level: '實用口語片語',
    meaning: '堅持下去、持續練習（不半途而廢，繼續維持同一個計畫或習慣）',
    exampleEn: 'Commit to practicing for at least twenty hours so you stick with it past the frustration barrier.',
    exampleZh: '承諾自己至少練習二十小時，讓自己能堅持度過初期的挫折門檻。'
  },
  {
    regex: /\b(?:boil|boils|boiled|boiling)\s+down\s+to\b/i,
    lemma: 'boil down to',
    pos: 'phr.',
    phonetic: '/bɔɪl daʊn tu/',
    level: 'C1 邏輯總結片語',
    meaning: '歸根究柢在於⋯、核心本質就是⋯（將複雜的現象濃縮提煉為最關鍵的原因）',
    exampleEn: 'At its core, training a neural network boils down to finding the right weights and biases.',
    exampleZh: '歸根究柢，訓練神經網路的核心本質就是找出正確的權重與偏差值。'
  },
  {
    regex: /\b(?:wrap|wraps|wrapped|wrapping)\s+(?:your|our|my|their|one's)\s+head\s+around\b/i,
    lemma: 'wrap one\'s head around',
    pos: 'phr.',
    phonetic: '/ræp jʊr hɛd əˈraʊnd/',
    level: '母語高頻慣用語',
    meaning: '徹底理解、想通（某個抽象或反直覺的複雜概念，科技教學與討論極常用）',
    exampleEn: 'It takes a moment to wrap your head around a 13,000-dimensional parameter space.',
    exampleZh: '你需要花點時間才能徹底理解一個高達一萬三千維度的參數空間。'
  },
  {
    regex: /\bunder\s+the\s+hood\b/i,
    lemma: 'under the hood',
    pos: 'phr.',
    phonetic: '/ˈʌndɚ ðə hʊd/',
    level: '科技工程必備慣用語',
    meaning: '在底層機制中、內部運作原理（原指汽車引擎蓋下，軟體與 AI 領域指系統底層架構）',
    exampleEn: 'Let\'s look under the hood to see how matrix multiplication powers each hidden layer.',
    exampleZh: '讓我們深入底層機制，看看矩陣乘法是如何驅動每一個隱藏層的。'
  },
  {
    regex: /\brule\s+of\s+thumb\b/i,
    lemma: 'rule of thumb',
    pos: 'phr.',
    phonetic: '/rul əv θʌm/',
    level: '商務與工程慣用語',
    meaning: '經驗法則、實用準則（不追求絕對精確，但在實務上非常管用的判斷標準）',
    exampleEn: 'As a general rule of thumb, simpler models generalize better when training data is limited.',
    exampleZh: '根據一般的經驗法則，當訓練資料有限時，較精簡的模型泛化能力更好。'
  },
  {
    regex: /\b(?:break|breaks|broke|broken|breaking)\s+new\s+ground\b/i,
    lemma: 'break new ground',
    pos: 'phr.',
    phonetic: '/breɪk nu ɡraʊnd/',
    level: 'C1 演講與商務片語',
    meaning: '開闢新天地、取得突破性創新（在未知的技術或科學領域率先開拓）',
    exampleEn: 'Generative AI tokens are helping researchers break new ground in protein folding and clean energy.',
    exampleZh: '生成式 AI 詞元正協助研究人員在蛋白質摺疊與潔淨能源領域開闢新天地。'
  },
  {
    regex: /\binflection\s+point(?:s)?\b/i,
    lemma: 'inflection point',
    pos: 'phr.',
    phonetic: '/ɪnˈflɛkʃən pɔɪnt/',
    level: '矽谷科技核心詞組',
    meaning: '轉折點、產業拐點（原為微積分反曲點，矽谷創投與執行長最常用來形容技術爆發的歷史性時刻）',
    exampleEn: 'Accelerated computing and generative AI have reached a historic inflection point.',
    exampleZh: '加速運算與生成式 AI 已經來到歷史性的產業轉折點。'
  },
  {
    regex: /\bfrom\s+the\s+ground\s+up\b/i,
    lemma: 'from the ground up',
    pos: 'phr.',
    phonetic: '/frʌm ðə ɡraʊnd ʌp/',
    level: '外商產品高頻片語',
    meaning: '從底層全新打造、徹頭徹尾重新設計（強調不是修補舊系統，而是從地基開始重構）',
    exampleEn: 'We redesigned the entire data center architecture from the ground up for AI reasoning.',
    exampleZh: '我們為了 AI 推理運算，從底層徹底重新設計了整個資料中心架構。'
  },
  {
    regex: /\b(?:scale|scales|scaled|scaling)\s+(?:up|out)\b/i,
    lemma: 'scale up / scale out',
    pos: 'phr.',
    phonetic: '/skeɪl ʌp/',
    level: '科技架構核心片語',
    meaning: '規模化擴展（scale up 為「垂直升級單機算力」，scale out 為「水平串聯多節點叢集擴展」）',
    exampleEn: 'You have to scale up the compute node first before you scale out across the data center.',
    exampleZh: '在水平擴展至整個資料中心之前，你必須先垂直升級單一運算節點的算力。'
  },
  {
    regex: /\bdigital\s+twin(?:s)?\b/i,
    lemma: 'digital twin',
    pos: 'phr.',
    phonetic: '/ˈdɪdʒətəl twɪn/',
    level: 'AI 與工業元宇宙術語',
    meaning: '數位孿生、數位雙生（在虛擬空間中 1:1 即時模擬真實世界工廠、城市或機器人的物理模型）',
    exampleEn: 'Every autonomous factory will operate inside a physically accurate digital twin before deployment.',
    exampleZh: '每座自動化工場在實際部署前，都會先在具備精準物理法則的「數位孿生」環境中運作。'
  },
  {
    regex: /\bphysical\s+AI\b/i,
    lemma: 'physical AI',
    pos: 'phr.',
    phonetic: '/ˈfɪzɪkəl ˌeɪˈaɪ/',
    level: '前沿 AI 核心術語',
    meaning: '實體 AI、物理具身智慧（能理解重力、摩擦力與三維空間物理法則，並驅動機器人與自駕車與真實世界互動的 AI）',
    exampleEn: 'The next wave of artificial intelligence is physical AI—AI that understands the laws of physics.',
    exampleZh: '人工智慧的下一波浪潮是「實體 AI」——能夠理解物理定律並與實體世界互動的 AI。'
  },
  {
    regex: /\b(?:take|takes|took|taken|taking)\s+a\s+moment\s+to\b/i,
    lemma: 'take a moment to',
    pos: 'phr.',
    phonetic: '/teɪk‿ə ˈmoʊmənt tu/',
    level: '演講引導句型',
    meaning: '花一點時間（細想、體會或感謝；演講者用來引導聽眾停下腳步、專注思考某個重點的經典開場）',
    exampleEn: 'I want you to take a moment to appreciate how effortlessly your visual cortex recognizes patterns.',
    exampleZh: '我希望你花一點時間細細體會：你的視覺皮質竟能如此毫不費力地辨識出圖形模式。'
  },
  {
    regex: /\bhave\s+no\s+trouble\b/i,
    lemma: 'have no trouble (+ V-ing)',
    pos: 'phr.',
    phonetic: '/hæv noʊ ˈtrʌbəl/',
    level: '實用口語結構',
    meaning: '毫不費力就能⋯、做⋯完全沒問題（後接動詞 V-ing，比單說 can easily V 更道地自然）',
    exampleEn: 'Even at a tiny 28x28 resolution, humans have no trouble recognizing the handwritten digit.',
    exampleZh: '即使在極低的 28x28 解析度下，人類依然能毫不費力地辨識出這個手寫數字。'
  },
  {
    regex: /\b(?:clear|clears|cleared|clearing)\s+the\s+way(?:\s+for)?\b/i,
    lemma: 'clear the way (for)',
    pos: 'phr.',
    phonetic: '/klɪr ðə weɪ/',
    level: 'B2 演講與商務片語',
    meaning: '為⋯鋪路、掃清障礙（讓後續的創新、發展或成果得以順利實現）',
    exampleEn: 'Automated perception systems are clearing the way for safer autonomous vehicles.',
    exampleZh: '自動化感知系統正為更安全的自動駕駛車輛鋪平道路。'
  },
  {
    regex: /\ball\s+at\s+once\b/i,
    lemma: 'all at once',
    pos: 'phr.',
    phonetic: '/ɔl‿æt wʌns/',
    level: '道地口語片語',
    meaning: '同時湧現、一下子全部發生（比 at the same time 更強調「令人措手不及地同時發生」）',
    exampleEn: 'New parents often feel overwhelmed because hundreds of new responsibilities arrive all at once.',
    exampleZh: '新手父母常感到不知所措，因為數百項新責任一下子同時湧現。'
  },
  {
    regex: /\bover\s*night\b/i,
    lemma: 'overnight',
    pos: 'adv./adj.',
    phonetic: '/ˌoʊvɚˈnaɪt/',
    level: 'B2 高頻生動表達',
    meaning: '一夕之間、瞬間翻轉（常用來形容生活、市場或技術發生劇烈且迅速的改變）',
    exampleEn: 'Becoming a parent changes your entire worldview and daily priorities overnight.',
    exampleZh: '成為父母會在一夕之間改變你的世界觀與日常優先順序。'
  },
  {
    regex: /\b(?:run|runs|ran|running)\s+(?:our|your|my|their|his|her|a|an)\s+(?:own\s+)?business(?:es)?\b/i,
    lemma: 'run a business',
    pos: 'phr.',
    phonetic: '/rʌn ə ˈbɪznəs/',
    level: '商務必學搭配詞',
    meaning: '經營企業、管理公司（注意英文「經營事業」道地動詞必用 run，切勿中式直譯為 open or play a business）',
    exampleEn: 'Running your own business from home requires strict boundaries and deliberate time management.',
    exampleZh: '在家經營自己的事業，需要嚴格的界線與刻意的時間管理。'
  },
  {
    regex: /\bseni?or\s+thesis\b/i,
    lemma: 'senior thesis',
    pos: 'n.',
    phonetic: '/ˈsinjɚ ˈθisɪs/',
    level: '校園與學術核心詞組',
    meaning: '大四畢業論文（美國大學稱大四為 senior year，畢業大型研究論文即為 senior thesis）',
    exampleEn: 'Writing a ninety-page senior thesis requires months of structured research and outlining.',
    exampleZh: '撰寫一篇長達九十頁的大四畢業論文，需要數個月有系統的研究與大綱規劃。'
  },
  {
    regex: /\b(?:am|is|are|was|were)\s+supposed\s+to\b/i,
    lemma: 'be supposed to',
    pos: 'phr.',
    phonetic: '/səˈpoʊzd tu/',
    level: '口語與職場極高頻',
    meaning: '按理應該要⋯、照規定或計畫必須⋯（注意連音讀作 /səˈpoʊstə/，常用於對比「原本應該做」與「實際卻沒做」）',
    exampleEn: 'You are supposed to spread the research across the entire semester, not cram it into two nights.',
    exampleZh: '你按理應該把研究進度分散到整個學期，而不是塞在最後兩個晚上趕完。'
  },
  {
    regex: /\bnot\s+an\s+option\b/i,
    lemma: 'not an option',
    pos: 'phr.',
    phonetic: '/nɑt‿ən ˈɑpʃən/',
    level: '職場果斷表達',
    meaning: '絕不可行、不在考慮範圍內（用來堅決表達某個做法行不通，例如 Failure is not an option）',
    exampleEn: 'For a mission-critical system, downtime is simply not an option.',
    exampleZh: '對於關鍵任務系統而言，停機是絕對不可行的。'
  },
  {
    regex: /\b(?:come|comes|came|coming)\s+along\b/i,
    lemma: 'come along',
    pos: 'phr.',
    phonetic: '/kʌm əˈlɔŋ/',
    level: '道地口語動詞片語',
    meaning: '（機會、挑戰或任務）出現、隨之到來；亦可指「進展順利」或「同行」',
    exampleEn: 'Whenever a major project came along, my carefully planned schedule went out the window.',
    exampleZh: '每當有大型專案出現時，我原本精心規劃的時程表就會瞬間破功。'
  },
  {
    regex: /\b(?:get|gets|got|getting)\s+started\b/i,
    lemma: 'get started',
    pos: 'phr.',
    phonetic: '/ɡɛt ˈstɑrtəd/',
    level: '口語高頻片語',
    meaning: '開始動工、著手進行（比單用動詞 start 更有「克服惰性、正式啟動」的行動感）',
    exampleEn: 'The hardest part of any complex project is simply sitting down to get started.',
    exampleZh: '任何複雜專案最困難的部分，往往只是坐下來開始動工的那一刻。'
  },
  {
    regex: /\b(?:get|gets|got|getting)\s+by\b/i,
    lemma: 'get by',
    pos: 'phr.',
    phonetic: '/ɡɛt baɪ/',
    level: 'B2 實用生活片語',
    meaning: '勉強過活、湊合著撐過去（指在資源、金錢或語言能力有限的情況下設法維持生活）',
    exampleEn: 'I returned Coke bottles for the five-cent deposits just to get by and buy food.',
    exampleZh: '我靠著退還可樂空瓶換取五美分押金，勉強維持生活買食物吃。'
  },
  {
    regex: /\b(?:put|puts|putting)\s+in\s+(?:the\s+)?(?:time|hours|work|effort)\b/i,
    lemma: 'put in (time / effort)',
    pos: 'phr.',
    phonetic: '/pʊt‿ɪn/',
    level: '職場與學習高頻片語',
    meaning: '投入、花費（時間、心力或苦工，強調腳踏實地累積實作時數）',
    exampleEn: 'If you put in twenty hours of focused deliberate practice, you will see remarkable progress.',
    exampleZh: '只要你投入二十小時專注的刻意練習，就會看見顯著的進步。'
  }
];

/**
 * Curated B2-C2 Professional, Academic & Tech Vocabulary Dictionary
 */
export const TUTOR_VOCAB = {
  commencement: {
    lemma: 'commencement',
    pos: 'n.',
    phonetic: '/kəˈmɛnsmənt/',
    level: 'C1 學術演講字彙',
    meaning: '畢業典禮（源自法語動詞 commence「開始」，英美大學稱畢業典禮為 commencement，寓意畢業不是結束，而是人生新篇章的「起點」）',
    exampleEn: 'At the Stanford commencement address, Steve Jobs shared three defining stories from his life.',
    exampleZh: '在史丹佛大學畢業典禮演講中，賈伯斯分享了他人生中三個關鍵的故事。'
  },
  honored: {
    lemma: 'honored',
    pos: 'adj.',
    phonetic: '/ˈɑnɚd/',
    level: 'B2 演講與商務禮儀',
    meaning: '深感榮幸的（演講與外商會議最經典的開場句型：I am honored to be with you today）',
    exampleEn: 'I am deeply honored to share our research findings with this global community.',
    exampleZh: '我深感榮幸能與這個全球社群分享我們的研究成果。'
  },
  graduate: {
    lemma: 'graduate',
    pos: 'v./n.',
    phonetic: '/ˈɡrædʒuˌeɪt/',
    level: 'B2 核心學術字彙',
    meaning: '畢業（動詞發音為 /-eɪt/，必搭配介系詞 graduate from + 學校；名詞「畢業生」發音則弱化為 /-ət/）',
    exampleEn: 'Although he never graduated from college, his curiosity shaped modern personal computing.',
    exampleZh: '儘管他從未大學畢業，他的好奇心卻形塑了現代個人電腦的樣貌。'
  },
  calligraphy: {
    lemma: 'calligraphy',
    pos: 'n.',
    phonetic: '/kəˈlɪɡrəfi/',
    level: 'C1 藝術與人文',
    meaning: '書法、優美的手寫字體藝術（字根拆解：希臘文 kalli-「美麗」+ -graphy「書寫、描繪」）',
    exampleEn: 'Reed College offered perhaps the finest calligraphy instruction in the entire country.',
    exampleZh: '里德學院當時提供了全美最頂尖的書法藝術課程。'
  },
  typography: {
    lemma: 'typography',
    pos: 'n.',
    phonetic: '/taɪˈpɑɡrəfi/',
    level: 'B2 設計與出版專業',
    meaning: '字體排印學、版面字型設計（研究字距、字重與視覺美感的專業領域，是現代 UI/UX 設計的基石）',
    exampleEn: 'Good typography makes complex digital interfaces feel effortless and pleasurable to read.',
    exampleZh: '優秀的字體排印設計，能讓複雜的數位介面讀起來毫不費力且賞心悅目。'
  },
  proportionally: {
    lemma: 'proportionally',
    pos: 'adv.',
    phonetic: '/prəˈpɔrʃənəli/',
    level: 'B2 學術與工程副詞',
    meaning: '成比例地、相應地（形容詞 proportional 常搭配 proportional to，指依字母寬度或數值大小按比例配置）',
    exampleEn: 'The Macintosh was the first personal computer with proportionally spaced fonts.',
    exampleZh: '麥金塔是史上第一台具備「成比例字距」優美字型的個人電腦。'
  },
  serendipity: {
    lemma: 'serendipity',
    pos: 'n.',
    phonetic: '/ˌsɛrənˈdɪpəti/',
    level: 'C2 進階高雅字彙',
    meaning: '意外發現珍寶的機緣、美麗的巧合（指在探索過程中，無意間獲得意外重大突破的好運與敏銳度）',
    exampleEn: 'Many scientific breakthroughs are born from a blend of rigorous preparation and serendipity.',
    exampleZh: '許多科學突破都誕生於嚴謹準備與「意外機緣（serendipity）」的交會。'
  },
  intuition: {
    lemma: 'intuition',
    pos: 'n.',
    phonetic: '/ˌɪntuˈɪʃən/',
    level: 'B2 思維與認知核心',
    meaning: '直覺、直觀理解力（不經繁瑣推理就能洞察事物本質的敏銳語感或專業直覺；形容詞為 intuitive）',
    exampleEn: 'Building visual intuition for linear algebra makes deep learning much easier to grasp.',
    exampleZh: '建立對線性代數的「直觀理解」，能讓深度學習變得更容易掌握。'
  },
  dogma: {
    lemma: 'dogma',
    pos: 'n.',
    phonetic: '/ˈdɔɡmə/',
    level: 'C1 思辨與哲學字彙',
    meaning: '教條、僵化的信條（指不經獨立思考便盲目接受的既有規矩或他人成見；形容詞為 dogmatic）',
    exampleEn: 'Don\'t be trapped by dogma—which is living with the results of other people\'s thinking.',
    exampleZh: '不要被「教條」所困——那等同於活在別人思考框架的結果之中。'
  },
  retrospect: {
    lemma: 'retrospect',
    pos: 'n.',
    phonetic: '/ˈrɛtrəˌspɛkt/',
    level: 'C1 高頻搭配詞',
    meaning: '回顧、回想（字根 retro-「向後」+ spect「看」；極常以片語 in retrospect「事後回想起來」出現）',
    exampleEn: 'In retrospect, getting fired from Apple was the best thing that could have ever happened to me.',
    exampleZh: '事後回想起來，被蘋果開除反而是我人生中發生過最棒的一件事。'
  },
  procrastinator: {
    lemma: 'procrastinator',
    pos: 'n.',
    phonetic: '/prəˈkræstəˌneɪtɚ/',
    level: 'C1 心理與行為字彙',
    meaning: '拖延症患者、習慣拖延的人（動詞 procrastinate 源自拉丁文 pro-「往後推」+ crastinus「屬於明天的」）',
    exampleEn: 'Inside the mind of a master procrastinator, an instant-gratification monkey frequently takes the wheel.',
    exampleZh: '在重度拖延症患者的大腦裡，一隻「即時享樂猴」經常搶走方向盤。'
  },
  procrastination: {
    lemma: 'procrastination',
    pos: 'n.',
    phonetic: '/prəˌkræstəˈneɪʃən/',
    level: 'B2 職場與心理核心',
    meaning: '拖延、拖延症（明知某事重要卻一再延後執行的行為模式）',
    exampleEn: 'Long-term procrastination often stems from fear of failure rather than simple laziness.',
    exampleZh: '長期的拖延往往源於對失敗的恐懼，而非單純的懶惰。'
  },
  gratification: {
    lemma: 'gratification',
    pos: 'n.',
    phonetic: '/ˌɡrætəfəˈkeɪʃən/',
    level: 'C1 進階名詞',
    meaning: '滿足感、喜悅（動詞 gratify；常對比 instant gratification「即時滿足」與 delayed gratification「延宕滿足」）',
    exampleEn: 'Mastering a complex skill requires choosing delayed gratification over short-term comfort.',
    exampleZh: '精通一項複雜技能，需要選擇「延遲滿足」而非短期的安逸。'
  },
  rational: {
    lemma: 'rational',
    pos: 'adj.',
    phonetic: '/ˈræʃənəl/',
    level: 'B2 邏輯與思辨核心',
    meaning: '理性的、合理的（具備邏輯規劃與長遠判斷能力的；反義詞為 irrational「非理性的」）',
    exampleEn: 'A rational decision-maker evaluates long-term impact rather than reacting to immediate impulses.',
    exampleZh: '理性的決策者會評估長期影響，而非受眼前的衝動左右。'
  },
  epiphany: {
    lemma: 'epiphany',
    pos: 'n.',
    phonetic: '/ɪˈpɪfəni/',
    level: 'C2 進階亮點字彙',
    meaning: '頓悟、醍醐灌頂的靈光乍現（突然看清某個深刻真相或找到關鍵解答的瞬間）',
    exampleEn: 'Viewing the life calendar triggered an epiphany about how precious each remaining week truly is.',
    exampleZh: '看到那張人生週曆的瞬間，帶來了一場醍醐灌頂的頓悟，讓人意識到剩下的每一週有多珍貴。'
  },
  spectator: {
    lemma: 'spectator',
    pos: 'n.',
    phonetic: '/ˈspɛkteɪtɚ/',
    level: 'B2 核心字彙',
    meaning: '旁觀者、觀眾（字根 spect「看」；演講中常用來比喻只在一旁觀看自己人生流逝、卻未主動採取行動的人）',
    exampleEn: 'Don\'t become a passive spectator of your own ambitions while the years slip by.',
    exampleZh: '別在歲月流逝時，成了自己人生抱負的被動旁觀者。'
  },
  civil: {
    lemma: 'civil',
    pos: 'adj.',
    phonetic: '/ˈsɪvəl/',
    level: 'B2 多義高雅字彙',
    meaning: '體面的、文明有秩序的（除「公民的」之外，口語說 things stay civil 幽默指「生活還維持著體面與秩序，尚未陷入熬夜崩潰」）',
    exampleEn: 'When we distribute tasks evenly across the sprint, everything gets done and things stay civil.',
    exampleZh: '當我們把任務平均分配到衝刺週期中，所有事情都能順利完成，工作節奏也依然從容體面。'
  },
  workflow: {
    lemma: 'workflow',
    pos: 'n.',
    phonetic: '/ˈwɝkˌfloʊ/',
    level: '職場與科技高頻字',
    meaning: '工作流程、作業工序（指完成一項任務或專案的標準步驟與節奏）',
    exampleEn: 'Automating repetitive testing steps streamlined our entire engineering workflow.',
    exampleZh: '將重複性的測試步驟自動化，精簡了我們整個工程開發的工作流程。'
  },
  priority: {
    lemma: 'priority',
    pos: 'n.',
    phonetic: '/praɪˈɔrəti/',
    level: 'B2 職場必備核心字',
    meaning: '優先事項、第一要務（常見搭配：top priority 首要之務、set priorities 排定優先順序）',
    exampleEn: 'When a crisis hits, all of your daily priorities shift immediately.',
    exampleZh: '當危機發生時，你所有的日常優先順序都會立即改變。'
  },
  process: {
    lemma: 'process',
    pos: 'v./n.',
    phonetic: '/ˈprɑsɛs/',
    level: 'B2 多義核心字彙',
    meaning: '（心理上）消化、理解（重大變化或大量資訊）；處理（資料）（作名詞為「過程」，作及物動詞指大腦消化龐大衝擊）',
    exampleEn: 'Life changes so rapidly that it can be difficult to process everything at once.',
    exampleZh: '生活變化得如此迅速，有時讓人很難一下子消化所有改變。'
  },
  outfit: {
    lemma: 'outfit',
    pos: 'n.',
    phonetic: '/ˈaʊtfɪt/',
    level: 'B2 實用生活字彙',
    meaning: '全套服裝、穿搭（指搭配好的一整套衣著，比 clothes 更具體指「一套造型」）',
    exampleEn: 'Choosing the right outfit for a keynote presentation helps project confidence on stage.',
    exampleZh: '為主題演講挑選合適的穿搭，有助於在舞台上展現自信。'
  },
  frustration: {
    lemma: 'frustration',
    pos: 'n.',
    phonetic: '/frʌˈstreɪʃən/',
    level: 'B2 心理與學習高頻',
    meaning: '挫折感、沮喪（Josh Kaufman 提出阻礙大人學新技能的最大障礙不是智力，而是初期的 frustration barrier「挫折屏障」）',
    exampleEn: 'The biggest obstacle to rapid skill acquisition isn\'t intellectual—it\'s the emotional frustration barrier.',
    exampleZh: '快速掌握技能的最大阻礙並非智力問題，而是情緒上的「挫折屏障」。'
  },
  deconstruct: {
    lemma: 'deconstruct',
    pos: 'v.',
    phonetic: '/ˌdikənˈstrʌkt/',
    level: 'C1 方法論核心動詞',
    meaning: '拆解、解構（字首 de-「拆開」+ construct「建構」；指將龐大技能或系統拆解為最關鍵的核心構造）',
    exampleEn: 'The first step to learning anything quickly is to deconstruct the skill into its smallest sub-skills.',
    exampleZh: '快速學會任何事物的第一步，就是將該技能「解構」為最小的子技能。'
  },
  acquisition: {
    lemma: 'acquisition',
    pos: 'n.',
    phonetic: '/ˌækwəˈzɪʃən/',
    level: 'B2 商務與認知核心',
    meaning: '習得、獲得；企業併購（動詞 acquire；skill acquisition 指「技能習得」，language acquisition 指「語言習得」）',
    exampleEn: 'Deliberate practice accelerates skill acquisition far more effectively than passive reading.',
    exampleZh: '刻意練習能比被動閱讀更有效地加速「技能習得」。'
  },
  tremendous: {
    lemma: 'tremendous',
    pos: 'adj.',
    phonetic: '/trəˈmɛndəs/',
    level: 'B2 演講強調形容詞',
    meaning: '極大的、驚人的、非常棒的（演講者極常用來取代 big / great，增強語氣張力與專業感）',
    exampleEn: 'Focusing on just twenty hours of deliberate practice yields a tremendous return on effort.',
    exampleZh: '專注投入短短二十小時的刻意練習，就能帶來極為驚人的成果回報。'
  },
  entrepreneur: {
    lemma: 'entrepreneur',
    pos: 'n.',
    phonetic: '/ˌɑntrəprəˈnɝ/',
    level: 'B2 商務與創業必備',
    meaning: '創業家、企業家（源自法語，注意字尾發音為 /-ˈnɝ/；衍生字 entrepreneurship 指「創業精神」）',
    exampleEn: 'As an entrepreneur, your scarcest resource is always focused, uninterrupted time.',
    exampleZh: '身為創業者，你最稀缺的資源永遠是專注且不受打擾的時間。'
  },
  barrier: {
    lemma: 'barrier',
    pos: 'n.',
    phonetic: '/ˈbæriɚ/',
    level: 'B2 高頻核心字彙',
    meaning: '障礙、壁壘、門檻（常見搭配：language barrier 語言隔閡、barrier to entry 進入門檻、frustration barrier 挫折門檻）',
    exampleEn: 'Removing distractions before you sit down to practice lowers the barrier to getting started.',
    exampleZh: '在坐下來練習前先移除分心物，能大幅降低開始行動的門檻。'
  },
  competent: {
    lemma: 'competent',
    pos: 'adj.',
    phonetic: '/ˈkɑmpətənt/',
    level: 'B2 職場評鑑核心字',
    meaning: '能勝任的、具備足夠能力的（名詞 competence 指「專業職能、勝任力」）',
    exampleEn: 'It takes ten thousand hours to reach world-class mastery, but only twenty hours to become reasonably competent.',
    exampleZh: '達到世界級大師水準需要一萬小時，但達到「能勝任、表現得體」的水準只需二十小時。'
  },
  sloppily: {
    lemma: 'sloppily',
    pos: 'adv.',
    phonetic: '/ˈslɑpəli/',
    level: 'C1 生動描寫副詞',
    meaning: '潦草地、馬虎隨便地（形容詞 sloppy 常形容字跡潦草 sloppy handwriting 或程式碼寫得馬虎 sloppy code）',
    exampleEn: 'Even when a digit is sloppily written at low resolution, the human visual cortex decodes it instantly.',
    exampleZh: '即使一個數字在低解析度下寫得極為潦草，人類的視覺皮質依然能瞬間解碼辨識。'
  },
  effortlessly: {
    lemma: 'effortlessly',
    pos: 'adv.',
    phonetic: '/ˈɛfɚtləsli/',
    level: 'B2 優美高頻副詞',
    meaning: '毫不費力地、輕鬆自如地（effort「努力」+ -less「無」+ -ly，形容高超技術或大腦運作行雲流水）',
    exampleEn: 'Our brains process millions of visual signals effortlessly every single second.',
    exampleZh: '我們的大腦每一秒都在毫不費力地處理數百萬個視覺訊號。'
  },
  appreciate: {
    lemma: 'appreciate',
    pos: 'v.',
    phonetic: '/əˈpriʃiˌeɪt/',
    level: 'B2 多義必學動詞',
    meaning: '細細體會、充分意識到（其價值或難度）；感謝；增值（在演講中說 appreciate how crazy it is 意為「深刻體會這有多麼不可思議」，而非單純道謝）',
    exampleEn: 'Studying neuroscience helps us appreciate just how sophisticated human vision really is.',
    exampleZh: '研究神經科學能幫助我們深刻體會人類視覺系統究竟有多麼精密。'
  },
  recognize: {
    lemma: 'recognize',
    pos: 'v.',
    phonetic: '/ˈrɛkəɡˌnaɪz/',
    level: 'B2 認知與 AI 核心動詞',
    meaning: '辨識出、認出；承認（衍生字 recognizable「可辨識的」、pattern recognition「模式辨識」）',
    exampleEn: 'A well-trained neural network can recognize handwritten digits with over 99% accuracy.',
    exampleZh: '訓練精良的神經網路能以超過 99% 的準確率辨識手寫數字。'
  },
  recognizable: {
    lemma: 'recognizable',
    pos: 'adj.',
    phonetic: '/ˈrɛkəɡˌnaɪzəbəl/',
    level: 'B2 進階形容詞',
    meaning: '可辨識的、認得出來的（動詞 recognize + -able「能夠被⋯的」）',
    exampleEn: 'Despite entirely different pixel values, all three images remain instantly recognizable as the number three.',
    exampleZh: '儘管像素數值截然不同，這三張影像依然能瞬間被辨識為數字 3。'
  },
  distinct: {
    lemma: 'distinct',
    pos: 'adj.',
    phonetic: '/dɪˈstɪŋkt/',
    level: 'B2 學術與精準描述',
    meaning: '截然不同的、獨特分明的（強調兩者之間界線清晰、毫不混淆；名詞為 distinction）',
    exampleEn: 'The visual cortex separates similar patterns into distinct conceptual categories.',
    exampleZh: '視覺皮質能將相似的圖案區分為截然不同的概念類別。'
  },
  trivial: {
    lemma: 'trivial',
    pos: 'adj.',
    phonetic: '/ˈtrɪviəl/',
    level: 'C1 科技與學術高頻字',
    meaning: '輕而易舉的、微不足道的（工程師與數學家極常用 non-trivial 來形容「絕非顯而易見、頗具技術難度的問題」）',
    exampleEn: 'What feels trivial to the human brain can be dauntingly difficult to express as explicit code.',
    exampleZh: '對人類大腦而言輕而易舉的事，若要寫成明確的程式規則卻可能困難重重。'
  },
  dauntingly: {
    lemma: 'dauntingly',
    pos: 'adv.',
    phonetic: '/ˈdɔntɪŋli/',
    level: 'C1 高階修辭副詞',
    meaning: '令人望而生畏地、氣勢逼人地（形容詞 daunting 指任務龐大艱鉅，讓人還沒開始就感到敬畏）',
    exampleEn: 'Writing explicit rules to recognize handwriting quickly becomes a dauntingly complex task.',
    exampleZh: '試圖撰寫明確規則來辨識手寫字，很快就會變成一項令人望而生畏的複雜任務。'
  },
  comically: {
    lemma: 'comically',
    pos: 'adv.',
    phonetic: '/ˈkɑmɪkli/',
    level: 'C1 生動修辭副詞',
    meaning: '荒謬可笑地、滑稽地（用來形成強烈反差，如 comically trivial「簡單到好笑」）',
    exampleEn: 'Without machine learning, our hand-coded image classifier performed comically poorly.',
    exampleZh: '在沒有機器學習的情況下，我們手寫規則的影像分類器表現得差勁到令人發笑。'
  },
  resolution: {
    lemma: 'resolution',
    pos: 'n.',
    phonetic: '/ˌrɛzəˈluʃən/',
    level: 'B2 科技與商務多義字',
    meaning: '（影像）解析度；決心；問題的解決方案（多義核心字：28x28 resolution 指解析度，conflict resolution 指衝突解決）',
    exampleEn: 'Each training image in the MNIST dataset is rendered at a resolution of 28 by 28 pixels.',
    exampleZh: 'MNIST 資料集中的每張訓練影像，皆以 28×28 像素的解析度呈現。'
  },
  cortex: {
    lemma: 'cortex',
    pos: 'n.',
    phonetic: '/ˈkɔrtɛks/',
    level: 'C1 神經科學與 AI 術語',
    meaning: '大腦皮質（如 visual cortex「視覺皮質」、prefrontal cortex「前額葉皮質」，是人工神經網路最初的靈感來源）',
    exampleEn: 'Convolutional neural networks were originally inspired by how the biological visual cortex processes edges.',
    exampleZh: '卷積神經網路最初的靈感，正是來自生物「視覺皮質」處理邊緣特徵的方式。'
  },
  activation: {
    lemma: 'activation',
    pos: 'n.',
    phonetic: '/ˌæktəˈveɪʃən/',
    level: 'AI 與深度學習核心',
    meaning: '激活值、活化程度（神經網路中每個神經元輸出的數值，介於 0 到 1 或經 ReLU/Sigmoid 轉換後的活躍度）',
    exampleEn: 'The activations in one layer directly determine the activation patterns of the next layer.',
    exampleZh: '前一層神經元的「激活值」，會直接決定下一層神經元的活化模式。'
  },
  sigmoid: {
    lemma: 'sigmoid',
    pos: 'n./adj.',
    phonetic: '/ˈsɪɡmɔɪd/',
    level: 'AI 數學核心術語',
    meaning: 'S 型函數（Sigmoid function，能將任意實數平滑壓縮至 0 與 1 之間的經典神經網路激活函數）',
    exampleEn: 'The sigmoid function squishes any real number into a clean range between zero and one.',
    exampleZh: 'Sigmoid 函數能將任何實數平滑壓縮到 0 與 1 之間的範圍。'
  },
  parameter: {
    lemma: 'parameter',
    pos: 'n.',
    phonetic: '/pəˈræmətɚ/',
    level: 'B2 科技與工程必備',
    meaning: '參數（AI 模型中可訓練調整的權重 weights 與偏差值 biases 總稱，注意重音在第二音節 /-ˈræm-/）',
    exampleEn: 'Modern large language models tune billions of parameters to capture subtle linguistic patterns.',
    exampleZh: '現代大型語言模型透過微調數百億個「參數」，來捕捉細膩的語言規律。'
  },
  gradient: {
    lemma: 'gradient',
    pos: 'n.',
    phonetic: '/ˈɡreɪdiənt/',
    level: 'AI 與微積分核心字',
    meaning: '梯度、斜率變化率（深度學習透過 gradient descent「梯度下降法」找出讓損失函數最小化的參數方向）',
    exampleEn: 'By computing the negative gradient of the cost function, the network learns how to improve step by step.',
    exampleZh: '透過計算成本函數的負「梯度」，神經網路得以學會如何一步步自我優化。'
  },
  abstraction: {
    lemma: 'abstraction',
    pos: 'n.',
    phonetic: '/æbˈstrækʃən/',
    level: 'C1 軟體架構與思維核心',
    meaning: '抽象化、抽象層（將底層複雜細節封裝起來，以更高層次的概念進行思考或系統設計）',
    exampleEn: 'Good software engineering relies on clean layers of abstraction so teams can build at scale.',
    exampleZh: '優秀的軟體工程仰賴清晰的「抽象層」設計，讓團隊得以大規模協作開發。'
  },
  frontier: {
    lemma: 'frontier',
    pos: 'n.',
    phonetic: '/frʌnˈtɪr/',
    level: 'B2 科技與演講高頻',
    meaning: '前沿、新領域、邊疆（AI 領域常說 frontier models「最前沿頂尖模型」或 a new frontier「全新未知的疆界」）',
    exampleEn: 'Token generation has opened a new frontier in scientific discovery and industrial automation.',
    exampleZh: '詞元生成技術已為科學探索與工業自動化開闢了全新的前沿領域。'
  },
  harness: {
    lemma: 'harness',
    pos: 'v.',
    phonetic: '/ˈhɑrnəs/',
    level: 'C1 演講與科技精準動詞',
    meaning: '善用、駕馭、將（強大的自然力或新技術）轉化為可用動能（比 use 更具掌控力與專業感）',
    exampleEn: 'Researchers are harnessing accelerated computing to simulate climate systems at kilometer resolution.',
    exampleZh: '研究人員正「善用／駕馭」加速運算技術，以公里級的高解析度模擬全球氣候系統。'
  },
  decipher: {
    lemma: 'decipher',
    pos: 'v.',
    phonetic: '/dɪˈsaɪfɚ/',
    level: 'C1 科學與解析高階動詞',
    meaning: '破譯、解讀、解碼（密碼、基因序列或深奧難懂的訊號；字根 cipher 指密碼）',
    exampleEn: 'Foundation models in biology are helping scientists decipher the complex language of proteins and DNA.',
    exampleZh: '生物學領域的基礎模型，正協助科學家「破譯」蛋白質與 DNA 的複雜語言。'
  },
  tirelessly: {
    lemma: 'tirelessly',
    pos: 'adv.',
    phonetic: '/ˈtaɪɚləsli/',
    level: 'B2 演講修辭副詞',
    meaning: '不知疲倦地、孜孜不倦地（形容全天候運作的 AI 代理人或敬業團隊）',
    exampleEn: 'Autonomous AI agents work tirelessly in the background to monitor infrastructure health.',
    exampleZh: '自主 AI 代理人在後台不知疲倦地運作，全天候監控基礎設施的健康狀態。'
  },
  navigate: {
    lemma: 'navigate',
    pos: 'v.',
    phonetic: '/ˈnævəˌɡeɪt/',
    level: 'B2 科技與商務雙棲動詞',
    meaning: '導航、穿梭於（實體空間）；妥善應對、駕馭（複雜的局勢或挑戰）',
    exampleEn: 'Embodied robots must navigate dynamic physical environments safely alongside humans.',
    exampleZh: '具身智慧機器人必須能與人類並肩，安全地穿梭於動態的實體環境中。'
  },
  simulation: {
    lemma: 'simulation',
    pos: 'n.',
    phonetic: '/ˌsɪmjəˈleɪʃən/',
    level: 'B2 科學與工程核心',
    meaning: '模擬、仿真（動詞 simulate；在電腦中重現物理法則或系統行為，是訓練機器人與氣候預測的核心）',
    exampleEn: 'In virtual simulation, a robot can accumulate ten years of driving experience in a single afternoon.',
    exampleZh: '在虛擬「模擬」環境中，機器人只需一個下午就能累積相當於十年的駕駛經驗。'
  },
  revolutionize: {
    lemma: 'revolutionize',
    pos: 'v.',
    phonetic: '/ˌrɛvəˈluʃəˌnaɪz/',
    level: 'B2 科技趨勢核心動詞',
    meaning: '徹底革新、帶來革命性改變（比 change 或 improve 強烈得多，指顛覆既有工作流程）',
    exampleEn: 'Agentic coding tools are poised to revolutionize how software engineers architect and ship systems.',
    exampleZh: '代理式程式開發工具正準備徹底革新軟體工程師設計與交付系統的方式。'
  },
  inflection: {
    lemma: 'inflection',
    pos: 'n.',
    phonetic: '/ɪnˈflɛkʃən/',
    level: 'C1 矽谷科技核心字',
    meaning: '轉折、反曲、語調起伏（科技演講最常搭配 inflection point，指產業成長曲線急遽躍升的關鍵拐點）',
    exampleEn: 'Every decade brings a major platform inflection that reshapes the entire computing industry.',
    exampleZh: '每十年都會迎來一次重大的平台「轉折（拐點）」，重塑整個運算產業的版圖。'
  },
  architecture: {
    lemma: 'architecture',
    pos: 'n.',
    phonetic: '/ˈɑrkəˌtɛktʃɚ/',
    level: 'B2 科技與系統設計核心',
    meaning: '系統架構、底層架構（原指建築學，科技領域指晶片、軟體或神經網路的結構設計；動詞亦可作 architect）',
    exampleEn: 'A unified system architecture allows GPUs, CPUs, and networking switches to operate as one giant computer.',
    exampleZh: '統一的「系統架構」讓 GPU、CPU 與網路交換器能協同運作為一台巨型電腦。'
  },
  throughput: {
    lemma: 'throughput',
    pos: 'n.',
    phonetic: '/ˈθrupʊt/',
    level: 'C1 系統工程專業字',
    meaning: '吞吐量、單位時間處理量（衡量 AI 推論伺服器每秒能生成多少 tokens 或處理多少資料的核心指標）',
    exampleEn: 'Optimizing memory bandwidth directly increases token generation throughput while lowering cost per query.',
    exampleZh: '最佳化記憶體頻寬能直接提升詞元生成的「吞吐量」，同時降低每次查詢的成本。'
  },
  amortize: {
    lemma: 'amortize',
    pos: 'v.',
    phonetic: '/ˈæmɚˌtaɪz/',
    level: 'C2 財務與工程高階字',
    meaning: '攤銷、分攤（成本或運算開銷；工程與商務中指將龐大的初期投資分攤到長期的巨量產出中）',
    exampleEn: 'High inference throughput allows data centers to amortize hardware capital costs across billions of tokens.',
    exampleZh: '極高的推論吞吐量，讓資料中心能將硬體資本支出「分攤（攤銷）」到數十億個詞元產出上。'
  },
  autonomous: {
    lemma: 'autonomous',
    pos: 'adj.',
    phonetic: '/ɔˈtɑnəməs/',
    level: 'B2 AI 與機器人核心字',
    meaning: '自主運作的、自動駕駛的（字根 auto-「自己」+ nomos「法則」；名詞為 autonomy「自主性」）',
    exampleEn: 'Autonomous agents can break down high-level goals, invoke tools, and verify their own outputs.',
    exampleZh: '「自主」AI 代理人能將高階目標拆解、呼叫工具，並自行驗證產出結果。'
  },
  inference: {
    lemma: 'inference',
    pos: 'n.',
    phonetic: '/ˈɪnfərəns/',
    level: 'AI 與機器學習核心字',
    meaning: '（AI 模型）推論、推理（指訓練完成的模型實際接收提問並生成答案與 tokens 的運算過程；動詞為 infer）',
    exampleEn: 'Real-time AI inference requires both massive memory bandwidth and ultra-low latency.',
    exampleZh: '即時 AI「推論」同時需要龐大的記憶體頻寬與極低的延遲。'
  },
  infrastructure: {
    lemma: 'infrastructure',
    pos: 'n.',
    phonetic: '/ˈɪnfrəˌstrʌktʃɚ/',
    level: 'B2 科技與產業必備',
    meaning: '基礎設施、底層基礎建設（字首 infra-「在底下」+ structure「結構」；如 AI infrastructure、cloud infrastructure）',
    exampleEn: 'Cloud providers are investing hundreds of billions of dollars into next-generation AI infrastructure.',
    exampleZh: '雲端服務商正投入數千億美元建置下一代 AI「基礎設施」。'
  },
  accelerate: {
    lemma: 'accelerate',
    pos: 'v.',
    phonetic: '/ækˈsɛləˌreɪt/',
    level: 'B2 科技與商務核心動詞',
    meaning: '加速、促進（衍生詞 accelerated computing「加速運算」指以 GPU 協同 CPU 進行大規模平行運算）',
    exampleEn: 'Accelerated computing has dramatically reduced the time needed to train foundation models.',
    exampleZh: '「加速」運算大幅縮短了訓練基礎模型所需的時間。'
  },
  neuron: {
    lemma: 'neuron',
    pos: 'n.',
    phonetic: '/ˈnʊrɑn/',
    level: 'B2 神經科學與深度學習',
    meaning: '神經元（神經網路的基本運算單元，負責接收上一層輸入、加權求和並透過激活函數輸出訊號）',
    exampleEn: 'In a simple neural network, each neuron holds an activation number between zero and one.',
    exampleZh: '在簡單的神經網路中，每個「神經元」都保有一個介於 0 到 1 之間的激活數值。'
  },
  intelligence: {
    lemma: 'intelligence',
    pos: 'n.',
    phonetic: '/ɪnˈtɛlədʒəns/',
    level: 'B2 核心科技與認知名詞',
    meaning: '智慧、智能（科技語境指 Artificial Intelligence「人工智慧」或數位智能，而非軍事情報）',
    exampleEn: 'Modern AI factories transform electricity and data into digital intelligence at scale.',
    exampleZh: '現代 AI 工廠將電力與資料大規模轉化為數位「智能」。'
  },
  integrate: {
    lemma: 'integrate',
    pos: 'v.',
    phonetic: '/ˈɪntəˌɡreɪt/',
    level: 'B2 工程與商務高頻動詞',
    meaning: '整合、融入（常搭配 integrate A into/with B，將不同軟硬體系統無縫結合成整體；名詞為 integration）',
    exampleEn: 'We integrated the new reasoning model directly into our developer workflow.',
    exampleZh: '我們將新的推理模型直接「整合」進開發者的工作流程中。'
  },
  foundation: {
    lemma: 'foundation',
    pos: 'n.',
    phonetic: '/faʊnˈdeɪʃən/',
    level: 'B2 學術與 AI 核心字',
    meaning: '基礎、根基；基金會（AI 領域常說 foundation models「基礎大模型」，指可微調應用於萬物的底層模型）',
    exampleEn: 'Linear algebra provides the mathematical foundation for all modern machine learning.',
    exampleZh: '線性代數為所有現代機器學習提供了數學「基礎」。'
  },
  algorithm: {
    lemma: 'algorithm',
    pos: 'n.',
    phonetic: '/ˈælɡəˌrɪðəm/',
    level: 'B2 資訊科學必備字',
    meaning: '演算法（電腦解決特定問題或執行運算的明確邏輯步驟；形容詞為 algorithmic）',
    exampleEn: 'Backpropagation is the core algorithm for computing how a neural network should adjust its weights.',
    exampleZh: '反向傳播是計算神經網路應如何調整權重的核心「演算法」。'
  },
  capability: {
    lemma: 'capability',
    pos: 'n.',
    phonetic: '/ˌkeɪpəˈbɪləti/',
    level: 'B2 職場與產品高頻字',
    meaning: '能力、功能特性（常用複數 capabilities 指系統、產品或模型所具備的「進階功能與實力」）',
    exampleEn: 'Multimodal reasoning capabilities allow the model to understand audio, video, and code simultaneously.',
    exampleZh: '多模態推理「能力」讓模型能同時理解音訊、影片與程式碼。'
  },
  enterprise: {
    lemma: 'enterprise',
    pos: 'n.',
    phonetic: '/ˈɛntɚˌpraɪz/',
    level: 'B2 商務與外商核心字',
    meaning: '大型企業、企業級應用（外商常說 enterprise software「企業級軟體」，強調高安全性與大規模部署能力）',
    exampleEn: 'Every global enterprise is now building custom AI agents tailored to its own domain data.',
    exampleZh: '每家全球大型「企業」如今都在打造專屬自身領域資料的客製化 AI 代理人。'
  },
  generative: {
    lemma: 'generative',
    pos: 'adj.',
    phonetic: '/ˈdʒɛnəˌreɪtɪv/',
    level: 'B2 當代科技核心字',
    meaning: '生成式的、具創造產出能力的（源自動詞 generate；如 generative AI「生成式 AI」）',
    exampleEn: 'Generative AI has shifted computing from retrieving pre-recorded files to generating answers on the fly.',
    exampleZh: '「生成式」AI 已將運算模式從檢索預存檔案，轉變為即時生成解答。'
  },
  ultimately: {
    lemma: 'ultimately',
    pos: 'adv.',
    phonetic: '/ˈʌltəmətli/',
    level: 'B2 演講邏輯收斂副詞',
    meaning: '歸根結底、最終（演講者在鋪陳多個論點後，用來引出「最根本的核心結論」）',
    exampleEn: 'Ultimately, the quality of your questions determines the quality of your learning.',
    exampleZh: '「歸根結底」，你提問的品質決定了你學習的品質。'
  },
  supercomputer: {
    lemma: 'supercomputer',
    pos: 'n.',
    phonetic: '/ˈsupɚkəmˌpjutɚ/',
    level: 'B2 科技與硬體核心字',
    meaning: '超級電腦（由數千至數萬顆高速互連晶片組成、具備極致算力的運算叢集）',
    exampleEn: 'An entire AI data center now functions as a single giant AI supercomputer.',
    exampleZh: '整座 AI 資料中心如今就像一台單一的巨型 AI「超級電腦」般運作。'
  },
  partnership: {
    lemma: 'partnership',
    pos: 'n.',
    phonetic: '/ˈpɑrtnɚˌʃɪp/',
    level: 'B2 商務合作核心字',
    meaning: '夥伴關係、策略合作（常搭配 form/announce a strategic partnership with「與⋯建立策略合作夥伴關係」）',
    exampleEn: 'We announced a deep engineering partnership to bring accelerated computing to telecommunications.',
    exampleZh: '我們宣布了一項深度工程「合作夥伴關係」，將加速運算導入電信產業。'
  },
  essentially: {
    lemma: 'essentially',
    pos: 'adv.',
    phonetic: '/ɪˈsɛnʃəli/',
    level: 'B2 演講解釋高頻副詞',
    meaning: '本質上、說穿了就是（演講者將複雜技術概念化繁為簡、用一句白話解釋核心本質時的必備轉折詞）',
    exampleEn: 'A neural network is essentially a mathematical function that maps inputs to predictions.',
    exampleZh: '神經網路「本質上」就是一個將輸入映射到預測結果的數學函數。'
  },
  enormous: {
    lemma: 'enormous',
    pos: 'adj.',
    phonetic: '/ɪˈnɔrməs/',
    level: 'B2 強勢形容詞',
    meaning: '極為龐大的、巨量的（語氣比 big 強烈許多，常修飾 enormous amount of data / potential）',
    exampleEn: 'Training frontier models requires an enormous amount of compute and clean data.',
    exampleZh: '訓練最前沿的模型需要「極為龐大」的算力與乾淨資料。'
  },
  efficiency: {
    lemma: 'efficiency',
    pos: 'n.',
    phonetic: '/ɪˈfɪʃənsi/',
    level: 'B2 工程與商務必備字',
    meaning: '效率、效能（常見搭配：energy efficiency 能源效率、operational efficiency 營運效率；形容詞為 efficient）',
    exampleEn: 'Co-designing chips and software together delivers a tenfold leap in energy efficiency.',
    exampleZh: '將晶片與軟體協同設計，能帶來十倍的能源「效率」躍升。'
  },
  confidential: {
    lemma: 'confidential',
    pos: 'adj.',
    phonetic: '/ˌkɑnfəˈdɛnʃəl/',
    level: 'B2 商務資安核心字',
    meaning: '機密的、保密的（常見搭配：confidential computing 機密運算、strictly confidential 絕對機密）',
    exampleEn: 'Confidential computing ensures that sensitive enterprise data remains encrypted even during processing.',
    exampleZh: '「機密」運算確保敏感的企業資料即使在運算處理過程中也維持加密狀態。'
  },
  incredible: {
    lemma: 'incredible',
    pos: 'adj.',
    phonetic: '/ɪnˈkrɛdəbəl/',
    level: 'B2 演講高頻讚嘆詞',
    meaning: '驚人的、不可思議的、極為出色的（字根 cred「相信」；副詞 incredibly 極常用來修飾形容詞表「非常、極度」）',
    exampleEn: 'The open-source community has built an incredible ecosystem of developer tools.',
    exampleZh: '開源社群已經建立起一個「令人驚嘆」的開發者工具生態系。'
  },
  biopsy: {
    lemma: 'biopsy',
    pos: 'n.',
    phonetic: '/ˈbaɪɑpsi/',
    level: 'C1 醫療與生醫字彙',
    meaning: '活體組織切片檢查（字根 bio-「生命」+ opsis「觀看」，指取出少量組織在顯微鏡下檢驗病變）',
    exampleEn: 'The doctors performed a biopsy and discovered that the tumor was a rare, curable form of cancer.',
    exampleZh: '醫師進行了「活體組織切片檢查」，發現該腫瘤是一種罕見但可治癒的癌症。'
  },
  prerequisite: {
    lemma: 'prerequisite',
    pos: 'n.',
    phonetic: '/priˈrɛkwəzət/',
    level: 'C1 學術與職場核心字',
    meaning: '先決條件、必備前提；先修課程（字首 pre-「預先」+ requisite「必要的」，常搭配 a prerequisite for/to）',
    exampleEn: 'Clear problem definition is an essential prerequisite for writing clean, maintainable code.',
    exampleZh: '清晰的問題定義是撰寫乾淨、易維護程式碼的必備「先決條件」。'
  },
  matrix: {
    lemma: 'matrix',
    pos: 'n.',
    phonetic: '/ˈmeɪtrɪks/',
    level: 'B2 數學與 AI 核心術語',
    meaning: '矩陣（複數為 matrices /ˈmeɪtrəˌsiz/；深度學習將千萬個權重組織為矩陣，透過矩陣乘法高速平行運算）',
    exampleEn: 'Organizing neural network weights into a matrix allows GPUs to compute millions of products in parallel.',
    exampleZh: '將神經網路權重組織成「矩陣」，能讓 GPU 平行計算數百萬個乘積。'
  },
  latency: {
    lemma: 'latency',
    pos: 'n.',
    phonetic: '/ˈleɪtənsi/',
    level: 'C1 系統工程必備術語',
    meaning: '延遲時間、反應時間（從發出請求到收到第一個回應所需的毫秒數；常說 low latency「低延遲」）',
    exampleEn: 'Reducing network latency is critical for real-time voice interaction with AI assistants.',
    exampleZh: '降低網路「延遲」對於與 AI 助理進行即時語音互動至關重要。'
  },
  bandwidth: {
    lemma: 'bandwidth',
    pos: 'n.',
    phonetic: '/ˈbændˌwɪdθ/',
    level: 'B2 科技與職場雙棲字',
    meaning: '（記憶體／網路）頻寬；（口語喻）個人的時間與心力餘裕（如 I don\'t have the bandwidth this week）',
    exampleEn: 'High-bandwidth memory is essential for feeding massive parameters into the processor quickly.',
    exampleZh: '高「頻寬」記憶體對於將龐大參數快速餵入處理器至關重要。'
  },
  ecosystem: {
    lemma: 'ecosystem',
    pos: 'n.',
    phonetic: '/ˈikoʊˌsɪstəm/',
    level: 'B2 商務與科技高頻字',
    meaning: '生態系、產業生態圈（指硬體、軟體、開發者與合作夥伴相互依存共榮的完整體系）',
    exampleEn: 'A thriving developer ecosystem is the strongest moat any computing platform can build.',
    exampleZh: '蓬勃發展的開發者「生態系」是任何運算平台能建立的最強護城河。'
  },
  perspective: {
    lemma: 'perspective',
    pos: 'n.',
    phonetic: '/pɚˈspɛktɪv/',
    level: 'B2 思辨與溝通必備',
    meaning: '觀點、視角、洞察高度（常見片語：from my perspective 從我的角度來看、put things in perspective 客觀看待全貌）',
    exampleEn: 'Looking at the problem from a systems perspective revealed a much simpler solution.',
    exampleZh: '從系統整體的「視角」檢視問題，揭示了一個簡單得多的解決方案。'
  },
  fundamental: {
    lemma: 'fundamental',
    pos: 'adj.',
    phonetic: '/ˌfʌndəˈmɛntəl/',
    level: 'B2 學術與演講核心字',
    meaning: '根本的、最基礎核心的（副詞 fundamentally 常表「從根本上徹底地」）',
    exampleEn: 'We are witnessing a fundamental shift in how software is written and executed.',
    exampleZh: '我們正在見證軟體撰寫與執行方式的一場「根本性」轉變。'
  }
};

/**
 * Normalize an inflected English word to its likely base lemma so we can match TUTOR_VOCAB
 */
export function resolveCanonicalLemma(word) {
  const low = (word || '').toLowerCase().replace(/[^a-z-]/g, '');
  if (!low) return '';
  if (TUTOR_VOCAB[low]) return low;
  if (low === 'matrices') return 'matrix';
  if (low.endsWith('ies') && low.length > 5) {
    const y = low.slice(0, -3) + 'y';
    if (TUTOR_VOCAB[y]) return y;
    return y;
  }
  if (low.endsWith('es') && low.length > 5) {
    const base1 = low.slice(0, -2);
    if (TUTOR_VOCAB[base1]) return base1;
    const base2 = low.slice(0, -1);
    if (TUTOR_VOCAB[base2]) return base2;
  }
  if (low.endsWith('s') && !low.endsWith('ss') && !low.endsWith('us') && !low.endsWith('is') && low.length > 4) {
    const base = low.slice(0, -1);
    if (TUTOR_VOCAB[base]) return base;
    return base;
  }
  if (low.endsWith('ing') && low.length > 6) {
    const base1 = low.slice(0, -3);
    if (TUTOR_VOCAB[base1]) return base1;
    const base2 = low.slice(0, -3) + 'e';
    if (TUTOR_VOCAB[base2]) return base2;
  }
  if (low.endsWith('ed') && low.length > 5) {
    const base1 = low.slice(0, -2);
    if (TUTOR_VOCAB[base1]) return base1;
    const base2 = low.slice(0, -1);
    if (TUTOR_VOCAB[base2]) return base2;
  }
  return low;
}

/**
 * Score a candidate word by CEFR B2-C2 academic / morphological richness.
 * Returns <= 0 if the word is basic/elementary and should NOT be tagged!
 */
export function scoreWordDifficulty(rawWord) {
  const clean = (rawWord || '').replace(/[^A-Za-z-]/g, '');
  const low = clean.toLowerCase();
  if (low.length < 5) return -10;
  if (BASIC_WORDS.has(low)) return -10;

  const lemma = resolveCanonicalLemma(low);
  if (BASIC_WORDS.has(lemma)) return -10;
  if (TUTOR_VOCAB[lemma]) return 100;

  let score = 0;
  if (low.length >= 10) score += 25;
  else if (low.length >= 8) score += 16;
  else if (low.length >= 6) score += 8;

  // High-value academic/professional suffixes
  if (/(?:tion|sion|ment|ity|ance|ence|tude|logy|graphy|cracy|nomy|metry|sophy|sphere)$/.test(low)) {
    score += 22;
  } else if (/(?:ive|ous|able|ible|escent|ulent|aneous|orial|atical|istic|logical)$/.test(low)) {
    score += 20;
  } else if (/(?:ize|ise|ify|ate)$/.test(low)) {
    score += 16;
  } else if (/(?:lessly|fully|ingly|edly|ally|tically)$/.test(low)) {
    score += 15;
  }

  // High-value Latin/Greek prefixes
  if (/^(?:inter|trans|sub|super|hyper|ultra|counter|contra|multi|omni|neuro|tele|cyber|bio|geo|micro|macro|proto|pseudo|retro|semi|co-|de-|re-|un-|in-|im-|ir-|il-|dis-|mis-|over|under|out)/.test(low)) {
    score += 14;
  }

  // Penalize capitalized proper nouns mid-sentence unless they have academic suffixes
  if (/^[A-Z][a-z]+$/.test(clean) && score < 20) {
    score -= 8;
  }

  return score;
}

export function inferPosAndRootNote(word) {
  const low = word.toLowerCase();
  let pos = 'n./v.';
  if (low.endsWith('ly') && low.length > 4) pos = 'adv.';
  else if (/(?:tion|sion|ment|ness|ity|ance|ence|ship|dom|ism|ist|er|or|logy|graphy)$/.test(low)) pos = 'n.';
  else if (/(?:ous|ive|able|ible|ful|less|al|ic|ant|ent|ary|ory)$/.test(low)) pos = 'adj.';
  else if (/(?:ize|ise|ify|ate|en)$/.test(low)) pos = 'v.';
  else if (low.endsWith('ing')) pos = 'v./n.';
  else if (low.endsWith('ed')) pos = 'v./adj.';

  let rootHint = '';
  if (/^inter/.test(low)) rootHint = '字首 inter- 表「相互、在⋯之間」';
  else if (/^trans/.test(low)) rootHint = '字首 trans- 表「跨越、轉變」';
  else if (/^sub/.test(low)) rootHint = '字首 sub- 表「在底層、次級」';
  else if (/^de/.test(low) && low.length >= 7) rootHint = '字首 de- 表「拆解、向下、移除」';
  else if (/^re/.test(low) && low.length >= 7) rootHint = '字首 re- 表「重新、反覆」';
  else if (/^un|^in|^im|^ir|^dis/.test(low) && low.length >= 7) rootHint = '否定／反向字首搭配核心字根';
  else if (/^co(?:m|n|l|r)?/.test(low) && low.length >= 8) rootHint = '字首 co-/con- 表「共同、整合」';
  else if (/^pre|^pro/.test(low) && low.length >= 7) rootHint = '字首 pre-/pro- 表「預先、向前推進」';
  else if (/^over|^out|^under/.test(low) && low.length >= 7) rootHint = '複合字首強化程度或空間關係';
  else if (/tion$|sion$/.test(low)) rootHint = '名詞字尾 -tion 表「動作過程或狀態」';
  else if (/able$|ible$/.test(low)) rootHint = '形容詞字尾 -able/-ible 表「能夠被⋯的」';
  else if (/ive$|ous$/.test(low)) rootHint = '高頻形容詞字尾，常用於精準描述特質';

  return { pos, rootHint };
}

/**
 * Extract 0-2 truly tutor-worthy items (Phrases/Idioms first, then Curated B2-C2 vocabulary)
 * from a single English sentence. Only returns 100% verified entries with genuine meanings & examples!
 */
export function selectTutorKeywordsForSentence(enText, focusMode = 'tech-interview') {
  const picked = [];
  const usedSpans = [];

  // 1. First scan for high-value Idioms, Phrasal Verbs & Collocations
  for (const phraseEntry of TUTOR_PHRASES) {
    const m = enText.match(phraseEntry.regex);
    if (m && m[0]) {
      const matchedStr = m[0].trim();
      const idx = enText.toLowerCase().indexOf(matchedStr.toLowerCase());
      const overlaps = usedSpans.some(([s, e]) => idx < e && idx + matchedStr.length > s);
      if (!overlaps) {
        usedSpans.push([idx, idx + matchedStr.length]);
        picked.push({
          word: matchedStr,
          lemma: phraseEntry.lemma,
          pos: phraseEntry.pos,
          phonetic: phraseEntry.phonetic,
          meaning: phraseEntry.meaning,
          level: phraseEntry.level,
          exampleEn: phraseEntry.exampleEn,
          exampleZh: phraseEntry.exampleZh,
          isCurated: true
        });
        if (picked.length >= 2) return picked;
      }
    }
  }

  // 2. Scan for Curated B2-C2 Advanced Single Words
  const tokenRegex = /[A-Za-z]+(?:-[A-Za-z]+)?/g;
  let match;
  const candidates = [];
  while ((match = tokenRegex.exec(enText)) !== null) {
    const word = match[0];
    const startIdx = match.index;
    const endIdx = startIdx + word.length;
    const overlaps = usedSpans.some(([s, e]) => startIdx < e && endIdx > s);
    if (overlaps) continue;

    const canon = resolveCanonicalLemma(word);
    if (TUTOR_VOCAB[canon]) {
      candidates.push({ word, canon, startIdx, endIdx, score: 100 });
    }
  }

  const seenLemmas = new Set(picked.map((p) => p.lemma.toLowerCase()));

  for (const cand of candidates) {
    const canon = cand.canon;
    if (seenLemmas.has(canon)) continue;
    seenLemmas.add(canon);

    const curated = TUTOR_VOCAB[canon];
    if (curated) {
      picked.push({
        word: cand.word,
        lemma: curated.lemma,
        pos: curated.pos,
        phonetic: curated.phonetic,
        meaning: curated.meaning,
        level: curated.level,
        exampleEn: curated.exampleEn,
        exampleZh: curated.exampleZh,
        isCurated: true
      });
    }
    if (picked.length >= 2) break;
  }

  return picked;
}

/**
 * Generate a warm, insightful Online English Tutor commentary (grammarNote)
 * analyzing sentence structure, spoken discourse markers, phrases, and native linking!
 */
export function buildTutorGrammarNote(enText, zhText, keywords = []) {
  const notes = [];
  const clean = (enText || '').trim();

  // 1. Highlight phrase or key vocabulary usage first
  const phraseKw = keywords.find((k) => k.pos === 'phr.');
  if (phraseKw) {
    const shortMeaning = phraseKw.meaning.split('（')[0];
    notes.push(`🎯 片語亮點：劇中出現道地片語「${phraseKw.lemma}」（${shortMeaning}），建議整組打包記憶，口說時直接套用`);
  }

  // 2. Detect sentence grammar & rhetorical patterns
  if (/\b(?:if|had)\b[^.?!]+\bwould\s+have\b/i.test(clean)) {
    notes.push('📐 句型解析：「If + 過去完成式, would have + Vpp」為第三類與過去事實相反的假設語氣，用來回顧人生關鍵轉折');
  } else if (/^what\s+[a-z]+\s+/i.test(clean) && /\b(?:is|was|are|were)\b/i.test(clean)) {
    notes.push('📐 句型解析：以名詞子句「What + S + V」作為主詞的強調句型，母語講者常用來把核心結論推向動詞後方聚焦');
  } else if (/\bnot\s+only\b/i.test(clean)) {
    notes.push('📐 句型解析：「not only... (but also)...」遞進強調結構，能讓論點層次感更鮮明');
  } else if (/\b(?:even\s+though|although|while\s+at\s+the\s+same\s+time|whereas)\b/i.test(clean)) {
    notes.push('📐 句型解析：使用讓步／對比從屬子句，先承認前項事實，再凸顯主句令人驚豔的反差重點');
  } else if (/,?\s+which\s+(?:means|is|was|makes|allows|helps)\b/i.test(clean)) {
    notes.push('📐 句型解析：逗號後接「which + 動詞」為非限定關係子句，用來順勢補充「前面整句話所帶來的結果」');
  } else if (/,\s+[a-z]+ing\s+/i.test(clean)) {
    notes.push('📐 句型解析：句中運用「, V-ing...」現在分詞構句，不需額外連接詞即可流暢描繪伴隨發生的動作或結果');
  } else if (/\bmake(?:s|d)?\s+it\s+[a-z]+\s+to\s+[a-z]+/i.test(clean)) {
    notes.push('📐 句型解析：「make it + 形容詞 + to V」以 it 作為虛受詞，將真正的長不定詞片語移至句尾，是極道地的英語造句法');
  } else if (/^(?:now,|so,|well,|look,|you\s+know|i\s+mean)/i.test(clean)) {
    notes.push('💬 母語語感：句首的語氣轉折詞（Discourse Marker）在演講中並非贅字，而是用來提示聽眾「接下來要切換視角或舉例了」');
  }

  // 3. Detect concrete native linking / pronunciation tips in the sentence
  const linkingMatch =
    clean.match(/\b(kind\s+of|sort\s+of|a\s+lot\s+of|out\s+of|drop(?:ped)?\s+out|drop(?:ped)?\s+in|turn(?:ed)?\s+out|figure\s+out|pick\s+up|hand\s+in|sink\s+in|want\s+to|going\s+to|have\s+to|used\s+to|at\s+all|all\s+of|one\s+of|some\s+of|most\s+of)\b/i);

  if (linkingMatch) {
    const expr = linkingMatch[1];
    notes.push(`🔊 連音跟讀：注意句中「${expr}」在母語自然語速下子音與母音會緊密連讀（Linking），跟讀時切勿逐字斷開`);
  } else if (keywords.length > 0 && notes.length === 0) {
    const kw = keywords[0];
    const shortMeaning = kw.meaning.split('（')[0];
    notes.push(`💡 家教導讀：本句精選高階表達「${kw.lemma} (${kw.pos} ${shortMeaning})」，朗讀時請將語調重音落在此核心語塊上`);
  }

  if (notes.length === 0) {
    const wordCount = clean.split(/\s+/).length;
    if (wordCount <= 5) {
      notes.push('💬 家教導讀：簡潔有力的短句更能創造演講節奏感，跟讀時注意句尾語調的自然收束。');
    } else {
      notes.push('🔊 家教導讀：朗讀時請將介系詞與冠詞（to, of, the, in）輕讀弱化為 /ə/，凸顯核心名詞與動詞的重音節奏。');
    }
  }

  return notes.slice(0, 2).join('；');
}
