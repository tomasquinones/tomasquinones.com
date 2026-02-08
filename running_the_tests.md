# Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Prerequisites

Install dependencies:

```bash
npm install
```

Install Playwright browsers (first time only):

```bash
npx playwright install chromium
```

## Running Tests

### Run all tests

```bash
npm test
```

This automatically starts a local server on port 3000 and runs all tests.

### Interactive UI mode

```bash
npm run test:ui
```

Opens Playwright's interactive UI where you can:
- Run individual tests
- Watch tests execute in real-time
- Debug failures step-by-step
- View test traces

### View test report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This opens a browser with detailed results including:
- Pass/fail status for each test
- Screenshots for visual regression tests
- Diff images showing what changed (for failures)

## Visual Regression Tests

Visual tests compare screenshots against baseline images stored in `tests/design-kit.visual.spec.ts-snapshots/`.

### Update baselines after intentional changes

When you make intentional visual changes (new theme, updated styles, etc.):

```bash
npm run test:update-snapshots
```

This captures new baseline screenshots. Review the changes before committing.

### Viewing visual diffs

When visual tests fail:

1. Run `npm test` to see failures
2. Run `npx playwright show-report` to open the report
3. Click on a failed test to see:
   - **Expected**: The baseline screenshot
   - **Actual**: What the test captured
   - **Diff**: Pink/red highlights showing differences

## Test Files

| File | Description |
|------|-------------|
| `tests/design-kit.spec.ts` | Functional tests (theme switching, localStorage, UI interactions) |
| `tests/design-kit.visual.spec.ts` | Visual regression tests (screenshots for all 16 themes) |

## Configuration

Test configuration is in `playwright.config.ts`:

- **webServer**: Automatically runs `npx serve -l 3000` before tests
- **baseURL**: `http://localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Reporter**: HTML report

## Tips

- Tests clear localStorage in `beforeEach` to ensure clean state
- Visual tests use `maxDiffPixelRatio: 0.01` (1% tolerance for minor rendering differences)
- Use `--headed` flag to watch tests run: `npx playwright test --headed`
- Run a single test file: `npx playwright test tests/design-kit.spec.ts`
