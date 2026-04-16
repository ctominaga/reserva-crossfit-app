// =====================================================================
//  MOCK DATA — Reserva CrossFit MVP
//  Todos os dados são estáticos para fins de demonstração.
// =====================================================================

export type ClassType = "WOD" | "Weightlifting" | "Endurance" | "Open Box";

export interface ClassSession {
  id: string;
  time: string;
  name: ClassType;
  coach: string;
  capacity: number;
  booked: number;
}

export interface DaySchedule {
  date: string; // ISO yyyy-mm-dd
  weekday: string; // "Seg", "Ter"...
  dayNum: number;
  sessions: ClassSession[];
}

export interface Movement {
  name: string;
  reps?: string;
  weight?: string;
  height?: string;
  distance?: string;
  description?: string;
}

export type PRCategory =
  | 'barbell'
  | 'endurance'
  | 'gymnastics'
  | 'wod_girls'
  | 'wod_heroes'
  | 'wod_open'
  | 'wod_notable';

export interface PR {
  id: string;
  movement: string;
  value: string;
  unit: string;
  date: string;
  icon: string;
  category: PRCategory;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  currentResult: string;
  previousResult?: string;
  history: { date: string; value: number }[];
  unit: "time" | "rounds" | "reps";
}

export interface RankingEntry {
  position: number;
  name: string;
  initial: string;
  color: string;
  score: number;
  isUser?: boolean;
}

export interface FeedItem {
  id: string;
  icon: "pr" | "wod" | "event";
  title: string;
  subtitle: string;
  time: string;
}

// -------------------- USER --------------------

export const mockUser = {
  name: "Lucas Mendes",
  firstName: "Lucas",
  avatar: "L",
  plan: {
    name: "Mensal Ilimitado",
    status: "active" as const,
    startedAt: "2026-03-15",
    expiresAt: "2026-05-15",
    daysUsed: 18,
    daysTotal: 30,
  },
  memberSince: "Março 2023",
  streak: 12,
  totalWorkouts: 234,
  bestRanking: 3,
  activeMonths: 14,
};

// -------------------- PLANS --------------------

export const mockPlans = [
  {
    id: "mensal",
    name: "Mensal",
    price: 199,
    period: "mês",
    features: ["Acesso ilimitado", "App exclusivo", "Suporte dos coaches"],
    current: true,
  },
  {
    id: "trimestral",
    name: "Trimestral",
    price: 179,
    period: "mês",
    features: [
      "Acesso ilimitado",
      "App exclusivo",
      "Brinde oficial Reserva",
      "10% off loja parceira",
    ],
    current: false,
    highlight: true,
  },
  {
    id: "anual",
    name: "Anual",
    price: 159,
    period: "mês",
    features: [
      "Acesso ilimitado",
      "App exclusivo",
      "Brinde oficial Reserva",
      "Análise física trimestral",
      "20% off loja parceira",
    ],
    current: false,
  },
];

// -------------------- AGENDA --------------------

export interface ScheduleSlot {
  time: string;       // "HH:MM"
  name: ClassType;
  coach: string;
}

// Capacity overrides: key = "yyyy-mm-dd|HH:MM" or "default|HH:MM"
export type CapacityOverrides = Record<string, number>;

// Schedule overrides: key = "date|yyyy-mm-dd" or "weekday|N" (0=Sun..6=Sat)
export type ScheduleOverrides = Record<string, ScheduleSlot[]>;

export function resolveCapacity(
  date: string,
  time: string,
  overrides: CapacityOverrides
): number {
  return (
    overrides[`${date}|${time}`] ??
    overrides[`default|${time}`] ??
    20
  );
}

export function resolveSchedule(
  date: string,
  overrides: ScheduleOverrides,
  defaultSlots: ScheduleSlot[]
): ScheduleSlot[] {
  const weekday = new Date(date + "T12:00:00").getDay();
  return (
    overrides[`date|${date}`] ??
    overrides[`weekday|${weekday}`] ??
    defaultSlots
  );
}

