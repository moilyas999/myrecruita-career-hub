import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">MyRecruita</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Your trusted recruitment partner, connecting talent with opportunity across all industries.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-primary-foreground/60">Follow us on social media (coming soon)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="hover:text-accent transition-colors">
                  Explore Roles
                </Link>
              </li>
              <li>
                <Link to="/submit-cv" className="hover:text-accent transition-colors">
                  Submit CV
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="hover:text-accent transition-colors">
                  Career Partner
                </Link>
              </li>
              <li>
                <Link to="/featured-talent" className="hover:text-accent transition-colors">
                  Featured Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/career-partner" className="hover:text-accent transition-colors">
                  CV Review & Enhancement
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="hover:text-accent transition-colors">
                  LinkedIn Profile Optimization
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="hover:text-accent transition-colors">
                  Interview Preparation
                </Link>
              </li>
              <li>
                <Link to="/career-partner" className="hover:text-accent transition-colors">
                  Career Coaching
                </Link>
              </li>
              <li>
                <Link to="/employers" className="hover:text-accent transition-colors">
                  Talent Sourcing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>zuhair@myrecruita.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+44 203 8685 510</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Office 124, Barking Enterprise Centre, IG11</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2025 MyRecruita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;