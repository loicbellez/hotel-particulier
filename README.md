
Following repos used & combined in this project:

[Google eleventy](https://github.com/google/eleventy-high-performance-blog/)

[Eleventy multilang i18n](https://github.com/adamduncan/eleventy-plugin-i18n/)

# eleventy-plugin-i18n-demo

Demo site for [`eleventy-plugin-i18n`](https://github.com/adamduncan/eleventy-plugin-i18n).

## Goal

- [x] Leverage Eleventy's data cascade to build a clever, language-aware `{{ 'hello' | i18n }}` filter, backed by multilingual dictionary translations.
- [ ] Package the filter up into a plugin, so can be easily configured and used in any Eleventy site.
- [x] Add a `data` argument and interpolate values into the translations: `{ 'hello_name': 'Hello, {{ name }}!' }`
- [ ] Write up tutorial to build on some great concepts ([multilingual](https://www.webstoemp.com/blog/multilingual-sites-eleventy/), [language toggle](https://www.webstoemp.com/blog/language-switcher-multilingual-jamstack-sites/)) in this area. Dive further into how to architect and implement multilingual Eleventy sites, and leverage the plugin (e.g. [smart language switching](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_includes/components/language-selector.njk)).
- [ ] Explore shipping additional `pluralize` filter for i18n usage `{{ 'hello' | i18n | pluralize(3) }}` (Awesome suggestion from [@alexcarpenter](https://github.com/alexcarpenter)).

## TL;DR just riffin'

- We start with logical [country-code directories for the site `src`](https://github.com/adamduncan/eleventy-plugin-i18n-demo/tree/master/src) (`/en` or `/en-GB`). Country codes or country codes with language suffixes (if we're talking dialects) are both fair game.
- Set [country-specific locale data](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/en-gb/en-gb.json) in each language directory. This data is used deeper in the country sites' cascade, as well as at the [document level for `lang` and `dir` attributes](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_includes/layouts/base.njk#L2).
- As we maintain independent site trees per language, the guts of the content pages will likely be written in their respective languages. But;
- With "UI text" though, in layouts, forms, and reusable components we often find ourselves hard-coding little chunks of copy throughout. What if we lift these out into a structured [dictionary of terms and translations](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_data/i18n/index.js)? (We could also break this down into any number/schema of dictionary files per language.)
- Then we give ourselves a clever [`i18n` filter](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_11ty/filters/i18n.js) to play with:
  - This takes a `key` to look up in the dictionary. It [uses](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_11ty/filters/i18n.js#L27) `lodash.get`-style dot notation to support structured dictionary objects. E.g. [`{{ 'actions.click' | i18n }}`](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_data/i18n/index.js#L39-L50) :sunglasses:
  - Under the hood, the `i18n` function will be clever enough to [infer its language "scope"](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_11ty/filters/i18n.js#L23) based on `page.url` language prefix.
  - We can interpolate values from a data object, by passing it as the first argument: `{{ 'hello_name' | i18n({ name: 'Eve' }) }}`.
  - To override page `locale`, we can pass a language code as the second argument: `{{ 'hello' | i18n({}, 'fr-FR') }}`. (_Note:_ we still pass an empty data object—or `undefined`—here if no interpolation is needed).
  - If a dictionary lookup can't be found, we can also set [`fallbackLocales`](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/.eleventy.js#L16-L18) via plugin options. This key/value maps lanaguages to their fallbacks. E.g. `{ 'en-US': 'en-GB' }` or use a wildcard to catch all `{ '*': 'en-GB' }`. Let's [warn the user](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_11ty/filters/i18n.js#L39-L43) in the console when fallbacks are used.
  - If neither a translation _nor_ its fallback can be found, let's return the original `key` and [really warn the user](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_11ty/filters/i18n.js#L48-L52) that something's definitely lost in translation.
- One more thing: Because we know about our [`locales.json`](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_data/locales.js) up front, and our site is structured predictably, we can easily create a smart [language-switcher](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_includes/components/language-selector.njk) component. This will automatically link you through to the correct page in each respective language based on the page you're on. No extra front matter or permalinking required. :kissing:

P.S. I've naively taken [translations here](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_data/i18n/index.js) from Google translate. I'm sure they're wrong, but would love to get them right! If you speak Spanish or Arabic and can correct me, I'd love for you to reach out: [@duncanadam](https://twitter.com/duncanadam).

#############################################################

# eleventy-plugin-i18n

[Eleventy](https://www.11ty.dev/) plugin to assist with internationalization and dictionary translations.

What's in the box? A contextually-aware `i18n` filter, with smarts and dynamic string interpolation.

- 📦 [Install](#install)
- 🕹️ [Demo](#demo)
- ⚙️ [Configuration](#configuration)
- 🔮 [Usage](#usage)
- 📓 [API](#api)
- 🚗 [Roadmap](#roadmap)

## Install

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-i18n).

```
npm install eleventy-plugin-i18n --save
```

## Demo

Dive in to see how the plugin is used in a multilingual Eleventy site:

- [Demo site](https://eleventy-plugin-i18n-demo.netlify.app/)
- [Source](https://github.com/adamduncan/eleventy-plugin-i18n-demo/)

We'll be writing up a tutorial to provide a guide and some handy **11ty i18n** hints (just as soon as we work out what all those letters and numbers mean). For a quick rundown in the meantime, check out the [TL;DR walkthrough](https://github.com/adamduncan/eleventy-plugin-i18n-demo#tldr-just-riffin).

## Configuration

### 1. Define language site directories

Create directories at the site root for each language code (e.g. `en`) or language code with country code suffix (e.g. `en-GB`):

```
├─ src
   └─ en-GB
       ├─ about.njk
       └─ index.njk
   └─ es-ES
       ├─ about.njk
       └─ index.njk
```

Either is fine. Let's assume we'll need to support multiple dialects in the future, and include country code suffixes.

These directory names determine the `lang` value of each language site. This enables Eleventy to infer language when translating terms throughout their pages.

### 2. Create directory data files

In each language site directory, create a locale data file of the same name. Include `dir` and `locale` values. E.g. `src/en-GB/en-GB.json`

```json
{
  "dir": "ltr",
  "locale": "en-GB"
}
```

👉 Bonus point: Wherever your main HTML document template is defined, include `lang` and `dir` attributes:

```
<html lang="{{ locale }}" dir="{{ dir }}">
```

### 3. Add to Eleventy configuration

Open up your Eleventy config file (probably `.eleventy.js`). Import the plugin and use `addPlugin`. This is where we provide the `translations` and `fallbackLocales` as plugin options:

```js
// .eleventy.js
const i18n = require('eleventy-plugin-i18n');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(i18n, {
    translations: {
      hello: {
        'en-GB': 'Hello',
        'es-ES': 'Hola'
      }
    },
    fallbackLocales: {
      'es-ES': 'en-GB'
    }
  });
};
```

#### `translations`

Type: `Object` | Default: `{}`

Schema: `{ [key]: { [locale]: 'String' } }`

This object contains our dictionary of translations for each respective language. It _can_ be declared inline within the plugin options (as above), but it might be nicer to lift it out into its own JS module to keep things tidy as it grows:

```js
// .eleventy.js
const i18n = require('eleventy-plugin-i18n');
const translations = require('./src/_data/i18n');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      'es-ES': 'en-GB'
    }
  });
};
```

```js
// src/_data/i18n/index.js
module.exports = {
  hello: {
    'en-GB': 'Hello',
    'es-ES': 'Hola'
  }
};
```

You might choose to break translations out into their own individual `en-GB.js` and `es-ES.js` data files, then import and merge them into a single `translations` object for the plugin. As long as our `translation` schema is the same when you're done, we're good to go! (See [API: `key`](#key))

_Note:_ These [global data files](https://www.11ty.dev/docs/data-global/) could also be JSON, but we've opted for JS to offer more flexibility around quotation marks and comments.

#### `fallbackLocales`

Type: `Object` | Default: ‌`{}`

If a matching translation for a given dictionary item can't be found, the `i18n` filter will try to find a fallback from the relevant language based on the `fallbackLocales` key/value pairs you specify. In the examples above, we're specifying that should a translation not be available in Spanish, we'll try to fall back to UK English.

You can also use a wildcard `*` to specify that all missing translations fall back to a given language:

```js
fallbackLocales: {
  '*': 'en-GB'
}
```

👀 `eleventy-plugin-i18n` will warn you in the Node console when the intended translation or fallback values can't be found for a given language based on your `translations` data.

## Usage

Once configured, the `i18n` [Universal filter](https://www.11ty.dev/docs/filters/#universal-filters) is available throughout Nunjucks, Handlebars, Liquid, and JavaScript templates and includes. E.g. To return the translation for our `hello` key in Nunjucks or Liquid syntax:

```njk
{{ 'hello' | i18n }}
```

Whether used in a page, layout or include, the filter will automatically determine the correct translation to use based on its site's language. No need to pass `locale` everywhere it's used!

## API

### **`i18n(key, data?, localeOverride?)`**

Returns: `String`

#### `key`

Type: `String`

The translation lookup key for our dictionary item.

😯 Fun fact: Translation objects can be structured however you like, as long as the `locale` is at the end of the chain. `i18n` uses [lodash's `get`](https://lodash.com/docs/#get) under the hood to make dot notation lookups like this easy peasy:

```js
module.exports = {
  actions: {
    click: {
      'en-GB': 'Click',
      'es-ES': 'Hacer clic'
    }
  }
};
```

```njk
{{ 'actions.click' | i18n }}
```

#### `data`

Type: `Object` | Default: `{}`

Translation values can interpolate data using the `{{ }}` syntax (thanks to [@lukeed](https://github.com/lukeed)'s awesome [`templite`](https://github.com/lukeed/templite/) — check out their docs!). For example, given the translation:

```js
module.exports = {
  hello_name: {
    'en-GB': 'Hello, {{ name }}!',
    'es-ES': '¡Hola {{ name }}!'
  }
};
```

```njk
{{ 'hello_name' | i18n({ name: 'Eve' }) }}
{# Returns: "Hello, Eve!" or "¡Hola Eve!" #}
```

#### `localeOverride`

Type: `String`

We can guarantee a translation will always return in a given language by including a `localeOverride` as the second argument. For example, this will always render in Spanish, no matter which country site it's in. Muy bueno!

```
{{ 'hello' | i18n({}, 'es-ES') }}
```

_Note:_ Here we still have to pass the first `data` argument, even if no interpolation is needed. You can pass an empty object `{}` or `undefined`.

## Roadmap

- [ ] Write up tutorial to build on some great concepts ([multilingual](https://www.webstoemp.com/blog/multilingual-sites-eleventy/), [language toggle](https://www.webstoemp.com/blog/language-switcher-multilingual-jamstack-sites/)) in this area. Dive deeper into how to architect and implement multilingual Eleventy sites, and leverage the plugin (e.g. [smart language switching](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_includes/components/language-selector.njk), using Netlify's `_redirects` to get users to where they need to go).
- [ ] [Jekyll](https://github.com/kurtsson/jekyll-multiple-languages-plugin#5-usage)/[Hugo](https://gohugo.io/functions/i18n/) sites often have similar libraries with `t` or `T` filters as an alias for `i18n`. Worthwhile for those migrating?
- [ ] Quiet mode option? Some might want to suppress the console logs on missing translations?
- [ ] Explore shipping additional i18n-aware `pluralize` filter `{{ 'apple' | i18n | pluralize(3) }}` (Awesome suggestion from [@alexcarpenter](https://github.com/alexcarpenter)).
- [ ] Move to v1.0.0 once we've gathered some feedback on the API.
- [ ] Consider how one might still be able to achieve a simple language switcher if site trees diverge (e.g. if `es-ES` url paths are en Español).

---

Read more about [Eleventy plugins](https://www.11ty.dev/docs/plugins/).

Feedback welcome 🙌

#############################################################

# eleventy-high-performance-blog

A starter repository for building a blog with the [Eleventy static site generator](https://www.11ty.dev/) implementing a wide range of performance best practices.

![Screenshot showing that the site achieves 100 points on Lighthouse by default](https://cdn.glitch.com/db98564e-04da-47bf-a3d6-70803c3d0fe7%2FScreen%20Shot%202020-09-04%20at%2012.07.27.png?v=1599214260591)

Based on the awesome [eleventy-base-blog](https://github.com/11ty/eleventy-base-blog).

## Demo

* [Netlify Demo](https://eleventy-high-performance-blog-sample.industrialempathy.com/)
* [Original site this template was based on](https://www.industrialempathy.com/)

## Getting Started

### 1. Generate a new repository from this repository template

Click the ["Use this template"](https://github.com/google/eleventy-high-performance-blog/generate) button. Alternatively you can clone this repo yourself and push your copy to your favorite git repository.

### 2. Clone your new repository

```
git clone https://github.com/YOUR_REPO
```

### 3. Navigate to the directory

```
cd my-blog-name
```

### 4. Install dependencies

```
npm install
```

### 5. Build, serve, watch and test
```
npm run watch
```

### 6. Build and test
```
npm run build
```

## Customize

- Search for "Update me" across files in your editor to find all the site specific things you should update.
- Update the favicons in 'img/favicon/'.
- Otherwise: Knock yourself out. This is a template repository.
- For a simple color override, adjust these CSS variables at the top of `css/main.css`.

```css
:root {
  --primary: #E7BF60;
  --primary-dark: #f9c412;
}
```

## Features

### Performance outcomes

- Perfect score in applicable lighthouse audits (including accessibility).
- Single HTTP request to [First Contentful Paint](https://web.dev/first-contentful-paint/).
- Very optimized [Largest Contentful Paint](https://web.dev/lcp/) (score depends on image usage, but images are optimized).
- 0 [Cumulative Layout Shift](https://web.dev/cls/).
- ~0 [First Input Delay](https://web.dev/fid/).

### Performance optimizations

#### Images

- Generates multiple sizes of each image and uses them in **`srcset`**.
- Generates a **blurry placeholder** for each image (without adding an HTML element or using JS).
- Transcodes images to [AVIF](https://en.wikipedia.org/wiki/AV1#AV1_Image_File_Format_(AVIF)) (currently off-by-default due to instability of the encoder) and [webp](https://developers.google.com/speed/webp) and generates `picture` element.
- **Lazy loads** images (using [native `loading=lazy`](https://web.dev/native-lazy-loading/)).
- **Async decodes** images (using `decoding=async`).
- **Lazy layout** of images and placeholders using [`content-visibility: auto`](https://web.dev/content-visibility/#skipping-rendering-work-with-content-visibility).
- **Avoids CLS impact** of images by inferring and providing width and height (Supported in Chrome, Firefox and Safari 14+).
- Downloads remote images and stores/serves them locally.
- Immutable URLs.

#### CSS

- Defaults to the compact "classless" [Bahunya CSS framework](https://kimeiga.github.io/bahunya/).
- Inlines CSS.
- Dead-code-eliminates / tree-shakes / purges (pick your favorite word) unused CSS on a per-page basis with [PurgeCSS](https://purgecss.com/).
- Minified CSS with [csso](https://www.npmjs.com/package/csso).

#### Miscellaneous

- Immutable URLs for JS.
- Sets immutable caching headers for images, fonts, and JS (CSS is inlined). Currently implements for Netlify `_headers` file.
- Minifies HTML and optimizes it for compression. Uses [html-minifier](https://www.npmjs.com/package/html-minifier) with aggressive options.
- Uses [rollup](https://rollupjs.org/) to bundle JS and minifies it with [terser](https://terser.org/).
- Prefetches same-origin navigations when a navigation is likely.
- If an AMP files is present, [optimizes it](https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/optimize_amp/).

#### Fonts

- Serves fonts from same origin.
- Makes fonts `display:swap`.

#### Analytics

- Supports locally serving Google Analytics's JS and proxying it's hit requests to a Netlify proxy (other proxies could be easily added).
- Support for noscript hit requests.
- Avoids blocking onload on analytics requests.
- To turn this on, specify `googleAnalyticsId` in `metadata.json`. 

### DX features

- Uses 🚨 as favicon during local development.
- Supports a range of default tests.
- Runs build and tests on `git push`.
- Sourcemap generated for JS.

### SEO & Social

- Share button preferring `navigator.share()` and falling back to Twitter. Using OS-like share-icon.
- Support for OGP metadata.
- Support for Twitter metadata.
- Support for schema.org JSON-LD.
- Sitemap.xml generation.

### Largely useless glitter

- Read time estimate.
- Animated scroll progress bar…
- …with an optimized implementation that should never cause a layout.

### Security

Generates a strong CSP for the base template.

- Default-src is self.
- Disallows plugins.
- Generates hash based CSP for the JS used on the site.
- To extend the CSP with new rules, see [CSP.js](https://github.com/google/eleventy-high-performance-blog/blob/main/_data/csp.js#L22)

### Build performance

- Downloaded remote images, and generated sizes are cached in the local filesystem…
- …and SHOULD be committed to git.
- `.persistimages.sh` helps with this.

## Disclaimer

This is not an officially supported Google product, but rather [Malte's](https://twitter.com/cramforce) private best-effort open-source project.
