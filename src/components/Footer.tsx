import { Link } from "react-router";
import { ChefHat, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#6B3A3A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-[#D4A373]" />
              <span className="font-display text-xl font-semibold">
                The Velvet Whisk
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              Artisanal cakes crafted with love, premium ingredients, and decades
              of baking expertise. Every celebration deserves a masterpiece.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#D4A373] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#D4A373] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#D4A373] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 text-[#D4A373]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Shop All Cakes", path: "/shop" },
                { name: "Track Order", path: "/track" },
                { name: "Sign In", path: "/login" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 text-[#D4A373]">
              Categories
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Classic Cakes", slug: "classic" },
                { name: "Gourmet Cakes", slug: "gourmet" },
                { name: "Designer Cakes", slug: "designer" },
                { name: "Cheesecakes", slug: "cheesecakes" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 text-[#D4A373]">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-4 w-4 text-[#D4A373]" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-4 w-4 text-[#D4A373]" />
                hello@velvetwhisk.com
              </li>
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4 text-[#D4A373] mt-0.5" />
                <span>
                  123 Baker Street
                  <br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            &copy; 2026 The Velvet Whisk. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/50">
            <span className="hover:text-white/70 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-white/70 cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
