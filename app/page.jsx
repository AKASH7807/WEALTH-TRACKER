import HeroSection from "@/components/hero";
import MonthlyFinanceInsight from "@/components/MonthlyFinanceInsight";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

// Cache landing page for 3600 seconds (1 hour)
export const revalidate = 3600;

export default function Home() {
  return (
    <div>
      <HeroSection />

      {/* Information Stats */}
      <section className="relative py-10 bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statsData.map((item, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-indigo-100 bg-white/70 backdrop-blur-md px-6 py-8 text-center shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-4xl font-semibold text-indigo-600 tracking-tight">
                  {item.value}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-600">
                  {item.label}
                </div>
                {/* Accent line */}
                <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-70 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Everything you need to
            <span className="text-indigo-600"> manage your finances</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border bg-gradient-to-br from-indigo-300 via-violet-300 to-indigo-300 transition-all duration-300 hover:shadow-lg"
              >
                <Card className="h-full bg-white rounded-xl transition-all duration-300 group-hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center text-center space-y-4 pt-6">
                    {/* Icon */}
                    <div className="flex items-center justify-center text-indigo-600 transition-transform duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works  */}
      <section className="py-20 bg-blue-50 ">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* tesimonial section  */}
      <section className="py-20 ">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expense Calculator */}
      <section className=" w-[95%] sm:w-full max-w-5xl mx-auto my-6 sm:my-8 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl shadow-lg border border-indigo-200 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-4 text-center text-indigo-700">
          Your Monthly Finance Overview
        </h2>
        <p className="text-center text-indigo-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Enter your monthly income and expenses to get instant insights and
          suggestions.
        </p>
        <div className="rounded-xl p-3 sm:p-6 md:p-8  transition-all">
          <MonthlyFinanceInsight />
        </div>
      </section>

      {/* Action Section */}
      <section className="py-10 px-2">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-8 py-16 text-center text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex flex-nowrap -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                className="w-8 h-8 rounded-full border border-white/40 object-cover"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                className="w-8 h-8 rounded-full border border-white/40 object-cover"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                className="w-8 h-8 rounded-full border border-white/40 object-cover"
                alt=""
              />
            </div>

            <p className="text-sm text-indigo-100">
              Trusted by <span className="font-medium text-white">100+</span>{" "}
              users
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight max-w-2xl mx-auto">
            Take control of your finances with
            <span className="block bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Finance Tracker
            </span>
          </h2>
          <p className="mt-4 text-indigo-100 max-w-xl mx-auto">
            Manage accounting, expenses, and enterprise workflows smarter — all
            from one powerful dashboard.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-full px-10 shadow-md"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
