export default function AboutPage() {
  const aboutContent = {
    heading: "About Wealth",
    subHeading:
      "An AI-powered finance and enterprise management platform designed to simplify accounting, expenses, and insights.",
    image:
      "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop",
    title: "Why Choose Wealth ERP",
    description:
      "Manage your finances smarter with AI-driven insights, real-time tracking, and enterprise-grade tools — all in one powerful dashboard.",
    features: [
      {
        title: "AI-Powered Analytics",
        description:
          "Understand spending patterns and optimize finances with intelligent insights.",
        icon:
          "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/flashEmoji.png",
      },
      {
        title: "Smart Expense Tracking",
        description:
          "Automatically track and categorize transactions across multiple accounts.",
        icon:
          "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/colorsEmoji.png",
      },
      {
        title: "Enterprise-Ready Workflows",
        description:
          "Built for scalability with multi-currency, automation, and reporting tools.",
        icon:
          "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/aboutSection/puzzelEmoji.png",
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
        {aboutContent.heading}
      </h1>
      <p className="text-sm sm:text-base text-slate-500 text-center mt-3 max-w-xl mx-auto">
        {aboutContent.subHeading}
      </p>

      {/* Content */}
      <div className="mt-10 sm:mt-14 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Image */}
        <div className="relative flex justify-center w-full md:w-auto">
          <div className="hidden sm:block size-[300px] md:size-[420px] rounded-full absolute blur-[220px] -z-10 bg-indigo-100" />
          <img
            src={aboutContent.image}
            alt="Wealth ERP preview"
            className="w-full max-w-xs sm:max-w-sm rounded-xl shadow-md object-cover"
          />
        </div>

        {/* Text */}
        <div className="w-full text-center md:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold">
            {aboutContent.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            {aboutContent.description}
          </p>

          {/* Features */}
          <div className="flex flex-col gap-6 mt-6">
            {aboutContent.features.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 text-left"
              >
                <div className="shrink-0 size-9 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
                  <img src={item.icon} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-slate-700">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
