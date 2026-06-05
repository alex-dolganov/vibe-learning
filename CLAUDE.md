# Build&Vibe — обзор проекта

Образовательная платформа для нетехнических сотрудников IT-команд. Учит понимать процессы разработки.

## Стек

- React 18 + Vite 5
- **Supabase** (`@supabase/supabase-js`) — авторизация (GitHub, Google, Email)
- **framer-motion** — анимации переходов и микровзаимодействий
- **lucide-react** — все иконки интерфейса (никаких эмодзи в UI)
- CSS Modules (никакого styled-components/Tailwind)
- react-markdown для рендера контента уроков
- Без TypeScript, без роутера, без state-manager

## Команды

```bash
npm run dev       # локальный сервер
npm run build     # сборка в dist/
npm run preview   # превью собранного
npm run lint      # ESLint
```

## Переменные окружения

Нужны для Supabase. Локально — в `.env.local` (см. `.env.local.example`):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Если переменные не заданы, `lib/supabase.js` использует placeholder и пишет warning в консоль (приложение не падает, но auth не работает).

При деплое эти значения берутся из **GitHub Secrets** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — см. `.github/workflows/deploy.yml`.

## Деплой

GitHub Pages. Автодеплой через GitHub Actions при пуше в `main`.
Сайт: https://alex-dolganov.github.io/vibe-learning/
`vite.config.js` имеет `base: '/vibe-learning/'` — обязательно для GH Pages.
Redirect-URL для OAuth/email строится как `${window.location.origin}${import.meta.env.BASE_URL}`.

## Структура

```
src/
  App.jsx              # корень: роутинг между Auth/Onboarding/Dashboard/Reader
  App.css              # глобальные стили
  index.css            # CSS-reset и body-стили
  main.jsx             # ReactDOM.createRoot точка входа
  lib/
    supabase.js        # инициализация Supabase-клиента
  components/          # UI-компоненты (см. src/components/CLAUDE.md)
  data/
    course.js          # весь контент курса (см. src/data/CLAUDE.md)
  assets/              # hero.png, react.svg, vite.svg
public/
  bg.mp4               # видео-фон (loop, muted, autoplay)
  favicon.svg
  icons.svg
```

## Флоу приложения

`App.jsx` держит четыре экрана и выбирает один по состоянию сессии и данных пользователя:

1. **AuthPage** — если нет Supabase-сессии (`!session`)
2. **Onboarding** — есть сессия, но нет `userData` в localStorage (3 шага: имя → роль → цель)
3. **Dashboard** — есть сессия и `userData`, урок не открыт (главный хаб)
4. **Reader** — открыт конкретный урок (`readerLesson` задан)

Переходы между экранами анимируются через `AnimatePresence mode="wait"`.
Сессия отслеживается через `supabase.auth.onAuthStateChange`. Выход — `supabase.auth.signOut()`.

### Разделы внутри Dashboard

`Dashboard` — это shell с глобальным левым меню (стейт `section`):

- **Обучение** (`learning`) — курс: под-навигация Главная/Прогресс/Профиль/Достижения + правая колонка.
- **Заметки** (`notes`) — `NotesBoard`: канбан с drag&drop (framer-motion), хранится в Supabase.
- **Мои проекты** (`projects`) — `ProjectsView`: галерея проектов + диаграмма стека, хранится в Supabase.

Вне «Обучения» правая колонка скрыта (`shellWide`).

## localStorage

Ключи **привязаны к Supabase user id** (`session.user.id`), чтобы данные разных аккаунтов не смешивались:

| Ключ | Содержимое |
|------|------------|
| `vibecoder_user_${userId}` | `{ name, role, goal }` — результат онбординга |
| `vibecoder_progress_${userId}` | массив строк — ID пройденных уроков (`"1-1"`, `"2-3"` и т.д.) |
| `vibecoder_activity_${userId}` | `{ "ГГГГ-ММ-ДД": число }` — активность по дням для heatmap в профиле (см. `lib/progress.js`) |

Профиль и прогресс курса хранятся **в localStorage**. Заметки и проекты — **в Supabase** (см. ниже).

## Supabase: таблицы

Кроме аутентификации, Supabase хранит данные разделов Заметки и Проекты. Схема — `supabase/migrations/0001_notes_projects.sql` (выполнить один раз в SQL Editor). Приватность — через RLS (`auth.uid() = user_id`), `user_id` дефолтится `auth.uid()`.

| Таблица | Содержимое | Клиент |
|---------|------------|--------|
| `notes` | карточки канбана: `title, body, status(idea/doing/done), position, color` | `lib/notes.js` |
| `projects` | проекты: `name, description, stack text[], status, link, color` | `lib/projects.js` |

## Видеофон

Компонент `<Background>` (`components/Background.jsx`) рендерит `<video>` с `src={BASE_URL}bg.mp4` и затемняющий оверлей. Рендерится всегда, под всеми экранами.
