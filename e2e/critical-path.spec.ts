import { expect } from '@playwright/test'
import { test } from '@playwright/test'

/**
 * Parcours critique e-commerce : Accueil → Produit → Panier → Commande.
 * Ne soumet pas au paiement Stripe (arrêt au formulaire checkout).
 *
 * Stratégie robuste :
 * - Accepter les cookies si la bannière est visible (évite overlay).
 * - Aller au catalogue /products pour cliquer un vrai lien fiche produit (évite hero qui intercepte les clics).
 */
test.describe('Parcours critique', () => {
  test('Accueil → Produit → Panier → Page commande', async ({ page }) => {
    // / redirige vers /fr (middleware) ; on peut aussi aller directement sur /fr
    await page.goto('/')

    // Fermer la bannière cookies si elle est affichée (évite qu’elle gêne la suite)
    const acceptCookies = page.getByRole('button', {
      name: /Tout accepter|Accept all/i,
    })
    await acceptCookies.click({ timeout: 3_000 }).catch(() => {})

    // Aller au catalogue : liens produits stables et cliquables (pas bloqués par le hero)
    await page.goto('/products')
    await expect(page).toHaveURL(/\/products\/?$/)

    // Attendre que le catalogue ait fini de charger (résultats ou message vide)
    await page
      .locator('main')
      .locator('p')
      .filter({
        hasText: /\d+\s*(résultat|produit|result)|Aucun produit trouvé|No products found/i,
      })
      .first()
      .waitFor({ state: 'visible', timeout: 12_000 })

    // Lien fiche produit dans la grille catalogue (pas nav ni packs)
    const productLink = page
      .locator('#catalogue-products-grid a[href^="/products/"]')
      .first()

    if (await productLink.isVisible().catch(() => false)) {
      const href = await productLink.getAttribute('href')
      const path = href.replace(/^https?:\/\/[^/]+/, '') || href
      const isProductDetail =
        path &&
        path !== '/products' &&
        path !== '/products/' &&
        /\/products\/(?!packs)[^/]+\/?$/.test(path.replace(/\?.*$/, ''))

      if (isProductDetail) {
        await page.goto(href.startsWith('http') ? href : new URL(href, page.url()).toString())
        await expect(page).toHaveURL(/\/products\/.+/)
      } else {
        await page.goto('/products/packs')
        await expect(page).toHaveURL(/\/products\/packs/)
        const packLink = page.locator('main a[href^="/products/packs/"]').first()
        await expect(packLink).toBeVisible({ timeout: 15_000 })
        await packLink.click()
        await expect(page).toHaveURL(/\/products\/packs\/.+/, { timeout: 12_000 })
      }
    } else {
      await page.goto('/products/packs')
      await expect(page).toHaveURL(/\/products\/packs/)
      const packLink = page.locator('main a[href^="/products/packs/"]').first()
      await expect(packLink).toBeVisible({ timeout: 15_000 })
      await packLink.click()
      await expect(page).toHaveURL(/\/products\/packs\/.+/, { timeout: 12_000 })
    }

    // Fiche produit ou pack : URL /products/xxx ou /products/packs/xxx
    await expect(page).toHaveURL(/\/products\/.+/)

    // Les pages pack n’ont pas de bouton « Ajouter au panier » : aller sur une fiche produit
    if (page.url().includes('/products/packs/')) {
      await page.goto('/products')
      await page
        .locator('main p')
        .filter({ hasText: /\d+\s*(résultat|produit|result)/i })
        .first()
        .waitFor({ state: 'visible', timeout: 8_000 })
      const productHref = await page.evaluate(() => {
        const anchors = document.querySelectorAll('#catalogue-products-grid a[href^="/products/"]')
        for (const a of anchors) {
          const h = a.getAttribute('href') || ''
          const path = h.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
          if (path && path !== '/products' && path !== '/products/' && !path.startsWith('/products/packs')) return h
        }
        return null
      })
      if (productHref) {
        await page.goto(productHref.startsWith('http') ? productHref : new URL(productHref, page.url()).toString())
      }
    }

    // Bouton "Ajouter au panier" / "Ajouter le pack" / "Commander" (data-action pour fiabilité)
    const addToCart = page
      .locator('button[data-action="add-to-cart"]')
      .or(
        page.getByRole('button', {
          name: /Ajouter au panier|Ajouter le pack|Add to cart|Commander maintenant|Buy now|Ajouté/i,
        })
      )
    await expect(addToCart.first()).toBeVisible({ timeout: 20_000 })
    await addToCart.first().click()

    // Aller au panier
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/cart/)
    // Panier non vide : lien ou bouton vers commande
    const toCheckout = page
      .getByRole('link', {
        name: /Passer commande|Proceed to checkout|Payer/i,
      })
      .or(page.getByRole('button', { name: /Passer commande|Proceed to checkout/i }))
    await expect(toCheckout.first()).toBeVisible({ timeout: 5_000 })
    await toCheckout.first().click()

    // Page commande
    await expect(page).toHaveURL(/\/commande/)
    // Formulaire : email et bouton paiement
    await expect(
      page
        .getByLabel(/Email|email/i)
        .or(page.getByRole('textbox', { name: /email/i }))
    ).toBeVisible({ timeout: 5_000 })
    await expect(
      page.getByRole('button', { name: /Payer maintenant|Pay now/i })
    ).toBeVisible()
  })
})
