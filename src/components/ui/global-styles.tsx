
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
  darkMode = true, // Default to dark mode (warm theme)
}: PageBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${darkMode ? "bg-warm-darkCognac text-warm-light" : "bg-warm-light text-warm-dark"} ${className}`}>
      {darkMode && <HeroBackground />}

      {withGlow && darkMode && (
        <>
          <GlowCircle className="w-[300px] h-[300px] bg-warm-burntSienna top-0 right-0" />
          <GlowCircle className="w-[200px] h-[200px] bg-warm-sunsetAmber/40 bottom-20 left-10" />
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
  onClick?: () => void;
}

export const CardContainer = ({ children, className = "", onClick }: CardContainerProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br from-warm-burntSienna/60 to-warm-darkCognac/40 p-2 sm:p-6 rounded-md sm:rounded-xl border border-warm-sunsetAmber/50 backdrop-blur-sm overflow-hidden ${className}`}
    >
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
      className={`bg-gradient-to-r from-warm-burntSienna to-warm-sunsetAmber text-white px-4 py-2 rounded-md hover:from-warm-darkCognac hover:to-warm-burntSienna transition-all shadow-lg shadow-warm-darkCognac/30 ${className}`}
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
      className={`bg-gradient-to-r from-warm-burntSienna to-warm-sunsetAmber text-white px-4 py-2 rounded-md hover:from-warm-darkCognac hover:to-warm-burntSienna transition-all shadow-lg shadow-warm-darkCognac/30 inline-block ${className}`}
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
      className={`text-warm-goldenSand hover:text-warm-light transition-colors px-3 py-1 border border-warm-sunsetAmber/50 rounded-md bg-warm-darkCognac/40 backdrop-blur-sm ${className}`}
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
      className={`text-warm-goldenSand hover:text-warm-light transition-colors px-3 py-1 border border-warm-sunsetAmber/50 rounded-md bg-warm-darkCognac/40 backdrop-blur-sm inline-block ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

export { GlowCircle };
