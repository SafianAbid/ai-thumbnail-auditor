import React, { useState, useCallback, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AuditReport } from './components/AuditReport';
import { generateAuditReport } from './services/geminiService';
import { BotMessageSquare, Sparkles } from './components/icons';
import { defaultAuditTemplate } from './defaultTemplate';

const App: React.FC = () => {
  const [myChannelScreenshot, setMyChannelScreenshot] = useState<string | null>(null);
  const [competitorScreenshots, setCompetitorScreenshots] = useState<Array<string | null>>(Array(3).fill(null));
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const handleMyScreenshotUpload = useCallback((base64: string | null) => {
    setMyChannelScreenshot(base64);
  }, []);

  const handleCompetitorScreenshotUpload = useCallback((index: number, base64: string | null) => {
    setCompetitorScreenshots(prev => {
      const newScreenshots = [...prev];
      newScreenshots[index] = base64;
      return newScreenshots;
    });
  }, []);

  const isAuditReady = useMemo(() => {
    const uploadedCompetitors = competitorScreenshots.filter(s => s !== null).length;
    return myChannelScreenshot !== null && uploadedCompetitors >= 2;
  }, [myChannelScreenshot, competitorScreenshots]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleAudit = async () => {
    if (!isAuditReady || !myChannelScreenshot) return;

    setIsLoading(true);
    setError(null);
    setAuditReport(null);

    const validCompetitorScreenshots = competitorScreenshots.filter(s => s !== null) as string[];

    try {
      const report = await generateAuditReport(myChannelScreenshot, validCompetitorScreenshots, defaultAuditTemplate, selectedLanguage);
      setAuditReport(report);
    } catch (e) {
      setError('An error occurred while generating the audit. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-indigo-500/10 p-3 rounded-full mb-4">
            <BotMessageSquare className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            AI YouTube Thumbnail Auditor
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload screenshots of your and your competitors' popular videos for an expert AI-powered audit.
          </p>
        </header>

        <div className="space-y-12">
          {/* Step 1: My Channel Screenshot */}
          <section className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-200">
              <span className="text-indigo-400 font-bold">Step 1:</span> Your Channel Screenshot
            </h2>
             <p className="text-sm text-gray-400 mb-4 max-w-prose">Take a screenshot of your channel's "Most Popular" videos page, showing thumbnails, titles, and view counts.</p>
            <div className="max-w-2xl mx-auto">
              <ImageUploader 
                label="Upload Your 'Most Popular' Screenshot" 
                onImageUpload={handleMyScreenshotUpload} 
              />
            </div>
          </section>

          {/* Step 2: Competitors' Screenshots */}
          <section className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-200">
              <span className="text-indigo-400 font-bold">Step 2:</span> Competitors' Screenshots
            </h2>
            <p className="text-sm text-gray-400 mb-4 max-w-prose">Upload screenshots from 2 or 3 competitors' "Most Popular" videos pages.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUploader 
                label="Competitor 1 Screenshot" 
                onImageUpload={(base64) => handleCompetitorScreenshotUpload(0, base64)} 
              />
              <ImageUploader 
                label="Competitor 2 Screenshot" 
                onImageUpload={(base64) => handleCompetitorScreenshotUpload(1, base64)} 
              />
              <ImageUploader 
                label="Competitor 3 (Optional)" 
                onImageUpload={(base64) => handleCompetitorScreenshotUpload(2, base64)} 
              />
            </div>
          </section>

          {/* Action Button */}
          <div className="text-center space-y-6">
            <div>
                <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-300">Select Report Language:</label>
                <select
                  id="language"
                  name="language"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full max-w-xs mx-auto p-2.5"
                >
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Roman Urdu">Roman Urdu</option>
                </select>
            </div>

            <div>
              <button
                onClick={handleAudit}
                disabled={!isAuditReady || isLoading}
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
              >
                <Sparkles className="h-6 w-6 mr-3" />
                {isLoading ? 'Analyzing...' : 'Generate AI Audit'}
              </button>
               <p className="text-xs text-gray-500 max-w-md mx-auto mt-3">
                  Note: The report will be generated using human-friendly language and based on real-world thumbnail design psychology.
              </p>
            </div>
          </div>

          {/* Results Section */}
          {isLoading && (
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-300">Our AI expert is analyzing your screenshots...</p>
              <p className="text-sm text-gray-500">This might take a moment.</p>
            </div>
          )}
          {error && <div className="text-center p-6 bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
          {auditReport && <AuditReport report={auditReport} />}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-gray-600">
          Powered by Gemini
      </footer>
    </div>
  );
};

export default App;