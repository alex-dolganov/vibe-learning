# src — архитектура

## Дерево компонентов

```
App                          # выбирает один из 4 экранов по состоянию
├── <Background>             # видеофон + оверлей, всегда снизу
└── <AnimatePresence>        # анимированный переход между экранами
    ├── AuthPage             # !session
    ├── Onboarding           # session && !userData
    ├── Dashboard            # session && userData && !readerLesson
    └── Reader               # session && userData && readerLesson
```

## Стейт в App.jsx

```js
const [session, setSession]           // undefined → загрузка, null → нет, объект → есть
const [userData, setUserData]         // { name, role, goal } из localStorage или null
const [readerLesson, setReaderLesson] // открытый урок или null
const [readerChapter, setReaderChapter]
```

- При монтировании: `supabase.auth.getSession()` + подписка на `onAuthStateChange`
- `userData` читается из `localStorage[vibecoder_user_${userId}]` при наличии сессии
- `handleOnboardingComplete(data)` — пишет userData в localStorage, setUserData
- `handleReset()` — удаляет оба ключа пользователя, возвращает на онбординг
- `handleLogout()` — `supabase.auth.signOut()`
- `handleOpenLesson(lesson, chapter)` — открывает Reader

Пока `session === undefined` (первая проверка) ничего не блокируется — `showAuth` завязан на `!session`, поэтому до резолва промиса экран пустой доли секунды.

## Стейт в Dashboard.jsx

```js
const [section, setSection]       // 'learning' | 'notes' | 'projects' — глобальный раздел
const [activeNav, setActiveNav]   // 'home' | 'progress' | 'profile' | 'achievements' (только learning)
```

`section` переключает левое меню: `notes` → `NotesBoard`, `projects` → `ProjectsView`, `learning` → курс.
Прогресс читается из localStorage синхронно при каждом рендере (`getCompleted(userId)`), не хранится в стейте — Dashboard не мутирует прогресс, только отображает.

## Стейт в Reader.jsx

```js
const [activeLesson, setActiveLesson] // текущий урок
const [completed, setCompleted]       // массив ID пройденных, синхронно с localStorage
const [sideOpen, setSideOpen]         // сайдбар-оглавление на мобильном
```

`markComplete(id)` дописывает урок в `completed` и сохраняет в `localStorage[vibecoder_progress_${userId}]`.

## Авторизация и данные (Supabase)

`lib/supabase.js` экспортирует единственный `supabase`-клиент. Используется в `App.jsx` (сессия) и `AuthPage.jsx` (вход/регистрация). Провайдеры: GitHub, Google (OAuth) и Email+пароль.

Слой данных (async, через тот же клиент, RLS ограничивает строки юзером):
- `lib/notes.js` — CRUD заметок (таблица `notes`).
- `lib/projects.js` — CRUD проектов (таблица `projects`).
- `lib/progress.js` — активность для heatmap (localStorage, не Supabase).

Схема таблиц — `supabase/migrations/0001_notes_projects.sql` (применяется вручную в Supabase SQL Editor).

## Добавить новый компонент

1. Создать `src/components/MyComp.jsx` + `MyComp.module.css`
2. Импортировать в нужном месте (обычно `App.jsx`, `Dashboard.jsx` или `Reader.jsx`)
3. Иконки — только из `lucide-react`, анимации — через `framer-motion`
4. Обновить `src/components/CLAUDE.md`

## Легаси (не используется)

`CourseLayout.jsx`, `Sidebar.jsx`, `LessonContent.jsx` (+ их `.module.css`) — остатки версии до редизайна. Сейчас **не импортируются** нигде (App.jsx использует Dashboard + Reader). Можно удалить; оставлены до явной чистки.
