# 🐺 QA Wolf Project Setup

Welcome to the QA Wolf project! This guide will help you set up the project, run tests, and modify the test configuration.

---

## 🚀 Getting Started

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/0ld-goose/project
```

### 2. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
cd QA-wolf
npm install
```

### 3. Run Tests

To execute the tests, use the following command:

```bash
npx playwright test
```

---

## ⚙️ Modifying the Test Configuration

The test configuration is defined in two places: the `playwright.config.ts` file and the `TestConfig` object in `index.spec.ts`. You can modify these to suit your needs.

### Modifying the `TestConfig` Object

The `TestConfig` object is defined at the top of `index.spec.ts` and looks like this:

```typescript
const config: TestConfig = {
  TARGET_URL: "https://news.ycombinator.com/newest",
  TEST_COUNT: 100,
  TITLE_KEYWORD: /Hacker News/,
};
```

You can modify the following properties:

1. **`TARGET_URL`**:  
   Change this to the URL of the website you want to test.

2. **`TEST_COUNT`**:  
   Adjust this value to specify the number of articles to validate during the test.

3. **`TITLE_KEYWORD`**:  
   Update this regular expression to match the expected title of the page.

### Example Changes:

- To test a different website:

  ```typescript
  TARGET_URL: "https://example.com",
  ```

- To validate 50 articles instead of 100:

  ```typescript
  TEST_COUNT: 50,
  ```

- To match a different title:
  ```typescript
  TITLE_KEYWORD: /Example Title/,
  ```

---

### Modifying the `playwright.config.ts` File

In addition to the `TestConfig` object, you can modify the `playwright.config.ts` file for global settings.

1. **Enable/Disable Browsers**:  
   In `playwright.config.ts`, you can enable or disable specific browsers by commenting/uncommenting the `projects` array entries:

   ```typescript
   projects: [
     {
       name: "chromium",
       use: { ...devices["Desktop Chrome"] },
     },
     {
       name: "firefox",
       use: { ...devices["Desktop Firefox"] },
     },
     // Uncomment to enable Safari
     // {
     //   name: "webkit",
     //   use: { ...devices["Desktop Safari"] },
     // },
   ],
   ```

2. **Enable Tracing**:  
   Tracing can help debug failed tests. In the `use` section of `playwright.config.ts`, ensure tracing is enabled:
   ```typescript
   use: {
     trace: "on-first-retry",
   },
   ```

---

## 🛠 Debugging Tips

- **Run a Specific Test File**:  
  Use the following command to run a specific test file:

  ```bash
  npx playwright test tests/index.spec.ts
  ```

- **View Test Report**:  
  After running tests, view the HTML report:

  ```bash
  npx playwright show-report
  ```

- **Capture Screenshots**:  
  Screenshots are automatically saved in the `screenshots` folder during test execution.

---

Feel free to modify the project as needed. Happy testing! 🐺
