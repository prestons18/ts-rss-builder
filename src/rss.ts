import type { RSSFeedOptions, RSSItem } from './types';

const xmlEscapeCache = new Map<string, string>();

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';

  const cached = xmlEscapeCache.get(unsafe);
  if (cached !== undefined) return cached;

  const safe = String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  xmlEscapeCache.set(unsafe, safe);
  return safe;
}

function formatDate(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) throw new Error('Invalid date');

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} GMT`;
}

function renderCategory(category: string | string[]): string {
  if (!category) return '';

  if (Array.isArray(category)) {
    return category
      .filter(Boolean)
      .map(cat => `    <category>${escapeXml(String(cat))}</category>`)
      .join('\n');
  }

  return `    <category>${escapeXml(String(category))}</category>`;
}

function cleanCdata(content: unknown): string {
  if (content === null || content === undefined) return '';
  let str = String(content);

  // Unescape any previously escaped CDATA end markers
  str = str.replace(/]]&gt;/g, ']]>');

  // Remove control characters except newlines, tabs, etc.
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // Escape any remaining CDATA end markers
  str = str.replace(/]]>/g, ']]&gt;');

  return str;
}

function renderItem(item: RSSItem): string {
  if (!item?.title || !item.link) return '';

  const guid = item.guid || item.link;
  const parts = [
    '  <item>',
    `    <title>${escapeXml(item.title)}</title>`,
    `    <link>${escapeXml(item.link)}</link>`,
    `    <pubDate>${formatDate(item.pubDate || new Date())}</pubDate>`,
    `    <guid isPermaLink="${guid === item.link ? 'true' : 'false'}">${escapeXml(guid)}</guid>`
  ];

  if (item.description) {
    parts.push(`    <description>${escapeXml(item.description)}</description>`);
  }

  if (item.content) {
    parts.push(`    <content:encoded><![CDATA[${item.content}]]></content:encoded>`);
  }

  if (item.category) {
    const categoryXml = renderCategory(item.category);
    if (categoryXml) parts.push(categoryXml);
  }

  if (item.enclosure?.url) {
    const { url, length, type } = item.enclosure;
    const safeUrl = escapeXml(url);
    const safeType = type ? escapeXml(type) : 'image/jpeg';
    const safeLength = typeof length === 'number' && length >= 0 ? length : 0;

    parts.push(`    <enclosure url="${safeUrl}" length="${safeLength}" type="${safeType}" />`);
  }

  parts.push('  </item>');
  return parts.join('\n');
}

export function generateRSS(options: RSSFeedOptions): string {
  const { title, description, site, feedUrl, items = [], language = 'en' } = options;

  if (!title || !description || !site || !feedUrl) {
    throw new Error('Missing required RSS options: title, description, site, feedUrl');
  }

  const validItems = items.filter(item => item?.title && item.link);
  const itemsXml = validItems.map(renderItem).filter(Boolean).join('\n\n');
  const lastBuildDate = formatDate(new Date());

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${options.customData ? `    ${options.customData.trim()}\n` : ''}${itemsXml}
  </channel>
</rss>`;
}