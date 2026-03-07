import { test, expect } from '@playwright/test'

test.describe('Dashboard (Home Page)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders without crashing', async ({ page }) => {
    // Nav should be visible
    await expect(page.locator('nav')).toBeVisible()
    // Page should not be blank — at least loading state or content
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('shows loading state or dashboard content', async ({ page }) => {
    // Either shows "Loading" while fetching, or shows actual content
    const hasLoading = await page.getByText(/loading/i).isVisible().catch(() => false)
    const hasContent = await page.locator('.bg-gray-900').first().isVisible().catch(() => false)
    expect(hasLoading || hasContent).toBeTruthy()
  })

  test('no uncaught errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(2000)

    // Filter out expected errors (e.g. network failures when backend is down)
    const unexpectedErrors = errors.filter(
      (e) => !e.includes('fetch') && !e.includes('network') && !e.includes('Failed to fetch')
    )
    expect(unexpectedErrors).toHaveLength(0)
  })
})
