# Copilot Instructions for Recipe Manager App

## Architecture Overview
- **Full-stack app**: Backend (Node.js/Express + Prisma + PostgreSQL) serves APIs; Frontend (React Native/Expo) consumes them.
- **Authentication**: AWS Cognito for user management; Backend validates via Cognito SDK; Frontend stores JWT in AsyncStorage.
- **Data Layer**: Prisma ORM for PostgreSQL; migrations in `Backend/database/migrations/`.
- **Frontend Structure**: Feature-based slices (e.g., `Frontend/src/features/auth/`) with `api/`, `model/`, `ui/` subfolders. Export UI components via `index.ts`.
- **Key Files**: [Backend/src/app.ts](../Backend/src/app.ts) (Express setup), [Frontend/src/features/auth/model/auth.context.tsx](../Frontend/src/features/auth/model/auth.context.tsx) (auth state).

## Developer Workflows
- **Backend Dev**: `npm run dev` (ts-node-dev auto-restart); build with `npm run build`; start with `npm start`.
- **Frontend Dev**: `npm start` (Expo); platform-specific: `npm run ios/android/web`.
- **Database Setup**: Run migrations with `psql -h localhost -p 5432 -U postgres -d recipe_manager -f database/migrations/001_init.sql`.
- **Linting**: Frontend only: `npm run lint` (ESLint via Expo).
- **No Tests**: Project lacks test suites; validate manually.

## Conventions & Patterns
- **API Calls**: Hardcode base URL (e.g., `http://192.168.1.51:5005/api` in [Frontend/src/features/auth/api/auth.service.ts](Frontend/src/features/auth/api/auth.service.ts)); handle network errors with user-friendly messages.
- **Local Storage**: Use AsyncStorage with user-scoped keys (e.g., `shopping/lists:v1:${userId}`); wipe on logout via prefix matching (e.g., `['@auth', '@lists:']`).
- **Session Management**: Increment `sessionId` on logout to invalidate async ops; check mounted ref to avoid state updates post-unmount.
- **Cache Normalization**: Defensive parsing for legacy data (e.g., [Frontend/src/features/shoppingList/model/storage.ts](Frontend/src/features/shoppingList/model/storage.ts) adds missing sharing fields).
- **ID Mapping**: For shopping lists, map server UUIDs to stable numeric IDs using hash function for UI consistency.
- **Backend Structure**: `engine/` for services (e.g., AuthService); `api/` for routes/controllers; inject services into routers.
- **Enums**: Use PostgreSQL enums for units/labels (Hebrew values); position columns for ordering.

## Integration Points
- **Cognito**: Auth via `@aws-sdk/client-cognito-identity-provider`; store Cognito sub as user ID.
- **Prisma**: Schema in `prisma/schema.prisma` (not shown); generate client after schema changes.
- **Sharing**: Planned via join tables; Frontend handles local share status (pending/active).
- **No Recipe Sync Yet**: Shopping lists local-only; recipes in DB but not exposed via API.

## Common Pitfalls
- Update hardcoded IPs for different environments.
- Ensure AsyncStorage keys prefixed for logout wipe.
- Normalize cached data to handle schema evolution.</content>
<parameter name="filePath">c:\Users\User\MyApp\.github\copilot-instructions.md