export const DEFAULT_CLASS_TIMES: ScheduleSlot[] = [
  { time: "06:00", name: "WOD", coach: "Coach Rafael" },
  { time: "07:00", name: "WOD", coach: "Coach Rafael" },
  { time: "08:00", name: "WOD", coach: "Coach Bia" },
  { time: "09:30", name: "Weightlifting", coach: "Coach Dudu" },
  { time: "12:00", name: "Open Box", coach: "Coach Marina" },
  { time: "18:00", name: "WOD", coach: "Coach Marina" },
  { time: "19:00", name: "Endurance", coach: "Coach Bia" },
  { time: "20:00", name: "WOD", coach: "Coach Dudu" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function buildWeekSchedule(
  baseDate: Date,
  scheduleOverrides: ScheduleOverrides = {},
  capacityOverrides: CapacityOverrides = {}
): DaySchedule[] {
  const week: DaySchedule[] = [];
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const seedBase = d.getDate() + d.getMonth() * 31;

    const slots = resolveSchedule(iso, scheduleOverrides, DEFAULT_CLASS_TIMES);

    const sessions: ClassSession[] = slots.map((slot, idx) => {
      const seed = seedBase * 7 + idx + 1;
      const capacity = resolveCapacity(iso, slot.time, capacityOverrides);
      const booked = Math.min(Math.floor(pseudoRandom(seed) * (capacity + 1)), capacity);
      return {
        id: `${iso}-${slot.time}`,
        time: slot.time,
        name: slot.name,
        coach: slot.coach,
        capacity,
        booked,
      };
    });

    week.push({
      date: iso,
      weekday: WEEKDAYS[d.getDay()],
      dayNum: d.getDate(),
      sessions,
    });
  }
  return week;
}

// -------------------- WOD --------------------

export const mockWOD = {
  date: new Date().toISOString(),
  dateLabel: "Quarta-feira — 15 Abr 2026",
  type: "AMRAP" as "AMRAP" | "For Time" | "EMOM" | "Chipper",
  duration: 20,
  title: "Heavy Fran Style",
  warmup: [
    "400m Run em ritmo leve",
    "3 rounds: 10 Air Squats + 10 Push-ups + 10 Pull-ups",
    "Mobilidade de ombros e quadril — 5 min",
  ],
  main: {
    description: "20 min AMRAP (As Many Rounds As Possible)",
    movements: [
      { name: "Thrusters", reps: "15 reps", weight: "43/29kg" },
      { name: "Pull-ups", reps: "10 reps" },
      { name: "Box Jumps", reps: "15 reps", height: "60/50cm" },
    ] as Movement[],
    scaling: {
      rx: "Executar conforme prescrito (43kg / 29kg, Pull-ups estritas).",
      scaled:
        "Thrusters 30/20kg · Jumping Pull-ups · Box Jumps 50/40cm ou Step-ups.",
      beginner:
        "Front Squats sem barra · Ring Rows · Step-ups em caixa baixa. Foque em técnica.",
    },
  },
  cooldown: [
    "Hip flexor stretch — 2 min por lado",
    "Pigeon pose — 2 min por lado",
    "Foam roller em quadríceps e costas — 5 min",
  ],
};

export const mockMovementLibrary: Movement[] = [
  {
    name: "Thrusters",
    description:
      "Combinação de Front Squat e Push Press. Desça controlado, exploda da posição de squat empurrando a barra acima da cabeça em um movimento fluido.",
  },
  {
    name: "Pull-ups",
    description:
      "Mãos em pronação na barra fixa. Puxe até o queixo passar a barra. Mantenha core engajado.",
  },
  {
    name: "Box Jumps",
    description:
      "Salto explosivo sobre a caixa com aterrissagem suave. Sempre estenda totalmente o quadril no topo.",
  },
  {
    name: "Air Squats",
    description:
      "Agachamento livre com foco em profundidade (quadril abaixo do joelho) e joelhos alinhados com os pés.",
  },
];

export const mockWODHistory = [
  {
    date: "14/04/2026",
    title: "EMOM 24",
    type: "EMOM",
    summary: "Power Clean + Burpees alternados por 24 minutos.",
  },
  {
    date: "13/04/2026",
    title: "Helen",
    type: "For Time",
    summary: "3 RFT: 400m Run · 21 KB Swings · 12 Pull-ups.",
  },
  {
    date: "12/04/2026",
    title: "Heavy Day",
    type: "Strength",
    summary: "Back Squat 5x5 @ 80% do 1RM.",
  },
  {
    date: "11/04/2026",
    title: "Chipper 100",
    type: "Chipper",
    summary: "100 Wall Balls · 80 DU · 60 KB · 40 Burpees · 20 Muscle-ups.",
  },
  {
    date: "10/04/2026",
    title: "Cindy",
    type: "AMRAP",
    summary: "20 min AMRAP — 5 Pull-ups · 10 Push-ups · 15 Air Squats.",
  },
  {
    date: "09/04/2026",
    title: "Snatch Focus",
    type: "Strength",
    summary: "Snatch técnica + Complex 2x3.",
  },
  {
    date: "08/04/2026",
    title: "Grace",
    type: "For Time",
    summary: "30 Clean & Jerks — For Time.",
  },
];

// -------------------- EVOLUÇÃO --------------------

export const mockPRs: PR[] = [
  // ── BARBELL ──────────────────────────────────────
  { id: 'bs',  movement: 'Back Squat',       value: '120', unit: 'kg',   date: '02/04/2026', icon: '🏋️', category: 'barbell' },
  { id: 'fs',  movement: 'Front Squat',      value: '100', unit: 'kg',   date: '28/03/2026', icon: '🏋️', category: 'barbell' },
  { id: 'dl',  movement: 'Deadlift',         value: '140', unit: 'kg',   date: '20/03/2026', icon: '💪', category: 'barbell' },
  { id: 'cj',  movement: 'Clean & Jerk',     value: '80',  unit: 'kg',   date: '15/03/2026', icon: '🔥', category: 'barbell' },
  { id: 'sn',  movement: 'Snatch',           value: '65',  unit: 'kg',   date: '10/03/2026', icon: '⚡', category: 'barbell' },
  { id: 'pc',  movement: 'Power Clean',      value: '90',  unit: 'kg',   date: '05/03/2026', icon: '💥', category: 'barbell' },
  { id: 'pp',  movement: 'Push Press',       value: '75',  unit: 'kg',   date: '01/03/2026', icon: '🎯', category: 'barbell' },
  { id: 'pr',  movement: 'Strict Press',     value: '65',  unit: 'kg',   date: '25/02/2026', icon: '💥', category: 'barbell' },

  // ── GYMNASTICS ───────────────────────────────────
  { id: 'pu',  movement: 'Pull-up (máx)',         value: '25',  unit: 'reps', date: '20/03/2026', icon: '🎯', category: 'gymnastics' },
  { id: 'du',  movement: 'Double Under (máx)',     value: '150', unit: 'reps', date: '01/04/2026', icon: '🪢', category: 'gymnastics' },
  { id: 'mu',  movement: 'Muscle-up (máx)',        value: '8',   unit: 'reps', date: '12/03/2026', icon: '🔄', category: 'gymnastics' },
  { id: 'hpu', movement: 'HSPU (máx)',             value: '15',  unit: 'reps', date: '08/03/2026', icon: '🙃', category: 'gymnastics' },
  { id: 'ttu', movement: 'Toes-to-bar (máx)',      value: '20',  unit: 'reps', date: '15/03/2026', icon: '🦵', category: 'gymnastics' },
  { id: 'bu',  movement: 'Bar Muscle-up (máx)',    value: '5',   unit: 'reps', date: '22/03/2026', icon: '🏅', category: 'gymnastics' },

  // ── ENDURANCE ────────────────────────────────────
  { id: 'r1',  movement: 'Run 400m',    value: '1:28', unit: 'min', date: '18/03/2026', icon: '🏃', category: 'endurance' },
  { id: 'r2',  movement: 'Run 1.6km',   value: '6:45', unit: 'min', date: '25/03/2026', icon: '🏃', category: 'endurance' },
  { id: 'r3',  movement: 'Row 500m',    value: '1:42', unit: 'min', date: '10/04/2026', icon: '🚣', category: 'endurance' },
  { id: 'r4',  movement: 'Row 2000m',   value: '7:20', unit: 'min', date: '02/04/2026', icon: '🚣', category: 'endurance' },

  // ── WOD GIRLS ────────────────────────────────────
  { id: 'fran',   movement: 'Fran',   value: '4:32',  unit: 'min', date: '05/04/2026', icon: '👧', category: 'wod_girls' },
  { id: 'grace',  movement: 'Grace',  value: '6:45',  unit: 'min', date: '28/03/2026', icon: '👧', category: 'wod_girls' },
  { id: 'helen',  movement: 'Helen',  value: '10:20', unit: 'min', date: '15/03/2026', icon: '👧', category: 'wod_girls' },
  { id: 'cindy',  movement: 'Cindy',  value: '22',    unit: 'rounds', date: '20/03/2026', icon: '👧', category: 'wod_girls' },
  { id: 'annie',  movement: 'Annie',  value: '8:45',  unit: 'min', date: '01/04/2026', icon: '👧', category: 'wod_girls' },
  { id: 'karen',  movement: 'Karen',  value: '6:55',  unit: 'min', date: '10/04/2026', icon: '👧', category: 'wod_girls' },

  // ── WOD HEROES ───────────────────────────────────
  { id: 'murph',  movement: 'Murph',  value: '47:30', unit: 'min', date: '30/03/2026', icon: '🦅', category: 'wod_heroes' },
  { id: 'dt',     movement: 'DT',     value: '9:10',  unit: 'min', date: '22/03/2026', icon: '🦅', category: 'wod_heroes' },
  { id: 'jt',     movement: 'JT',     value: '12:40', unit: 'min', date: '14/03/2026', icon: '🦅', category: 'wod_heroes' },

  // ── WOD NOTABLE ──────────────────────────────────
  { id: 'jackie', movement: 'Jackie', value: '8:22', unit: 'min', date: '08/04/2026', icon: '⭐', category: 'wod_notable' },
  { id: 'nancy',  movement: 'Nancy',  value: '15:40', unit: 'min', date: '25/03/2026', icon: '⭐', category: 'wod_notable' },
];

export const mockBenchmarks: Benchmark[] = [
  {
    id: "fran",
    name: "Fran",
    description: "21-15-9 Thrusters (43/29) + Pull-ups",
    currentResult: "4:32",
    previousResult: "5:10",
    unit: "time",
    history: [
      { date: "Out/25", value: 330 },
      { date: "Nov/25", value: 322 },
      { date: "Dez/25", value: 315 },
      { date: "Fev/26", value: 310 },
      { date: "Mar/26", value: 285 },
      { date: "Abr/26", value: 272 },
    ],
  },
  {
    id: "grace",
    name: "Grace",
    description: "30 Clean & Jerks (60/42) For Time",
    currentResult: "6:45",
    previousResult: "7:30",
    unit: "time",
    history: [
      { date: "Nov/25", value: 480 },
      { date: "Dez/25", value: 460 },
      { date: "Jan/26", value: 440 },
      { date: "Fev/26", value: 420 },
      { date: "Mar/26", value: 410 },
      { date: "Abr/26", value: 405 },
    ],
  },
  {
    id: "helen",
    name: "Helen",
    description: "3 RFT: 400m Run + 21 KBS + 12 Pull-ups",
    currentResult: "10:20",
    previousResult: "11:05",
    unit: "time",
    history: [
      { date: "Nov/25", value: 700 },
      { date: "Dez/25", value: 680 },
      { date: "Jan/26", value: 665 },
      { date: "Fev/26", value: 650 },
      { date: "Mar/26", value: 635 },
      { date: "Abr/26", value: 620 },
    ],
  },
  {
    id: "cindy",
    name: "Cindy",
    description: "20 min AMRAP — 5 PU · 10 PSU · 15 AS",
    currentResult: "22 rounds",
    previousResult: "19 rounds",
    unit: "rounds",
    history: [
      { date: "Out/25", value: 18 },
      { date: "Nov/25", value: 19 },
      { date: "Dez/25", value: 20 },
      { date: "Fev/26", value: 21 },
      { date: "Mar/26", value: 21 },
      { date: "Abr/26", value: 22 },
    ],
  },
  {
    id: "murph",
    name: "Murph",
    description: "1mi Run · 100 PU · 200 PSU · 300 AS · 1mi Run",
    currentResult: "47:30",
    previousResult: "52:10",
    unit: "time",
    history: [
      { date: "Set/25", value: 3200 },
      { date: "Nov/25", value: 3130 },
      { date: "Jan/26", value: 3050 },
      { date: "Fev/26", value: 2980 },
      { date: "Mar/26", value: 2900 },
      { date: "Abr/26", value: 2850 },
    ],
  },
];

// Generate frequency heatmap — last 60 days
export function buildFrequency(baseDate: Date) {
  const days: { date: string; trained: boolean; intensity: number }[] = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const seed = d.getDate() + d.getMonth() * 31 + d.getFullYear();
    const r = pseudoRandom(seed);
    const trained = r > 0.35;
    const intensity = trained ? Math.ceil(r * 4) : 0;
    days.push({ date: d.toISOString().slice(0, 10), trained, intensity });
  }
  return days;
}

