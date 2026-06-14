// ============================================================================
// Wuwa Archive — URL Validator
// Client-side validation for Convene URL from Kuro Games
// ============================================================================

// === REGEX PATTERNS ===

/**
 * Full regex pattern for Convene URL validation
 * Matches: https://aki-gm-resources(-oversea)?.aki-game.(net|com)/aki/gacha/index.html#/record?...
 */
export const CONVENE_URL_REGEX = /^https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?/;

/**
 * Simplified pattern for quick validation
 * Checks domain and hash part
 */
export const CONVENE_URL_SIMPLE_REGEX = /^https:\/\/aki-gm-resources.*aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?/;

/**
 * Pattern to extract required params from URL
 */
export const URL_PARAMS_REGEX = /[?&](player_id|record_id|svr_id|lang|svr_area)=([^&\s]+)/g;

// === TYPES ===

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

export interface UrlParams {
  playerId: string;
  recordId: string;
  serverId: string;
  languageCode: string;
  serverArea: string;
}

// === VALIDATION ===

/**
 * Validate a Convene URL
 * Returns validation result with error details if invalid
 */
export function validateConveneUrl(url: string): UrlValidationResult {
  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check if empty
  if (!trimmedUrl) {
    return {
      isValid: false,
      error: 'URL is empty. Please paste the Convene URL.',
      errorCode: 'EMPTY_URL',
    };
  }

  // Check if it's a valid URL format
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Invalid URL format. URL must start with http:// or https://.',
      errorCode: 'INVALID_PROTOCOL',
    };
  }

  // Check domain (must be from Kuro Games)
  if (!CONVENE_URL_SIMPLE_REGEX.test(trimmedUrl)) {
    return {
      isValid: false,
      error: 'URL is not from Convene History. Please open Convene History in-game and copy the URL.',
      errorCode: 'INVALID_DOMAIN',
    };
  }

  // Check for required hash part
  if (!trimmedUrl.includes('#/record?')) {
    return {
      isValid: false,
      error: 'Invalid URL format. Missing record hash.',
      errorCode: 'MISSING_HASH',
    };
  }

  // Extract and validate required params
  const params = extractUrlParams(trimmedUrl);
  
  if (!params.playerId) {
    return {
      isValid: false,
      error: 'URL is missing player_id parameter.',
      errorCode: 'MISSING_PLAYER_ID',
    };
  }

  if (!params.recordId) {
    return {
      isValid: false,
      error: 'URL is missing record_id parameter. The URL may have expired.',
      errorCode: 'MISSING_RECORD_ID',
    };
  }

  if (!params.serverId) {
    return {
      isValid: false,
      error: 'URL is missing server ID parameter.',
      errorCode: 'MISSING_SERVER_ID',
    };
  }

  return { isValid: true };
}

/**
 * Quick check if URL looks valid (without detailed error)
 */
export function isValidConveneUrl(url: string): boolean {
  return validateConveneUrl(url).isValid;
}

// === PARSING ===

/**
 * Extract parameters from Convene URL
 */
export function extractUrlParams(url: string): UrlParams {
  const hashPart = url.split('#/record?')[1] || '';
  const params = new URLSearchParams(hashPart);

  return {
    playerId: params.get('player_id') || '',
    recordId: params.get('record_id') || '',
    serverId: params.get('svr_id') || '',
    languageCode: params.get('lang') || 'en',
    serverArea: params.get('svr_area') || 'global',
  };
}

/**
 * Sanitize URL by trimming whitespace
 */
export function sanitizeUrl(url: string): string {
  return url.trim().replace(/\s+/g, ' ');
}

/**
 * Get player UID from URL
 */
export function getPlayerUidFromUrl(url: string): string {
  const params = extractUrlParams(url);
  return params.playerId;
}

/**
 * Get server area from URL
 */
export function getServerAreaFromUrl(url: string): 'global' | 'cn' {
  const params = extractUrlParams(url);
  return params.serverArea === 'cn' ? 'cn' : 'global';
}

// === URL BUILDING ===

/**
 * Rebuild URL with updated params (useful for re-import)
 */
export function rebuildUrl(
  originalUrl: string,
  updates: Partial<UrlParams>
): string {
  const params = extractUrlParams(originalUrl);
  const merged = { ...params, ...updates };
  
  const hashPart = new URLSearchParams();
  if (merged.playerId) hashPart.set('player_id', merged.playerId);
  if (merged.recordId) hashPart.set('record_id', merged.recordId);
  if (merged.serverId) hashPart.set('svr_id', merged.serverId);
  if (merged.languageCode) hashPart.set('lang', merged.languageCode);
  if (merged.serverArea) hashPart.set('svr_area', merged.serverArea);

  const baseUrl = originalUrl.split('#/record?')[0];
  return `${baseUrl}#/record?${hashPart.toString()}`;
}

// === TEST CASES ===

/**
 * Test URLs for validation
 * Use these to verify the validator works correctly
 */
export const TEST_URLS = {
  valid: {
    global: 'https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?svr_id=76402e5b&player_id=800123456&record_id=abc123xyz&lang=en&svr_area=global',
    china: 'https://aki-gm-resources.aki-game.com/aki/gacha/index.html#/record?svr_id=abc123&player_id=123456789&record_id=xyz789&lang=zh&svr_area=cn',
  },
  invalid: {
    wrongDomain: 'https://evil-site.com/aki/gacha/index.html#/record?player_id=123',
    missingHash: 'https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html?player_id=123',
    missingParams: 'https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?',
    empty: '',
    notUrl: 'not a url at all',
  },
} as const;
