export interface RSSItem {
  title: string;
  link: string;
  pubDate: Date | string;
  guid?: string;
  description?: string;
  content?: string;
  category?: string | string[];
  enclosure?: RSSEnclosure;
}

export interface RSSEnclosure {
  url: string;
  length: number | string;
  type: string;
}

export interface RSSFeedOptions {
  title: string;
  description: string;
  site: string;
  feedUrl: string;
  items: RSSItem[];
  language?: string;
  customData?: string;
}

export interface AstroRSSConfig<T = any> {
  title: string;
  description: string;
  site: string;
  feedUrl: string;
  language?: string;
  customData?: string;
  mappers: {
    title: (entry: T) => string;
    link: (entry: T) => string;
    description: (entry: T) => string;
    content: (entry: T) => string;
    pubDate: (entry: T) => string | Date;
    category?: (entry: T) => string | string[] | undefined;
    guid?: (entry: T) => string;
    enclosure?: (entry: T) => RSSEnclosure | undefined;
  };
}