export const mockWeeklyFrequency = [
  { week: "S-7", count: 3 },
  { week: "S-6", count: 4 },
  { week: "S-5", count: 5 },
  { week: "S-4", count: 4 },
  { week: "S-3", count: 5 },
  { week: "S-2", count: 3 },
  { week: "S-1", count: 4 },
  { week: "Atual", count: 4 },
];

// -------------------- RANKING --------------------

const RANKING_COLORS = [
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#10B981",
  "#F97316",
  "#6366F1",
  "#14B8A6",
];

export const mockRanking: RankingEntry[] = [
  { position: 1, name: "Beatriz Alves", initial: "B", color: RANKING_COLORS[0], score: 28 },
  { position: 2, name: "Rafael Costa", initial: "R", color: RANKING_COLORS[1], score: 26 },
  { position: 3, name: "Marina Lima", initial: "M", color: RANKING_COLORS[2], score: 25 },
  { position: 4, name: "João Pereira", initial: "J", color: RANKING_COLORS[3], score: 23 },
  { position: 5, name: "Camila Ribeiro", initial: "C", color: RANKING_COLORS[4], score: 22 },
  { position: 6, name: "Diego Santos", initial: "D", color: RANKING_COLORS[5], score: 21 },
  { position: 7, name: "Lucas Mendes", initial: "L", color: RANKING_COLORS[6], score: 20, isUser: true },
  { position: 8, name: "Fernanda Rocha", initial: "F", color: RANKING_COLORS[7], score: 19 },
  { position: 9, name: "Thiago Silva", initial: "T", color: RANKING_COLORS[8], score: 18 },
  { position: 10, name: "Paula Nogueira", initial: "P", color: RANKING_COLORS[9], score: 17 },
];

