/**
 * Configuration for the test suite.
 */
export interface TestConfig {
  /**
   * The target URL for the website.
   * @type {string}
   * @default "https://news.ycombinator.com/newest"
   */
  TARGET_URL: string;
  /**
   * The number of articles to check.
   * @type {number}
   * @default 100
   * @example 50
   */
  TEST_COUNT: number;
  /**
   * A keyword in the page title
   * @type {RegExp}
   * @example /Hacker News/
   */
  TITLE_KEYWORD: RegExp;
}
