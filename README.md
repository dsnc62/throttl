# Throttl

## Getting Started

```sh
# Clone the repo
git clone https://github.com/dsnc62/throttl

# Navigate to the project directory
cd throttl

# check if pnpm is installed
pnpm --version

# install pnpm (if not already installed)
npm i -g pnpm

# check if bun is installed
bun --version

# install bun (if not already installed)
npm i -g bun

# install dependencies
pnpm i
```

### Environment Variables

The backend directory has a `.env` file that needs to be created and populated.
Copy the `.env.example` file to `.env` to get started.

For the frontend directory, copy the `.env.example` file into `.env.local`.

The values in `.env.example` should be enough to test locally, however for
production, URLs and secrets will need to be changed.

## Structure

This repo is a pnpm monorepo, split into 2 distinct workspaces, each with their
own projects:

- `apps/`: Projects that are meant to be publicly accessible (e.g. `frontend/`)
- `packages/`: Internal projects, for use within other projects (currently
  unused)

## Development

### Prerequisites

- Git
- Node.js v24+
- pnpm
- Bun
- [Turso CLI](https://docs.turso.tech/cli/introduction)

### Running the Project

```sh
# run dev server (run frontend+backend)
pnpm run dev

# run dev db
pnpm run dev:db

# seed db (only needed for inital run, does not include images)
cd apps/backend && pnpm run db:seed
```

### Testing

```sh
# you may need to run this before executing
chmod +x ./apps/backend/run-tests.sh

# run curl tests
./apps/backend/run-tests.sh
```
