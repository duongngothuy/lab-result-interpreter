import { FileText, Search, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Understand Your Lab Results in{" "}
          <span className="text-blue-600">Plain English</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Upload your lab report PDF and get clear, easy-to-understand
          explanations for every test result — powered by AI.
        </p>
        <a
          href="/upload"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
        >
          Upload Your Report <ArrowRight className="h-5 w-5" />
        </a>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
          How It Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              1. Upload PDF
            </h3>
            <p className="text-sm text-slate-600">
              Upload your lab report PDF. We extract the text and identify your
              test results automatically.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              2. AI Analysis
            </h3>
            <p className="text-sm text-slate-600">
              Our AI references a curated medical knowledge base to explain what
              each result means for you.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              3. Get Results
            </h3>
            <p className="text-sm text-slate-600">
              View color-coded results with plain-English explanations. See
              what&apos;s normal and what needs attention.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        <p>
          This tool is for informational purposes only and does not provide
          medical advice.
        </p>
        <p className="mt-1">Always consult your healthcare provider.</p>
      </footer>
    </div>
  );
}
