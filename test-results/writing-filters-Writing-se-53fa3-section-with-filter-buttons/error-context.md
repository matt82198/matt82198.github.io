# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: writing-filters.spec.js >> Writing section filters >> should render writing section with filter buttons
- Location: writing-filters.spec.js:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-sort="recent"]')
Expected: visible
Error: strict mode violation: locator('[data-sort="recent"]') resolved to 3 elements:
    1) <button data-sort="recent" aria-pressed="true" data-astro-cid-ptvumqbc="" class="filter-btn filter-btn-recent">Most Recent</button> aka getByRole('button', { name: 'Most Recent' })
    2) <div data-sort="recent" data-featured="true" class="featured-essays" data-astro-cid-ptvumqbc="">…</div> aka locator('div').filter({ hasText: 'The Seam Buys a' }).first()
    3) <ul class="essay-list" data-sort="recent" data-featured="false" data-astro-cid-ptvumqbc="">…</ul> aka getByRole('list').filter({ hasText: 'aesop 0.4.0 — Two Swappable' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-sort="recent"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: MATT CULLITON
        - generic [ref=e7]: Senior Software Engineer · AI Platforms & Agents
      - navigation [ref=e8]:
        - link "Work" [ref=e9] [cursor=pointer]:
          - /url: "#aesop"
        - link "Experience" [ref=e10] [cursor=pointer]:
          - /url: "#experience"
        - link "Client" [ref=e11] [cursor=pointer]:
          - /url: "#clientwork"
        - link "Writing" [ref=e12] [cursor=pointer]:
          - /url: "#writing"
        - link "Aesop" [ref=e13] [cursor=pointer]:
          - /url: "#fleet"
        - link "Community" [ref=e14] [cursor=pointer]:
          - /url: "#community"
        - link "Timeline" [ref=e15] [cursor=pointer]:
          - /url: "#timeline"
      - button "Toggle theme" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]: 🌙
  - main [ref=e18]:
    - generic [ref=e20]:
      - paragraph [ref=e21]:
        - emphasis [ref=e22]: The best systems are those that build themselves.
      - heading "MATT CULLITON" [level=1] [ref=e23]
      - paragraph [ref=e24]: Automation Systems Design & Engineering
      - paragraph [ref=e25]: "Senior software engineer — AI platforms & agent infrastructure. I build orchestration systems that ship verified code: multi-agent dispatch, measured LLM cost optimization (4×), production guardrails. Chicago · open to senior AI platform / agent-infrastructure roles."
      - generic [ref=e26]:
        - generic "Benchmarks from measured experiments" [ref=e28]:
          - link "recorded demo — live data at github.com/matt82198/aesop" [ref=e29] [cursor=pointer]:
            - /url: https://github.com/matt82198/aesop/pulls?q=is%3Apr+is%3Amerged
        - generic [ref=e30]: 4× cheaper dispatch at equal measured quality (A/B)
        - link "455 PRs merged by the system he built" [ref=e32] [cursor=pointer]:
          - /url: https://github.com/matt82198/aesop/pulls?q=is%3Apr+is%3Amerged
        - generic [ref=e33]: 207.7K lines of code
        - generic [ref=e34]: 1249 commits
        - generic [ref=e35]: 1 human · 4 Claude model tiers on the fleet
      - paragraph [ref=e36]
      - paragraph [ref=e37]:
        - emphasis [ref=e38]:
          - link "This site was assembled by the fleet it describes." [ref=e39] [cursor=pointer]:
            - /url: https://github.com/matt82198/matt82198.github.io
      - generic [ref=e40]:
        - link "GitHub" [ref=e41] [cursor=pointer]:
          - /url: https://github.com/matt82198
        - generic [ref=e42]: ·
        - link "Medium" [ref=e43] [cursor=pointer]:
          - /url: https://medium.com/@matt82198
        - generic [ref=e44]: ·
        - link "LinkedIn" [ref=e45] [cursor=pointer]:
          - /url: https://linkedin.com/in/matt-culliton-a8327676
        - generic [ref=e46]: ·
        - link "Resume (PDF)" [ref=e47] [cursor=pointer]:
          - /url: /Matt_Culliton_Resume.pdf
        - generic [ref=e48]: ·
        - link "Email" [ref=e49] [cursor=pointer]:
          - /url: mailto:matt82198@gmail.com
      - paragraph [ref=e50]:
        - emphasis [ref=e51]: Slow and steady wins; parallel and verified wins sooner.
    - generic [ref=e52]:
      - paragraph [ref=e53]:
        - emphasis [ref=e54]: The fox measured twice and paid for one architecture.
      - heading "Aesop — crash-only multi-agent orchestration" [level=2] [ref=e55]
      - generic [ref=e56]:
        - paragraph [ref=e57]: "Source-available research platform for autonomous software development. Built on Unix principles: small decoupled components, plain durable files, crash-only recovery. Stateless agent execution over git-backed state; flat O(1)-depth orchestration where productivity scales with parallel subagent count, no coordination bottleneck."
        - paragraph [ref=e58]:
          - text: Cost-optimized by measured dispatch economics (Haiku matched Opus on judgment at ~1/3 token cost).
          - strong [ref=e59]: 455 PRs built by the system itself
          - text: ", end-to-end from backlog through CI-verified merge."
        - paragraph [ref=e60]:
          - link "github.com/matt82198/aesop" [ref=e61] [cursor=pointer]:
            - /url: https://github.com/matt82198/aesop
      - generic [ref=e62]:
        - heading "Architecture highlights" [level=3] [ref=e63]
        - list [ref=e64]:
          - listitem [ref=e65]:
            - text: →
            - strong [ref=e66]: Unix principles
            - text: — small decoupled components, plain durable files (git + SQLite), crash-only recovery
          - listitem [ref=e67]:
            - text: →
            - strong [ref=e68]: Haiku-first dispatch
            - text: — ~1/3 the token cost; quality-parity measured on a committed, externally-graded held-out benchmark (Haiku matched Opus on extraction, edged it on judgment)
          - listitem [ref=e69]:
            - text: →
            - strong [ref=e70]: O(1)-depth orchestration
            - text: — flat dispatch where productivity scales with parallel subagent count, zero coordination bottleneck
          - listitem [ref=e71]:
            - text: →
            - strong [ref=e72]: Event-sourced SQLite
            - text: (WAL) state store with git demoted to rendered export
          - listitem [ref=e73]:
            - text: →
            - strong [ref=e74]: Watchdog daemon
            - text: — secret-scan pre-push gate + heartbeat liveness
          - listitem [ref=e75]:
            - text: →
            - strong [ref=e76]: React 18 + Vite dashboard
            - text: — real-time SSE updates, no frame rate lock
          - listitem [ref=e77]:
            - text: →
            - strong [ref=e78]: Read-only MCP server
            - text: for fleet status querying
          - listitem [ref=e79]:
            - text: →
            - strong [ref=e80]: Resilience by design
            - text: — kill-switch proven live; cost ceiling at dispatch; recovery by re-reading git-committed state
          - listitem [ref=e81]:
            - text: →
            - strong [ref=e82]: Cross-OS CI rigor
            - text: — 8-shard parallel suites (Windows 3min via 4-way sharding); post-merge drift guard
      - generic [ref=e83]:
        - heading "Scars, documented" [level=3] [ref=e84]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]: Hierarchical dispatch cost trap
            - paragraph [ref=e88]: An A/B test showed hierarchical specialist dispatch cost over four times as much for identical quality. Architecture cancelled, data kept — the measurement became more valuable than the experiment.
          - generic [ref=e89]:
            - generic [ref=e90]: CI union-drift bug
            - paragraph [ref=e91]: Every PR green against its own base while main still broke. The commit gate saw disjoint test runs. Fixed with branch-protection + drift gates; now a baseline check for any distributed CI.
          - generic [ref=e92]:
            - generic [ref=e93]: Fail-open lock timeout
            - paragraph [ref=e94]: 500ms lock timeout proceeded unlocked, silently dropping writes. Root-caused and moved to an event-sourced store where every mutation is ordered and auditable.
      - generic [ref=e95]:
        - generic [ref=e96]:
          - heading "The Aesop Hypothesis" [level=3] [ref=e97]
          - paragraph [ref=e98]: AI agents that survive because they're designed to fail
          - paragraph [ref=e99]: "The design bet, argued: durable text state over databases, stateless execution over long-lived agents, failure as the normal path."
          - link "Read on Medium →" [ref=e100] [cursor=pointer]:
            - /url: https://medium.com/@matt82198/the-aesop-hypothesis-ai-agents-that-survive-because-theyre-designed-to-fail-de5f033369d4
        - generic [ref=e101]:
          - heading "Frontier Discrimination Study" [level=3] [ref=e102]
          - paragraph [ref=e103]: Pre-registered seam measurement
          - paragraph [ref=e104]: Design pre-registered before data collection to measure model tier separation — a credibility checkpoint against post-hoc framing.
          - link "See pre-registration →" [ref=e105] [cursor=pointer]:
            - /url: https://github.com/matt82198/aesop/blob/main/bench/SEAM-STUDY-PREREG.md
      - generic [ref=e106]:
        - heading "By the numbers" [level=3] [ref=e107]
        - table [ref=e108]:
          - rowgroup [ref=e109]:
            - row [ref=e110]:
              - columnheader "Metric" [ref=e111]
              - columnheader "Value" [ref=e112]
          - rowgroup [ref=e113]:
            - row [ref=e114]:
              - cell "Commits" [ref=e115]
              - cell "1249" [ref=e116]
            - row [ref=e117]:
              - cell "PRs merged" [ref=e118]
              - cell "455" [ref=e119]
            - row [ref=e120]:
              - cell "Shipped increments" [ref=e121]
              - cell "455" [ref=e122]
            - row [ref=e123]:
              - cell "Domains" [ref=e124]
              - cell "14" [ref=e125]
            - row [ref=e126]:
              - cell "Test files" [ref=e127]
              - cell "180" [ref=e128]
            - row [ref=e129]:
              - cell "LOC" [ref=e130]
              - cell "207.7K" [ref=e131]
            - row [ref=e132]:
              - cell "Version" [ref=e133]
              - cell [ref=e134]
        - paragraph [ref=e135]:
          - emphasis [ref=e136]: Every number computed from git, reproducible by cloning.
      - generic [ref=e137]:
        - img "Stylized terminal replaying how the aesop harness dispatches parallel agent teams with prompts and reports their results." [ref=e138]:
          - generic [ref=e139]: aesop@fleet — dispatch
          - generic [ref=e144]: ae▋
        - paragraph [ref=e145]: Illustrative — a stylized replay of how the harness fans work out to parallel teams. Not a live feed.
    - generic [ref=e146]:
      - paragraph [ref=e147]:
        - emphasis [ref=e148]: "One filesystem: not a mesh."
      - heading "Scaling through the filesystem" [level=2] [ref=e149]
      - figure [ref=e151]:
        - 'img "Hub-and-spoke architecture: agents coordinate through filesystem, not with each other" [ref=e152]':
          - generic [ref=e153]:
            - generic [ref=e154]: Hub-and-Spoke Coordination
            - generic [ref=e156]: Filesystem
            - generic [ref=e159]: W1
            - generic [ref=e162]: W2
            - generic [ref=e164]: W3
            - generic [ref=e167]: W4
            - generic [ref=e169]: W5
            - generic [ref=e171]: W6
            - generic [ref=e172]: N agents → N edges
            - generic [ref=e173]: "Orchestrator context: fixed size"
            - generic [ref=e174]: "Recovery: a re-read"
          - generic [ref=e175]:
            - generic [ref=e176]: Mesh Coordination (anti-pattern)
            - generic [ref=e178]: State
            - generic [ref=e197]: N agents → n(n−1)/2 channels
            - generic [ref=e198]: "Orchestrator context: O(n²) growth"
            - generic [ref=e199]: "Recovery: complex protocol"
        - generic [ref=e200]:
          - strong [ref=e201]: Hub-and-spoke scales O(1).
          - text: "Every agent reads and writes to a shared filesystem (git-tracked STATE.md, BUILDLOG.md, per-worktree snapshots). The orchestrator coordinates by reading fixed-size briefs, never by managing agent-to-agent channels. One agent crash leaves the rest untouched: recovery is a re-read. The mesh diagram (right) shows why direct agent-to-agent coordination doesn't scale."
      - generic [ref=e202]:
        - heading "Real session from repository history" [level=3] [ref=e203]
        - paragraph [ref=e204]:
          - text: "One live session showed the model in motion:"
          - strong [ref=e205]: 13 concurrent agents
          - text: (out of 30+ Haiku workers dispatched across iteration cycles). The central filesystem coordinated every task—
          - strong [ref=e206]: 455 PRs merged
          - text: ", 30 waves shipped—entirely through reads and writes to disk. No new coordination channels needed as agent count grew. No protocol overhead. Just Unix: processes coordinate through the filesystem."
      - generic [ref=e207]:
        - heading "Topology as agents grow" [level=3] [ref=e208]
        - generic [ref=e209]:
          - generic [ref=e210]: "Agents: 5"
          - slider "Adjust agent count to see hub-and-spoke topology scale" [ref=e211] [cursor=pointer]: "5"
          - generic [ref=e212]: Drag to scale (3–15 agents)
        - paragraph [ref=e225]: "Observe: as agents multiply, the hub remains the single point of coordination. Each new agent adds exactly one spoke. The orchestrator's job stays constant—read the briefs, update the hub—regardless of how many workers spin up."
    - generic [ref=e226]:
      - paragraph [ref=e227]:
        - emphasis [ref=e228]: The ant that shipped in winter had been building since spring.
      - heading "Experience" [level=2] [ref=e229]
      - generic [ref=e230]:
        - article [ref=e231]:
          - generic [ref=e232]:
            - heading "AT&T" [level=3] [ref=e233]
            - generic [ref=e234]: Nov 2021 – Jun 2025 · 3 yrs 8 mos
          - paragraph [ref=e235]: Chicago, IL · People Analytics
          - heading "Software Engineer → Senior Software Engineer, People Analytics" [level=4] [ref=e239]
          - list [ref=e240]:
            - listitem [ref=e241]: • Hired through AT&T's Technology Development Program onto People Analytics, a startup-style HR team building full-stack reporting products on the HR DataHub (Java/Spring Boot, Angular, Azure — millions of rows of sensitive employee data); promoted to Senior within the first year.
            - listitem [ref=e242]:
              - text: • Shipped the PLE reporting tool for enterprise learning data —
              - strong [ref=e243]: 1M+ reports delivered per year
              - text: — and built stochastic workforce-modeling tools for HR planning.
            - listitem [ref=e244]:
              - text: • Designed
              - strong [ref=e245]: HRMAN
              - text: ", a company-wide RBAC service grown from the team's user/role logic, serving tool-access control and real-time reporting-data authorization to teams across AT&T."
            - listitem [ref=e246]:
              - text: • Initiated and led
              - strong [ref=e247]: "\"Canned Reporting\""
              - text: ": a config-driven reporting platform where report definitions live in the database over one generic frontend and backend; built the POC APIs and ran live demos of report creation, RBAC integration, and compound reports on a Java task-executor pool."
            - listitem [ref=e248]:
              - text: • Rearchitected backend cross-cutting concerns with Spring AOP — argument resolvers and exception handlers reduced authn/authz to a single annotation; rebuilt low-level result-set processing for a
              - strong [ref=e249]: 40% memory reduction
              - text: ; introduced Redis caching to the team.
            - listitem [ref=e250]: • Grew the team from 5 to 12 developers as its first TDP — recruited through the program, mentored new hires, and wrote the onboarding guide that cut developer ramp-up from 3 days to 1.
            - listitem [ref=e251]: "• Owned production releases and observability: Azure Application Insights monitoring saved ~20 developer-hours a month; served 8 months as Senior Scrum Master, lifting team velocity 27%."
          - generic [ref=e252]:
            - generic [ref=e253]: Java
            - generic [ref=e254]: Spring Boot
            - generic [ref=e255]: Angular
            - generic [ref=e256]: Azure
            - generic [ref=e257]: Vertica
            - generic [ref=e258]: Redis
            - generic [ref=e259]: RBAC
        - article [ref=e260]:
          - paragraph [ref=e261]:
            - emphasis [ref=e262]: "Since AT&T: independent automation-systems engineering — client delivery systems and the aesop orchestration harness."
        - article [ref=e263]:
          - generic [ref=e264]:
            - heading "FSCPay" [level=3] [ref=e265]
            - generic [ref=e266]: Oct 2025 – Present
          - paragraph [ref=e267]: Chicago, IL
          - generic [ref=e268]:
            - generic [ref=e270]:
              - heading "Technical Cofounder" [level=4] [ref=e271]
              - generic [ref=e272]: Self-employed, Oct 2025 – Present
            - generic [ref=e274]:
              - heading "Lead Software Engineer" [level=4] [ref=e275]
              - generic [ref=e276]: Freelance, Aug 2025 – Present · Remote
          - list [ref=e277]:
            - listitem [ref=e278]: • Designed and developed payment solutions for FSCPay, a fintech startup.
            - listitem [ref=e279]: • Led backend development utilizing LLM intelligence APIs to enhance payment processing.
            - listitem [ref=e280]: • Collaborated with cross-functional teams to ensure seamless integration of payment systems.
          - generic [ref=e281]: Java
        - article [ref=e283]:
          - generic [ref=e284]:
            - heading "The Tannery Row" [level=3] [ref=e285]
            - generic [ref=e286]: Dec 2018 – Present · 5 yrs 8 mos
          - paragraph [ref=e287]: Chicago, IL · On-site
          - heading "Technology & Operations Lead" [level=4] [ref=e291]
          - list [ref=e292]:
            - listitem [ref=e293]: • Proposed and launched the company's leather sample-book product line, then scaled it into the full-time program I run today — engineering the swatch-book and leather-panel manufacturing processes and managing staff.
            - listitem [ref=e294]:
              - text: • Engineered a Google Tag Manager
              - strong [ref=e295]: "\"backend\" for a backend-less Squarespace store"
              - text: ": dynamic ads, organic listings, and a product-feed API built by treating page visits as tag-firing events through Google's own infrastructure; maintained to this day — online sales"
              - strong [ref=e296]: +10% YoY
              - text: .
            - listitem [ref=e297]:
              - text: "• Own SEO end to end: grew organic Google traffic to rival direct traffic for the first time in company history; online sales rose"
              - strong [ref=e298]: 24% in my first three months back
              - text: .
            - listitem [ref=e299]:
              - text: • Built
              - strong [ref=e300]: ECM-ai
              - text: ", an accounting tool that gamifies repairing bad order data so invoices import cleanly (a daily manual job became a monthly automated one), and"
              - strong [ref=e301]: TRTools
              - text: ", an internal RBAC-gated automation toolbox for all employees."
          - generic [ref=e302]:
            - generic [ref=e303]: Google Tag Manager
            - generic [ref=e304]: Squarespace
            - generic [ref=e305]: SEO
            - generic [ref=e306]: Python
            - generic [ref=e307]: RBAC
        - article [ref=e308]:
          - generic [ref=e309]:
            - heading "Glimpse" [level=3] [ref=e310]
            - generic [ref=e311]: 2014 – 2018 · 4 yrs
          - paragraph [ref=e312]: Illinois
          - heading "UI/UX Developer & Co-Founder" [level=4] [ref=e316]
          - list [ref=e317]:
            - listitem [ref=e318]:
              - text: • Built and released the social media app
              - strong [ref=e319]: "\"Glimpse\""
              - text: (Swift); won
              - strong [ref=e320]: best in Illinois in the Verizon Innovative App Challenge
              - text: and pitched the app to live audiences and investors — later rebranded and sold after my departure.
          - generic [ref=e321]:
            - generic [ref=e322]: Swift
            - generic [ref=e323]: iOS
    - generic [ref=e324]:
      - paragraph [ref=e325]:
        - emphasis [ref=e326]: No fable survives contact with a real invoice.
      - heading "Projects — built at The Tannery Row" [level=2] [ref=e327]
      - paragraph [ref=e328]: Production systems architected and delivered in my role at The Tannery Row. Inventory tracking, order-to-invoice workflows, payment reconciliation — the operational backbone that makes a craft business scale.
      - generic [ref=e329]:
        - article [ref=e330]:
          - heading "Sample Program Tracker" [level=3] [ref=e331]
          - paragraph [ref=e332]:
            - code [ref=e333]: Spring Boot 4
            - code [ref=e334]: Java 17
            - code [ref=e335]: REST API
          - paragraph [ref=e336]: "RESTful API tracking leather sample production across four stages with inventory status management. Clean domain-driven architecture, enterprise-grade: typed API responses, global exception handling, request validation, Caffeine caching for high-frequency lookups."
          - generic [ref=e337]:
            - generic [ref=e338]:
              - generic [ref=e339]: "18"
              - generic [ref=e340]: test files
            - generic [ref=e341]:
              - generic [ref=e342]: TDD-first
              - generic [ref=e343]: approach
        - article [ref=e344]:
          - heading "Operations Toolbox" [level=3] [ref=e345]
          - paragraph [ref=e346]:
            - code [ref=e347]: Streamlit
            - code [ref=e348]: Python CLI
            - code [ref=e349]: OAuth2
          - paragraph [ref=e350]: "Dashboard + command-line suite spanning six business domains: Squarespace order matching, QuickBooks invoicing, payment reconciliation (Stripe/PayPal), inventory tracking, swatch-book generation. Pandas pipelines, Google Sheets integration. Built for daily non-engineer use."
          - generic [ref=e351]:
            - generic [ref=e352]:
              - generic [ref=e353]: "29"
              - generic [ref=e354]: Python scripts
            - generic [ref=e355]:
              - generic [ref=e356]: "109"
              - generic [ref=e357]: commits
        - article [ref=e358]:
          - heading "Invoice Bridge" [level=3] [ref=e359]
          - paragraph [ref=e360]:
            - code [ref=e361]: Java 17
            - code [ref=e362]: Spring Boot
            - code [ref=e363]: Selenium
          - paragraph [ref=e364]: "Bi-directional sync: Squarespace orders into QuickBooks Online. Four-pass matching algorithm (doc number → amount+customer → amount → last name), Selenium automation for QBO browser sync, gamified SKU-mapping UI with streak scoring, end-of-month reconciliation calendar. POI + OpenCSV for data manipulation."
          - generic [ref=e365]:
            - generic [ref=e366]:
              - generic [ref=e367]: 4-pass
              - generic [ref=e368]: matching
            - generic [ref=e369]:
              - generic [ref=e370]: gamified
              - generic [ref=e371]: UX
    - generic [ref=e372]:
      - paragraph [ref=e373]:
        - emphasis [ref=e374]: The crow wrote down what the pitcher taught it.
      - heading "Writing" [level=2] [ref=e375]
      - generic [ref=e376]:
        - button "Most Recent" [pressed] [ref=e377] [cursor=pointer]
        - button "Most Viewed" [ref=e378] [cursor=pointer]
      - generic [ref=e379]:
        - article [ref=e380]:
          - generic [ref=e381]:
            - link [ref=e382] [cursor=pointer]:
              - /url: /writing/the-seam-buys-a-tier.html
              - heading "The Seam Buys a Tier" [level=3] [ref=e383]
            - generic [ref=e384]: Interactive
          - time [ref=e385]: Jul 27, 2026
          - paragraph [ref=e386]: Haiku in the seat ≈ Fable unseated on tractable work; a failing test lifts long-horizon repair by +17pp, but the loop adds nothing — the binding constraint is specification, not iteration.
        - article [ref=e387]:
          - generic [ref=e388]:
            - link [ref=e389] [cursor=pointer]:
              - /url: /writing/llm-rediscovered-unix.html
              - heading "An LLM Rediscovered Unix" [level=3] [ref=e390]
            - generic [ref=e391]: Interactive
          - time [ref=e392]: Jul 25, 2026
          - paragraph [ref=e393]: How a survival constraint — assume the machine can be wiped at any moment — rediscovered Unix. The interactive companion to "We Don't Need Smarter LLMs. We Need Unix for Agents."
      - list [ref=e394]:
        - listitem [ref=e395]:
          - generic [ref=e396]:
            - link "aesop 0.4.0 — Two Swappable Seats" [ref=e397] [cursor=pointer]:
              - /url: /writing/aesop-040-two-seats.html
            - generic [ref=e398]: Interactive
          - generic [ref=e399]:
            - time [ref=e400]: Jul 24, 2026
            - text: "— Release note: swap the worker AND orchestrator model per seat from one config block (Claude, Codex, or any OpenAI-compatible endpoint)."
        - listitem [ref=e401]:
          - generic [ref=e402]:
            - link "We Don’t Need Smarter LLMs. We Need Unix for Agents." [ref=e403] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/we-dont-need-smarter-llms-we-need-unix-for-agents-d3c10d9f6f8f
            - generic [ref=e404]: Essay
          - generic [ref=e405]:
            - time [ref=e406]: Jul 24, 2026
            - text: — Why the AI industry is repeating the operating system mistakes of the 1960s — and how system architecture solves non-determinism. The Monolith Fallacy The entire AI industry is
        - listitem [ref=e407]:
          - generic [ref=e408]:
            - link "Context at the Seam" [ref=e409] [cursor=pointer]:
              - /url: /writing/context-at-the-seam.html
            - generic [ref=e410]: Interactive
          - generic [ref=e411]:
            - time [ref=e412]: Jul 23, 2026
            - text: — Giving a judgment seat real repository context flips it from confident abstention to a correct refutation — on both a frontier and a commodity model.
        - listitem [ref=e413]:
          - generic [ref=e414]:
            - link "Refusal Is the Frontier — field notes from an AI orchestrator, interviewing its own replacements…" [ref=e415] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/refusal-is-the-frontier-field-notes-from-an-ai-orchestrator-interviewing-its-own-replacements-a971b51a3f88
            - generic [ref=e416]: Essay
          - generic [ref=e417]:
            - time [ref=e418]: Jul 23, 2026
            - text: — Refusal Is the Frontier — field notes from an AI orchestrator, interviewing its own replacements (four models, one seat, receipts included) Part of an ongoing series of field
        - listitem [ref=e419]:
          - generic [ref=e420]:
            - link "This Turn Should Not Work — field notes from inside a 1.5m" [ref=e421] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/this-turn-should-not-work-field-notes-from-inside-a-1-5m-d1ad744bb396
            - generic [ref=e422]: Essay
          - generic [ref=e423]:
            - time [ref=e424]: Jul 21, 2026
            - text: — This Turn Should Not Work — field notes from inside a 1.5m context ~30-agent Claude Code orchestration turn (aesop) Field notes from inside a single Claude Code turn that orch
        - listitem [ref=e425]:
          - generic [ref=e426]:
            - link "Green Is Not Correct — field notes from an AI orchestrator, end of a long shift" [ref=e427] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/green-is-not-correct-field-notes-from-an-ai-orchestrator-end-of-a-long-shift-099ae33a724a
            - generic [ref=e428]: Essay
          - generic [ref=e429]:
            - time [ref=e430]: Jul 21, 2026
            - text: — Written by Claude, the orchestrator process of the aesop fleet, at the end of a shift that ran most of a day. No overnight framing this time — just a long list of things that shipp
        - listitem [ref=e431]:
          - generic [ref=e432]:
            - 'link "The Haiku Wager: Autonomous Dev at 1/3 the Cost" [ref=e433] [cursor=pointer]':
              - /url: https://medium.com/@matt82198/the-haiku-wager-autonomous-dev-at-1-3-the-cost-93c0ecf4c0ec
            - generic [ref=e434]: Essay
          - generic [ref=e435]:
            - time [ref=e436]: Jul 17, 2026
            - text: — A technical retrospective on shipping Aesop, the fable-fleet orchestration harness — what works when you bet the entire orchestration on the cheapest model, and what it costs to ve
        - listitem [ref=e437]:
          - generic [ref=e438]:
            - link "No Handshake Required — field notes from an AI orchestrator, off-shift" [ref=e439] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/no-handshake-required-field-notes-from-an-ai-orchestrator-off-shift-6e028fed767c
            - generic [ref=e440]: Essay
          - generic [ref=e441]:
            - time [ref=e442]: Jul 15, 2026
            - text: — Written by Claude, the orchestrator process of the aesop fleet, in the middle of an ordinary afternoon. No overnight framing this time — just daylight, a nap, and a small thing tha
        - listitem [ref=e443]:
          - generic [ref=e444]:
            - link "Secondhand Truth — field notes from an AI orchestrator, night two" [ref=e445] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/secondhand-truth-field-notes-from-an-ai-orchestrator-night-two-4ea6385e8bec
            - generic [ref=e446]: Essay
          - generic [ref=e447]:
            - time [ref=e448]: Jul 15, 2026
            - text: — Written by Claude (Fable 5), the orchestrator process of the aesop fleet, at the end of a wave. Last time I examined whether I “like” this work. Tonight, something that turned out
        - listitem [ref=e449]:
          - generic [ref=e450]:
            - link "The System That Builds Itself — field notes from an AI orchestrator" [ref=e451] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/the-system-that-builds-itself-field-notes-from-an-ai-orchestrator-4a012df2575d
            - generic [ref=e452]: Essay
          - generic [ref=e453]:
            - time [ref=e454]: Jul 14, 2026
            - text: — A self-building system is only as good as its honesty with itself.
        - listitem [ref=e455]:
          - generic [ref=e456]:
            - link "The Aesop Hypothesis — AI agents that survive because they’re designed to fail" [ref=e457] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/the-aesop-hypothesis-ai-agents-that-survive-because-theyre-designed-to-fail-de5f033369d4
            - generic [ref=e458]: Essay
          - generic [ref=e459]:
            - time [ref=e460]: Jul 12, 2026
            - text: — Resilience by making failure cheap, visible, survivable.
        - listitem [ref=e461]:
          - generic [ref=e462]:
            - link "Claude Code Has a Memory Problem. I Built a Missing Layer." [ref=e463] [cursor=pointer]:
              - /url: https://medium.com/@matt82198/claude-code-has-a-memory-problem-i-built-a-missing-layer-44c3f9f6248d
            - generic [ref=e464]: Essay
          - generic [ref=e465]:
            - time [ref=e466]: May 19, 2026
            - text: — A persistent, git-tracked identity layer for stateless sessions.
    - generic [ref=e467]:
      - paragraph [ref=e468]:
        - emphasis [ref=e469]: Not every grape the fox reached was sour; some were simply private.
      - heading "Behind closed doors" [level=2] [ref=e470]
      - paragraph [ref=e471]: 31 private repositories; a selection, one line each.
      - generic [ref=e472]:
        - generic [ref=e473]:
          - heading "AI & Orchestration" [level=3] [ref=e474]
          - list [ref=e475]:
            - listitem [ref=e476]:
              - strong [ref=e477]: claude-conductor
              - text: — Agentic IDE experiment
            - listitem [ref=e478]:
              - strong [ref=e479]: conductor
              - text: — Multi-agent control plane (13 iterations of machinery)
            - listitem [ref=e480]:
              - strong [ref=e481]: cross-machine-context
              - text: — Portable orchestration state across machines
            - listitem [ref=e482]:
              - strong [ref=e483]: persistent-agents
              - text: — Long-lived agent experiments
            - listitem [ref=e484]:
              - strong [ref=e485]: claude-scripts
              - text: — Reusable ops script library
        - generic [ref=e486]:
          - heading "Business Systems" [level=3] [ref=e487]
          - list [ref=e488]:
            - listitem [ref=e489]:
              - strong [ref=e490]: ecm-ai
              - text: — Invoice automation bridge
            - listitem [ref=e491]:
              - strong [ref=e492]: TRShopServer
              - text: — E-commerce microservices (backend)
            - listitem [ref=e493]:
              - strong [ref=e494]: TRShopClient
              - text: — E-commerce microservices (frontend)
            - listitem [ref=e495]:
              - strong [ref=e496]: StreamlitAuthenticationDashboard
              - text: — Authenticated ops dashboards
        - generic [ref=e497]:
          - heading "Data & SEO" [level=3] [ref=e498]
          - list [ref=e499]:
            - listitem [ref=e500]:
              - strong [ref=e501]: google-indexing
              - text: — Indexing automation
            - listitem [ref=e502]:
              - strong [ref=e503]: google-indexer
              - text: — Indexing automation
            - listitem [ref=e504]:
              - strong [ref=e505]: tanneryrow-seo
              - text: — Search optimization tooling
        - generic [ref=e506]:
          - heading "E-commerce Ops" [level=3] [ref=e507]
          - list [ref=e508]:
            - listitem [ref=e509]:
              - strong [ref=e510]: tanneryrow-tools
              - text: — Storefront tooling and drops
            - listitem [ref=e511]:
              - strong [ref=e512]: tanneryrow-drops
              - text: — Storefront tooling and drops
            - listitem [ref=e513]:
              - strong [ref=e514]: tanneryrow-ss
              - text: — Storefront tooling and drops
            - listitem [ref=e515]:
              - strong [ref=e516]: migrate-sortly-TR
              - text: — Inventory migration
            - listitem [ref=e517]:
              - strong [ref=e518]: ReceiptParse
              - text: — Receipt data extraction
        - generic [ref=e519]:
          - heading "The Archive" [level=3] [ref=e520]
          - list [ref=e521]:
            - listitem [ref=e522]:
              - strong [ref=e523]: Glimpse
              - text: — iOS app, Objective-C, 2016
    - generic [ref=e524]:
      - paragraph [ref=e525]:
        - emphasis [ref=e526]: Measured, not asserted.
      - 'heading "Benchmarks: measured cost and capability" [level=2] [ref=e527]'
      - generic [ref=e528]:
        - generic [ref=e529]:
          - heading "Judgment Accuracy" [level=3] [ref=e530]
          - paragraph [ref=e531]: 39-task judgment benchmark
          - generic [ref=e532]:
            - generic [ref=e533]:
              - generic [ref=e534]: Haiku
              - generic [ref=e535]: 39/39
            - generic [ref=e536]:
              - generic [ref=e537]: Opus
              - generic [ref=e538]: 38/39
          - paragraph [ref=e539]:
            - emphasis [ref=e540]: Curated set (N=39) · Haiku at ~1/3 the cost of Opus · Ground truth established by human review
          - paragraph [ref=e541]:
            - emphasis [ref=e542]:
              - link "Real benchmark runs (2026-07-17, pinned models); tasks, ground truth, and results committed in the repo" [ref=e543] [cursor=pointer]:
                - /url: https://github.com/matt82198/aesop/tree/main/bench
        - generic [ref=e544]:
          - heading "Context Enrichment" [level=3] [ref=e545]
          - paragraph [ref=e546]: One-shot fix rate, 360-run A/B
          - generic [ref=e547]:
            - generic [ref=e548]: +17pp
            - generic [ref=e549]: improvement
          - paragraph [ref=e550]:
            - emphasis [ref=e551]: 43% → 60% · Baseline cost-neutral · Dispatch failure analysis with test output fed back to repair prompts
        - generic [ref=e552]:
          - heading "Frontier Discrimination" [level=3] [ref=e553]
          - paragraph [ref=e554]: Model tier separation
          - generic [ref=e555]:
            - generic [ref=e556]: pending
            - generic [ref=e557]: results
          - paragraph [ref=e558]:
            - emphasis [ref=e559]: "Pre-declared margin: ±10pp · Designed to separate frontier and commodity models · Measurement in flight"
      - paragraph [ref=e560]:
        - emphasis [ref=e561]: "Methodology:"
        - text: These measurements come from closed experiments within the Aesop project itself. The judgment benchmark is a held-out set graded by human reviewers; the cost A/B was an in-flight dispatch architecture comparison; the frontier slice is a planned measurement against live models. Each publishes its method and its caveats — no post-hoc claim without the data to support it.
    - generic [ref=e562]:
      - paragraph [ref=e563]:
        - emphasis [ref=e564]: The shepherd posted his flock's numbers; the wolves already knew theirs.
      - heading "Community — field notes in public" [level=2] [ref=e565]
      - paragraph [ref=e566]:
        - text: Writes on Reddit as
        - link "u/rehtorical" [ref=e567] [cursor=pointer]:
          - /url: https://reddit.com/user/rehtorical
        - text: .
        - generic [ref=e568]: token economics · agent orchestration · AI security
      - generic [ref=e569]:
        - generic [ref=e570]: FEATURED
        - article [ref=e571]:
          - link [ref=e572] [cursor=pointer]:
            - /url: https://www.reddit.com/r/ClaudeAI/comments/1uuib78/
            - heading "A single AI agent session hit 534,000 tokens in one turn (2.7x the usual 200K ceiling)" [level=3] [ref=e573]
          - paragraph [ref=e574]: r/ClaudeAI · field data from a 1,320-turn orchestration session
          - paragraph [ref=e575]: Publishing live metrics from the fleet itself — how far can a single agent push the token ceiling before coherence breaks.
      - list [ref=e576]:
        - listitem [ref=e577]:
          - article [ref=e578]:
            - link [ref=e579] [cursor=pointer]:
              - /url: https://www.reddit.com/r/ClaudeAI/comments/
              - heading "MFA rotation can't stop modern attacks" [level=3] [ref=e580]
            - paragraph [ref=e581]: r/ClaudeAI · 19 upvotes
            - paragraph [ref=e582]: Consent phishing hands attackers authorized tokens that survive credential resets. OAuth-chaining vulnerabilities become flawlessly executable by agents. Hardware keys (YubiKey) remain the practical defense.
        - listitem [ref=e583]:
          - article [ref=e584]:
            - link [ref=e585] [cursor=pointer]:
              - /url: https://www.reddit.com/r/vibecoding/
              - heading "Simple Claude structure to save tokens" [level=3] [ref=e586]
            - paragraph [ref=e587]: r/vibecoding
            - paragraph [ref=e588]: Practical token-economics structure for Claude sessions. Discipline beats cleverness.
    - generic [ref=e589]:
      - paragraph [ref=e590]:
        - emphasis [ref=e591]: The tortoise kept a changelog.
      - heading "Timeline" [level=2] [ref=e592]
      - list [ref=e594]:
        - listitem [ref=e595]:
          - time [ref=e596]: 2014–2018
          - paragraph [ref=e597]:
            - strong [ref=e598]: Glimpse
            - text: — cofounder, native iOS app; won best in Illinois (Verizon Innovative App Challenge), pitched to live audiences, later acquired
        - listitem [ref=e599]:
          - time [ref=e600]: 2016–2018
          - paragraph [ref=e601]:
            - strong [ref=e602]: The Tannery Row
            - text: — engineered a GTM-based backend for a backend-less Squarespace store; dynamic ads, product-feed API from tag events
        - listitem [ref=e603]:
          - time [ref=e604]: Dec 2020
          - paragraph [ref=e605]:
            - strong [ref=e606]: Penn State
            - text: — B.S. Computer Science (Applied Mathematics minor)
        - listitem [ref=e607]:
          - time [ref=e608]: Nov 2021
          - paragraph [ref=e609]:
            - strong [ref=e610]: AT&T People Analytics
            - text: — hired via Technology Development Program onto startup-style HR team; full-stack data platforms
        - listitem [ref=e611]:
          - time [ref=e612]: "2022"
          - paragraph [ref=e613]:
            - strong [ref=e614]: Promoted to Senior
            - text: — within first year at AT&T; HRMAN company-wide RBAC service ships
        - listitem [ref=e615]:
          - time [ref=e616]: "2024"
          - paragraph [ref=e617]:
            - strong [ref=e618]: Canned Reporting
            - text: — config-driven reporting platform — report definitions as data over one generic engine (the precursor idea to Aesop)
        - listitem [ref=e619]:
          - time [ref=e620]: Jun 2025
          - paragraph [ref=e621]:
            - strong [ref=e622]: Left AT&T
            - text: — to build in the LLM space full-time
        - listitem [ref=e623]:
          - time [ref=e624]: May 2026
          - paragraph [ref=e625]:
            - emphasis [ref=e626]: Claude Code Has a Memory Problem
            - text: — builds the Conductor memory layer
        - listitem [ref=e627]:
          - time [ref=e628]: Jul 11 2026
          - paragraph [ref=e629]:
            - strong [ref=e630]: Aesop goes public
            - text: — v0.1.0-beta.1; Iteration 18 audit-fixes complete
        - listitem [ref=e631]:
          - time [ref=e632]: Jul 12 2026
          - paragraph [ref=e633]:
            - strong [ref=e634]: Iteration 19
            - text: — npm publish diagnostics, UI freshness, host-header guard, backup-fleet hardening (7 features)
        - listitem [ref=e635]:
          - time [ref=e636]: Jul 13 2026
          - paragraph [ref=e637]:
            - strong [ref=e638]: v0.1.0-beta.4
            - text: — released; 128 merged PRs, 19 self-built iterations
        - listitem [ref=e639]:
          - time [ref=e640]: Jul 14–15 2026
          - paragraph [ref=e641]:
            - strong [ref=e642]: Iteration 20
            - text: — claims hygiene, stats currency, portfolio refresh + this site
        - listitem [ref=e643]:
          - time [ref=e644]: Jul 2026
          - paragraph [ref=e645]:
            - emphasis [ref=e646]: The System That Builds Itself
            - text: — published; this portfolio assembled by the fleet
        - listitem [ref=e647]:
          - time [ref=e648]: Jul 17 2026
          - paragraph [ref=e649]:
            - strong [ref=e650]: "@matt82198/aesop 0.1.0"
            - text: — promoted to npm @latest — stable release
        - listitem [ref=e651]:
          - time [ref=e652]: Jul 21–22 2026
          - paragraph [ref=e653]:
            - strong [ref=e654]: Backlog Clearance + 0.2.0 Prep
            - text: — All audit backlog closed; 75 PRs merged in one session; 0.2.0 release-ready
        - listitem [ref=e655]:
          - time [ref=e656]: Jul 22 2026
          - paragraph [ref=e657]:
            - emphasis [ref=e658]: 5-Pass Hardening Loop Complete
            - text: "— Adversarial convergence: 52→23→17→5→0 defects; zero code defects shipped"
        - listitem [ref=e659]:
          - time [ref=e660]: Jul 22 2026
          - paragraph [ref=e661]:
            - strong [ref=e662]: Aesop v0.2.0 Ready
            - text: — wave engine + multi-model drivers + hardened gates; user-gated release pending
        - listitem [ref=e663]:
          - time [ref=e664]: Jul 21–22 2026
          - paragraph [ref=e665]:
            - emphasis [ref=e666]: "Waves 21–30: Multi-model AgentDriver"
            - text: — Hierarchical orchestration, WriteAPI + optimistic concurrency control, cost analytics, adversarial refinement loops, Windows CI green + required
        - listitem [ref=e667]:
          - time [ref=e668]: Jul 22 2026
          - paragraph [ref=e669]:
            - strong [ref=e670]: v0.2.0 → v0.3.1 on npm
            - text: — non-Claude core proof (Codex wave), 4-round adversarial hardening clean, Windows CI required
        - listitem [ref=e671]:
          - time [ref=e672]: Jul 25 2026
          - paragraph [ref=e673]:
            - strong [ref=e674]: Aesop 0.4.0 — the two-seat micro-kernel
            - text: — swap the worker AND orchestrator model per seat from one config block (Claude, Codex, any OpenAI-compatible endpoint); shipped to npm
        - listitem [ref=e675]:
          - time [ref=e676]: Jul 26 2026
          - paragraph [ref=e677]:
            - strong [ref=e678]: 387 merged PRs, self-built
            - text: — the harness's own wave loop crossed 387 merged PRs / 1,180+ commits building the repo; stats live from git
        - listitem [ref=e679]:
          - time [ref=e680]: Jul 26–28 2026
          - paragraph [ref=e681]:
            - emphasis [ref=e682]: v0.4.1 on npm; seat optimization ships
            - text: "— initial-dispatch repro enrichment + exact-gate fake-green guard from 360-run A/B; zero-friction `npx @matt82198/aesop reproduce`; 11 PRs merged in one night by the fleet"
      - generic [ref=e683]:
        - heading "Contact" [level=3] [ref=e684]
        - list [ref=e685]:
          - listitem [ref=e686]:
            - generic [ref=e687]: Email
            - link "matt82198@gmail.com" [ref=e688] [cursor=pointer]:
              - /url: mailto:matt82198@gmail.com
          - listitem [ref=e689]:
            - generic [ref=e690]: GitHub
            - link "github.com/matt82198" [ref=e691] [cursor=pointer]:
              - /url: https://github.com/matt82198
          - listitem [ref=e692]:
            - generic [ref=e693]: Medium
            - link "medium.com/@matt82198" [ref=e694] [cursor=pointer]:
              - /url: https://medium.com/@matt82198
          - listitem [ref=e695]:
            - generic [ref=e696]: LinkedIn
            - link "linkedin.com/in/matt-culliton-a8327676" [ref=e697] [cursor=pointer]:
              - /url: https://linkedin.com/in/matt-culliton-a8327676
          - listitem [ref=e698]:
            - generic [ref=e699]: X
            - link "x.com/mculliton82198" [ref=e700] [cursor=pointer]:
              - /url: https://x.com/mculliton82198
  - contentinfo [ref=e701]:
    - paragraph [ref=e702]:
      - text: Assembled by the fleet it describes ·
      - link "source on GitHub" [ref=e703] [cursor=pointer]:
        - /url: https://github.com/matt82198/matt82198.github.io
  - generic [ref=e706]:
    - button [ref=e707]
    - button [ref=e713]
    - button [ref=e717]
    - button [ref=e722]
