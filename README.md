# Reserva CrossFit — MVP App

Protótipo funcional e navegável do aplicativo do **Reserva CrossFit** (Sorocaba/SP).
Web app responsivo (mobile-first) construído para validar o MVP junto ao dono do box antes do desenvolvimento real.

> **Demo v1.0** — Todos os dados são mockados. Sem backend, sem autenticação real.

---

## Stack

- **React 18 + Vite + TypeScript** — scaffolding rápido, build instantâneo
- **Tailwind CSS 3** — design system via tokens da marca
- **React Router 6** (HashRouter) — navegação client-side que funciona em qualquer host estático sem rewrite rules
- **Lucide React** — ícones
- **Recharts** — gráficos de evolução e frequência
- **localStorage** — persiste reservas, toggles e estado de onboarding entre sessões

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

Build de produção:

```bash
npm run build
npm run preview
```

O bundle gerado vai para `dist/`.

---

## Deploy

### Vercel

```bash
npm i -g vercel
vercel deploy
# ou, para produção direta:
vercel --prod
```

`vercel.json` já está configurado para SPA rewrites.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
# ou
netlify deploy --prod --dir=dist
```

`netlify.toml` já está configurado com `publish = "dist"` e redirects.

### Drop-in (manual)

Qualquer host estático (GitHub Pages, Cloudflare Pages, S3) funciona — faça o build e suba o conteúdo de `dist/`. Como usamos `HashRouter`, nenhuma configuração de servidor é necessária.

---

## Estrutura

```
src/
├── app/       — não usado (Next.js style); veja pages/
├── pages/
│   ├── Onboarding.tsx   — splash + entrada demo
│   ├── Home.tsx         — dashboard, plano, próxima aula, feed
│   ├── Agenda.tsx       — grade semanal, reservas, check-in QR
│   ├── WOD.tsx          — WOD do dia, scaling, registro, biblioteca
│   ├── Evolucao.tsx     — PRs, benchmarks, heatmap, ranking
│   └── Perfil.tsx       — perfil, stats, planos, configurações
├── components/
│   ├── layout/          — Header, TabBar
│   ├── ui/              — Card, Badge, Modal, Toast, EmptyState
│   └── features/        — ClassCard, WODCard, PRCard, RankingList
├── data/mock.ts         — toda a base mockada
├── hooks/               — useToast, useLocalStorage
└── styles/globals.css   — variáveis da marca + utilitários Tailwind
```

---

## Identidade visual

- **Verde** `#22C55E` — acento único
- **Fundo preto** `#0A0A0A` — dark mode only
- **Barlow Condensed** (display) + **Barlow** (body) via Google Fonts
- Hashtag `#PadrãoReserva` na splash

---

## Recursos interativos

- Reservar / cancelar vagas em aulas → toast + persistência
- Check-in com QR Code decorativo
- Atualizar PR com modal
- Alternar escala RX / Scaled / Beginner no WOD
- Gráficos responsivos de evolução por benchmark
- Heatmap de frequência (60 dias) no estilo contribuição GitHub
- Ranking com pódio visual top 3 + destaque do usuário logado
- Seletor de planos (Mensal / Trimestral / Anual)
- Toggle de notificações com persistência

---

## Checklist de qualidade ✅

- [x] Mobile-first, 375px mínimo
- [x] Tab bar fixa com `pb-24` nas páginas
- [x] Feedback visual em toda interação
- [x] Verde consistente em botões, badges, destaques
- [x] Tipografia Barlow Condensed carregada via Google Fonts
- [x] Transições fade entre rotas
- [x] QR Code renderizado como SVG nativo
- [x] `ResponsiveContainer` em todos os gráficos Recharts
- [x] `npm run build` funciona sem erros
- [x] `vercel.json` e `netlify.toml` prontos

---

## Para o dono do box

Basta abrir o link em qualquer celular. Navegue pelas 5 abas inferiores:

1. **Início** — veja como seu aluno abre o app todo dia
2. **Agenda** — reserve uma aula e simule o check-in
3. **WOD** — veja o treino do dia e registre seu resultado
4. **Evolução** — acompanhe PRs, benchmarks e ranking
5. **Perfil** — gerencie plano e configurações

Dúvidas? Fale com a equipe de produto.
