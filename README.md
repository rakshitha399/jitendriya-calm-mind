# Jitendriya: Calm Mind

Project: Jitendriya

Build a modern, premium spiritual wellbeing and mindfulness web application called Jitendriya.

Tagline: Calm Mind • Balanced Life • Higher You

Purpose

Jitendriya helps users explore mindfulness, meditation, spiritual practices, daily reflection, personal goals, and personalized wellbeing recommendations.

Design direction

Use the attached Jitendriya design reference as the primary visual inspiration.

Warm cream and ivory backgrounds

Sage green and deep forest green as primary colors

Subtle muted gold accents

Elegant serif headings paired with readable sans-serif body text

Softly rounded cards, subtle shadows, consistent spacing

Beautiful nature, mountains, sunrise, meditation, and botanical imagery

Minimal lotus-inspired branding

Peaceful, sophisticated, uncluttered visual design

The application should feel like a premium wellness product, not a generic AI dashboard or a basic template.

Technical requirements

Use the existing project framework and conventions if a project already exists.

If starting fresh, use React, TypeScript, Tailwind CSS, and reusable components.

Use Lucide icons or a consistent equivalent.

Build a responsive web application for desktop, tablet, and mobile.

Keep UI components, styling, data, and application logic organized.

Use reusable components for navigation, cards, buttons, forms, and section headings.

Important constraints

Build the application incrementally.

Do not remove or rewrite existing working functionality unnecessarily.

Do not invent actual AI capabilities, authentication, or database integration.

Use clearly identified sample data and editable placeholder content where necessary.

Keep the application easy to extend with an AI recommendation engine and backend later.

For now, inspect the existing project and establish the design system. Do not attempt to implement every feature at once.Implement the main application layout for Jitendriya using the established design system.

Create these main navigation destinations:

Home

Explore

Meditation

My Journal

My Profile

Settings

Design requirements:

On desktop, use a clean top navigation or a refined sidebar, whichever best fits the reference.

On mobile, use a compact header and bottom navigation.

Display the Jitendriya lotus-inspired logo and brand name.

Use consistent icons, typography, spacing, active states, hover states, and focus states.

Use React Router or the routing solution already present in the project.

Give every navigation item its own appropriate page or route.

Keep the navigation consistent across authenticated-style application screens.

Create reusable layout and navigation components rather than duplicating markup.

Use sample user data only where needed.

Ensure that all navigation links work and the layout is responsive. Do not add real authentication or backend integration yet.Build the Jitendriya welcome page and Home dashboard.

Welcome page

Use a peaceful sunrise or mountain meditation background.

Place the Jitendriya logo and tagline prominently.

Add a short welcome message and a clear Get Started button.

Use a subtle overlay to keep text readable.

Make the page elegant and responsive.

Home dashboard

Include these sections:

A personalized greeting with the user's display name.

A short inspirational quote using sample content.

A Spiritual Wellness card with a sample progress indicator.

Quick-access cards for Meditation, Daily Wisdom, Explore, and Journal.

A Today's Recommendation section with a sample meditation card.

A Daily Reflection or mindfulness reminder section.

UI behavior

Get Started should navigate into the app.

Quick-access cards should open the appropriate pages.

Recommendation cards should open their detail screens.

Keep progress and recommendations clearly labeled as sample data for now.

Do not claim that the application has measured a user's real wellbeing.

Use spacious layouts, calm colors, beautiful imagery, and subtle hover animations. Keep the dashboard useful rather than overcrowded.Build the Explore and Personalized Recommendations pages for Jitendriya.

Explore page

Create a welcoming discovery page with categories for:

Meditation

Breathing exercises

Yoga and relaxation

Mantras and spiritual practices

Daily wisdom

Guided mindfulness

Personalized Recommendations page

Design a dedicated page with:

A heading explaining personalized wellbeing recommendations.

Filters for All, Meditation, Mantras, Breathing, and Relaxation.

A clean list or grid of recommendation cards.

A title, short description, duration, difficulty, category, and relevant image for each sample item.

A clear action to open each recommendation.

Personalization preview

Include an optional preferences section where users can select:

Their current mood

Their personal wellbeing goals

Their preferred practice duration

Their preferred content categories