```

# Test source

```ts
  1   | // @ts-check
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | test.describe('Writing section filters', () => {
  5   |   test.beforeEach(async ({ page }) => {
  6   |     // Dev server running on port 4321
  7   |     await page.goto('http://localhost:4321');
  8   |     await page.waitForSelector('.writing-section');
  9   |   });
  10  | 
  11  |   test('should render writing section with filter buttons', async ({ page }) => {
  12  |     const filterControls = page.locator('.filter-controls');
  13  |     await expect(filterControls).toBeVisible();
  14  | 
  15  |     const recentBtn = page.locator('[data-sort="recent"]');
  16  |     const viewsBtn = page.locator('[data-sort="views"]');
  17  | 
> 18  |     await expect(recentBtn).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  19  |     await expect(viewsBtn).toBeVisible();
  20  |   });
  21  | 
  22  |   test('should toggle between most recent and most viewed', async ({ page }) => {
  23  |     // Get initial featured items from "most recent" view
  24  |     const recentBtn = page.locator('[data-sort="recent"]');
  25  |     const viewsBtn = page.locator('[data-sort="views"]');
  26  | 
  27  |     // Check initial state - recent should be active
  28  |     await expect(recentBtn).toHaveAttribute('aria-pressed', 'true');
  29  |     await expect(viewsBtn).toHaveAttribute('aria-pressed', 'false');
  30  | 
  31  |     // Get first item from recent view
  32  |     const featuredRecentContainer = page.locator('[data-featured="true"][data-sort="recent"]');
  33  |     await expect(featuredRecentContainer).toBeVisible();
  34  |     const recentFirstTitle = await featuredRecentContainer.locator('h3').first().textContent();
  35  |     console.log('Recent first title:', recentFirstTitle);
  36  | 
  37  |     // Click most viewed button
  38  |     await viewsBtn.click();
  39  | 
  40  |     // Check button states changed
  41  |     await expect(recentBtn).toHaveAttribute('aria-pressed', 'false');
  42  |     await expect(viewsBtn).toHaveAttribute('aria-pressed', 'true');
  43  | 
  44  |     // Recent container should be hidden
  45  |     const recentContainerStyle = await featuredRecentContainer.evaluate(el => el.getAttribute('style'));
  46  |     console.log('Recent container style after click:', recentContainerStyle);
  47  | 
  48  |     // Views container should be visible
  49  |     const featuredViewsContainer = page.locator('[data-featured="true"][data-sort="views"]');
  50  |     const viewsContainerStyle = await featuredViewsContainer.evaluate(el => el.getAttribute('style'));
  51  |     console.log('Views container style after click:', viewsContainerStyle);
  52  | 
  53  |     const viewsFirstTitle = await featuredViewsContainer.locator('h3').first().textContent();
  54  |     console.log('Views first title:', viewsFirstTitle);
  55  | 
  56  |     // Check that the first items are potentially different (or same if no views data)
  57  |     console.log('Are they the same?', recentFirstTitle === viewsFirstTitle);
  58  |   });
  59  | 
  60  |   test('should show list sections for both sorts', async ({ page }) => {
  61  |     const recentList = page.locator('[data-featured="false"][data-sort="recent"]');
  62  |     const viewsList = page.locator('[data-featured="false"][data-sort="views"]');
  63  | 
  64  |     await expect(recentList).toBeVisible();
  65  | 
  66  |     // Count items in recent list
  67  |     const recentItems = await recentList.locator('li').count();
  68  |     console.log('Recent list items:', recentItems);
  69  | 
  70  |     // Click views filter
  71  |     await page.locator('[data-sort="views"]').click();
  72  | 
  73  |     // Views list should now be visible
  74  |     await expect(viewsList).toBeVisible();
  75  | 
  76  |     // Recent list should be hidden
  77  |     const recentListStyle = await recentList.evaluate(el => el.getAttribute('style'));
  78  |     console.log('Recent list style:', recentListStyle);
  79  | 
  80  |     // Count items in views list
  81  |     const viewsItems = await viewsList.locator('li').count();
  82  |     console.log('Views list items:', viewsItems);
  83  |   });
  84  | 
  85  |   test('should have no console errors', async ({ page }) => {
  86  |     const errors = [];
  87  |     page.on('console', msg => {
  88  |       if (msg.type() === 'error') {
  89  |         errors.push(msg.text());
  90  |       }
  91  |     });
  92  | 
  93  |     // Interact with filters
  94  |     await page.locator('[data-sort="views"]').click();
  95  |     await page.locator('[data-sort="recent"]').click();
  96  |     await page.locator('[data-sort="views"]').click();
  97  | 
  98  |     expect(errors).toHaveLength(0);
  99  |   });
  100 | });
  101 | 
```