# ts-rss-builder

A Zero-Dependency TypeScript RSS builder for Astro.

## Purpose

Generate RSS feeds from Astro collections with ease. Built for NN1 Spotlights RSS feed.

## Why?

For learning and to keep things simple. Most RSS builders have alot of deps and stuff you don't need. My library is zero-dep, easy to understand, and made to play nicely with Astro collections.

## Installation

```
pnpm install ts-rss-builder
```

## Usage

```
import { getCollection } from 'astro:content';
import { createRSSFromAstroCollection } from 'ts-rss-builder';
import sanitizeHtml from 'sanitize-html';

const baseUrl = "https://example.com";
const blog = await getCollection('blog');

return createRSSFromAstroCollection(blog, {
      site: baseUrl,
      feedUrl: `${baseUrl}/blog.xml`,
      mappers: {
        title: (entry) => entry.data.name,
        link: (entry) => `${baseUrl}/blog/${entry.id}`,
        description: (entry) => generateDescription(entry),	// You'd usually get this from entry.data
        content: (entry) => sanitizeContent(entry.rendered?.html || entry.body || ''), // sanitizeHtml is a custom defined wrapping sanitizeHtml
        pubDate: (entry) => entry.data.date,
        guid: (entry) => `${baseUrl}/blog/${entry.id}`,
        enclosure: (entry) => createImageEnclosure(entry, baseUrl, isDev), // // You'd usually get this from entry.data (image)
      },
});
```

## Configuration Interface

```
interface AstroRSSConfig<T = any> {
  title: string;                // Feed title
  description: string;          // Feed description
  site: string;                 // Base site URL (e.g. https://example.com)
  feedUrl: string;              // Full URL to the RSS feed (e.g. https://example.com/feed.xml)
  language?: string;            // Optional language code (e.g. "en-GB")
  customData?: string;          // Optional raw XML string for additional RSS tags/namespaces

  mappers: {
    title: (entry: T) => string;              // Map entry to item title
    link: (entry: T) => string;               // Map entry to item link
    description: (entry: T) => string;        // Map entry to item description (typically summary)
    content: (entry: T) => string;             // Map entry to item full content (for content:encoded)
    pubDate: (entry: T) => string | Date;     // Map entry to publication date (ISO string or Date)
    category?: (entry: T) => string | string[] | undefined; // Optional categories/tags
    guid?: (entry: T) => string;               // Optional unique identifier for the item
    enclosure?: (entry: T) => RSSEnclosure | undefined;    // Optional media enclosure
  };
}

interface RSSEnclosure {
  url: string;
  length?: number | string;
  type?: string; // MIME type, e.g. "image/jpeg"
}
```

## Security, XML Safety & Compliance 

This builder is designed with XML correctness and security in mind. Here are some techniques it uses:

#### XML Character Escaping:
- All user-supplied text (titles, descriptions, links, etc.) is escaped to replace characters like &, <, >, ", and ' with their XML entity equivalents (&amp;, &lt;, etc.).
-This prevents XML injection, broken markup, and parsing errors.

#### Safe CDATA Handling:
- Content inside `<content:encoded>` is wrapped in CDATA sections to allow HTML without heavy escaping.
- This library escapes any ]]> sequences inside content to ]]&gt;, preventing early CDATA section termination, which would corrupt the XML.
- It also removes dangerous control characters (non-printable ASCII) which can cause XML parsers to fail or behave unexpectedly.

#### Date Formatting:
- Publication dates are strictly formatted to RFC-822 compliant strings, ensuring compatibility with RSS readers and feed validators.
- Enclosure & Category Safety

#### Caching:
- XML escaping results are cached for performance when escaping repeated strings.