// -------------------- FEED (activity) --------------------

export const mockFeed: FeedItem[] = [
  {
    id: "f1",
    icon: "pr",
    title: "João Pereira fez PR no Deadlift",
    subtitle: "Agora em 165kg — +5kg",
    time: "há 2h",
  },
  {
    id: "f2",
    icon: "wod",
    title: "WOD do dia publicado",
    subtitle: "Heavy Fran Style — 20min AMRAP",
    time: "há 4h",
  },
  {
    id: "f3",
    icon: "event",
    title: "Copa Reserva 2026",
    subtitle: "Inscrições abertas — 15 dias para a competição",
    time: "ontem",
  },
];

// -------------------- COMMUNITY FEED (Posts) --------------------

export interface Comment {
  id: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  authorRole: "athlete" | "admin" | "coach";
  content: string;
  imageUrl?: string;
  type: "text" | "image" | "achievement" | "announcement";
  likes: number;
  comments: Comment[];
  likedByUser: boolean;
  createdAt: string;
  tags?: string[];
}

export const mockPosts: Post[] = [
  {
    id: "p1",
    authorName: "Reserva CrossFit",
    authorInitial: "R",
    authorColor: "#22C55E",
    authorRole: "admin",
    content: "Copa Reserva 2026 confirmada! Dias 10 e 11 de maio no box. Categorias RX, Scaled e Iniciante. Inscrições abertas pelo app. Bora representar!",
    imageUrl: "https://picsum.photos/seed/copa2026/600/400",
    type: "announcement",
    likes: 34,
    comments: [
      { id: "c1", authorName: "Beatriz Alves", authorInitial: "B", authorColor: "#22C55E", content: "Vai ser incrível! Já garantindo minha vaga!", createdAt: "2026-04-16T09:30:00" },
      { id: "c2", authorName: "Diego Santos", authorInitial: "D", authorColor: "#EC4899", content: "RX esse ano, sem desculpas!", createdAt: "2026-04-16T09:45:00" },
    ],
    likedByUser: false,
    createdAt: "2026-04-16T08:00:00",
    tags: ["#CopaReserva", "#PadrãoReserva"],
  },
  {
    id: "p2",
    authorName: "João Pereira",
    authorInitial: "J",
    authorColor: "#3B82F6",
    authorRole: "athlete",
    content: "NOVO PR! Deadlift 165kg! Mês passado estava em 160kg. A consistência paga o preço!",
    type: "achievement",
    likes: 22,
    comments: [
      { id: "c3", authorName: "Coach Rafael", authorInitial: "R", authorColor: "#F59E0B", content: "Monstro! Técnica perfeita no último rep!", createdAt: "2026-04-16T07:20:00" },
      { id: "c4", authorName: "Lucas Mendes", authorInitial: "L", authorColor: "#10B981", content: "Inspiração demais, João! Bora!", createdAt: "2026-04-16T07:35:00" },
    ],
    likedByUser: true,
    createdAt: "2026-04-16T07:00:00",
    tags: ["#PR", "#Deadlift"],
  },
  {
    id: "p3",
    authorName: "Coach Rafael",
    authorInitial: "R",
    authorColor: "#F59E0B",
    authorRole: "coach",
    content: "Dia de treino pesado não é dia de desistir. É dia de descobrir do que você é feito. Nos vemos às 6h. Quem vem?",
    type: "text",
    likes: 18,
    comments: [],
    likedByUser: false,
    createdAt: "2026-04-15T22:00:00",
    tags: ["#Motivação", "#PadrãoReserva"],
  },
  {
    id: "p4",
    authorName: "Reserva CrossFit",
    authorInitial: "R",
    authorColor: "#22C55E",
    authorRole: "admin",
    content: "Top 5 do WOD da semana:\n1. Beatriz A. — 4:12 (RX)\n2. Rafael C. — 4:25 (RX)\n3. Marina L. — 4:38 (RX)\n4. João P. — 4:45 (RX)\n5. Camila R. — 5:02 (Scaled)",
    type: "announcement",
    likes: 15,
    comments: [
      { id: "c5", authorName: "Camila Ribeiro", authorInitial: "C", authorColor: "#A855F7", content: "Semana que vem entro no top 3!", createdAt: "2026-04-15T19:00:00" },
    ],
    likedByUser: false,
    createdAt: "2026-04-15T18:30:00",
    tags: ["#WODdaSemana", "#Ranking"],
  },
  {
    id: "p5",
    authorName: "Beatriz Alves",
    authorInitial: "B",
    authorColor: "#22C55E",
    authorRole: "athlete",
    content: "Treino de sábado com a galera! Nada melhor que começar o fim de semana assim.",
    imageUrl: "https://picsum.photos/seed/treino-sabado/600/400",
    type: "image",
    likes: 28,
    comments: [
      { id: "c6", authorName: "Fernanda Rocha", authorInitial: "F", authorColor: "#F97316", content: "Que foto incrível! Sábado é sagrado!", createdAt: "2026-04-14T11:00:00" },
    ],
    likedByUser: true,
    createdAt: "2026-04-14T10:30:00",
    tags: ["#TreinoDeEquipe"],
  },
  {
    id: "p6",
    authorName: "Marina Lima",
    authorInitial: "M",
    authorColor: "#EF4444",
    authorRole: "athlete",
    content: "1 ano de Reserva CrossFit hoje! De não conseguir fazer 1 pull-up para fazer 15 unbroken. Gratidão a todos os coaches e parceiros de treino!",
    type: "achievement",
    likes: 45,
    comments: [
      { id: "c7", authorName: "Coach Bia", authorInitial: "B", authorColor: "#A855F7", content: "Orgulho demais, Marina! Você é exemplo de dedicação!", createdAt: "2026-04-13T17:00:00" },
      { id: "c8", authorName: "Diego Santos", authorInitial: "D", authorColor: "#EC4899", content: "Parabéns! Evolução surreal!", createdAt: "2026-04-13T17:15:00" },
      { id: "c9", authorName: "Lucas Mendes", authorInitial: "L", authorColor: "#10B981", content: "Merece demais! Continue assim!", createdAt: "2026-04-13T17:30:00" },
    ],
    likedByUser: false,
    createdAt: "2026-04-13T16:00:00",
    tags: ["#Aniversário", "#PadrãoReserva"],
  },
  {
    id: "p7",
    authorName: "Diego Santos",
    authorInitial: "D",
    authorColor: "#EC4899",
    authorRole: "athlete",
    content: "EMOM de Power Cleans bateu diferente hoje. Coach Dudu não deixa ninguém no conforto!",
    type: "text",
    likes: 9,
    comments: [],
    likedByUser: false,
    createdAt: "2026-04-13T08:00:00",
    tags: ["#WOD", "#PowerClean"],
  },
  {
    id: "p8",
    authorName: "Thiago Silva",
    authorInitial: "T",
    authorColor: "#6366F1",
    authorRole: "athlete",
    content: "Primeiro Murph sub-50! 49:32 com colete. Próxima meta: sub-45!",
    type: "achievement",
    likes: 31,
    comments: [
      { id: "c10", authorName: "Coach Rafael", authorInitial: "R", authorColor: "#F59E0B", content: "Sub-50 com colete é brabo! Parabéns, Thiago!", createdAt: "2026-04-12T16:30:00" },
    ],
    likedByUser: true,
    createdAt: "2026-04-12T16:00:00",
    tags: ["#PR", "#Murph"],
  },
  {
    id: "p9",
    authorName: "Coach Bia",
    authorInitial: "B",
    authorColor: "#A855F7",
    authorRole: "coach",
    content: "Programação da semana que vem: foco em ginástica! Muscle-ups, HSPU e pistols. Preparem-se!",
    imageUrl: "https://picsum.photos/seed/programacao/600/400",
    type: "image",
    likes: 20,
    comments: [],
    likedByUser: false,
    createdAt: "2026-04-12T12:00:00",
    tags: ["#Programação", "#Ginástica"],
  },
  {
    id: "p10",
    authorName: "Paula Nogueira",
    authorInitial: "P",
    authorColor: "#14B8A6",
    authorRole: "athlete",
    content: "Quem mais tá sentindo as pernas depois do Heavy Day de ontem? Back Squat 5x5 não perdoa!",
    type: "text",
    likes: 14,
    comments: [
      { id: "c11", authorName: "Fernanda Rocha", authorInitial: "F", authorColor: "#F97316", content: "Nem me fala... escada é o inimigo hoje!", createdAt: "2026-04-11T09:00:00" },
    ],
    likedByUser: false,
    createdAt: "2026-04-11T08:30:00",
    tags: ["#HeavyDay", "#BackSquat"],
  },
];

