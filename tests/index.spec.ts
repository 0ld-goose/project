import { test, expect } from "@playwright/test";
import { Article } from "../interfaces/Articles";
import { TestConfig } from "../interfaces/TestConfig";

const config: TestConfig = {
  TARGET_URL: "https://news.ycombinator.com/newest",
  TEST_COUNT: 100,
  TITLE_KEYWORD: /Hacker News/,
};

//The class locators
enum Locators {
  ARTICLE = ".submission",
  MORE = ".morelink",
  RANK = ".rank",
}

test.describe("Site Functionality", () => {
  //For this group go to the target before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(config.TARGET_URL);
  });

  test("Page has title", async ({ page }) => {
    await expect(page).toHaveTitle(config.TITLE_KEYWORD);
  });

  test("Articles exist ", async ({ page }) => {
    let articleCount = await page.locator(Locators.ARTICLE).count();
    await expect(articleCount).toBeGreaterThan(0);
  });

  test("More items is working", async ({ page }) => {
    await test.step("Verify the 'More' link is visible", async () => {
      await expect(page.locator(Locators.MORE)).toBeVisible();
    });

    await test.step("Click the 'More' link", async () => {
      await page.getByRole("link", { name: "More", exact: true }).click();
    });

    await test.step("Verify the 'More' link is still visible", async () => {
      await expect(page.locator(Locators.MORE)).toBeVisible();
    });
  });
});

//This test is ran serially, we will first scrape the articles
test.describe.serial(`${config.TEST_COUNT} Articles In Descending Order`, () => {
  let articles = new Array<Article>();

  test(`Can read exactly ${config.TEST_COUNT} articles`, async ({ page }) => {
    await test.step(`Go to the target URL: [${config.TARGET_URL}]`, async () => {
      await page.goto(config.TARGET_URL);
    });

    let articlesPerPage = 1;
    await test.step("Capture the number of articles on a page", async () => {
      let lastRank = await page.locator(Locators.RANK).last().innerText();

      // Ensure lastRank is a valid number
      if (!lastRank || isNaN(parseInt(lastRank))) {
        throw new Error(`Invalid last rank value: ${lastRank}`);
      }
      articlesPerPage = parseInt(lastRank);
    });

    for (
      let moreCount = 1;
      moreCount <= Math.ceil(config.TEST_COUNT / articlesPerPage);
      moreCount++
    ) {
      await test.step(`Scrape articles on page ${moreCount}`, async () => {
        for (const container of await page.locator(Locators.ARTICLE).all()) {
          //capture the rank
          let rank = parseInt(await container.locator(Locators.RANK).innerText());

          //Fail the test if rank isn't captured correctly
          await expect(rank).not.toBeNaN();
          await expect(rank).toBeGreaterThan(0);

          //extract title
          let title = await container.locator(".titleline").getByRole("link").first().innerText();

          //extract the closest date using the .age class since the <span> containing the date is in a sibling <tr>
          let dateString = await container
            .locator("xpath=following-sibling::tr[1]//span[contains(@class, 'age')]")
            .getAttribute("title");

          //extract the Unix Timestamp
          let unixTimestamp = parseInt(dateString?.split(" ")[1] || "0");

          // Fail the test if the Unix timestamp can't be parsed
          await expect(unixTimestamp).toBeGreaterThan(0);

          //build article objects
          let article: Article = {
            ObservedOrder: rank,
            Title: title,
            UnixTimestamp: unixTimestamp,
          };
          //exit once we hit exactly the amount of articles to capture
          if (articles.length < config.TEST_COUNT) {
            articles.push(article);
          } else {
            break;
          }
        }
      });

      await test.step(`Capture a screenshot for page ${moreCount}`, async () => {
        await page.screenshot({
          path: `screenshots/newest-articles-${Date.now()}-p${moreCount}.png`,
          fullPage: true,
        });
      });

      await test.step(`Click more once all articles on page ${moreCount} scraped`, async () => {
        if (articles.length < config.TEST_COUNT) {
          await page.getByRole("link", { name: "More", exact: true }).click();
        }
      });
    }

    await test.step(`Log our Article array to stdout for debugging (OPTIONAL)`, async () => {
      page.on("console", (msg) => console.log(msg.text()));
      console.log(articles);
    });

    //test we have scraped the correct number of articles
    await expect(articles.length).toEqual(config.TEST_COUNT);
  });

  //The real task =')
  test(`The ${config.TEST_COUNT} articles are in descending order`, async () => {
    await test.step(`Verify we have already scraped the articles`, async () => {
      await expect(articles.length).toBeGreaterThan(0);
    });

    // Check if the Unix timestamps are in descending order
    await test.step(`Verify the articles are in descending order`, async () => {
      const isDescending = checkIfArticlesDescending(articles);
      await expect(isDescending).toBeTruthy();
    });
  });

  test("The articles are not in descending order when manipulated", async () => {
    let dummyArticle = {
      ObservedOrder: 1, //irrelevant as our Unix timestamp is our indicator
      Title: "Some old thing",
      UnixTimestamp: 1690000000, //2023
    };

    await test.step(`Verify the articles are in descending order`, async () => {
      await expect(checkIfArticlesDescending(articles)).toBeTruthy();
    });

    await test.step("Add an old article to the front and check it's no longer descending", async () => {
      let modifiedArticles = [...articles];
      modifiedArticles.unshift(dummyArticle);
      await expect(checkIfArticlesDescending(modifiedArticles)).toBeFalsy();
    });

    await test.step(`Verify adding the old article to the end is still descending`, async () => {
      let correctlyModifiedArticles = [...articles];
      correctlyModifiedArticles.push(dummyArticle);
      await expect(checkIfArticlesDescending(correctlyModifiedArticles)).toBeTruthy();
    });
  });
});

/**
 * Checks if articles are in descending order based on UnixTimestamp.
 * @param {Article[]} articles - Array of articles to check.
 * @returns {boolean} True if articles are in descending order.
 */
function checkIfArticlesDescending(articles: Article[]) {
  return articles.every((article, index) => {
    // Skip the last element since there's no next element to compare
    if (index === articles.length - 1) return true;
    //if for any reason an article has no timestamp fail
    if (isNaN(article.UnixTimestamp)) return false;

    // Compare the current article's timestamp with the next one
    return article.UnixTimestamp >= articles[index + 1].UnixTimestamp;
  });
}
