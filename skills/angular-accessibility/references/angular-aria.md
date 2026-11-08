# Angular Aria (headless primitives)

> Status: **New / recently introduced** (first released with v21). Angular Aria is a separate,
> installable package — `@angular/aria` — documented at
> https://angular.dev/guide/aria/overview. The examples below come directly from
> the official primitive guides; treat anything not shown there as not yet
> documented.

## What it is

Angular Aria is a collection of **headless, accessible directives** that
implement common WAI-ARIA interaction patterns. Each directive handles:

- keyboard interactions,
- ARIA attributes,
- focus management,
- screen-reader support.

"Headless" means the directives ship **behavior and accessibility only — no
styling**. You bring your own markup and CSS while the primitives keep the
interaction correct.

### When to use it

- Building a design system with specific visual standards.
- Enterprise component libraries that need WCAG compliance with custom branding.
- Custom, unstyled widgets where you control every pixel.

### When not to use it

- You want components that are already styled → use **Angular Material**.
- Simple forms → native HTML controls are enough.
- Rapid prototyping where custom styling does not matter.

## Installation

```bash
npm install @angular/aria
# or: yarn add @angular/aria
# or: pnpm add @angular/aria
# or: bun add @angular/aria
```

Import the directives for the pattern you need from its subpath, then add them to
a standalone component's `imports`. Directives are applied with attribute
selectors (e.g. `ngListbox`, `ngOption`).

## Available primitives

Each lives under its own subpath of `@angular/aria` and has a matching docs page
under `/guide/aria/<name>`:

- **Search & selection:** Autocomplete, Listbox, Select, Multiselect, Combobox
- **Navigation & actions:** Menu, Menubar, Toolbar
- **Content organization:** Accordion, Tabs, Tree, Grid

Most primitives also ship a testing harness under
`@angular/aria/<name>/testing` (e.g. `ListboxHarness`, `TabsHarness`,
`AccordionGroupHarness`) for use with `@angular/cdk/testing`.

## Common configuration patterns

Several selection/navigation primitives share inputs:

- `orientation`: `'vertical' | 'horizontal'`
- `selectionMode`: `'follow'` (activate on focus) | `'explicit'` (require
  Space/Enter)
- `focusMode`: `'roving' | 'activedescendant'`
- `wrap`: whether arrow-key navigation wraps at the edges
- `multi`: enable multiple selection (where applicable)
- `disabled` / `softDisabled`: `softDisabled` items stay focusable
- `value` / two-way binding for the current selection

Standard keyboard support across primitives: Arrow keys to navigate
(orientation-aware), Home/End to jump to first/last, Space/Enter to activate in
explicit mode, and type-ahead for text matching.

## Listbox

```typescript
import {Component} from '@angular/core';
import {Listbox, Option} from '@angular/aria/listbox';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Listbox, Option],
})
export class App {
  options = ['Option 1', 'Option 2', 'Option 3'];
}
```

```html
<div ngListbox [value]="['Option 1']">
  @for (option of options; track option) {
    <div ngOption [value]="option">
      <span>{{ option }}</span>
    </div>
  }
</div>
```

Horizontal, multi-select, explicit selection:

```html
<div
  ngListbox
  aria-label="Amenities"
  orientation="horizontal"
  selectionMode="explicit"
  multi
>
  @for (amenity of amenities; track amenity) {
    <div ngOption [value]="amenity" [label]="amenity">
      <span>{{ amenity }}</span>
    </div>
  }
</div>
```

Key inputs (`ngListbox`): `multi`, `orientation` (default `'vertical'`),
`selectionMode` (default `'follow'`), `value` (two-way), `disabled`, `readonly`,
`wrap` (default `true`), `typeaheadDelay` (default `500`), `focusMode` (default
`'roving'`), `softDisabled` (default `true`). Exposes a `value` signal and
methods `gotoFirst()` and `scrollActiveItemIntoView()`.

Key inputs (`ngOption`): `value` (required), `label`, `disabled`, `id`. Exposes
`selected()` and `active()` signals.

## Tabs

```typescript
import {Component} from '@angular/core';
import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
})
export class App {}
```

```html
<div ngTabs>
  <div ngTabList selectionMode="follow" selectedTab="movie">
    <div ngTab value="movie">Movie</div>
    <div ngTab value="cast">Cast</div>
    <div ngTab value="reviews">Reviews</div>
  </div>

  <div ngTabPanel value="movie">
    <ng-template ngTabContent>Panel 1</ng-template>
  </div>
  <div ngTabPanel value="cast">
    <ng-template ngTabContent>Panel 2</ng-template>
  </div>
  <div ngTabPanel value="reviews">
    <ng-template ngTabContent>Panel 3</ng-template>
  </div>
</div>
```

