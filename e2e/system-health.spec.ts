import { test, expect } from '@playwright/test'

test.describe('System Health Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced/system')
  })

  test('renders without crashing', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('shows system health heading or content', async ({ page }) => {
    const hasHeading = await page.getByText(/system|health/i).first().isVisible().catch(() => false)
    const hasLoading = await page.getByText(/loading/i).isVisible().catch(() => false)
    expect(hasHeading || hasLoading).toBeTruthy()
  })

  test('no uncaught errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/advanced/system')
    await page.waitForTimeout(2000)

    const unexpectedErrors = errors.filter(
      (e) => !e.includes('fetch') && !e.includes('network') && !e.includes('Failed to fetch')
    )
    expect(unexpectedErrors).toHaveLength(0)
  })
})
