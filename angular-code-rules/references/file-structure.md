# File & Project Structure

Grounded in the official Angular Style Guide (angular.dev / next.angular.dev).
Targets modern Angular (v21/v22).

## Where code lives

- **All Angular UI code** (TypeScript, HTML, and styles) should live inside a
  directory named **`src`**.
- **Bootstrap the application in `main.ts`** directly inside `src`. The code that
  starts up an Angular application always lives in `main.ts`.

## Group related files together

- **Group closely related files in the same directory.** A component's
  TypeScript, template, and style files belong together.
- **Co-locate unit tests with the code under test.** Avoid collecting unrelated
  tests into a single `tests` directory.

## One concept per file

- **Prefer focusing each source file on a single concept.** Typically one
  component, directive, or service per file.
- The exception: small classes that form a single cohesive unit may share a
  file.

## Organize by feature, not by file type

- **Organize the project by feature areas**, not by the kind of code.
- **Avoid** top-level/grouping directories named after types such as
  `components/`, `directives/`, or `services/`.

### Example feature-based layout

```
src/
├─ main.ts
├─ movie-reel/
│  ├─ show-times/
│  │  ├─ film-calendar/
│  │  │  ├─ film-calendar.ts
│  │  │  ├─ film-calendar.html
│  │  │  ├─ film-calendar.css
│  │  │  └─ film-calendar.spec.ts
│  │  └─ film-details/
│  ├─ reserve-tickets/
│  │  ├─ payment-info/
│  │  └─ purchase-confirmation/
```

Each feature folder holds the component files **and** their tests together.

## DO / DON'T

DO:
- Keep all UI code under `src`.
- Bootstrap in `src/main.ts`.
- Put a component's `.ts`, `.html`, `.css`, and `.spec.ts` in the same folder.
- Group folders by feature area (e.g. `show-times/`, `reserve-tickets/`).
- Keep one concept (component/directive/service) per file.

DON'T:
- Create type-based folders like `components/`, `services/`, `directives/`.
- Put tests in a separate centralized `tests/` directory.
- Mix multiple unrelated concepts into one file.
