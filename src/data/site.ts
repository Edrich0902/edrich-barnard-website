// Single source of truth for the homepage and the /cv page.

export const site = {
  name: "Edrich Barnard",
  role: "Full-Stack Software Engineer",
  handle: "Edrich0902",
  location: "Paarl, South Africa",
  timezone: "SAST, UTC+2",
  tz: "Africa/Johannesburg",
  email: "edrichbarnard@gmail.com",
  links: {
    github: "https://github.com/Edrich0902",
    linkedin: "https://www.linkedin.com/in/edrich-barnard-10a811155/",
  },
  description:
    "Full-stack software engineer from Paarl, South Africa, building web platforms, mobile apps and native tools.",
  lede: "I build web platforms, mobile apps and native tools - from the database schema to the App Store release.",
  intro:
    "Full-stack engineer from Paarl, South Africa. For close to six years I've built and kept running software for Agri-Tech, fitness, cold storage, cellar management, banking and churches.",
  about: [
    "Today I'm a full-stack software engineer at Inspiration Starts Here, working remotely with a New York-based team. I own most of the mobile side: I built our white-label Flutter app solo, it runs every one of our branded apps, and I automated its build and release pipeline to TestFlight and Google Play. I also built the effects and animation engine behind our site builder.",
    "Before that I spent four and a half years at I3 Zone Development, where I led most of my projects and was the main point of contact for clients - from a fruit-evaluation platform used by around 200 people to real-time cold-chain monitoring on Teltonika sensors. I worked across Angular, Laravel, ASP.NET, React, MeteorJS, Grails and Spring Boot, wrote native Swift and Kotlin plugins for a banking app, and helped interview new engineers. AI tools like Claude Code and Cursor are part of my daily workflow.",
    "After hours I build tools I want to use myself and products for my church: the Lewende Woord app, portal and platform, a macOS audio mixer, and a one-click dev environment launcher. I hold a BSc in Information Technology from the Pearson Institute of Higher Education, graduated magna cum laude.",
  ],
  /** Summary at the top of the /cv page. */
  profile:
    "Full-stack software engineer with close to six years of experience building and running production software for Agri-Tech, fitness, cold storage, cellar management, banking and church organisations. Works across the whole stack - database schema, APIs and web front-ends through to native plugins and App Store releases - and is comfortable owning a product from first commit to release. Has led client projects end to end, from scoping and client communication through to delivery. Currently owns the white-label Flutter platform and its automated release pipeline for a New York-based team.",
  industries: ["Agri-Tech", "Fitness", "Cold storage", "Cellar management", "Banking", "Church tech"],
  languages: ["English", "Afrikaans"],
  since: 2020,
};

/** `icon` is a simple-icons export name; `mono` is a fallback monogram for brands simple-icons doesn't ship. */
export type StackItem = { name: string; icon?: string; mono?: string };
export const stack: { group: string; items: StackItem[] }[] = [
  {
    group: "Languages",
    items: [
      { name: "TypeScript", icon: "siTypescript" },
      { name: "JavaScript", icon: "siJavascript" },
      { name: "PHP", icon: "siPhp" },
      { name: "Dart", icon: "siDart" },
      { name: "C#", mono: "C#" },
      { name: "Java", icon: "siOpenjdk" },
      { name: "Kotlin", icon: "siKotlin" },
      { name: "Swift", icon: "siSwift" },
      { name: "Python", icon: "siPython" },
      { name: "SQL", mono: "SQL" },
    ],
  },
  {
    group: "Frontend",
    items: [
      { name: "Vue", icon: "siVuedotjs" },
      { name: "Angular", icon: "siAngular" },
      { name: "React", icon: "siReact" },
      { name: "Svelte", icon: "siSvelte" },
      { name: "Tailwind CSS", icon: "siTailwindcss" },
      { name: "PrimeVue", icon: "siPrimevue" },
      { name: "Pinia", icon: "siPinia" },
      { name: "Vite", icon: "siVite" },
    ],
  },
  {
    group: "Mobile & desktop",
    items: [
      { name: "Flutter", icon: "siFlutter" },
      { name: "React Native", icon: "siReact" },
      { name: "Cordova", icon: "siApachecordova" },
      { name: "Electron", icon: "siElectron" },
      { name: "Android", icon: "siAndroid" },
      { name: "Xcode", icon: "siXcode" },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "Laravel", icon: "siLaravel" },
      { name: "ASP.NET", icon: "siDotnet" },
      { name: "Spring Boot", icon: "siSpringboot" },
      { name: "Node.js", icon: "siNodedotjs" },
      { name: "Meteor", icon: "siMeteor" },
      { name: "Grails", mono: "Gr" },
      { name: "Django", icon: "siDjango" },
      { name: "Flask", icon: "siFlask" },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "PostgreSQL", icon: "siPostgresql" },
      { name: "Supabase", icon: "siSupabase" },
      { name: "MySQL", icon: "siMysql" },
      { name: "SQL Server", mono: "MS" },
      { name: "MongoDB", icon: "siMongodb" },
      { name: "Firebase", icon: "siFirebase" },
    ],
  },
  {
    group: "Cloud & tooling",
    items: [
      { name: "AWS", mono: "AWS" },
      { name: "Google Cloud", icon: "siGooglecloud" },
      { name: "Docker", icon: "siDocker" },
      { name: "Jenkins", icon: "siJenkins" },
      { name: "Git", icon: "siGit" },
      { name: "Cloudinary", icon: "siCloudinary" },
      { name: "Cursor", icon: "siCursor" },
      { name: "Claude Code", icon: "siClaude" },
    ],
  },
];

