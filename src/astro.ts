import { generateRSS } from './rss';
import type { RSSFeedOptions, RSSItem, AstroRSSConfig } from './types';

export function createRSSFromAstroCollection<T = any>(
  collection: T[],
  config: AstroRSSConfig<T>
): string {
  const rssItems: RSSItem[] = collection.map(entry => {
    const item: RSSItem = {
      title: config.mappers.title(entry),
      link: config.mappers.link(entry),
      pubDate: config.mappers.pubDate(entry),
      description: config.mappers.description(entry),
    };

    const content = config.mappers.content(entry);
    if (content) item.content = content;

    const category = config.mappers.category?.(entry);
    if (category) item.category = category;

    item.guid = config.mappers.guid?.(entry) || config.mappers.link(entry);
    
    const enclosure = config.mappers.enclosure?.(entry);
    if (enclosure) item.enclosure = enclosure;

    return item;
  });

  const rssOptions: RSSFeedOptions = {
    title: config.title,
    description: config.description,
    site: config.site,
    feedUrl: config.feedUrl,
    ...(config.language ? { language: config.language } : {}),
    ...(config.customData ? { customData: config.customData } : {}),
    items: rssItems,
  };

  return generateRSS(rssOptions);
}

export * from './types';