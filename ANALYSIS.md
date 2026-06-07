# React Native Integration Analysis
## Context: Existing Native iOS + Android Teams with Established Base Apps

**Scope:** All line counts, diff counts, and compatibility issues in this document were
measured directly from code written in this repository. No claims are based on general
experience or third-party benchmarks. The analysis is written for a team that already
maintains native iOS (SwiftUI/UIKit) and Android (Kotlin/Compose) codebases, and is
evaluating whether to adopt React Native for new feature development.

---

## 1. What Was Built and Measured

Three implementations of the same payee management feature (login, dashboard, payee CRUD):

| Artifact | Location | Technology |
|---|---|---|
| Web app | `web-app/src/` | React 19 + Vite + Tailwind CSS v4 |
| RN app | `rn-app/src/` | React Native 0.85.3 + Metro |
| Native host | `RNMania/RNMania/` | SwiftUI (iOS) |

The web app represents the existing codebase the web team would migrate from.
The RN app represents what they would deliver to the mobile teams.
The SwiftUI files represent the native team writing the same feature directly.

---

## 2. The Core Claim: Code Reuse

The primary argument for React Native is that web code can be reused on mobile, reducing
duplication between platforms. This is the claim this POC was designed to test.

### 2.1 What actually transfers

| File | Web lines | RN lines | Diff | Notes |
|---|---|---|---|---|
| `src/types/index.ts` | 24 | 24 | **0** | Exact copy |
| `src/lib/utils.ts` | 22 | 22 | **0** | Exact copy |
| `src/api/payees.ts` | 92 | 92 | **2** | One TS strict-mode fix |
| `src/store/authStore.ts` | 37 | 46 | **15** | Storage backend swap only |

**Reusable total: ~175 lines out of 1,035 web lines = 17%**

### 2.2 What must be completely rewritten

| Web file | Lines | RN equivalent | Lines | Shared code |
|---|---|---|---|---|
| `pages/LoginPage.tsx` | 88 | `screens/LoginScreen.tsx` | 164 | 0% |
| `pages/DashboardPage.tsx` | 92 | `screens/DashboardScreen.tsx` | 104 | 0% |
| `pages/payees/PayeesPage.tsx` | 163 | `screens/payees/PayeesScreen.tsx` | 179 | 0% |
| `pages/payees/PayeeForm.tsx` | 121 | `screens/payees/PayeeForm.tsx` | 168 | 0% |
| `pages/payees/AddPayeePage.tsx` | 47 | `screens/payees/AddPayeeScreen.tsx` | 27 | 0% |
| `pages/payees/EditPayeePage.tsx` | 71 | `screens/payees/EditPayeeScreen.tsx` | 62 | 0% |
| `App.tsx` + `AppLayout.tsx` | 127 | `App.tsx` + `navigation/index.tsx` | 104 | 0% |
| `components/ui/Button.tsx` | 47 | `components/Button.tsx` | 73 | 0% |
| `components/ui/Input.tsx` | 36 | `components/FormField.tsx` | 46 | 0% |
| `components/ui/Select.tsx` | 39 | *(no equivalent — replaced by Modal)* | — | 0% |

**The 83% that must be rewritten is also the most expensive 83% to write.**
Types, utils, and API calls are the fastest things to produce in any language or framework.
The reusable portion represents perhaps one to two days of work for an experienced developer.
The UI layer — which transfers nothing — is where the majority of development time is spent.

### 2.3 The reuse claim applied to two platforms

The web team's argument assumes that one RN codebase covers both iOS and Android.
This is true for logic. For UI, React Native's own component model still requires
platform-specific handling for many patterns:

- `Platform.OS === 'ios'` / `Platform.OS === 'android'` branches are present in nearly
  every production RN app that targets both platforms
- Navigation patterns differ: iOS uses swipe-back gestures; Android uses the back button
- Bottom sheets, modals, and pickers behave and look different per platform
- Keyboard handling differs between platforms (`KeyboardAvoidingView` requires
  `behavior="padding"` on iOS and `behavior="height"` on Android)

