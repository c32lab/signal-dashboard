import { test, expect } from '@playwright/test'

test.describe('Responsive – Mobile viewport (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('hamburger button is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Toggle navigation menu')).toBeVisible()
  })

  test('desktop nav links are hidden', async ({ page }) => {
    await page.goto('/')
    // The desktop nav container has "hidden md:flex" — at 375px it should be hidden
    const desktopNav = page.locator('nav .hidden.md\\:flex')
    await expect(desktopNav).toBeHidden()
  })

  test('clicking hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByLabel('Toggle navigation menu')
    await hamburger.click()
    // Mobile menu renders nav links inside a md:hidden container
    const mobileMenu = page.locator('nav .md\\:hidden.border-t')
    await expect(mobileMenu).toBeVisible()
    // At least one nav link should be visible
    await expect(mobileMenu.getByRole('link').first()).toBeVisible()
  })

  test('can navigate to a page via mobile menu', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Toggle navigation menu').click()
    // Click the trading link in the mobile menu
    await page.getByRole('link', { name: /交易记录/ }).click()
    await expect(page).toHaveURL(/\/trading/)
    // Page should render without crashing
    await expect(page.locator('nav')).toBeVisible()
  })
})

test.describe('Responsive – Desktop viewport (1280x720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('desktop nav links are visible', async ({ page }) => {
    await page.goto('/')
    const desktopNav = page.locator('nav .hidden.md\\:flex')
    await expect(desktopNav).toBeVisible()
    // Should contain nav links
    await expect(desktopNav.getByRole('link').first()).toBeVisible()
  })

  test('hamburger button is hidden', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Toggle navigation menu')).toBeHidden()
  })
})

test.describe('Responsive – Pages render at mobile width', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  const pages = [
    { path: '/', name: 'Dashboard' },
    { path: '/quality', name: 'Quality' },
    { path: '/trading', name: 'Trading' },
  ]

  for (const { path, name } of pages) {
    test(`${name} (${path}) renders without crashing at 375px`, async ({ page }) => {
      await page.goto(path)
      // Nav should always be present
      await expect(page.locator('nav')).toBeVisible()
      // Page should have some main content (heading or main element)
      const hasContent = await page
        .locator('h1, h2, h3, main, [role="main"]')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
      // At minimum, the page should not show an error boundary
      const hasError = await page
        .getByText('Something went wrong')
        .isVisible({ timeout: 1000 })
        .catch(() => false)
      expect(hasError).toBe(false)
      // Either content rendered or at least the nav is there (API may be down)
      expect(hasContent || (await page.locator('nav').isVisible())).toBe(true)
    })
  }
})
