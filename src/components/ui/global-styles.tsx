import React from "react";
import { GlowCircle, HeroBackground, WaveDivider } from "@/components/landing/LandingSvgs";

interface PageBackgroundProps {
  children: React.ReactNode;
  className?: string;
  withGlow?: boolean;
  withWave?: boolean;
  darkMode?: boolean;
}

export const PageBackground = ({
  children,
  className = "",
  withGlow = true,
  withWave = false,
  darkMode = true, // Default to dark mode (blue theme)
}: PageBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${darkMode ? "bg-[#0f0a1e] text-white" : "bg-white text-gray-900"} ${className}`}>
      {darkMode && <HeroBackground />}

      {withGlow && darkMode && (
        <>
          <GlowCircle className="w-[300px] h-[300px] bg-blue-600 top-0 right-0" />
          <GlowCircle className="w-[200px] h-[200px] bg-blue-800 bottom-20 left-10" />
        </>
      )}

      {withWave && <WaveDivider />}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContainer = ({ children, className = "" }: CardContainerProps) => {
  return (
    <div className={`bg-gradient-to-br from-blue-900/60 to-blue-800/40 p-2 sm:p-6 rounded-md sm:rounded-xl border border-blue-700/50 backdrop-blur-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionContainer = ({
  children,
  className = "",
  title,
  subtitle,
  centered = false,
}: SectionContainerProps) => {
  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className={`mb-8 ${centered ? "text-center" : ""}`}>
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {title}
                {centered && (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                    {" "}
                    {subtitle}
                  </span>
                )}
              </h2>
            )}
            {subtitle && !centered && (
              <p className="text-blue-200 max-w-2xl">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export const GradientButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const GradientLink = ({
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      className={`bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-900/30 inline-block ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export const OutlineButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`text-blue-200 hover:text-blue-100 transition-colors px-3 py-1 border border-blue-500/50 rounded-md bg-blue-900/40 backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const OutlineLink = ({
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <a
      className={`text-blue-200 hover:text-blue-100 transition-colors px-3 py-1 border border-blue-500/50 rounded-md bg-blue-900/40 backdrop-blur-sm inline-block ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export { GlowCircle };
