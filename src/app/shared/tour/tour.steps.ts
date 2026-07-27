import { TourStep } from './tour.service';

/** The first-run walkthrough shown on /roadmap after a new user registers. */
export const ROADMAP_TOUR: TourStep[] = [
  {
    title: 'Welcome to Athena 👋',
    body: 'This is your learning home. Here’s a quick 30-second tour of where everything lives.',
  },
  {
    selector: '[data-tour="nav-roadmap"]',
    title: 'Your Roadmap',
    body: 'Your personalized path, split into phases. You’re looking at it right now — each stop builds on the last.',
  },
  {
    selector: '[data-tour="roadmap-start"]',
    title: 'Start here',
    body: 'This is your current stop. Click it to open your first lesson: short readings, videos, hands-on practice and a quiz.',
  },
  {
    selector: '[data-tour="nav-daily-journey"]',
    title: 'Daily Journey',
    body: 'Your bite-sized plan for today — Athena picks a focused set of steps so you always know what to do next.',
  },
  {
    selector: '[data-tour="nav-knowledge-graph"]',
    title: 'Knowledge Graph',
    body: 'Watch concepts connect into a living map as you learn, so you can see how everything fits together.',
  },
  {
    selector: '[data-tour="nav-interviews"]',
    title: 'Interviews',
    body: 'Practice mock interviews for your goal and get instant, honest AI feedback.',
  },
  {
    selector: '[data-tour="nav-progress"]',
    title: 'Track your growth',
    body: 'Achievements, streaks, progress and insights all live here — proof of how far you’ve come.',
  },
  {
    selector: '[data-tour="nav-settings"]',
    title: 'Profile & Settings',
    body: 'Manage your account and security (two-factor, devices), and switch theme or language any time.',
  },
  {
    title: 'You’re all set 🎉',
    body: 'Click your current phase on the roadmap to begin your first lesson. You’ve got this!',
  },
];
