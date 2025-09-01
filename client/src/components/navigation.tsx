import { useState, useEffect, memo } from "react";
import { Link, useLocation } from "wouter";
import { NavbarRobot } from "./navbar-robot";
import { LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";

export const Navigation = memo(function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, isAuthenticated, logout } = useAuth();

  // The new order: Events, About Us, NavbarRobot, Community, Gallery
  const navItems = [
    { name: "Events", href: "/events" },
    { name: "About Us", href: "/about" },
    // NavbarRobot goes here in layout below
    { name: "Community", href: "/community" },
    { name: "Gallery", href: "/gallery" },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [isMobile, location]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50">
      <div className="responsive-container relative">
        {/* TOP RIGHT PROFILE or SIGN IN */}
        <div className="absolute right-0 top-0 h-full flex items-center pr-2 z-50">
          {isAuthenticated ? (
            <div className="relative">
              {/* Profile Avatar Button */}
              <button
                className="w-10 h-10 rounded-full bg-tech-blue text-white flex items-center justify-center overflow-hidden focus:outline-none"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-label="Profile menu"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg">
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg p-4 min-w-[220px] font-tech z-50 border text-tech-dark">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-tech-blue text-white flex items-center justify-center">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-xl">
                          {user.username ? user.username[0].toUpperCase() : "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{user.username}</div>
                      <div className="text-xs text-tech-grey">{user.email}</div>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <button
                    className="w-full mt-2 flex items-center gap-2 p-2 rounded hover:bg-tech-light font-bold text-left text-red-600"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/user/login"
              className="font-tech px-4 py-2 rounded-full font-bold transition bg-tech-blue hover:bg-tech-purple text-white shadow-lg"
              data-testid="nav-login"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex justify-center items-center h-16 lg:h-20">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            {/* Left side: Events, About Us */}
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link font-tech font-medium transition-all duration-300 hover:text-tech-blue hover-lift text-sm xl:text-base ${
                  location === item.href
                    ? "text-tech-blue font-bold"
                    : "text-tech-grey"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.name}
              </Link>
            ))}
            {/* Center: NavbarRobot */}
            <Link href="/" data-testid="nav-logo">
              <NavbarRobot className="w-16 h-16 cursor-pointer" />
            </Link>
            {/* Right side: Community, Gallery */}
            {navItems.slice(2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link font-tech font-medium transition-all duration-300 hover:text-tech-blue hover-lift text-sm xl:text-base ${
                  location === item.href
                    ? "text-tech-blue font-bold"
                    : "text-tech-grey"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Mobile Navigation Button */}
          <div className="lg:hidden flex items-center justify-center">
            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-16 h-16 rounded-lg hover:bg-accent transition-colors hover-lift overflow-hidden"
              data-testid="mobile-menu-toggle"
            >
              <NavbarRobot className="w-16 h-16 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 animate-slide-up z-40">
            <div className="px-4 py-4 space-y-2">
              {[...navItems.slice(0, 2), { name: "Logo", href: "/" }, ...navItems.slice(2)].map(
                (item, idx) =>
                  item.name === "Logo" ? (
                    <Link
                      href={item.href}
                      key="logo-mobile"
                      onClick={closeMobileMenu}
                      className="flex box items-center justify-center py-3"
                    >
                      <NavbarRobot className="w-16 h-16" />
                    </Link>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`mobile-nav-link block px-4 py-3 font-tech font-medium transition-all duration-300 rounded-lg hover:bg-tech-light hover:text-tech-blue animate-fade-in ${
                        location === item.href
                          ? "text-tech-blue font-bold bg-tech-light"
                          : "text-tech-grey"
                      }`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                      data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.name}
                    </Link>
                  )
              )}
              <div>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 mt-4">
                    {/* Mobile Avatar */}
                    <button
                      className="w-10 h-10 rounded-full bg-tech-blue text-white font-bold text-lg overflow-hidden"
                      onClick={() => setProfileMenuOpen((prev) => !prev)}
                    >
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.username
                          ? user.username[0].toUpperCase()
                          : "U"
                      )}
                    </button>
                    <span className="font-tech">{user.username}</span>
                    <button
                      className="ml-auto px-3 py-2 rounded bg-tech-light hover:bg-red-100 text-red-600"
                      onClick={logout}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/user/login"
                    className="font-tech block w-full mt-4 px-4 py-2 rounded-full font-bold transition bg-tech-blue hover:bg-tech-purple text-white shadow-lg text-center"
                    data-testid="nav-login-mobile"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});