export interface StoryItem {
  id: string;
  name: string;
  initial: string;
  color: string;
  isBox?: boolean;
  activeToday: boolean;
}

export const mockStories: StoryItem[] = [
  { id: "s0", name: "Reserva CF", initial: "R", color: "#22C55E", isBox: true, activeToday: true },
  { id: "s1", name: "Beatriz", initial: "B", color: "#22C55E", activeToday: true },
  { id: "s2", name: "João", initial: "J", color: "#3B82F6", activeToday: true },
  { id: "s3", name: "Coach Rafael", initial: "R", color: "#F59E0B", activeToday: true },
  { id: "s4", name: "Marina", initial: "M", color: "#EF4444", activeToday: false },
  { id: "s5", name: "Diego", initial: "D", color: "#EC4899", activeToday: true },
  { id: "s6", name: "Thiago", initial: "T", color: "#6366F1", activeToday: false },
  { id: "s7", name: "Paula", initial: "P", color: "#14B8A6", activeToday: true },
  { id: "s8", name: "Camila", initial: "C", color: "#A855F7", activeToday: false },
];

// -------------------- ADMIN ATHLETES --------------------

export interface AdminAthlete {
  id: string;
  name: string;
  initial: string;
  color: string;
  email: string;
  plan: "Mensal" | "Trimestral" | "Anual";
  status: "active" | "inactive" | "overdue";
  frequency: number;
  lastWorkout: string;
  memberSince: string;
}

