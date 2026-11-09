import { VideoLesson } from '../types';

export const CURATED_VIDEOS: VideoLesson[] = [
  {
    id: 'demo_ai_agents_tech',
    videoId: '5MgBikgcWnY',
    title: 'The First 20 Hours: How to Learn Anything Fast & Build Technical Mastery',
    channel: 'TEDx Talks · Josh Kaufman (AI 雙語精析版)',
    thumbnail: 'https://i.ytimg.com/vi/5MgBikgcWnY/hqdefault.jpg',
    duration: 72,
    focusMode: 'tech-interview',
    transcriptSource: 'curated-precision',
    analysisSource: 'gemini-2.5-flash',
    cached: true,
    summary: {
      overviewZh:
        '本講深入剖析知識工作者與工程師如何在資訊爆炸時代，打破「一萬小時定律」迷思，透過拆解核心技能（Deconstruct）、排除分心干擾、以及刻意練習關鍵 20 小時，快速掌握任何新技術或外語能力。',
      keyTakeaways: [
        '將龐大的技能拆解（Deconstruct）為最小可執行的子步驟，優先攻克高槓桿率的 20% 核心。',
        '學習初期最大的障礙不是智力，而是面對未知時的「情緒挫折感（Emotional barrier）」。',
        '移除環境中的分心阻力，承諾至少完成 20 小時的專注輸出，就能跨越新手撞牆期。'
      ],
      difficultyLevel: 'B2 中高級',
      topicTags: ['科技職場', '高效學習法', 'TED經典', 'TOEIC高頻']
    },
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 6.5,
        en: 'Most professionals constantly face a massive backlog of technical skills they want to acquire.',
        zh: '多數專業工作者經常面對龐大且待消化的技術技能清單，渴望能快速掌握。',
        grammarNote: 'face a massive backlog of... 為科技外商常用表達，指「面對大量待辦／待學事項積壓」。',
        keywords: [
          {
            word: 'backlog',
            lemma: 'backlog',
            pos: 'n.',
            phonetic: '/ˈbæk.lɔːɡ/',
            meaning: '積壓的工作；待辦事項清單（敏捷開發高頻字）',
            level: '科技高頻',
            exampleEn: 'Our engineering team prioritized the security patches in the sprint backlog.',
            exampleZh: '我們的工程團隊在衝刺待辦清單中優先處理了安全性修補程式。'
          },
          {
            word: 'acquire',
            lemma: 'acquire',
            pos: 'v.',
            phonetic: '/əˈkwaɪər/',
            meaning: '習得（技能）；獲得；併購',
            level: 'TOEIC 800',
            exampleEn: 'Developers need to continuously acquire domain knowledge in generative AI.',
            exampleZh: '開發者需要持續習得生成式 AI 領域的專業知識。'
          }
        ]
      },
      {
        id: 2,
        start: 6.5,
        end: 13.8,
        en: 'When we investigate the research, the 10,000-hour rule actually applies to reaching elite world-class performance.',
        zh: '當我們深入檢視研究文獻時，會發現「一萬小時定律」其實適用於達到世界頂尖菁英的水準。',
        grammarNote: 'apply to + V-ing（適用於⋯），注意此處 to 為介系詞，後方須接動名詞 reaching。',
        keywords: [
          {
            word: 'investigate',
            lemma: 'investigate',
            pos: 'v.',
            phonetic: '/ɪnˈves.tə.ɡeɪt/',
            meaning: '深入調查；研究排查（亦常用於排查 Bug）',
            level: 'TOEIC 750',
            exampleEn: 'We are currently investigating the root cause of the latency spike.',
            exampleZh: '我們目前正在排查延遲飆升的根本原因。'
          },
          {
            word: 'elite',
            lemma: 'elite',
            pos: 'adj./n.',
            phonetic: '/ɪˈliːt/',
            meaning: '頂尖的；菁英級別的',
            level: 'B2 核心',
            exampleEn: 'Consistent code reviews help cultivate an elite engineering culture.',
            exampleZh: '持續的程式碼審查有助於培養頂尖的工程文化。'
          }
        ]
      },
      {
        id: 3,
        start: 13.8,
        end: 21.5,
        en: 'However, going from knowing absolutely nothing to being reasonably competent takes only about twenty hours of deliberate practice.',
        zh: '然而，從完全一無所知到具備相當勝任的能力，其實只需要約 20 小時的刻意練習。',
        grammarNote: 'go from A to B（從狀態 A 蛻變到狀態 B），搭配動名詞片語展現極佳的口語對比節奏。',
        keywords: [
          {
            word: 'competent',
            lemma: 'competent',
            pos: 'adj.',
            phonetic: '/ˈkɑːm.pə.tənt/',
            meaning: '能勝任的；稱職的；具備實務能力的',
            level: 'TOEIC 850',
            exampleEn: 'After two weeks of onboarding, she became fully competent with our cloud pipeline.',
            exampleZh: '經過兩週的入職培訓後，她已完全能勝任我們的雲端部署流程。'
          },
          {
            word: 'deliberate practice',
            lemma: 'deliberate practice',
            pos: 'phrase',
            phonetic: '/dɪˈlɪb.ər.ət ˈpræk.tɪs/',
            meaning: '刻意練習（有明確目標與即時回饋的訓練）',
            level: '職場片語',
            exampleEn: 'Shadowing native speakers with immediate feedback is a form of deliberate practice.',
            exampleZh: '透過即時回饋跟讀母語人士，正是刻意練習的一種形式。'
          }
        ]
      },
      {
        id: 4,
        start: 21.5,
        end: 29.2,
        en: 'The first method is to deconstruct the skill into smaller, manageable sub-skills and focus on the most impactful parts first.',
        zh: '第一個方法是將這項技能拆解成更小、易於管理的子技能，並優先專注在最具影響力的核心部分。',
        grammarNote: 'deconstruct A into B 為系統設計（System Design）與問題拆解面試的黃金句型！',
        keywords: [
          {
            word: 'deconstruct',
            lemma: 'deconstruct',
            pos: 'v.',
            phonetic: '/ˌdiː.kənˈstrʌkt/',
            meaning: '拆解；解構（複雜系統或問題）',
            level: '外商面試',
            exampleEn: 'Let us deconstruct this monolithic service into independent microservices.',
            exampleZh: '讓我們將這個單體式服務拆解為獨立的微服務。'
          },
          {
            word: 'impactful',
            lemma: 'impactful',
            pos: 'adj.',
            phonetic: '/ɪmˈpækt.fəl/',
            meaning: '具高度影響力的；成效顯著的',
            level: '外商高頻',
            exampleEn: 'During performance reviews, highlight your most impactful engineering deliverables.',
            exampleZh: '在績效評估時，請突顯你最具影響力的工程交付成果。'
          }
        ]
      },
      {
        id: 5,
        start: 29.2,
        end: 37.0,
        en: 'Second, learn just enough to self-correct during practice, instead of using endless preparation as a form of procrastination.',
        zh: '第二，只需學習足夠讓自己在練習中自我修正的知識即可，切勿把無止盡的準備當作拖延的藉口。',
        grammarNote: 'instead of + V-ing（而非⋯）連接對比行為；as a form of...（作為一種⋯的形式）。',
        keywords: [
          {
            word: 'self-correct',
            lemma: 'self-correct',
            pos: 'v.',
            phonetic: '/ˌself.kəˈrekt/',
            meaning: '自我修正；自動校準',
            level: '科技高頻',
            exampleEn: 'Modern AI agents can self-correct when a tool execution returns an error.',
            exampleZh: '現代 AI 代理在工具執行回傳錯誤時能夠自我修正。'
          },
          {
            word: 'procrastination',
            lemma: 'procrastination',
            pos: 'n.',
            phonetic: '/prəˌkræs.təˈneɪ.ʃən/',
            meaning: '拖延症；延宕推遲',
            level: 'C1 核心',
            exampleEn: 'Perfectionism often masks procrastination when launching a minimum viable product.',
            exampleZh: '在推出最小可行性產品（MVP）時，完美主義往往掩蓋了拖延心態。'
          }
        ]
      },
      {
        id: 6,
        start: 37.0,
        end: 45.0,
        en: 'Third, eliminate all external distractions that might derail your momentum when you sit down to focus.',
        zh: '第三，當你坐下來專注時，徹底排除所有可能打亂你推進節奏的外在分心干擾。',
        grammarNote: 'derail one\'s momentum 是極道地的商務片語，字面為「使火車出軌」，引申為「打亂原本順暢的進度與氣勢」。',
        keywords: [
          {
            word: 'eliminate',
            lemma: 'eliminate',
            pos: 'v.',
            phonetic: '/iˈlɪm.ə.neɪt/',
            meaning: '消除；根除；淘汰',
            level: 'TOEIC 750',
            exampleEn: 'Automated caching helped us eliminate redundant LLM API calls.',
            exampleZh: '自動化快取幫助我們消除了重複的 LLM API 呼叫。'
          },
          {
            word: 'momentum',
            lemma: 'momentum',
            pos: 'n.',
            phonetic: '/moʊˈmen.təm/',
            meaning: '推進動能；氣勢；發展勢頭',
            level: '商務核心',
            exampleEn: 'Shipping early prototypes keeps strong momentum across the product team.',
            exampleZh: '及早釋出原型能維持整個產品團隊強勁的推進動能。'
          }
        ]
      },
      {
        id: 7,
        start: 45.0,
        end: 53.5,
        en: 'Finally, pre-commit to practicing for at least twenty hours to overcome the initial frustration barrier.',
        zh: '最後，預先承諾自己至少投入 20 小時的練習，藉此跨越初期最難熬的挫折門檻。',
        grammarNote: 'pre-commit to + V-ing（預先承諾做某事），注意 commit to 的 to 為介系詞，後接動名詞 practicing！',
        keywords: [
          {
            word: 'pre-commit',
            lemma: 'pre-commit',
            pos: 'v.',
            phonetic: '/ˌpriː.kəˈmɪt/',
            meaning: '預先承諾；預先綁定目標',
            level: '職場片語',
            exampleEn: 'Teams that pre-commit to clear milestones deliver projects with higher predictability.',
            exampleZh: '預先承諾明確里程碑的團隊，在交付專案時具備更高的可預測性。'
          },
          {
            word: 'frustration barrier',
            lemma: 'frustration barrier',
            pos: 'phrase',
            phonetic: '/frʌˈstreɪ.ʃən ˈbær.i.ər/',
            meaning: '挫折門檻；新手撞牆期',
            level: 'TED 核心',
            exampleEn: 'Interactive bilingual tools lower the frustration barrier of watching raw English tech talks.',
            exampleZh: '互動式雙語工具降低了觀看純英文科技演講的挫折門檻。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: 'According to the speaker, what does the "10,000-hour rule" actually apply to?',
        questionZh: '根據講者的觀點，「一萬小時定律」實際上適用於什麼情境？',
        options: [
          'Learning basic conversational phrases in a new language.',
          'Reaching elite, world-class performance in a highly competitive field.',
          'Overcoming the first week of frustration when starting a hobby.',
          'Setting up a software development environment.'
        ],
        answer: 1,
        explanation:
          '講者在第二句明確指出：一萬小時定律（10,000-hour rule）其實是針對達到「世界頂尖菁英水準（elite world-class performance）」，而非一般初學者從零到能夠勝任的階段。',
        relatedTimestamp: 6.5
      },
      {
        question: 'What is the purpose of "deconstructing" a skill before you start practicing?',
        questionZh: '在開始練習前先「拆解（deconstruct）」技能的主要目的為何？',
        options: [
          'To break it into manageable sub-skills and prioritize the most impactful parts.',
          'To collect as many reference books as possible before taking action.',
          'To delegate all technical tasks to external contractors.',
          'To avoid practicing the difficult parts altogether.'
        ],
        answer: 0,
        explanation:
          '講者強調將龐大技能拆解（deconstruct）為可管理的小步驟後，就能識別並優先練習「最具影響力（most impactful）」的核心子技能。',
        relatedTimestamp: 21.5
      },
      {
        question: 'Why does the speaker warn against excessive preparation before practicing?',
        questionZh: '為什麼講者提醒不要在開始練習前做過度無止盡的準備？',
        options: [
          'Because textbooks are always outdated.',
          'Because endless preparation often becomes a disguised form of procrastination.',
          'Because self-correction is impossible during practice.',
          'Because 20 hours is too short to read any documentation.'
        ],
        answer: 1,
        explanation:
          '在第五句中，講者指出我們只需要學會足夠在練習中「自我修正（self-correct）」的程度即可，無止盡的準備往往只是「拖延（procrastination）」的偽裝。',
        relatedTimestamp: 29.2
      },
      {
        question: 'What is the main benefit of pre-committing to at least 20 hours of practice?',
        questionZh: '預先承諾至少練習 20 小時的最大好處是什麼？',
        options: [
          'It guarantees an immediate promotion at work.',
          'It helps learners push past the initial frustration barrier.',
          'It replaces the need for eliminating distractions.',
          'It automatically translates foreign languages.'
        ],
        answer: 1,
        explanation:
          '學習新技能最大的阻礙是前幾個小時覺得自己什麼都不會的「挫折門檻（frustration barrier）」，預先承諾 20 小時能強迫自己跨越這段撞牆期。',
        relatedTimestamp: 45.0
      }
    ]
  },
  {
    id: 'demo_stanford_steve_jobs',
    videoId: 'UF8uR6Z6KLc',
    title: 'Steve Jobs’ 2005 Stanford Commencement Address: Connecting the Dots',
    channel: 'Stanford University · Steve Jobs (經典演講雙語精析)',
    thumbnail: 'https://i.ytimg.com/vi/UF8uR6Z6KLc/hqdefault.jpg',
    duration: 58,
    focusMode: 'academic-ted',
    transcriptSource: 'curated-precision',
    analysisSource: 'gemini-2.5-flash',
    cached: true,
    summary: {
      overviewZh:
        '賈伯斯於史丹佛大學畢業典禮的傳奇演講第一部分「Connecting the Dots（串連生命的點滴）」。探討如何在面對未知的職涯選擇時跟隨好奇心與直覺，並相信當下的點滴終將在未來串連成獨特的競爭優勢。',
      keyTakeaways: [
        '你無法在展望未來時將點滴串連起來，只能在回首過往時看見它們如何彼此連結（Connect the dots looking backward）。',
        '跟隨直覺與好奇心所累積的跨領域養分，往往會在多年後成為產品創新的關鍵差異化優勢。',
        '演講極度善用短句對比（looking forward vs. looking backward）創造強烈的聽覺記憶點。'
      ],
      difficultyLevel: 'B1/B2 中高級',
      topicTags: ['史丹佛演講', '職涯哲學', '產品創新', '經典必背']
    },
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 7.2,
        en: 'Today I want to tell you three stories from my life. That is it. No big deal. Just three stories.',
        zh: '今天我想跟各位分享我生命中的三個故事。就這樣，沒什麼大道理，就只是三個故事。',
        grammarNote: 'No big deal 在口語中極為自然，意為「沒什麼大不了、不講長篇大論」，能瞬間拉近與聽眾的距離。',
        keywords: [
          {
            word: 'no big deal',
            lemma: 'no big deal',
            pos: 'phrase',
            phonetic: '/noʊ bɪɡ diːl/',
            meaning: '沒什麼大不了；小事一樁；不用太嚴肅',
            level: '日常高頻',
            exampleEn: 'If the demo environment resets, it is no big deal—we have automated seed scripts.',
            exampleZh: '如果展示環境重置了也沒關係，我們有自動化的資料初始化腳本。'
          }
        ]
      },
      {
        id: 2,
        start: 7.2,
        end: 15.5,
        en: 'Much of what I stumbled into by following my curiosity and intuition turned out to be priceless later on.',
        zh: '當年我順著好奇心與直覺無意間接觸到的許多事物，在日後回頭看都成為了無價之寶。',
        grammarNote: 'stumble into（偶然踏入、無意間接觸到）搭配 turn out to be（結果證明是⋯），是描述職涯轉折的絕佳句型！',
        keywords: [
          {
            word: 'stumbled into',
            lemma: 'stumble into',
            pos: 'phrase',
            phonetic: '/ˈstʌm.bəld ˈɪn.tuː/',
            meaning: '偶然踏入；無意間接觸到',
            level: '道地片語',
            exampleEn: 'I stumbled into frontend architecture while building an internal developer tool.',
            exampleZh: '我在打造內部開發者工具時，偶然踏入了前端架構領域。'
          },
          {
            word: 'intuition',
            lemma: 'intuition',
            pos: 'n.',
            phonetic: '/ˌɪn.tuˈɪʃ.ən/',
            meaning: '直覺；洞察直覺',
            level: 'B2 核心',
            exampleEn: 'Strong product intuition comes from observing real users struggle with workflows.',
            exampleZh: '敏銳的產品直覺來自於觀察真實使用者在操作流程中的痛點。'
          },
          {
            word: 'priceless',
            lemma: 'priceless',
            pos: 'adj.',
            phonetic: '/ˈpraɪs.ləs/',
            meaning: '無價的；極其珍貴的（注意：不是沒有價值 worthless！）',
            level: 'TOEIC 750',
            exampleEn: 'Early feedback from beta testers proved priceless for refining our UX.',
            exampleZh: '封測使用者提供的早期回饋，對於打磨我們的使用者體驗證明是無價之寶。'
          }
        ]
      },
      {
        id: 3,
        start: 15.5,
        end: 24.0,
        en: 'Ten years later, when we were designing the first Macintosh computer, it all came back to me.',
        zh: '十年後，當我們在設計第一台麥金塔電腦時，當時學到的這一切全都浮現在我腦海中。',
        grammarNote: 'it all came back to me 意為「記憶或所學全部湧現回來」，口語敘事非常生動。',
        keywords: [
          {
            word: 'came back to me',
            lemma: 'come back to someone',
            pos: 'phrase',
            phonetic: '/keɪm bæk tuː miː/',
            meaning: '重新浮現腦海；回想起來',
            level: '日常片語',
            exampleEn: 'Once I started speaking in the meeting, my technical vocabulary quickly came back to me.',
            exampleZh: '一旦我在會議中開口，我的技術字彙很快就在腦海中浮現回來。'
          }
        ]
      },
      {
        id: 4,
        start: 24.0,
        end: 33.5,
        en: 'You cannot connect the dots looking forward; you can only connect them looking backward.',
        zh: '你無法在展望未來時將生命中的點滴串連起來；你只能在回首過往時，才看得見它們是如何連成一線的。',
        grammarNote: '經典對仗句型：looking forward 與 looking backward 為分詞構句作時間／條件狀語，節奏鏗鏘有力。',
        keywords: [
          {
            word: 'connect the dots',
            lemma: 'connect the dots',
            pos: 'phrase',
            phonetic: '/kəˈnekt ðə dɑːts/',
            meaning: '將線索串連起來；融會貫通；理出脈絡',
            level: '外商高頻',
            exampleEn: 'Good data visualization helps executives connect the dots across quarterly metrics.',
            exampleZh: '優秀的資料視覺化能幫助決策者將跨季度的指標串連出清晰脈絡。'
          }
        ]
      },
      {
        id: 5,
        start: 33.5,
        end: 43.0,
        en: 'So you have to trust that the dots will somehow connect in your future, because believing in your gut gives you the confidence to follow your heart.',
        zh: '因此你必須相信，這些點滴終將在你的未來以某種方式連結起來；因為相信直覺能賦予你追隨內心的自信。',
        grammarNote: 'believe in your gut 中的 gut 原意為腸胃，在美式商務與口語中代表「內心深處的直覺（gut feeling）」。',
        keywords: [
          {
            word: 'somehow',
            lemma: 'somehow',
            pos: 'adv.',
            phonetic: '/ˈsʌm.haʊ/',
            meaning: '以某種方式；不知怎麼地；總會找到辦法',
            level: 'B1 核心',
            exampleEn: 'Even under tight deadlines, our team somehow delivered every feature on schedule.',
            exampleZh: '即使在緊迫的期限下，我們團隊依然設法如期交付了所有功能。'
          },
          {
            word: 'gut',
            lemma: 'gut',
            pos: 'n.',
            phonetic: '/ɡʌt/',
            meaning: '直覺（gut feeling）；勇氣與膽識（guts）',
            level: '道地口語',
            exampleEn: 'Data informs our decisions, but sometimes you also have to trust your gut.',
            exampleZh: '數據為決策提供依據，但有時你也必須相信自己的直覺。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: 'What does the idiom "stumble into" mean in the context of Steve Jobs’ speech?',
        questionZh: '在賈伯斯演講語境中，「stumble into」這個片語代表什麼意思？',
        options: [
          'To carefully plan a five-year corporate roadmap.',
          'To encounter or start doing something by chance rather than by deliberate plan.',
          'To physically trip over hardware cables in a computer lab.',
          'To fail a university examination intentionally.'
        ],
        answer: 1,
        explanation:
          'stumble into 指「無意間踏入、偶然接觸到」，賈伯斯用來形容當年並非出於功利規劃、而是順著好奇心去旁聽字體設計課的經歷。',
        relatedTimestamp: 7.2
      },
      {
        question: 'What is the core message of "connecting the dots"?',
        questionZh: '「串連點滴（Connecting the dots）」最核心的觀點為何？',
        options: [
          'You can only see how past experiences link together when looking backward.',
          'You should never learn anything unless it has immediate financial value.',
          'Every career path can be predicted with 100% mathematical certainty.',
          'Typography is the only course worth taking in college.'
        ],
        answer: 0,
        explanation:
          '賈伯斯強調：我們無法在當下預知未來（looking forward）這些經歷如何串連，唯有在日後回首（looking backward）時才會恍然大悟。',
        relatedTimestamp: 24.0
      }
    ]
  },
  {
    id: 'demo_silicon_valley_standup',
    videoId: 'aircAruvnKk',
    title: 'Deep Learning & Neural Networks Explained: How Modern AI Actually Learns',
    channel: '3Blue1Brown · Grant Sanderson (AI 工程英語精讀)',
    thumbnail: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg',
    duration: 52,
    focusMode: 'toeic-business',
    transcriptSource: 'curated-precision',
    analysisSource: 'gemini-2.5-flash',
    cached: true,
    summary: {
      overviewZh:
        '以最直觀的視覺化語言拆解神經網路（Neural Networks）的運作本質。非常適合想同時提升「AI 技術英語詞彙」與「如何用簡單英文向非技術背景同事解釋複雜架構」的學習者。',
      keyTakeaways: [
        '學會使用 strip away the buzzwords（剝除流行術語包裝）切入技術核心。',
        '掌握 layer（層）、representation（表徵）、parameter（參數）與 edge（邊界／特徵）的道地英文解釋法。',
        '練習清楚表達「抽象概念如何逐層組合成高階決策」的英文邏輯連接詞。'
      ],
      difficultyLevel: 'B2/C1 高級',
      topicTags: ['AI技術英語', '架構溝通', '神經網路', '科普演講']
    },
    subtitles: [
      {
        id: 1,
        start: 0.0,
        end: 7.5,
        en: 'If you strip away the flashy buzzwords, a neural network is fundamentally a mathematical function that recognizes patterns.',
        zh: '如果你剝除那些華麗的行銷流行語，神經網路在本質上就是一個用來識別規律模式的數學函數。',
        grammarNote: 'strip away the buzzwords 是工程師與產品經理在技術分享時極受歡迎的開場句型！',
        keywords: [
          {
            word: 'strip away',
            lemma: 'strip away',
            pos: 'phrase',
            phonetic: '/strɪp əˈweɪ/',
            meaning: '剝除；去除表象以顯露本質',
            level: '外商高頻',
            exampleEn: 'When you strip away the UI complexity, our core workflow only has three steps.',
            exampleZh: '當你剝除介面上的複雜度後，我們的核心工作流其實只有三個步驟。'
          },
          {
            word: 'buzzwords',
            lemma: 'buzzword',
            pos: 'n.',
            phonetic: '/ˈbʌz.wɜːdz/',
            meaning: '流行術語；時髦口號',
            level: '科技高頻',
            exampleEn: 'Instead of using industry buzzwords, explain the concrete value to the customer.',
            exampleZh: '與其堆砌產業流行術語，不如向客戶說明具體的實質價值。'
          },
          {
            word: 'fundamentally',
            lemma: 'fundamentally',
            pos: 'adv.',
            phonetic: '/ˌfʌn.dəˈmen.təl.i/',
            meaning: '從根本上說；本質上',
            level: 'TOEIC 800',
            exampleEn: 'Structured outputs fundamentally change how we integrate LLMs into web apps.',
            exampleZh: '結構化輸出從根本上改變了我們將大型語言模型整合進網頁應用的方式。'
          }
        ]
      },
      {
        id: 2,
        start: 7.5,
        end: 16.0,
        en: 'Each hidden layer extracts increasingly abstract representations, moving from raw pixels to edges and eventually complete objects.',
        zh: '每一個隱藏層都會萃取出越發抽象的特徵表徵，從原始像素一路推進到邊緣線條，最終辨識出完整物體。',
        grammarNote: 'moving from A to B and eventually C 是描述系統資料流（Data Pipeline）演進的黃金結構。',
        keywords: [
          {
            word: 'extracts',
            lemma: 'extract',
            pos: 'v.',
            phonetic: '/ɪkˈstrækt/',
            meaning: '萃取；提取；擷取（資料或特徵）',
            level: '科技高頻',
            exampleEn: 'Our backend service automatically extracts timestamped captions from YouTube videos.',
            exampleZh: '我們的後端服務會自動從 YouTube 影片中擷取帶時間戳記的字幕。'
          },
          {
            word: 'representations',
            lemma: 'representation',
            pos: 'n.',
            phonetic: '/ˌrep.rɪ.zenˈteɪ.ʃən/',
            meaning: '（資料／特徵）表徵；表示法；代表',
            level: 'AI 核心',
            exampleEn: 'Vector embeddings store semantic representations of sentences in high-dimensional space.',
            exampleZh: '向量嵌入在高維度空間中儲存了句子的語意表徵。'
          }
        ]
      },
      {
        id: 3,
        start: 16.0,
        end: 25.0,
        en: 'Training the model boils down to tuning millions of weights so that the network minimizes its prediction error across examples.',
        zh: '訓練模型說穿了就是微調數百萬個權重參數，讓網路在大量樣本中將預測誤差降到最低。',
        grammarNote: 'boil down to + N/V-ing 意為「歸根究柢就是⋯、說穿了就是⋯」，在總結複雜技術時極為好用！',
        keywords: [
          {
            word: 'boils down to',
            lemma: 'boil down to',
            pos: 'phrase',
            phonetic: '/bɔɪlz daʊn tuː/',
            meaning: '歸結為；說穿了就是；核心在於',
            level: '外商必備',
            exampleEn: 'System reliability ultimately boils down to observability and automated recovery.',
            exampleZh: '系統穩定性歸根究柢取決於可觀測性與自動化復原機制。'
          },
          {
            word: 'tuning',
            lemma: 'tune',
            pos: 'v.',
            phonetic: '/ˈtuː.nɪŋ/',
            meaning: '調校；微調（參數或效能）',
            level: '工程高頻',
            exampleEn: 'After tuning the chunking threshold, subtitle synchronization became much smoother.',
            exampleZh: '在調校斷句合併門檻後，字幕同步變得更加流暢。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: 'What does the phrase "boil down to" mean when explaining a technical concept?',
        questionZh: '在解釋技術概念時，「boil down to」代表什麼意思？',
        options: [
          'To overheat a server rack due to high CPU usage.',
          'To summarize or reduce a complex matter to its most essential core.',
          'To delete all training data from a database.',
          'To encrypt network traffic using TLS.'
        ],
        answer: 1,
        explanation:
          'boil down to 原指將湯汁熬煮濃縮，引申為「歸根究柢就是⋯、濃縮到最核心的本質」。',
        relatedTimestamp: 16.0
      }
    ]
  }
];
