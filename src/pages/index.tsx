import CVJsonBuilder from "@/components/CVJsonBuilder";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>CV Parser AI — Intelligent Resume to JSON Converter</title>
      </Head>

      <div className="relative w-full min-h-screen bg-[#07111F] overflow-hidden">
        {/* Floating Background Orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Marquee Ticker Bar */}
        <div className="relative z-10 w-full overflow-hidden border-b border-white/[0.06] bg-[#A6F23A]">
          <div className="marquee-track whitespace-nowrap py-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-6 mx-8 text-[#07111F] text-xs font-extrabold uppercase tracking-[0.2em]"
              >
                <span>★ AI-Powered</span>
                <span>★ Gemini Engine</span>
                <span>★ CV Parser</span>
                <span>★ Instant JSON</span>
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          <CVJsonBuilder />
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#07111F]/90 backdrop-blur-xl">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-center items-center py-10 gap-4">
              <p className="text-sm text-[#A8B3C7]/50 text-center tracking-wide">
                © {new Date().getFullYear()} Created by{" "}
                <a
                  href="https://github.com/Mochrks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A6F23A]/70 hover:text-[#A6F23A] font-semibold transition-colors duration-300"
                >
                  @mochrks
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