export const mockAdminAthletes: AdminAthlete[] = [
  { id: "a1", name: "Beatriz Alves", initial: "B", color: "#22C55E", email: "beatriz@email.com", plan: "Trimestral", status: "active", frequency: 95, lastWorkout: "Hoje", memberSince: "Jan 2024" },
  { id: "a2", name: "Rafael Costa", initial: "R", color: "#F59E0B", email: "rafael@email.com", plan: "Anual", status: "active", frequency: 88, lastWorkout: "Hoje", memberSince: "Mar 2023" },
  { id: "a3", name: "Marina Lima", initial: "M", color: "#EF4444", email: "marina@email.com", plan: "Mensal", status: "active", frequency: 82, lastWorkout: "Ontem", memberSince: "Abr 2025" },
  { id: "a4", name: "João Pereira", initial: "J", color: "#3B82F6", email: "joao@email.com", plan: "Mensal", status: "active", frequency: 65, lastWorkout: "3 dias atrás", memberSince: "Jun 2024" },
  { id: "a5", name: "Camila Ribeiro", initial: "C", color: "#A855F7", email: "camila@email.com", plan: "Trimestral", status: "active", frequency: 78, lastWorkout: "Hoje", memberSince: "Set 2024" },
  { id: "a6", name: "Diego Santos", initial: "D", color: "#EC4899", email: "diego@email.com", plan: "Mensal", status: "active", frequency: 72, lastWorkout: "Ontem", memberSince: "Nov 2024" },
  { id: "a7", name: "Lucas Mendes", initial: "L", color: "#10B981", email: "lucas@email.com", plan: "Mensal", status: "active", frequency: 82, lastWorkout: "Hoje", memberSince: "Mar 2023" },
  { id: "a8", name: "Fernanda Rocha", initial: "F", color: "#F97316", email: "fernanda@email.com", plan: "Anual", status: "active", frequency: 70, lastWorkout: "2 dias atrás", memberSince: "Fev 2024" },
  { id: "a9", name: "Thiago Silva", initial: "T", color: "#6366F1", email: "thiago@email.com", plan: "Trimestral", status: "overdue", frequency: 45, lastWorkout: "5 dias atrás", memberSince: "Jul 2025" },
  { id: "a10", name: "Paula Nogueira", initial: "P", color: "#14B8A6", email: "paula@email.com", plan: "Mensal", status: "inactive", frequency: 30, lastWorkout: "2 semanas atrás", memberSince: "Dez 2025" },
];

