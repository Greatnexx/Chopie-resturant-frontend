import { Link } from 'react-router-dom';
import { ArrowRight, Users, Shield, Zap, Globe, ClipboardList, MessageSquare, BarChart2, Palette, Bell } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Chopie
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/restaurant/login"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/restaurant/register"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Business Today</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The complete digital platform for restaurants, clubs, hotels, and events.
              Manage orders, customize menus, and delight customers with our powerful multi-tenant solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/restaurant/register"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-yellow-200 rounded-full opacity-25 animate-bounce delay-1000"></div>
      </section>

      {/* Business Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect For Every Business</h2>
            <p className="text-xl text-gray-600">One platform, endless possibilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🍽️", title: "Restaurants", desc: "Full menu management with VIP/Regular pricing" },
              { icon: "🍸", title: "Clubs & Bars", desc: "Member tiers and exclusive offerings" },
              { icon: "🏨", title: "Hotels", desc: "Room service and restaurant integration" },
              { icon: "🎉", title: "Events", desc: "Premium and standard ticket experiences" }
            ].map((business, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-4xl mb-4">{business.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{business.title}</h3>
                <p className="text-gray-600">{business.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need, Built In</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Chopie gives your business a complete digital backbone — from the first order to the last report.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <ClipboardList className="w-7 h-7" />, title: "Smart Order Management", desc: "Receive, track, and manage orders in real time. Staff get instant notifications so nothing slips through the cracks." },
              { icon: <Palette className="w-7 h-7" />, title: "Menu Builder", desc: "Create and update your menu with categories, images, and pricing. Set VIP and regular pricing tiers effortlessly." },
              { icon: <Users className="w-7 h-7" />, title: "Staff & Role Management", desc: "Add kitchen staff, managers, and admins with role-based access. Everyone sees only what they need." },
              { icon: <MessageSquare className="w-7 h-7" />, title: "Live Customer Chat", desc: "Chat with customers in real time directly from your dashboard. Resolve issues fast and keep customers happy." },
              { icon: <BarChart2 className="w-7 h-7" />, title: "Analytics & Reports", desc: "Track revenue, order trends, and staff performance with clear, actionable dashboards." },
              { icon: <Bell className="w-7 h-7" />, title: "Real-Time Notifications", desc: "Instant alerts for new orders, status changes, and customer messages — so your team is always in sync." },
              { icon: <Globe className="w-7 h-7" />, title: "Your Own Subdomain", desc: "Every business gets a unique branded URL. Share your menu link with customers and start taking orders immediately." },
              { icon: <Shield className="w-7 h-7" />, title: "Secure & Reliable", desc: "Your data is isolated, encrypted, and protected. Each tenant is completely separated from others on the platform." },
              { icon: <Zap className="w-7 h-7" />, title: "Quick Setup", desc: "Register, get approved, and go live in minutes. No technical knowledge required — just fill in your details and start." },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-5">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of businesses already using Chopie to streamline their operations
          </p>
          <Link
            to="/restaurant/register"
            className="bg-white text-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-2xl font-bold">Chopie</span>
              </div>
              <p className="text-gray-400">
                The complete digital platform for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:info@chopie.ng" className="hover:text-white transition-colors">info@chopie.ng</a></li>
                <li><a href="tel:+2348066870296" className="hover:text-white transition-colors">+234 806 687 0296</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><p className="text-gray-400">Chopie is a multi-tenant digital platform built for restaurants, clubs, hotels, and events — helping businesses manage orders, menus, and customers all in one place.</p></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Chopie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
