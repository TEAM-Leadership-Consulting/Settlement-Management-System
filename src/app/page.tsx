'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import React from 'react';
import {
  ArrowRight,
  Users,
  FileText,
  Shield,
  CheckCircle,
  BarChart3,
  Star,
  Mail,
  Phone,
  Play,
  Zap,
  Briefcase,
  Database,
  Clock,
  Lightbulb,
  Target,
  Rocket,
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  benefits: string[];
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  storage: string;
  popular: boolean;
}

interface FounderBenefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentBenefit, setCurrentBenefit] = useState(0);

  const features: Feature[] = [
    {
      icon: Database,
      title: 'Advanced Data Management',
      description:
        'Centralized database for all settlement information with powerful search and filtering capabilities.',
      benefits: [
        'Secure data storage',
        'Advanced search',
        'Data validation',
        'Backup & recovery',
      ],
    },
    {
      icon: FileText,
      title: 'Complete Case Management',
      description:
        'Track every aspect of your settlement cases from initial filing through final distribution.',
      benefits: [
        'Case lifecycle tracking',
        'Document management',
        'Deadline tracking',
        'Status updates',
      ],
    },
    {
      icon: Users,
      title: 'Intelligent Party Management',
      description:
        'Manage all stakeholders including claimants, defendants, attorneys, and representatives.',
      benefits: [
        'Contact management',
        'Relationship tracking',
        'Communication history',
        'Role-based access',
      ],
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Reporting',
      description:
        'Generate detailed reports for compliance, analysis, and stakeholder communication.',
      benefits: [
        'Custom reports',
        'Compliance templates',
        'Data visualization',
        'Export capabilities',
      ],
    },
    {
      icon: Mail,
      title: 'Notice Management System',
      description:
        'Create, distribute, and track legal notices with automated delivery confirmation.',
      benefits: [
        'Template library',
        'Bulk distribution',
        'Delivery tracking',
        'Compliance logging',
      ],
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-grade security with role-based access control and comprehensive audit trails.',
      benefits: [
        'Data encryption',
        'User permissions',
        'Audit logging',
        'Secure backups',
      ],
    },
  ];

  const plans: Plan[] = [
    {
      name: 'Professional',
      price: '$2500',
      period: 'month',
      description: 'Perfect for small to medium law firms getting started',
      storage: '100GB Storage',
      features: [
        'Data Management',
        'Case Management',
        'Basic Report Management',
        'Notice Management',
        'User Management (up to 5 users)',
        'Email Support',
        'Standard Templates',
      ],
      popular: false,
    },
    {
      name: 'Premium',
      price: '$5000',
      period: 'month',
      description: 'Advanced features for growing firms and complex cases',
      storage: '500GB Storage',
      features: [
        'Everything in Professional',
        'Vendor Management',
        'Contact Management',
        'Website Management',
        'Award Management',
        'Task Management',
        'Unlimited Users',
        'Priority Support',
        'Custom Templates',
        'API Access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for large firms and complex settlements',
      storage: 'Unlimited Storage',
      features: [
        'Everything in Premium',
        'Custom Integrations',
        'White-label Options',
        'Dedicated Account Manager',
        '24/7 Phone Support',
        'Custom Workflows',
        'On-premise Deployment',
        'SLA Guarantees',
        'Training & Onboarding',
      ],
      popular: false,
    },
  ];

  const founderBenefits: FounderBenefit[] = [
    {
      icon: Target,
      title: 'Founding Member Pricing',
      description:
        'Lock in special pricing that will never increase - a 50% discount for the first year as our founding customer.',
    },
    {
      icon: Lightbulb,
      title: 'Shape the Product',
      description:
        'Your feedback directly influences our roadmap. Help us build exactly what the industry needs.',
    },
    {
      icon: Rocket,
      title: 'Priority Support & Training',
      description:
        'Get direct access to our founders for training, support, and feature requests.',
    },
  ];

  // Rotate founder benefits
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % founderBenefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [founderBenefits.length]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      document
        .getElementById('contact')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = () => {
    alert(
      'Thank you for your interest! We will contact you within 24 hours to discuss your needs.'
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Settlement Management System
                </span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#benefits"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Early Access
                </a>
                <a
                  href="#contact"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-9 w-24 rounded-lg"></div>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-medium mb-8">
              <Rocket className="w-4 h-4 mr-2" />
              🎉 Now Launching - Early Access Available
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Settlement Management
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Built by legal professionals for legal professionals. The first
              comprehensive platform designed specifically for modern settlement
              administration and case management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Early Access
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById('contact')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="group inline-flex items-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Schedule Demo
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Free 7-day trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Founding member pricing
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Shape the product
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Settlement Management Shouldn&apos;t Be This Hard
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  <span className="text-red-600 font-semibold">
                    The Problem:
                  </span>{' '}
                  Law firms are managing complex settlements with spreadsheets,
                  generic databases, and disconnected tools.
                </p>
                <p>
                  <span className="text-blue-600 font-semibold">
                    Our Solution:
                  </span>{' '}
                  A purpose-built platform that handles every aspect of
                  settlement administration in one integrated system.
                </p>
                <p>
                  <span className="text-green-600 font-semibold">
                    The Result:
                  </span>{' '}
                  Reduce administrative time by 70%, eliminate errors, and
                  provide transparency that clients love.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                What You Get Today:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Eliminate spreadsheet chaos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Automated compliance reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Centralized case management</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Professional client portals</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Bank-grade security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Purpose-built modules that work together seamlessly to handle
              every aspect of settlement management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founding Member Benefits */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Founding Member Exclusive Benefits
            </h2>
            <p className="text-xl text-gray-600">
              Be part of building the future of settlement management
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-blue-100 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {React.createElement(founderBenefits[currentBenefit].icon, {
                    className: 'w-8 h-8 text-white',
                  })}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {founderBenefits[currentBenefit].title}
                </h3>

                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  {founderBenefits[currentBenefit].description}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {founderBenefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBenefit(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentBenefit ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your firm&apos;s needs
            </p>
            <div className="mt-4 inline-flex items-center bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              50% off for founding members - lock in this price for your first
              year
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-blue-500 relative scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">
                      /{plan.period}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{plan.description}</p>
                  <div className="text-sm text-blue-600 font-medium">
                    {plan.storage}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include a 7-day free trial • No setup fees • Cancel
              anytime
            </p>
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Founding members lock in 50% discount for your first year - this
              offer won&apos;t last!
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join us in building the future of settlement management. Your
            feedback shapes the product, your success drives our mission.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={() =>
                document
                  .getElementById('contact')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Talk to Founder
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Let&apos;s Talk About Your Needs
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                As a founding member, you get direct access to our team.
                Let&apos;s discuss how we can solve your specific settlement
                management challenges.
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Direct Line
                    </div>
                    <div className="text-gray-600">+1 (503) 858-8889</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">
                      Info@SettlementManagementSystem.com
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Response Time
                    </div>
                    <div className="text-gray-600">
                      Within 48 hours guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Get Early Access
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Law Firm / Company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  rows={4}
                  placeholder="Tell us about your settlement management challenges..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <button
                  type="button"
                  onClick={handleContactSubmit}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Request Early Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">
                  Settlement Management System
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The first platform built specifically for modern settlement
                administration. Join us in revolutionizing legal case
                management.
              </p>
              <div className="flex space-x-4"></div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="hover:text-white transition-colors"
                  >
                    Early Access
                  </a>
                </li>
                <li>
                  <a
                    href="/test-db"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Settlement Management System by T.E.A.M. Consulting. All
              rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