// -------------------- ADMIN CHECK-IN MOCK --------------------

export interface CheckinSession {
  id: string;
  time: string;
  type: ClassType;
  coach: string;
}

export const mockCheckinSessions: CheckinSession[] = [
  { id: "cs1", time: "06:00", type: "WOD", coach: "Coach Rafael" },
  { id: "cs2", time: "07:00", type: "WOD", coach: "Coach Rafael" },
  { id: "cs3", time: "08:00", type: "WOD", coach: "Coach Bia" },
  { id: "cs4", time: "09:30", type: "Weightlifting", coach: "Coach Dudu" },
  { id: "cs5", time: "18:00", type: "WOD", coach: "Coach Marina" },
  { id: "cs6", time: "19:00", type: "Endurance", coach: "Coach Bia" },
  { id: "cs7", time: "20:00", type: "WOD", coach: "Coach Dudu" },
];

export function getMockOCRResults(sessionId: string) {
  const sessionMap: Record<string, Array<{ name: string; level: string; result: string }>> = {
    cs1: [
      { name: "Beatriz Alves", level: "RX", result: "4:12" },
      { name: "Rafael Costa", level: "RX", result: "4:25" },
      { name: "João Pereira", level: "Scaled", result: "5:10" },
      { name: "Diego Santos", level: "RX", result: "4:55" },
    ],
    cs2: [
      { name: "Lucas Mendes", level: "Scaled", result: "5:32" },
      { name: "Marina Lima", level: "RX", result: "4:38" },
      { name: "Camila Ribeiro", level: "Scaled", result: "5:45" },
      { name: "Fernanda Rocha", level: "Scaled", result: "6:02" },
    ],
    cs3: [
      { name: "Thiago Silva", level: "RX", result: "4:50" },
      { name: "Paula Nogueira", level: "Beginner", result: "7:15" },
      { name: "Beatriz Alves", level: "RX", result: "4:08" },
    ],
  };
  return sessionMap[sessionId] ?? sessionMap.cs1;
}

