import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-tech-dark text-white py-12 lg:py-16">
      <div className="responsive-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-tech text-xl sm:text-2xl font-bold mb-3 lg:mb-4">Innovare Technical Club</h3>
            <p className="text-gray-400 mb-4 lg:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Empowering the next generation of tech innovators through cutting-edge projects,
              collaborative learning, and breakthrough solutions.
            </p>
            <div className="flex space-x-3 lg:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tech-blue rounded-lg flex items-center justify-center hover:bg-tech-green transition-all duration-300 cursor-pointer hover-lift" data-testid="social-facebook">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tech-blue rounded-lg flex items-center justify-center hover:bg-tech-green transition-all duration-300 cursor-pointer hover-lift" data-testid="social-twitter">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tech-blue rounded-lg flex items-center justify-center hover:bg-tech-green transition-all duration-300 cursor-pointer hover-lift" data-testid="social-linkedin">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tech-blue rounded-lg flex items-center justify-center hover:bg-tech-green transition-all duration-300 cursor-pointer hover-lift" data-testid="social-github">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-tech font-semibold mb-3 lg:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-1 lg:space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-300" data-testid="footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors duration-300" data-testid="footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors duration-300" data-testid="footer-events">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors duration-300" data-testid="footer-gallery">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-tech font-semibold mb-3 lg:mb-4 text-sm sm:text-base">Contact Info</h4>
            <ul className="space-y-1 lg:space-y-2 text-gray-400 text-xs sm:text-sm">
              <li data-testid="contact-email">innovare@techclub.edu</li>
              <li data-testid="contact-location">Tech Building, Room 404</li>
              <li data-testid="contact-meetings">Friday Meetings, 4:00 PM</li>
              <li data-testid="contact-phone">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 lg:mt-12 pt-6 lg:pt-8 text-center text-gray-400">
          <p className="font-mono text-xs sm:text-sm">&copy; 2024 Innovare Technical Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