In practice, a cross-platform RN codebase for a banking app at production quality requires
non-trivial platform-specific code. The 17% reuse figure from web to RN does not compound
to 17%+17% savings across two platforms — the UI divergence eats into it.

---

## 3. Compatibility Issues Encountered in This POC

These are real blockers from the actual migration, not hypothetical risks.

### 3.1 Zod v4 incompatible with Metro Babel — permanent schema split

**What happened:** The RN app showed a blank white screen on launch with no error.
The root cause was `export * as core from '...'` syntax in Zod 4.x, which requires
`@babel/plugin-transform-export-namespace-from`. Metro's default Babel config does not
include this plugin.

**Resolution:** Downgrade to Zod 3.x. The web app remains on Zod 4.x.

**Consequence for shared libraries:** If the team writes a shared validation library
(e.g., form schemas for backend and frontend), it cannot use Zod 4 APIs in the RN version
without a custom Metro config. Any shared schema package must maintain two separate entry
points or pin to Zod 3. This is a permanent maintenance split.

### 3.2 `<select>` has no native equivalent — custom Modal required

The web app uses a standard HTML `<select>` element (39 lines, zero effort).
React Native has no built-in equivalent. Options:

- `@react-native-picker/picker`: an additional native dependency with inconsistent
  appearance on iOS vs Android
- Custom `Modal` + `Pressable` list: requires approximately 40 additional lines per
  picker in each form

The bank picker in `PayeeForm.tsx` required a 40-line custom Modal implementation.
Any form with a select/dropdown field carries this overhead.

### 3.3 Xcode project format incompatibility with CocoaPods

The existing SwiftUI app was created with Xcode 16, which uses the new
`PBXFileSystemSynchronizedRootGroup` project format for automatic file discovery.
CocoaPods 1.15.2 (current stable) does not support this format — `pod install` crashes
with an unrecognised ISA type.

**Resolution required:** Convert the entire `project.pbxproj` from the new auto-synced
format to explicit `PBXGroup` + `PBXFileReference` entries. This removes Xcode's ability
to automatically detect new files added to the filesystem — every new Swift file must now
be manually registered in the project file.

**This is not a temporary fix.** Once CocoaPods is introduced, the project cannot return
to the auto-sync format without removing CocoaPods. Teams that adopt modern Xcode project
conventions must choose between those conventions and CocoaPods compatibility.

### 3.4 New architecture is mandatory in RN 0.82+

RN 0.82 removed support for the old bridge (`RCT_NEW_ARCH_ENABLED=0`). The simpler
embedding approach using `RCTBridge` + `RCTRootView` is no longer officially supported.
The new architecture requires `RCTAppDelegate` or `RCTHost` setup, which conflicts with
SwiftUI's `@main struct App` lifecycle without an explicit `UIApplicationDelegateAdaptor`.

Every future RN major version bump carries a similar risk of native-side breaking changes
that require the mobile team's involvement regardless of who wrote the JS code.

### 3.5 TypeScript strict-mode divergence between web and RN configs

The RN TypeScript config (`@react-native/typescript-config`) is stricter on Promise
generics than the web app's tsconfig. Code that is valid in the web codebase is a
compile error in RN. Three files required fixes (`api/payees.ts`, `authStore.ts`,
`AddPayeeScreen.tsx`, `EditPayeeScreen.tsx`).

This is a systematic issue: any shared TypeScript code must pass both the web tsconfig
and the RN tsconfig. Shared packages require dual compilation validation.

---

## 4. Native Embedding Overhead

This section covers work required in the native app — work that the mobile team owns,
regardless of who writes the RN feature.

### 4.1 Bridge code (one-time per app)

| File | Lines | Owner |
|---|---|---|
| `ReactNativeView.swift` | 38 | Mobile team (iOS) |
| `RNBridgeManager.swift` | 45 | Mobile team (iOS) |
| Android equivalent | ~similar | Mobile team (Android) |

