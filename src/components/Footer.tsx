import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-secondary border-2 border-primary glow-gold flex items-center justify-center overflow-hidden">
                <img src="/src/assets/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-primary font-bold text-lg">موكب عزاء جدحفص</h3>
                <p className="text-muted-foreground text-xs">عزاء وإحياء</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              موقع إلكتروني يهتم بنشر قصائد وأخبار موكب عزاء جدحفص
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-right">
            <h4 className="text-primary font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {["الرئيسية", "جدول الموكب", "القصائد", "الرواديد", "الشعراء"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    :: {link} ::
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="text-primary font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">+973 1234 5678</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@example.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>جدحفص - البحرين</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h4 className="text-primary font-bold text-lg mb-4">تابعنا</h4>
            <div className="flex items-center justify-center md:justify-start gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground transition-colors flex items-center justify-center"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-muted-foreground text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} موكب عزاء جدحفص
          </p>
        </div>
      </div>
    </footer>
  );
};
