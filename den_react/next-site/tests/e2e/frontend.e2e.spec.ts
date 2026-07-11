import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Amao's Den/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText("Hi, I'm Amao")
  })

  test('shows migrated journal and gallery', async ({ page }) => {
    await page.goto('http://localhost:3000/journal')
    await expect(page.getByRole('link', { name: /Markdown Test/ })).toBeVisible()

    await page.goto('http://localhost:3000/gallery')
    await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'NSFW' })).toBeVisible()
  })
})
