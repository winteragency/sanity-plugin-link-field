# 🔗 sanity-plugin-link-field

[![Latest Stable Version](https://img.shields.io/npm/v/sanity-plugin-link-field.svg)](https://www.npmjs.com/package/sanity-plugin-link-field) [![Weekly Downloads](https://img.shields.io/npm/dw/sanity-plugin-link-field?style=flat-square)](https://npm-stat.com/charts.html?package=sanity-plugin-link-field)
[![License](https://img.shields.io/github/license/winteragency/sanity-plugin-link-field.svg)](https://github.com/winteragency/sanity-plugin-link-field) [![Made by Winter](https://img.shields.io/badge/made%20by-Winter-blue.svg)](https://winteragency.se)

A custom Link field (and associated React component) that allows editors to easily create internal and external links, as well as `mailto` and `tel`-links, all using the same intuitive UI.

<video controls src="https://github.com/winteragency/sanity-plugin-link-field/assets/1009069/5948b1d5-514b-4204-ab54-0bd710c6a6bc"></video>

## 🔌 Installation

```sh
npm install sanity-plugin-link-field
```

## 🗒️ Setup

### 1. Configure the plugin

Add the plugin to your `sanity.config.ts`:

```ts
// sanity.config.ts
import {defineConfig} from 'sanity'
import {linkField} from 'sanity-plugin-link-field'

export default defineConfig({
  //...
  plugins: [linkField()],
})
```

This will enable the new `link` field type. By default, it will allow internal links to point to any document of the type `page`. You can adjust this according to your needs by using the `linkableSchemaTypes` option:

```ts
// ...
export default defineConfig({
  //...
  plugins: [
    linkField({
      linkableSchemaTypes: ['page', 'product', 'article'],
    }),
  ],
})
```

If you set it to an empty array, the internal link option will be hidden entirely for all link fields.

> [!TIP]
> See [Options](#-options) for all the plugin level options you can set.

### 2. Add the field to your schema

You can now use the `link` type throughout your schema:

```ts
// mySchema.ts
import {defineField, defineType} from 'sanity'

export const mySchema = defineType({
  // ...
  fields: [
    // ...
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
    }),
  ],
})
```

Editors will be able to switch between internal links (using native references in Sanity), external links (for linking to other websites) as well as e-mail (`mailto`) and phone (`tel`) links:

The link object also includes additional fields for adding custom URL parameters and/or URL fragments to the end of an internal or external link. This can be used to add UTM campaign tracking or link to specific sections of a page, respectively. If you use the provided `Link` component, these will be handled automatically on the frontend.

<img width="456" alt="link-field" src="https://github.com/winteragency/sanity-plugin-link-field/assets/1009069/ebbe0f9f-a2e1-4f13-8a7f-9972a5237296">

You can also choose to enable an additional input field for setting the link's text/label:

```ts
defineField({
  name: 'link',
  title: 'Link',
  type: 'link',
  options: {
    enableText: true
  }
})
```

<img width="457" alt="Screenshot 2024-04-19 at 15 45 30" src="https://github.com/winteragency/sanity-plugin-link-field/assets/1009069/32a9381c-505f-458e-a07c-185edfb735f7">

 
> [!TIP]
> See [Options](#-options) for all the field level options you can set.

### 3. Making a required link field

Since the link field is just an object field internally, the normal `.required()` validator _will not work_. Instead, the plugin includes a helper to properly validate a link field and make it required:

```ts
import {requiredLinkField} from 'sanity-plugin-link-field'

// ...
defineField({
  name: 'link',
  title: 'Link',
  type: 'link',
  validation: (rule) => rule.custom((field) => requiredLinkField(field)),
})
```

### 4. Rendering links on the frontend

#### Spreading internal links

In order to render internal links in your frontend, you need to add a projection to your groq query so that the relevant fields (such as the `slug`) are included from the linked documents:

```groq
*[_type == "page" && slug.current == $slug][0] {
  // ...
  link {
    ...,
    internalLink->{_type,slug,title}
  },
}
```

#### Rendering links

How you render your links is up to you and will depend on your frontend framework of choice, as well as how you manage slugs/pathnames in your project.
This plugin does include a simple React component to render the link correctly regardless of its type:

```tsx
import {Link} from 'sanity-plugin-link-field/component'

import {resolveHref} from '@/lib/sanity/sanity.links'

// ...
<Link
  link={link}
  hrefResolver={({internalLink}) => resolveHref(internalLink?._type, internalLink?.slug?.current)}
>
  This is my link
</Link>
// ...
```

Notice the `hrefResolver` property. This is a callback used to resolve the `href` for internal links, and will differ depending on how your project is set up. The example above uses a `resolveHref` function defined elsewhere that will return the correct path depending on the document type and `slug`.

If a `hrefResolver` is not provided, the component will naively attempt to look at the `slug` property of the linked document and generate a `href` like so: `/${link.internalLink.slug?.current}`. This will of course only work on the off chance that your documents all have a `slug` property (like if you're using [this approach to managing slugs](https://www.simeongriggs.dev/nextjs-sanity-slug-patterns)).

Regardless of how you choose to manage slugs for internal links, the component will automatically handle external links, add `target="_blank"` as needed, and add `mailto:` to e-mail links as well as `tel:` to phone links. For `tel:` links, it will strip any spaces in the phone number since these are not allowed in such links. Additionally, it will render [the link's text label (if enabled)](#field-level), or try and fall back to a good textual representation of the link if one hasn't been passed to the component (using the `children` property).

#### Using `next/link` or similar framework specific components

If you're using Next.js, you'll want to use `next/link` for routing. In this case, the `Link` component accepts an `as` property:

```tsx
import {default as NextLink} from 'next/link'
import {Link} from 'sanity-plugin-link-field/component'

// ...
<Link link={link} as={NextLink}>
  This is my link
</Link>
// ...
```

To avoid having to remember to do this every time, you could create a convenience component in your project like so:

```tsx
import { default as NextLink } from 'next/link';
import { Link as SanityLink, type LinkProps } from 'sanity-plugin-link-field/component';

export function Link(props: LinkProps) {
  return <SanityLink as={NextLink} hrefResolver={...} {...props} />;
}
```

You can then use it throughout your project:

```tsx
import {Link} from '@/components/Link'

// ...
<Link link={link}>This is my link</Link>
// ...
```

#### Using with TypeScript

The plugin exports a type called `LinkValue` that you can use for your link fields.

### 5. Using with Portable Text

As with any other field, the link field can be used in a Portable Text editor by adding it as an annotation, eg:

```ts
defineArrayMember({
  type: 'block',
  marks: {
    annotations: [
      // ...
      {
        name: 'link',
        title: 'Link',
        type: 'link',
      },
    ],
  },
})
```

In this example, the built-in link annotation in Sanity will be replaced with a much more user-friendly and powerful link selector. If you want to keep the built-in link annotation as well, you can use a different `name`, such as `customLink`, in your own annotation.

<img width="504" alt="link-in-portable-text" src="https://github.com/winteragency/sanity-plugin-link-field/assets/1009069/ff302977-80aa-47b6-aff2-92746661032b">

You will need to adjust your groq queries to spread internal links:

```groq
content[] {
  ...,
  markDefs[]{
    ...,
    _type == "link" => {
      ...,
      internalLink->{_type,slug,title}
    }
  }
}
```

Finally, you'll need to adjust your frontend rendering logic to handle these links, something along the lines of:

```ts
marks: {
  link: ({ children, value }) => (
    <Link
      link={value}
      hrefResolver={...}
    >
      {children}
    </Link>
  )
}
```

## ⚙️ Advanced

### Custom link types

In addition to the built-in link types, it's possible to define a set of custom link types for the user to choose from. This can be used to allow users to link to pre-defined routes that do not exist in Sanity, such as hardcoded routes in your frontend application or dynamic routes loaded from an external system.

To enable this feature, simply define your custom link types using the `customLinkTypes` property when initializing the plugin:

```ts
// sanity.config.ts
import {defineConfig} from 'sanity'
import {linkField} from 'sanity-plugin-link-field'

export default defineConfig({
  //...
  plugins: [
    linkField({
      customLinkTypes: [
        {
          title: 'Archive Page',
          value: 'archive',
          icon: OlistIcon,
          description: 'Link to an archive page.',
          options: [
            {
              title: 'Blog',
              value: '/blog',
            },
            {
              title: 'News',
              value: '/news',
            },
          ],
        },
      ],
    }),
  ],
})
```

The "Archive Page" type will now show up as an option when editing a link field, and selecting it will present the user with a dropdown menu with the available routes:

<video controls src="https://github.com/winteragency/sanity-plugin-link-field/assets/1009069/59e79abf-a2a0-413f-bf80-c08b0f64b72a"></video>

You can also provide a callback for the `options` parameter to load the available options dynamically. The callback will receive the current document, the path to the link field being edited, as well as the current user:

```ts
// ...
customLinkTypes: [
  // Load movies from external system
  {
    title: 'Movie',
    value: 'movie',
    icon: FilmIcon,
    description: 'Link to a movie from the cinema system.',
    options: async (document, fieldPath, user) => {
      // Do a fetch request here to get available movies from an API route

      // ...

      return options;
    }
]
```

#### Rendering custom links on the frontend

Custom link objects have the following structure in the schema, where `url` will be the `value` of the user-selected option:

```ts
{
  _type: 'link',
  blank: false,
  type: 'myType'
  value: 'myCustomValue'
}
```

How you handle this on the frontend is up to you; you can either pass the `value` directly to your `<a>` as its `href` or do any other processing you like with it; it's just a string value.

If you're using the built-in `Link` component, it will handle custom links just like external links, and use the `value` as the `href`. It will also add any custom parameters or anchors configured by the user, if enabled.

## 🔧 Options

### Plugin level

When configuring the plugin in `sanity.config.ts`, these are the global options you can set. These will affect all link fields throughout your Studio.

| Option | Default Value | Description |
| ------------- | ------------- | ------------- |
| linkableSchemaTypes | `['page']` | An array of schema types that should be allowed in internal links. |
| weakReferences | `false` | Make internal links use [weak references](https://www.sanity.io/docs/reference-type#f45f659e7b28) |
| referenceFilterOptions | `undefined` | Custom [filter options](https://www.sanity.io/docs/reference-type#1ecd78ab1655) passed to the reference input component for internal links. Use it to filter the documents that should be available for linking, eg. by locale. |
| descriptions | *See [linkField.tsx](https://github.com/winteragency/sanity-plugin-link-field/blob/main/src/linkField.tsx)* | Override the descriptions of the different subfields. |
| enabledBuiltInLinkTypes | `['internal', 'external', 'email', 'phone']` | Built-in link types that should be shown in the dropdown. Use this to hide optional built-in types like `document`, `media`, `sms`, `whatsapp`, and `fax`. |
| enableLinkParameters | `true` | Whether the user should be able to set custom URL parameters for internal and external links. |
| enableAnchorLinks | `true` | Whether the user should be able to set custom anchors (URL fragments) for internal and external links. |
| customLinkTypes | `[]` | Any custom link types that should be available in the dropdown. This can be used to allow users to link to pre-defined routes that don't exist within Sanity, such as hardcoded routes in the frontend application, or dynamic content that is pulled in from an external system. See [Custom link types](#custom-link-types) |

### Field level

For each individual link field you add to your schema, you can set these options:

| Option | Default Value | Description |
| ------------- | ------------- | ------------- |
| enableText  | `false`  | Whether the link should include an optional field for setting the link text/label. If enabled, this will be available on the resulting link object under the `.text` property. |
| textLabel  | `Text`  | The label for the text input field, if enabled using the `enableText` option. |
| enabledBuiltInLinkTypes | `undefined` | Built-in link types to show for this specific field. Overrides the plugin-level `enabledBuiltInLinkTypes`. |

## 🔏 License

[MIT](LICENSE) © [Winter Agency](https://winteragency.se)

## 🧪 Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/winteragency/sanity-plugin-link-field/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.