Use local sample data and client-side filtering to demonstrate how the interface works. If users select preferences, update the displayed recommendations using transparent demo rules.

Do not call a real AI model yet. Do not present demo recommendations as actual AI-generated or scientifically validated results.

Allow me to replace all sample descriptions and content later without redesigning the pages.Build a polished Meditation detail page and a functional frontend meditation player for Jitendriya.

Meditation detail page

Include:

A large peaceful landscape illustration or image.

Meditation title and description.

Duration and difficulty.

A brief introduction.

A Start Meditation button.

Meditation player

Create a focused, distraction-free experience with:

A large play/pause button.

A timer showing elapsed and remaining time.

A progress bar.

Restart and skip controls where appropriate.

A volume or sound control if audio is implemented.

A calming completion screen.

Behavior

Implement a working countdown timer and playback state.

Prevent multiple timers from running simultaneously.

Provide a graceful visual experience if no audio files are available.

Do not pretend that audio is playing if no playable audio source exists.

Make buttons accessible and usable on mobile.

Use sample meditation content that I can replace later. Keep the player reusable so additional meditation sessions can be added easily.Build the My Journal page for Jitendriya.

The journal should provide a private-feeling, peaceful interface for daily reflection.

Include:

A page heading and a New Entry button.

A journal entry editor with title, date, mood, category, and reflection text.

A list of previous entries.

Search and category filters.

Edit and delete actions.

A simple mood selector using accessible labels and icons.

An empty state for users who have not written an entry.

A confirmation step before deleting an entry.

For this frontend prototype, use local storage to persist entries in the current browser. Clearly separate storage logic from UI components so a real backend can replace it later.

Do not imply that local browser storage is secure enough for sensitive journal data in a production application. Do not send journal entries to an external service.

Keep the interface visually consistent with Jitendriya's cream and sage-green theme.Build the My Profile and Settings pages for Jitendriya.

Profile page

Include:

A profile avatar.

Display name and editable profile details.

Personal wellbeing goals.

A sample progress summary.

Meditation sessions completed.

Journal entry count.

A sample daily practice streak.

Goals

Allow users to create, edit, and complete personal practice goals. Provide a simple progress indicator.

Settings

Include:

Profile preferences.

Notification preference controls.

Daily reminder time.

Theme preference, including a dark mode if implemented consistently.

Help and privacy sections.

Functionality

Make editable fields and toggles functional.

Persist demo preferences locally where appropriate.

Do not show fake achievements as real accomplishments.

Do not implement real notifications, account security, or authentication unless their underlying functionality is actually configured.

Use reusable components and maintain a consistent layout across all pages.Audit the entire Jitendriya application and implement the missing frontend interactions.

Check every page, button, navigation item, card, form, filter, toggle, and interactive control.

Requirements:

Every button must perform its intended action.

Forms must validate required fields and show useful error messages.

Display success feedback when an action completes.

Search and category filters must update the displayed content.

Navigation must work correctly, including browser back and forward.

Dialogs and menus must open and close properly.

Loading, empty, error, and success states must be designed where relevant.

Keep state management organized and avoid unnecessary duplication.

Fix console errors, broken routes, and React warnings.

Do not add buttons that look functional but do nothing. Do not replace working functionality with static mockups.

Preserve the existing visual design and avoid unnecessary redesigns. At the end, report which interactions are working and which still require external services or backend integration.Perform a visual quality and responsive design audit of Jitendriya.

Keep the established brand identity. Do not redesign the application from scratch.

Check and improve:

Alignment and spacing consistency.

Typography hierarchy and readability.

Card sizes, borders, shadows, and corner radii.

Image quality, cropping, and contrast.

Button sizes and interaction states.

Responsive behavior at mobile, tablet, and desktop widths.

Keyboard navigation and visible focus indicators.

Color contrast and accessible form labels.

Empty states, loading states, and error messages.

Layout overflow, horizontal scrolling, and overlapping elements.

Use subtle transitions rather than excessive animation. Respect reduced-motion preferences.

Reuse the existing design tokens and components. Avoid introducing unnecessary dependencies or changing the backend.

After the audit, summarize the important fixes made and any remaining issues.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37cac7cb-deb0-48e0-91af-a1cab8385d18).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
