# Lexicon — AI SEO Content SaaS

Lexicon turns a product brief into publish-ready catalog copy: a description, highlights, an SEO meta title, an SEO meta description, ad copy, and a social caption. Teams spend credits as they generate, save the pieces they want, and admins approve plans from a control center.

[![Live demo](https://img.shields.io/badge/live-demo-111111)](https://ai-content-studio-liard.vercel.app)
[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![NestJS API](https://img.shields.io/badge/API-NestJS-E0234E?logo=nestjs&logoColor=white)](https://github.com/maarijwaseem2/ai-content-studio-backend)

## Live demo

Open the hosted app: [https://ai-content-studio-liard.vercel.app](https://ai-content-studio-liard.vercel.app)

The API is a separate NestJS service: [ai-content-studio-backend](https://github.com/maarijwaseem2/ai-content-studio-backend).

## Screenshots

The images below are labeled placeholders in [`docs/screenshots/`](docs/screenshots/). Replace each file with a capture from the live app; the paths can stay the same.

| Landing | Generator |
| --- | --- |
| ![Lexicon landing page placeholder](docs/screenshots/landing.png) | ![Lexicon generator placeholder](docs/screenshots/generator.png) |

| Dashboard | Pricing |
| --- | --- |
| ![Lexicon dashboard placeholder](docs/screenshots/dashboard.png) | ![Lexicon pricing placeholder](docs/screenshots/pricing.png) |

![Lexicon admin portal placeholder](docs/screenshots/admin.png)

## Features

Verified against this frontend and the NestJS API.

- **SEO meta titles and descriptions.** The generator returns six pieces of copy. Two of them are an SEO meta title and an SEO meta description, shown in the result panel and editable in the content editor. The API asks the model for `metaTitle` and `metaDescription` alongside the description, highlights, ad copy, and social caption.
- **Product briefs.** A run needs a product name and can include category, features, audience, tone, length, language, and keywords. Tones are Professional, Friendly, SEO-friendly, Luxury, and Simple. Lengths are Short, Medium, and Long. Sixteen languages are available, including English, Urdu, Roman Urdu, Arabic, Hindi, and Chinese (Simplified).
- **One credit per generation.** The API checks the balance, calls the model, stores the result, and decrements credits by one in the same transaction. Accounts with no credits left are blocked. Admin accounts cannot generate.
- **Credit-based plans.** The pricing page lists Free ($0), Starter ($19/month), Pro ($49/month), and Business ($149/month). Choosing a plan creates a pending subscription request. An admin approves or rejects it. Approval adds credits: 20 for Free, 250 for Starter, 1,000 for Pro, and 5,000 for Business. A new account is created with 250 credits.
- **User accounts.** Email and password signup, OTP verification, login, and password reset. The session is a JWT access token. Signed-in users get a dashboard, generator, saved library, history, templates, pricing, and settings. Settings can submit an account-deletion request for admin review. Copy can be edited, copied, and exported as `.txt` or `.doc`.
- **Admin portal.** Users with the `ADMIN` role land on `/app/admin`. Everyone else is sent back to the workspace, and the API repeats that check with a role guard. The portal shows user, generation, and credit stats, searchable accounts, a generation feed, and queues to approve or reject subscription and deletion requests.

## Architecture

The browser app in this repository talks to the NestJS API over HTTPS. Axios sends the stored access token as a Bearer header. On startup the client calls `GET /health` so a sleeping host can wake before the first real request.

```mermaid
flowchart TB
  visitor[Visitor or signed-in user]
  fe[Lexicon frontend\nReact 18, Vite, Tailwind, shadcn/ui\nHosted on Vercel]
  api[NestJS API\nGlobal prefix /api\nJWT and role guards]
  auth[Auth\nsignup, login, OTP, password reset]
  users[Users\nprofile, plan requests, deletion requests]
  gen[Generator\none credit per successful run]
  content[Content\nsave, edit, history]
  admin[Admin\nstats, users, approvals]
  db[(PostgreSQL\nPrisma)]
  model[OpenAI chat completions\nJSON copy including meta title\nand meta description]

  visitor --> fe
  fe -->|VITE_API_BASE_URL| api
  api --> auth
  api --> users
  api --> gen
  api --> content
  api --> admin
  auth --> db
  users --> db
  gen --> db
  content --> db
  admin --> db
  gen --> model
```

| Piece | Responsibility |
| --- | --- |
| Frontend | Marketing site, auth screens, workspace, and admin UI. Deployed on Vercel as a single-page app. |
| Auth | Signup, login, signup OTP, resend, forgot-password, OTP check, and password reset. Passwords are hashed with bcrypt. Sessions use Passport JWT. |
| Generator | Builds a copywriting prompt, requests JSON from OpenAI, and falls back to a short template if the model call fails. |
| Content | Lists, updates, and deletes a user's generations, including the saved library. |
| Users | Profile, subscription requests, and deletion requests. |
| Admin | Stats, user search, generation feed, and approve/reject actions. Guarded to the `ADMIN` role. |
| Data | PostgreSQL through Prisma: users, content, subscription requests, password resets, and deletion requests. |

## Tech stack

**Frontend (this repo)**

- React 18 and TypeScript
- Vite 5
- Tailwind CSS and shadcn/ui (Radix)
- React Router
- Zustand for session and library state
- Axios for the API client
- Vitest

**Backend ([ai-content-studio-backend](https://github.com/maarijwaseem2/ai-content-studio-backend))**

- NestJS 11
- Prisma and PostgreSQL
- Passport JWT and bcrypt
- OpenAI SDK

## Local setup

This repository is the frontend. Run the API from [ai-content-studio-backend](https://github.com/maarijwaseem2/ai-content-studio-backend) if you want generation, accounts, and admin actions locally. The API listens on port `3001` unless `PORT` is set.

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

`npm run dev` serves the app at `http://localhost:8080`. `npm test` runs the Vitest suite.

## Environment variables

Names only. Keep values in an untracked `.env` file. This repo ignores `.env`.

**Frontend**

| Name | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for Axios. Include the API's `/api` prefix. The same value is used for the startup health check. |

**Backend**

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Signing secret for access tokens |
| `OPENAI_API_KEY` | Key for the copy model |
| `AI_MODEL` | Chat model name. The service uses `gpt-4o` when this is unset |
| `FRONTEND_URL` | Browser origin allowed by CORS |
| `PORT` | HTTP port. Defaults to `3001` |

## Roadmap

- Pass length and keywords into the model prompt. The form already collects both and stores them with the brief.
- Deliver signup and password-reset codes by email.
- Save profile, password, and default tone and language from Settings through the API.
- Add self-serve checkout so plan upgrades do not wait on a manual approval.
- Apply every template preset. Luxury and Amazon listings already set the tone.
- Replace the images in `docs/screenshots/` with captures from the live app.

## Author

**Syed Abdul Maarij**

- GitHub: [maarijwaseem2](https://github.com/maarijwaseem2)
- LinkedIn: [linkedin.com/in/maarijwaseem2](https://linkedin.com/in/maarijwaseem2)