// -------------------- WEEKDAY CHECK-IN STATS --------------------

export const mockWeekdayCheckins = [
  { day: "Seg", count: 42 },
  { day: "Ter", count: 38 },
  { day: "Qua", count: 45 },
  { day: "Qui", count: 40 },
  { day: "Sex", count: 35 },
  { day: "Sáb", count: 28 },
  { day: "Dom", count: 12 },
];

// -------------------- COACHES --------------------

export type CoachSpecialty =
  | 'WOD'
  | 'Weightlifting'
  | 'Endurance'
  | 'Gymnastics'
  | 'Nutrition';

export interface Coach {
  id: string;
  name: string;
  initial: string;
  color: string;
  specialty: CoachSpecialty[];
  bio: string;
  certifications: string[];
  activeSince: string;
  isActive: boolean;
  instagram?: string;
  scheduleIds: string[];
}

export const mockCoaches: Coach[] = [
  {
    id: 'rafael',
    name: 'Coach Rafael',
    initial: 'R',
    color: '#22C55E',
    specialty: ['WOD', 'Weightlifting'],
    bio: 'Especialista em levantamento olímpico com mais de 8 anos de experiência. Apaixonado por ajudar atletas a descobrirem seus limites.',
    certifications: ['CrossFit Level 2', 'USAW Sports Performance Coach'],
    activeSince: 'Janeiro 2020',
    isActive: true,
    instagram: 'coachrafael',
    scheduleIds: [],
  },
  {
    id: 'bia',
    name: 'Coach Bia',
    initial: 'B',
    color: '#F59E0B',
    specialty: ['WOD', 'Endurance'],
    bio: 'Atleta competitiva de CrossFit e especialista em condicionamento aeróbico. Acredita que consistência supera intensidade.',
    certifications: ['CrossFit Level 2', 'POSE Running Method'],
    activeSince: 'Março 2021',
    isActive: true,
    instagram: 'coachbia',
    scheduleIds: [],
  },
  {
    id: 'dudu',
    name: 'Coach Dudu',
    initial: 'D',
    color: '#3B82F6',
    specialty: ['Weightlifting', 'Gymnastics'],
    bio: 'Ginasta de formação, especializado em movimentos avançados de ginástica e mobilidade.',
    certifications: ['CrossFit Level 1', 'NSCA-CSCS'],
    activeSince: 'Junho 2021',
    isActive: true,
    scheduleIds: [],
  },
  {
    id: 'marina',
    name: 'Coach Marina',
    initial: 'M',
    color: '#EC4899',
    specialty: ['WOD', 'Nutrition'],
    bio: 'Nutricionista esportiva e coach CrossFit. Combina treino e alimentação para resultados duradouros.',
    certifications: ['CrossFit Level 1', 'Precision Nutrition Level 1'],
    activeSince: 'Fevereiro 2022',
    isActive: true,
    scheduleIds: [],
  },
];
