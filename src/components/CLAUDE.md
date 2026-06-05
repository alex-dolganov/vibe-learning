# src/components — компоненты

Каждый компонент имеет парный `.module.css`. Стили — только через CSS Modules.
Иконки — только из `lucide-react` (никаких эмодзи в UI). Анимации — через `framer-motion`.

## Background.jsx

Видеофон (`bg.mp4`) + затемняющий оверлей. Без пропов. Рендерится в `App.jsx` под всеми экранами.

---

## AuthPage.jsx

Экран входа/регистрации. Показывается, пока нет Supabase-сессии.

Без пропов — работает напрямую с `supabase` из `../lib/supabase`.

- Таб `login` / `register` (стейт `tab`)
- Вход по email+паролю (`signInWithPassword`) и регистрация (`signUp` с `emailRedirectTo`)
- OAuth: GitHub и Google (`signInWithOAuth`)
- `redirectTo = ${window.location.origin}${import.meta.env.BASE_URL}`
- Локальные иконки `GitHubIcon` / `GoogleIcon` (inline SVG в этом же файле)

После успешного входа `onAuthStateChange` в `App.jsx` сам переключит экран.

---

## Onboarding.jsx

3-шаговая форма после входа, если нет `userData`.

**Пропы:** `{ onComplete(userData), initialName }`
`initialName` подставляется из Supabase user_metadata (full_name / name / user_name).

**Шаги:**
1. Имя пользователя (text input)
2. Выбор роли (grid кнопок из массива `ROLES`; если "Другое" — text input)
3. Цель обучения (textarea, необязательная)

По завершению вызывает `onComplete({ name, role, goal })`. Переходы между шагами — `AnimatePresence` с направлением (`dir`).

---

## Dashboard.jsx

Главный хаб = shell с глобальным левым меню. Левый сайдбар + центральный контент + правая колонка (правая только в «Обучении»).

**Пропы:** `{ user, userId, onLogout(), onReset(), onOpenLesson(lesson, chapter) }`

Стейт `section` (`learning | notes | projects`) переключает разделы:
- `notes` → `<NotesBoard userId />`, `projects` → `<ProjectsView userId />` (правая колонка скрыта, `shellWide`).
- `learning` → стейт `activeNav` переключает 4 внутренних вью (объявлены в этом же файле):

| Вью | Что показывает |
|-----|----------------|
| `HomeView` | приветствие + карточки 5 глав с прогрессом |
| `ProgressView` | общий прогресс + по главам (бар + точки уроков) |
| `ProfileView` | аватар, роль, цель, % курса, кнопки «Начать заново» / «Выйти» |
| `AchievementsView` | сетка ачивок (`ACHIEVEMENTS`), залоченные показывают замок |

Правая колонка: «Продолжи обучение» (3 следующих урока) + «Недельный план» (`WeeklyPlan`).
Вспомогательное: `Ring` (SVG-кольцо прогресса), accent-цвета глав (`ACCENT_COLORS`), иконки глав (`CHAPTER_ICONS` — компоненты lucide).
Прогресс читается из localStorage через `getCompleted(userId)`.

---

## Reader.jsx

Экран чтения урока. Заменил старую связку CourseLayout + LessonContent.

**Пропы:** `{ user, userId, initialLesson, initialChapter, onBack() }`

- Хедер: кнопка назад, заголовок главы/урока, общий прогресс-бар, аватар
- Сайдбар-оглавление (`sideOpen` — скрыт на мобильном за бургером)
- Контент урока через `<ReactMarkdown>` с кастомными компонентами тегов
- «Отметить как пройденное» (`markComplete`) + навигация назад/вперёд между уроками
- Навигация по плоскому массиву `allLessons = courseData.flatMap(...)`

---

## NotesBoard.jsx

Канбан-доска заметок (раздел «Заметки»). Данные — Supabase через `lib/notes.js`.

**Пропы:** `{ userId }`

- 3 колонки: `idea / doing / done` (Идеи / В работе / Готово).
- **Drag & drop** (framer-motion): на `onDragEnd` хит-тест по `getBoundingClientRect` колонок (refs в `columnRefs`) → меняет `status` + `position`.
- Add/inline-edit (title+body)/delete; оптимистичный апдейт + запись в Supabase.
- Состояния loading / error (если таблицы нет — подсказка про SQL).

---

## ProjectsView.jsx

Галерея проектов + статистика (раздел «Мои проекты»). Данные — Supabase через `lib/projects.js`.

**Пропы:** `{ userId }`

- Шапка: донат-диаграмма стека (`Donut`, агрегирует `stack[]` всех проектов) + счётчики (`Counter`).
- Карточки проектов: статус-бейдж, чипы стека (цвет детерминирован хэшем имени), ссылка.
- Add/Edit через модалку (`AnimatePresence`): name, description, стек (tag-input), статус, ссылка.
- Удаление через `window.confirm`. Цвета технологий — `TECH_PALETTE` + `techColor(name)`.

---

## Легаси (не используется)

`CourseLayout.jsx`, `Sidebar.jsx`, `LessonContent.jsx` — версия до редизайна, **не импортируются** нигде. Их роль теперь выполняют `Dashboard` и `Reader`. Кандидаты на удаление.
