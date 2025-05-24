import dbConnect from "@/lib/dbConnect";
import FAQ from "@/models/FAQ";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    await dbConnect();
    const { productId, question, answer } = req.body;

    if (!productId || !question || !answer) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const faq = new FAQ({ productId, question, answer });
    await faq.save();

    return res.status(201).json({ message: "FAQ créée", faq });
  } catch (error) {
    console.error("Erreur création FAQ:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
