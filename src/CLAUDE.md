# src — архитектура

## Дерево компонентов

```
App
├── <video bgVideo>       # видеофон, всегда рендерится
├── <div bgOverlay>       # затемнение поверх видео
├── Onboarding            # если нет user в localStorage
└── CourseLayout          # если user есть
    ├── <header>          # лого + прогрессбар + имя пользователя + кнопка сброса
    ├── Sidebar           # список глав и уроков
    └── LessonContent     # контент активного урока (ReactMarkdown)
```

## Стейт в App.jsx

```js
const [user, setUser] = useState(null)  // { name, role, goal } или null
```

- При монтировании читает `localStorage.vibecoder_user`
- `handleOnboardingComplete(userData)` — записывает в localStorage и setUser
- `handleReset()` — удаляет оба ключа из localStorage, setUser(null)

## Стейт в CourseLayout.jsx

```js
const [activeLesson, setActiveLesson]   // текущий урок (объект из courseData)
const [completed, setCompleted]         // массив ID пройденных уроков
const [sidebarOpen, setSidebarOpen]     // булевый — видимость сайдбара на мобильном
```

`completed` синхронизируется с `localStorage.vibecoder_progress`.

## Добавить новый компонент

1. Создать `src/components/MyComp.jsx` + `MyComp.module.css`
2. Импортировать в нужном месте (обычно `CourseLayout.jsx` или `App.jsx`)
3. Обновить `src/components/CLAUDE.md`
