# Choosing an Architecture: Monolith vs Monorepo vs Micro-Frontend

This is the most consequential decision you will make. Get it wrong toward complexity (micro-frontends when you didn't
need them) and you pay forever in operational overhead. Get it wrong toward a tangled monolith and you pay in coupling
and slow teams. Fortunately, the modern Angular toolchain lets you get **most** of the benefits of separation *inside* a
single repo, which is why the default answer is "modular monolith / monorepo."

## The three options, precisely

1. **Single-app modular monolith** — One Angular application, one repository, one deployment. Internally split into
   domain feature folders with clear boundaries. No Nx required (though Nx helps even here).
2. **Monorepo (Nx)** — One repository, possibly several deployable apps, and many internal **libraries** (`libs/`).
   Boundaries are *enforced by lint*. Each library is independently testable and owned, but the repo builds and (
   usually) deploys as coordinated units. This is the enterprise default. **[Documented — Nx]**
3. **Micro-frontends (MFEs)** — Multiple **independently deployable** frontends, each built and shipped on its own
   pipeline, composed at runtime by a **shell**. The only option that delivers true independent deployment. *
   *[Documented — Native/Module Federation]**

> Vocabulary: "monolith" here means *modular* monolith — internally well-structured. The opposite is a "big ball of
> mud," which is a failure mode of *any* architecture, not a synonym for monolith.

## Decision factors

| Factor                      | Modular monolith                             | Monorepo (Nx)                         | Micro-frontends                                                   |
|-----------------------------|----------------------------------------------|---------------------------------------|-------------------------------------------------------------------|
| **Team size**               | 1–8 devs, single team                        | Several teams, one org                | Multiple autonomous teams, often separate orgs/vendors            |
| **Independent deployment**  | No (one deploy)                              | Coordinated (usually one/few deploys) | **Yes — the defining benefit**                                    |
| **Domain count**            | A handful                                    | Many domains, shared libs             | Many domains owned by separate teams                              |
| **Release cadence**         | Single, shared                               | Single/coordinated                    | **Per-team, divergent cadences**                                  |
| **Tech/version uniformity** | One version                                  | One version (single-version policy)   | Can differ per remote (e.g., mixed Angular versions / frameworks) |
| **Build/CI complexity**     | Low                                          | Medium (use `nx affected` + caching)  | **High** (N pipelines + integration)                              |
| **Runtime complexity**      | Low                                          | Low                                   | **High** (shared deps, version negotiation, cross-MFE comms)      |
| **Code sharing**            | In-app imports                               | First-class via libs + boundaries     | Hard — must share at runtime, version-matched                     |
| **Bundle/perf**             | Best (one optimizer pass, full tree-shaking) | Best                                  | Risk of duplicated deps; needs careful sharing                    |
| **Operational overhead**    | Minimal                                      | Low–medium                            | High (hosting per remote, manifests, versioning)                  |
| **Refactor across domains** | Easy (atomic)                                | Easy (atomic, single repo)            | Hard (cross-repo, versioned contracts)                            |
| **Onboarding**              | Easiest                                      | Easy (one repo, clear structure)      | Hardest                                                           |

## Conway's Law (read this before deciding)

> "Organizations design systems that mirror their communication structure." — Melvin Conway

Architecture and org structure converge whether you plan it or not. Practical implications:

- **One team → modular monolith.** Splitting one team's work into MFEs creates coordination overhead with no autonomy
  payoff.
- **Several teams in one org with shared roadmap → Nx monorepo.** Boundaries-as-code (tags) give each team a clear "you
  own these libs" without operational fragmentation. CODEOWNERS encodes the org chart.
- **Multiple genuinely autonomous teams shipping on their own schedules (the classic "we can't all release together") →
  micro-frontends.** Here the *org* already demands deployment independence; MFEs make the architecture match reality.

**Inverse Conway maneuver [Recommended practice]:** If you *want* autonomous teams, structure code boundaries (Nx
scopes / MFE remotes) first and let teams form around them — rather than letting an accidental org chart dictate a
tangled architecture.