export type Visual = "bars" | "nodes" | "routes" | "waves" | "grid" | "rings";
export type Project = {
  slug: string;
  title: string;
  year: string;
  kind: string;
  blurb: string;
  tags: string[];
  metric: string;
  url: string;
  visual: Visual;
  /** Screenshots live in public/media/projects/<slug>/; the first one replaces the generated visual. */
  media?: { src: string; alt: string }[];
};

export const projects: Project[] = [
  {
    slug: "lewende-woord/app",
    title: "Lewende Woord App",
    year: "2026",
    kind: "Mobile app",
    blurb: "The church app for Lewende Woord Paarl: sermons, a Bible with verse of the day, events with RSVP, connect groups, courses, notes, prayer requests and push notifications.",
    tags: ["Flutter", "Supabase", "BLoC"],
    metric: "iOS + Android",
    url: "https://github.com/Edrich0902/LW_App",
    visual: "nodes",
  },
  {
    slug: "lewende-woord/portal",
    title: "Lewende Woord Portal",
    year: "2026",
    kind: "Admin portal",
    blurb: "Where church staff run the app: sermons, events, groups, announcements, media and role-based access. Rewritten from Svelte to Vue 3 as the platform grew.",
    tags: ["Vue 3", "PrimeVue", "Supabase"],
    metric: "Svelte to Vue 3 rewrite",
    url: "https://github.com/Edrich0902/LW_Portal_2.0",
    visual: "bars",
  },
  {
    slug: "lewende-woord/platform",
    title: "Lewende Woord Platform",
    year: "2026",
    kind: "Backend",
    blurb: "The Supabase backend behind the app and portal: Postgres schema and permissions, role management, group posts, prayer requests, a pastoral blog and push notification dispatch from edge functions.",
    tags: ["PostgreSQL", "Supabase", "Edge Functions"],
    metric: "20 schema migrations",
    url: "https://github.com/Edrich0902/LW_dev_supabase",
    visual: "grid",
  },
  {
    slug: "omni-level",
    title: "OmniLevel",
    year: "2026",
    kind: "macOS app",
    blurb: "Native menu-bar audio utility for Apple Silicon: per-app routing and mixing, a 16-band parametric EQ, AutoEQ headphone profiles and a full loudness monitor suite.",
    tags: ["Swift", "Core Audio", "SwiftUI"],
    metric: "16-band EQ, per-app routing",
    url: "https://github.com/Edrich0902/omni-level",
    visual: "waves",
  },
  {
    slug: "flowstate",
    title: "FlowState",
    year: "2026",
    kind: "Developer tool",
    blurb: "Menu-bar launcher that boots a whole dev environment in one click - Docker, database, backend, frontend, IDE and browser - in the right order, every time.",
    tags: ["Electron", "Vue 3", "TypeScript"],
    metric: "8+ commands to 1 click",
    url: "https://github.com/Edrich0902/Flowstate",
    visual: "routes",
  },
  {
    slug: "nexus",
    title: "Nexus Hub",
    year: "2026",
    kind: "Platform",
    blurb: "A personal life-hub that pulls Spotify, GitHub, collections, media and sport behind one API, with a Vue desktop dashboard on top.",
    tags: ["Laravel", "Vue 3", "Sanctum"],
    metric: "API + web dashboard",
    url: "https://github.com/Edrich0902/nexus-web",
    visual: "rings",
  },
];

export type Role = {
  period: string;
  role: string;
  company: string;
  where: string;
  summary: string;
  /** Shown on the homepage. */
  highlights: string[];
  /** Full list for the CV page. */
  details: string[];
  tags: string[];
};

