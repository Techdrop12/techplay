export const templates = {
  confirmation: (name: string) => `
    <h1>Merci pour votre commande, ${name}</h1>
    <p>Nous préparons votre colis avec soin 💌</p>
  `,
  abandonPanier: (product: string) => `
    <p>Vous avez laissé <strong>${product}</strong> dans votre panier.</p>
    <p>Il vous attend toujours 😉</p>
  `,
}