## Decision flowchart (text)

```
START
 │
 ├─ Do separate teams need to deploy the frontend on
 │  INDEPENDENT schedules (different release days/pipelines)?
 │        │
 │        ├─ NO ──────────────────────────────────────────────┐
 │        │                                                    │
 │        └─ YES                                               │
 │             │                                               │
 │             ├─ Is the deployment-independence a HARD,        │
 │             │  current requirement (not aspirational)?      │
 │             │      │                                        │
 │             │      ├─ NO → revisit later; for now ──────────┤
 │             │      └─ YES                                    │
 │             │           │                                   │
 │             │           ├─ Do remotes need different         │
 │             │           │  frameworks/Angular versions, or   │
 │             │           │  are they owned by separate orgs?  │
 │             │           │      ├─ YES → MICRO-FRONTENDS      │
 │             │           │      │        (Native Federation,  │
 │             │           │      │         independent repos   │
 │             │           │      │         or Nx + MFE)        │
 │             │           │      └─ NO  → MICRO-FRONTENDS,     │
 │             │           │               but host them in an  │
 │             │           │               Nx monorepo if one   │
 │             │           │               org owns them        │
 │             │           ▼                                    │
 │             ▼                                                ▼
 │   (MFE branch ends)                          Is there more than ONE
 │                                              deployable app, OR multiple
 │                                              teams, OR a need to share
 │                                              libraries (design system,
 │                                              data-access) across apps?
 │                                                   │
 │                                                   ├─ YES → NX MONOREPO
 │                                                   │        (apps/ + libs/,
 │                                                   │         enforced tags)
 │                                                   │
 │                                                   └─ NO  → SINGLE-APP
 │                                                            MODULAR MONOLITH
 ▼
END
```

## Decision / when to use

- **Choose single-app modular monolith** when: one team, one product surface, a handful of domains, no need to share
  code with other apps. Cheapest, fastest, easiest to operate. You can graduate to Nx later with minimal churn if you
  kept feature boundaries clean.
- **Choose an Nx monorepo** when: multiple teams and/or multiple deployable apps in one org, you want to share a design
  system / data-access / utils, and you want **enforced** boundaries. This is the enterprise sweet spot. *
  *[Documented — Nx]**
- **Choose micro-frontends** when: independent deployment by autonomous teams is a hard requirement; teams release on
  different schedules; or you must integrate frontends owned by different orgs/vendors or built on different
  versions/frameworks. **[Documented]**

## Best practices

- **Start small, keep boundaries clean, graduate deliberately.** A well-structured monolith can become an Nx monorepo,
  and (rarely) an Nx monorepo can extract a remote into an MFE. The reverse (collapsing MFEs back) is painful — so don't
  over-commit early.
- **You can combine Nx + micro-frontends.** Nx can host the shell and remotes as separate apps in one repo while each
  still deploys independently — you get enforced boundaries *and* deployment autonomy. *
  *[Documented — Nx supports Module/Native Federation generators]**
- **Decide on data, not vibes.** Count teams, deployable units, and divergent release cadences. If "independent
  deployment" isn't a present, painful need, you don't need MFEs.
- **Write the decision down as an ADR** (see `rules-of-working.md`).

## Common mistakes / anti-patterns

- **Reaching for micro-frontends to get "modularity."** Modularity is free in a monorepo with enforced boundaries. MFEs
  are for *deployment* independence. This is the #1 over-engineering mistake.
- **"Frontend microservices."** The term reveals a category error — copying backend patterns to the browser where the
  runtime constraints are different.
- **A monorepo with no enforced boundaries.** Without tags/lint rules it degrades into a big ball of mud faster than
  separate repos would. Enforcement is the point.
- **MFEs that always deploy together.** If your remotes are always released in lockstep, you paid the MFE complexity tax
  for nothing — you wanted a monorepo.
- **Letting the accidental org chart pick the architecture.** Decide structure intentionally (Conway / inverse-Conway),
  then align teams.
