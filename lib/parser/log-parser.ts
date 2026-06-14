const CONVENE_URL_REGEX = /https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?[^\s"']+/g;

export function extractConveneUrl(logContent: string): string | null {
  const matches = logContent.match(CONVENE_URL_REGEX);
  if (!matches || matches.length === 0) return null;
  // Return the last match as it is the most recent auth token in the log
  return matches[matches.length - 1];
}
