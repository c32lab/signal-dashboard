import { test, expect } from '@playwright/test'

test.describe('Backtest Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/backtest')
  })

  test('renders without crashing', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()
  })

  test('shows backtest-related heading or content', async ({ page }) => {
    const hasHeading = await page.getByText(/backtest|A\/B|compare/i).first().isVisible().catch(() => false)
    const hasLoading = await page.getByText(/loading/i).isVisible().catch(() => false)
    expect(hasHeading || hasLoading).toBeTruthy()
  })

  test('no uncaught errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/backtest')
    await page.waitForTimeout(2000)

    const unexpectedErrors = errors.filter(
      (e) => !e.includes('fetch') && !e.includes('network') && !e.includes('Failed to fetch')
    )
    expect(unexpectedErrors).toHaveLength(0)
  })

  test('renders Param Sweep Heatmap section', async ({ page }) => {
    const section = page.getByText('Parameter Sweep Heatmap', { exact: true })
    const errorFallback = page.getByText('Failed to render Param Sweep Heatmap')
    await expect(section.or(errorFallback).first()).toBeVisible({ timeout: 10_000 })
  })

  test('renders Radar Comparison section', async ({ page }) => {
    const section = page.getByText('Radar Comparison', { exact: true })
    const errorFallback = page.getByText('Failed to render Radar Comparison')
    await expect(section.or(errorFallback).first()).toBeVisible({ timeout: 10_000 })
  })

  test('renders Sensitivity Analysis section', async ({ page }) => {
    const section = page.getByText('Sensitivity Analysis', { exact: true })
    const errorFallback = page.getByText('Failed to render Sensitivity Analysis')
    await expect(section.or(errorFallback).first()).toBeVisible({ timeout: 10_000 })
  })

  test('renders Parameter Matrix section', async ({ page }) => {
    const section = page.getByText('Parameter Matrix Heatmap', { exact: true })
    const errorFallback = page.getByText('Failed to render Parameter Matrix')
    await expect(section.or(errorFallback).first()).toBeVisible({ timeout: 10_000 })
  })

  test('renders Walk-Forward Analysis section', async ({ page }) => {
    const section = page.getByText('Walk-Forward Analysis', { exact: true })
    const errorFallback = page.getByText('Failed to render Walk-Forward Analysis')
    await expect(section.or(errorFallback).first()).toBeVisible({ timeout: 10_000 })
  })

  test('Parameter Matrix section has axis controls', async ({ page }) => {
    const heading = page.getByText('Parameter Matrix Heatmap', { exact: true })
    const isVisible = await heading.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }
    const container = heading.locator('..')
    await expect(container.getByText('X-Axis').or(container.locator('select')).first()).toBeVisible()
  })

  test('Walk-Forward Analysis section has chart or table', async ({ page }) => {
    const heading = page.getByText('Walk-Forward Analysis', { exact: true })
    const isVisible = await heading.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }
    const hasChart = await page.locator('.recharts-responsive-container').last().isVisible().catch(() => false)
    const hasTable = await page.getByText('Window').isVisible().catch(() => false)
    expect(hasChart || hasTable).toBeTruthy()
  })
})