- `ngTabContent` on an `<ng-template>` lazily renders panel content on first
  activation; set `[preserveContent]="false"` on a panel to discard content when
  deactivated.
- `ngTabList` inputs: `orientation` (default `'horizontal'`), `selectionMode`
  (default `'follow'`), `wrap` (default `true`), `softDisabled` (default
  `true`), `focusMode` (default `'roving'`), `selectedTab` (two-way).
- `ngTab` inputs: `value` (required), `disabled`; signals `selected()`,
  `active()`. Mark a tab `disabled` and set `[softDisabled]="false"` on the list
  to skip it during navigation.

## Accordion

```typescript
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';
```

```html
<div ngAccordionGroup [multiExpandable]="false">
  <h3>
    <span ngAccordionTrigger [panel]="panel1" #trigger1="ngAccordionTrigger">
      Question
      <span [class.expanded]="trigger1.expanded()">icon</span>
    </span>
  </h3>
  <div ngAccordionPanel #panel1="ngAccordionPanel">
    <ng-template ngAccordionContent>
      <p>Answer content</p>
    </ng-template>
  </div>
</div>
```

- `ngAccordionGroup`: `[multiExpandable]` (default `true`), `[disabled]`,
  `[softDisabled]` (default `true`), `[wrap]` (default `false`); methods
  `expandAll()`, `collapseAll()`.
- `ngAccordionTrigger`: `[panel]` (required), `[expanded]`, `[disabled]`,
  `[id]`; signal `active()`; methods `expand()`, `collapse()`, `toggle()`.
- `ngAccordionPanel`: `[id]`, `[preserveContent]` (default `true`); signal
  `visible()`.
- `ngAccordionContent` (structural, on `<ng-template>`): defers rendering until
  the panel first expands.

## Menu

The menu primitive shows actions/options, typically in response to a button
click, and renders in an overlay. It depends on `@angular/cdk/overlay`.

```typescript
import {Menu, MenuContent, MenuItem, MenuTrigger} from '@angular/aria/menu';
```

- `ngMenuTrigger` button input: `[menu]` — reference to the `Menu` to control.
- `ngMenuItem` inputs: `value`, `[disabled]`, `[softDisabled]`, `[submenu]`
  (reference a nested `Menu` for submenus).
- Use `viewChild<Menu<T>>()` in the component to get the menu reference and pass
  it to the trigger via `[menu]`.
- Supports nested submenus, checkbox/radio menu items, configurable auto-close,
  RTL, and keyboard navigation (arrows, Home/End, type-ahead).

Use menu for command/context/dropdown-action menus — **not** for site
navigation (use links), form selects (use Select), panel switching (use Tabs),
or collapsible content (use Accordion).

## Other documented primitives

Each has its own guide page under `/guide/aria/<name>`: **Autocomplete**,
**Combobox**, **Select**, **Multiselect**, **Menubar**, **Toolbar**, **Tree**,
**Grid**. They follow the same import-from-subpath + attribute-selector model,
for example:

```typescript
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';
```

Consult the corresponding doc page for the exact directive names and inputs
before using one of these — only the patterns shown above are reproduced here.

## Best practices

- Reach for `@angular/aria` only when you need full styling control; otherwise
  use Angular Material for accessible, pre-styled components.
- Import each pattern from its own subpath (`@angular/aria/<name>`) and add the
  directives to the standalone component's `imports`.
- Use `@for` with `track` to render option/tab/item lists.
- Prefer `selectionMode="explicit"` when accidental selection on focus would be
  harmful; use `'follow'` for fast, low-risk pickers.
- Use the `ng…Content` structural directives on `<ng-template>` to lazily render
  heavy panel/menu content.
- Keep disabled items focusable with `softDisabled` so screen-reader users can
  still perceive them; set `[softDisabled]="false"` only when you intend to skip
  them entirely.
- Use the provided testing harnesses (`@angular/aria/<name>/testing`) instead of
  asserting on raw DOM/ARIA attributes.

## Common mistakes

- Expecting styled output — these primitives are headless; you must provide all
  CSS.
- Importing from `@angular/aria` root instead of the pattern subpath (e.g.
  `@angular/aria/listbox`).
- Using the Menu primitive without `@angular/cdk/overlay`, or for site
  navigation instead of an actual menu pattern.
- Re-implementing ARIA roles/keyboard handling on top of these directives —
  they already provide it; adding your own can conflict.
- Treating the package as stable/long-standing API: it is newly introduced, so
  verify exact inputs against the current `/guide/aria/<name>` docs.
