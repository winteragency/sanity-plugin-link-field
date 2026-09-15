# Link Field Example Studio

Minimal Sanity Studio used to develop and test `sanity-plugin-link-field` in this repository.

## Setup

From the repository root:

```sh
npm run build
cd example
npm install
```

The checked-in config uses the project ID `placeholder`, which is enough for
`npm test`. To run the Studio itself you need a real Sanity project: copy
`.env.example` to `.env.local` and set your own project ID.

```sh
cp .env.example .env.local
```

Both `sanity.config.ts` and `sanity.cli.ts` read `SANITY_STUDIO_PROJECT_ID` and
fall back to `placeholder`. `.env.local` is gitignored, so your project ID stays
out of the repository.

## Commands

```sh
# Run the example Studio locally
npm run dev

# Validate schema, extract schema.json, run typegen, and run schema tests
npm test
```

The generated `schema.json` and `sanity.types.ts` files are gitignored and recreated by `npm test`.

## What it covers

- Internal links to the `page` document type
- External, email, and phone link types
- A custom `archive` link type
- Required link validation via `requiredLinkField`
- A GROQ query used by Sanity TypeGen
