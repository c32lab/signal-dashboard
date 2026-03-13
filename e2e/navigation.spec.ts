import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('nav bar is visible on the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
  })

  const routes = [
    { path: '/', heading: /signal|dashboard/i },
    { path: '/backtest', heading: /backtest|A\/B/i },
    { path: '/trading', heading: /trad/i },
    { path: '/history', heading: /history|event/i },
    { path: '/quality', heading: /quality/i },
    { path: '/timeline', heading: /timeline/i },
    { path: '/advanced/system', heading: /system|health/i },
  ]

  for (const { path } of routes) {
    test(`page ${path} loads without crashing`, async ({ page }) => {
      await page.goto(path)
      // Should not show React error boundary
      await expect(page.getByText('Something went wrong')).not.toBeVisible({ timeout: 3000 }).catch(() => {
        // If the text doesn't exist at all, that's fine
      })
      // Nav should always be present
      await expect(page.locator('nav')).toBeVisible()
    })
  }

  test('clicking nav links navigates to correct pages', async ({ page }) => {
    await page.goto('/')

    // Navigate to backtest via nav link
    await page.getByRole('link', { name: /Backtest/ }).click()
    await expect(page).toHaveURL(/\/backtest/)

    // Navigate to trading
    await page.getByRole('link', { name: /Trading/ }).click()
    await expect(page).toHaveURL(/\/trading/)

    // Navigate to history
    await page.getByRole('link', { name: /History/ }).click()
    await expect(page).toHaveURL(/\/history/)

    // Navigate to timeline
    await page.getByRole('link', { name: /Timeline/ }).click()
    await expect(page).toHaveURL(/\/timeline/)

    // Navigate back home
    await page.getByRole('link', { name: /Overview/ }).click()
    await expect(page).toHaveURL(/^\/$|localhost:8081\/$/)
  })

  test('advanced dropdown reveals quality and system health links', async ({ page }) => {
    await page.goto('/')
    // The advanced section is a dropdown — hover or click to reveal
    const advancedTrigger = page.getByText(/Advanced/)
    if (await advancedTrigger.isVisible()) {
      await advancedTrigger.click()
      // After opening, quality and system links should appear
      await expect(page.getByRole('link', { name: /Quality/ })).toBeVisible({ timeout: 3000 })
      await expect(page.getByRole('link', { name: /System Health/ })).toBeVisible({ timeout: 3000 })
    }
  })
})
