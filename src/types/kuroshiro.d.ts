declare module 'kuroshiro' {
  interface ConvertOptions {
    to: 'hiragana' | 'katakana' | 'romaji';
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
  }

  interface KuroshiroAnalyzer {
    parse(text: string): Promise<unknown>;
  }

  interface KuroshiroConstructor {
    new (): Kuroshiro;
  }

  interface Kuroshiro {
    init(analyzer: KuroshiroAnalyzer): Promise<void>;
    convert(text: string, options: ConvertOptions): Promise<string>;
  }

  const Kuroshiro: KuroshiroConstructor;
  export default Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  interface KuromojiAnalyzerOptions {
    dictPath?: string;
  }

  interface KuromojiAnalyzer {
    parse(text: string): Promise<unknown>;
  }

  interface KuromojiAnalyzerConstructor {
    new (options?: KuromojiAnalyzerOptions): KuromojiAnalyzer;
  }

  const KuromojiAnalyzer: KuromojiAnalyzerConstructor;
  export default KuromojiAnalyzer;
}