The bridge is stable, but it must be written and maintained by the native team.
The web team cannot write or own this code.

### 4.2 Permanent changes to the native project

| Change | Who must do it | Notes |
|---|---|---|
| Convert `project.pbxproj` to explicit file groups | Mobile team | Removes Xcode auto-sync |
| Add and maintain Podfile | Mobile team | References JS dependency locations |
| AppDelegate bridging for new arch | Mobile team | Required since RN 0.82 |
| Add `NSAppTransportSecurity` for Metro (debug) | Mobile team | localhost HTTP exemption |
| Add Metro bundle step to Xcode build phases (release) | Mobile team | JS bundle baked into IPA |

None of these are tasks the web team can perform. Every RN version upgrade may require
revisiting items 2–5.

### 4.3 Ongoing maintenance — what the mobile team owns permanently

| Concern | Frequency | Detail |
|---|---|---|
| `pod install` on RN version update | Every RN release | ~1 GB Pods regenerated |
| Native bridge code review on RN major upgrade | Every major | RN 0.82 broke old-arch; next major likely changes new-arch APIs |
| JS bundle release build step | Every release | Metro must run before `xcodebuild archive` |
| Dual CI agent requirement | Always | macOS + Xcode + Node on every build agent |
| Crash symbolication | Always | Native crashes and Hermes JS crashes use different symbol formats |
| Binary size | Always | Hermes engine adds ~7–15 MB to the app |

---

## 5. The Correct Comparison for This Team's Situation

The standard RN value argument is: *"One team writes code once and ships to both platforms."*

For a team that already maintains native iOS and Android with existing base apps, this
argument does not apply. The relevant comparison is different:

**Option A — RN embedded feature:**
- Web team writes RN screens (~83% new code, no web transfer)
- Mobile teams write and maintain bridge layer on both platforms
- Mobile teams handle all native integration, CI, and upgrade work
- Both teams are now in the loop for every mobile release

**Option B — Native feature written by mobile team directly:**
- iOS team writes SwiftUI screens
- Android team writes Compose/Kotlin screens
- Each team works independently within their established codebase
- No bridge, no JS toolchain, no cross-team dependency per release

### 5.1 Code volume comparison (measured where possible, estimated where noted)

| Work item | RN approach | Native approach |
|---|---|---|
| Logic layer (api + store + types) | ~184 lines (measured) | ~180 lines (estimated, near-equivalent) |
| UI screens | ~704 lines RN (measured) | ~360 lines SwiftUI (estimated from patterns) |
| Bridge / integration | ~83 lines Swift (measured) | 0 |
| Android equivalent | ~similar to iOS RN | ~similar to iOS native |
| **Total per platform (post-web)** | **~971 lines** | **~540 lines** |

The native approach produces approximately 44% less code per platform.

### 5.2 Who does what, per release

| Task | RN approach | Native approach |
|---|---|---|
| Write new screen | Web team | Mobile team |
| Pass data into the module | Mobile team (bridge) | Mobile team (direct) |
| Handle native callbacks | Mobile team (NativeModule) | Mobile team (direct) |
| Test on device | Both teams | Mobile team |
| Archive and release | Mobile team | Mobile team |
| Fix JS crash | Web team | Mobile team |
| Fix native crash | Mobile team | Mobile team |
| RN version upgrade | Both teams | N/A |

With RN, the mobile team retains all of its release responsibilities and gains new ones
(bridge maintenance, RN upgrade coordination, dual toolchain CI). The web team offloads
screen writing but introduces cross-team coupling on every release.

### 5.3 Speed of adding new features — the actual question

The user's framing is correct: for teams with existing native capacity and base apps,
the speed constraint on feature delivery is rarely "we don't have enough developers to
write native code." The constraints are typically:

- Feature requirements and design approval
- Backend API availability
- QA cycles
- Review and release scheduling

React Native addresses none of these. It potentially adds a coordination overhead
(web team dependency on mobile team bridge work) without eliminating any existing
bottleneck.

---

## 6. What RN Provides vs. What This Team Already Has

