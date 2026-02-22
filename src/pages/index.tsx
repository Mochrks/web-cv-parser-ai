import CVJsonBuilder from "@/components/CVJsonBuilder";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#0f172a]">
      <main className="flex-1">
        <CVJsonBuilder />
      </main>

      <footer className="w-full border-t border-slate-800/50 bg-[#0f172a]">
        <div className="container mx-auto flex justify-center items-center py-6 ">
          <p className="text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} All rights reserved by{" "}
            <a
              href="https://github.com/Mochrks"
              className="hover:underline text-blue-400 font-medium"
            >
              @mochrks
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
