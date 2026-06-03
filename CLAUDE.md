# VibeCoder Academy — обзор проекта

Образовательная платформа для нетехнических сотрудников IT-команд. Учит понимать процессы разработки.

## Стек

- React 18 + Vite 5
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

## Деплой

GitHub Pages. Автодеплой через GitHub Actions при пуше в `main`.
Сайт: https://alex-dolganov.github.io/vibe-learning/
`vite.config.js` имеет `base: '/vibe-learning/'` — обязательно для GH Pages.

## Структура

```
src/
  App.jsx              # корень: видеофон + Onboarding/CourseLayout
  App.css              # глобальные стили (.bgVideo, .bgOverlay)
  index.css            # CSS-reset и body-стили
  main.jsx             # ReactDOM.createRoot точка входа
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

1. `App.jsx` проверяет `localStorage.vibecoder_user`
2. Если нет → показывает `<Onboarding>` (3 шага: имя → роль → цель)
3. После онбординга → `<CourseLayout>` (сайдбар + уроки)
4. Кнопка ↩ в хедере сбрасывает user и progress из localStorage

## localStorage

| Ключ | Содержимое |
|------|------------|
| `vibecoder_user` | `{ name, role, goal }` |
| `vibecoder_progress` | массив строк — ID пройденных уроков (`"1-1"`, `"2-3"` и т.д.) |

## Видеофон

`<video>` с `src={BASE_URL}bg.mp4` рендерится всегда (и в Onboarding, и в CourseLayout).
Поверх него — `<div className="bgOverlay">` с полупрозрачным затемнением.