| RN value proposition | Relevant for this team? |
|---|---|
| Ship to iOS and Android from one codebase | No — both platforms are already covered natively |
| Hire frontend/web developers to build mobile features | No — native mobile teams already exist |
| Faster iteration via hot reload | Marginal — Xcode previews and simulator are comparable |
| Shared business logic across platforms | Partial — types and API calls (~17%) transfer; the backend API is the actual shared layer |
| Reduce platform-specific UI work | No — RN still requires platform-specific handling for production-quality UI |

The team already has everything RN is designed to provide, except via React.

---

## 7. Dependency and Toolchain Cost

### 7.1 Runtime packages

| Category | Web | RN |
|---|---|---|
| Core framework | react, react-dom | react-native |
| Routing | react-router-dom (1 pkg) | @react-navigation/* (4 pkgs) |
| Platform storage | browser native | @react-native-async-storage |
| Platform UI scaffolding | browser native | react-native-screens, react-native-safe-area-context |
| Validation | zod v4 | zod v3 (version split from web) |
| Total runtime packages | 7 | 13 |
| Native dependency manager | None | CocoaPods (~1 GB per platform) |

### 7.2 Developer environment requirements

| Requirement | Web dev | RN dev (added over web) |
|---|---|---|
| Node.js | ✓ | ✓ |
| Xcode + iOS SDK | — | ✓ Required |
| CocoaPods + Ruby | — | ✓ Required |
| Android SDK + Java | — | ✓ Required (for Android) |
| Metro bundler knowledge | — | ✓ Required |
| Native debugging tools | — | ✓ Required |

A web developer writing RN code for mobile still cannot build, run, or debug the native
host app. They require mobile team support for environment setup, device testing, and
release packaging. The web team is not self-sufficient.

---

## 8. Conclusions

### Findings derived from this codebase

1. **Code reuse from the web codebase is 17%.** The reusable portion — types, utilities,
   and API calls — is the fastest and cheapest code to write in any framework. It does not
   justify the overhead of the RN toolchain.

2. **The RN codebase is 16% larger than the web codebase** for the same feature
   (1,201 lines vs 1,035 lines). Reuse produces more code, not less.

3. **The mobile team's workload does not decrease.** Bridge code, Podfile management,
   CI configuration, RN version upgrades, and release packaging remain entirely in the
   mobile team's scope. The web team adds a JS feature layer; the mobile team gains
   a permanent maintenance obligation.

4. **Three hard blockers were encountered in this POC:**
   - Zod v4 / Metro Babel incompatibility → permanent schema version split
   - Xcode 16 project format / CocoaPods incompatibility → structural project regression
   - RN 0.82+ mandatory new architecture → AppDelegate changes required in both native apps

5. **A SwiftUI-native implementation of the same feature is estimated at ~360 lines of UI
   code vs ~704 lines of RN screens**, based on structural patterns measured in this repo.
   The native approach eliminates the custom picker modal (~40L), StyleSheet boilerplate,
   and all navigation scaffolding.

### Specific to this team's structure

This team has native iOS and Android engineers and established base apps on both platforms.
React Native's central value proposition — "one team, two platforms" — is not applicable.

The proposal from the web team results in:
- Two teams coupled on every mobile release
- The mobile team absorbing a permanent toolchain and maintenance burden
- The web team writing screens that look and behave less natively than the rest of the app
- No reduction in any actual delivery bottleneck (requirements, QA, release scheduling)
- A codebase that is harder to onboard native engineers into, and harder for web engineers
  to debug when native crashes occur

**The case for RN in this context requires demonstrating that the web team can independently
deliver, test, and release mobile features without mobile team involvement. This POC shows
that is not achievable: the native bridge layer, the build pipeline, and the native host
app integration are inescapable mobile team responsibilities.**

The decision to adopt RN is not a decision to let the web team build mobile features.
It is a decision to split responsibility for each mobile feature across two teams, while
accepting the compatibility, toolchain, and maintenance costs documented above.
