import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="relative text-white text-center py-20 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="absolute inset-0 opacity-20">
        <Image src="/hero-bg.jpg" fill alt="Hero" style={{ objectFit: 'cover' }} />
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold">Bienvenue sur TechPlay</h1>
        <p className="mt-4 text-lg md:text-xl">Les meilleurs produits tech et gadgets du moment</p>
      </div>
    </div>
  );
}
