# Link Field Example Studio

Minimal Sanity Studio used to develop and test `sanity-plugin-link-field` in this repository.

## Setup

From the repository root:

```sh
npm run build
cd example
npm install
```

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