export const experience: Role[] = [
  {
    period: "Jul 2025 - Now",
    role: "Full-Stack Software Engineer",
    company: "Inspiration Starts Here",
    where: "Remote, New York",
    summary: "Own most of the mobile side for a New York-based team of 8-10, alongside core product work on a PHP and Vue.js platform.",
    highlights: [
      "Built, solo, the white-label Flutter app that powers every one of our branded apps",
      "Release tooling that takes white-label builds to TestFlight and Google Play in as few steps as possible",
      "Built the effects and animation engine behind our site builder",
    ],
    details: [
      "Mobile engineering: designed and built, solo, a white-label Flutter application that runs all of the company's branded apps from a single codebase.",
      "Release engineering: own the iOS (TestFlight) and Android (Google Play) release process for every white-label app, and wrote the scripts and tooling that automate builds and releases down to as few steps as possible.",
      "Site builder: built the effects and animation engine that drives the visual effects in the company's website builder.",
      "Full-stack feature development: build and maintain core product features on a custom PHP backend and Vue.js frontend.",
      "Production support: take part in the on-call rotation, triaging and fixing internally reported bugs and issues.",
    ],
    tags: ["Flutter", "PHP", "Vue.js", "TestFlight", "Google Play", "Release automation"],
  },
  {
    period: "Dec 2020 - Jul 2025",
    role: "Full-Stack Software Developer",
    company: "I3 Zone Development",
    where: "Paarl, South Africa",
    summary: "Led most of the client and in-house projects I worked on, across five industries from Agri-Tech to banking.",
    highlights: [
      "Fruit-evaluation platform for ~200 users: Laravel, MySQL and Redis, an Angular front end and a native Android app",
      "Real-time cold-chain monitoring from Teltonika sensors: temperature, humidity and GPS routes on a map",
      "Project lead and main client contact; interviewed new engineering candidates",
    ],
    details: [
      "Project leadership: led most of the projects I worked on - client communication, scoping and project management through to delivery - and took part in interviewing new candidates.",
      "Agri-Tech: built and maintained a fruit-evaluation platform used by around 200 people, with a Laravel, MySQL and Redis backend, an Angular front end and a native Android app.",
      "Cold-chain monitoring: built real-time monitoring in MeteorJS on Teltonika sensors, tracking temperature and humidity and plotting GPS routes on a map.",
      "Designed and launched a fitness application with Vue.js and Cordova, focused on user experience.",
      "Contributed to cellar management systems integrating ASP.NET and React.",
      "Updated Jenkins build scripts and performed ongoing server maintenance for performance and reliability.",
      "Developed functionality for in-house solutions using Grails and Spring Boot.",
      "Implemented Cordova plugins in Swift and Kotlin for cross-platform iOS and Android support in the banking sector.",
      "Implemented device notifications using Firebase Cloud Messaging.",
      "Evaluated AWS DynamoDB for a specific project.",
    ],
    tags: ["Laravel", "Angular", "MySQL", "Redis", "Android", "MeteorJS", "Teltonika", "Vue.js", "Cordova", "ASP.NET", "React", "Grails", "Spring Boot", "Swift", "Kotlin", "Firebase", "Jenkins"],
  },
  {
    period: "Jan - Feb 2019",
    role: "Intern",
    company: "One2One IT Services & Solutions",
    where: "Paarl, South Africa",
    summary: "Hardware and software installs, networking and cabling, troubleshooting and day-to-day IT support.",
    highlights: [],
    details: [
      "Conducted general computer maintenance to keep systems performing well.",
      "Performed hardware installations, including setup and configuration of new devices.",
      "Executed software installations and setup, ensuring compatibility.",
      "Carried out networking tasks, including cabling and infrastructure support.",
      "Assisted in troubleshooting technical issues to minimise downtime.",
    ],
    tags: [],
  },
];

export const education = [
  {
    period: "2018 - 2020",
    title: "BSc Information Technology",
    school: "Pearson Institute of Higher Education",
    where: "Durbanville, South Africa",
    note: "Magna cum laude",
  },
  {
    period: "2013 - 2017",
    title: "High School Diploma",
    school: "Hoërskool Paarl Gimnasium",
    where: "Paarl, South Africa",
    note: "Academic Achievement award, 2016",
  },
];

export const awards = [
  { year: "2016", title: "Academic Achievement" },
  { year: "2016", title: "Hockey Umpire Certification, Level 0" },
];

export const currently = [
  { date: "2026-10", text: "Designing and building this website" },
  { date: "2026-09", text: "Building OmniLevel - per-app audio for macOS" },
  { date: "2026-08", text: "Push notifications and Groups 2.0 for the Lewende Woord app" },
  { date: "2026-08", text: "Shipping white-label Flutter apps at Inspiration Starts Here" },
];
