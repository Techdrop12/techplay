import { expect } from '@playwright/test'
import { test } from '@playwright/test'

/**
 * Parcours critique e-commerce : Accueil → Produit → Panier → Commande.
 * Ne soumet pas au paiement Stripe (arrêt au formulaire checkout).
 */
test.describe('Parcours critique', () => {
  test('Accueil → Produit → Panier → Page commande', async ({ page }) => {
    await page.goto('/')

    // Accueil : au moins un lien vers une fiche produit
    const productLink = page.locator('a[href^="/products/"]').first()
    await expect(productLink).toBeVisible({ timeout: 15_000 })
    await productLink.click()

    // Fiche produit : URL /products/xxx
    await expect(page).toHaveURL(/\/products\/[\w-]+/)
    // Bouton "Ajouter au panier" ou "Commander"
    const addToCart = page.getByRole('button', {
      name: /Ajouter au panier|Add to cart|Commander maintenant|Buy now/i,
    })
    await expect(addToCart).toBeVisible({ timeout: 10_000 })
    await addToCart.click()

    // Aller au panier
    await page.goto('/cart')
    await expect(page).toHaveURL(/\/cart/)
    // Panier non vide : lien ou bouton vers commande
    const toCheckout = page.getByRole('link', {
      name: /Passer commande|Proceed to checkout|Payer/i,
    }).or(page.getByRole('button', { name: /Passer commande|Proceed to checkout/i }))
    await expect(toCheckout.first()).toBeVisible({ timeout: 5_000 })
    await toCheckout.first().click()

    // Page commande
    await expect(page).toHaveURL(/\/commande/)
    // Formulaire : email et bouton paiement
    await expect(
      page.getByLabel(/Email|email/i).or(page.getByRole('textbox', { name: /email/i }))
    ).toBeVisible({ timeout: 5_000 })
    await expect(
      page.getByRole('button', { name: /Payer maintenant|Pay now/i })
    ).toBeVisible()
  })
})
