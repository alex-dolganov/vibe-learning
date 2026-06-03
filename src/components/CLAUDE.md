# src/components — компоненты

Каждый компонент имеет парный `.module.css`. Стили — только через CSS Modules.

## Onboarding.jsx

3-шаговая форма перед началом курса.

**Пропы:** `{ onComplete(userData) }`

**Шаги:**
1. Имя пользователя (text input)
2. Выбор роли (grid кнопок из массива `ROLES`; если "Другое" — показывается text input)
3. Цель обучения (textarea, необязательная)

По завершению вызывает `onComplete({ name, role, goal })`.

---

## CourseLayout.jsx

Основной экран курса после онбординга.

**Пропы:** `{ user: { name, role, goal }, onReset() }`

Управляет: выбором урока, прогрессом, открытием сайдбара.
Рендерит: header с прогресс-баром, Sidebar, LessonContent.

Навигация между уроками: плоский массив `allLessons = courseData.flatMap(ch => ch.lessons)`.

---

## Sidebar.jsx

Список глав и уроков курса.

**Пропы:** `{ chapters, activeLesson, completed, onSelect(lesson), isOpen }`

- `isOpen` управляет видимостью на мобильном (CSS класс `sidebarOpen`)
- Урок подсвечивается если `activeLesson.id === lesson.id`
- Урок отмечается галочкой если `completed.includes(lesson.id)`

---

## LessonContent.jsx

Рендер контента урока + навигация.

**Пропы:** `{ lesson, isCompleted, onComplete(), onNext(), onPrev(), nextTitle }`

- Контент рендерится через `<ReactMarkdown>` с кастомными компонентами для всех тегов (h1–h3, p, ul, ol, li, blockquote, code, pre, table, th, td, strong, hr)
- Кнопка "Отметить как пройденное" скрывается после нажатия, появляется бейдж "Пройдено"
- Кнопка "Следующий урок →" одновременно вызывает `onComplete()` и `onNext()`
