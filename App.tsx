import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import AnalysisChart from './components/AnalysisChart';
import HistoryList from './components/HistoryList';
import { analyzeVideoUrl } from './services/gemini';
import { AnalysisStatus, VideoAnalysis, HistoryItem } from './types';
import { 
  Search, 
  Download, 
  AlertCircle, 
  Loader2, 
  Share2, 
  Copy, 
  CheckCircle,
  PlayCircle,
  MessageCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeVideoUrl(url);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
      
      const newHistoryItem: HistoryItem = {
        ...data,
        id: Date.now().toString(),
        url,
        timestamp: Date.now()
      };
      
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleCopy = () => {
    if (result) {
      const text = `${result.title}\n\nSummary: ${result.summary}\nLink: ${url}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareData = {
      title: `Video Analysis: ${result.title}`,
      text: `🎬 *${result.title}* by ${result.author}\n\n📝 *Summary:*\n${result.summary}\n\n📊 *Sentiment:* ${result.sentimentScore}/100\n\n🔗 ${url}\n\n#VidParseAI ${result.tags.map(t => '#' + t).join(' ')}`,
      url: url
    };

    try {
      // Use type assertion to bypass TypeScript error for 'share' method
      const nav = navigator as any;
      if (nav.share) {
        await nav.share(shareData);
      } else {
        // Fallback for desktop/unsupported browsers
        handleCopy();
        alert("Opening share menu...\n(Native sharing not supported on this device. Link copied to clipboard!)");
      }
    } catch (err: any) {
      // Ignore AbortError which happens if the user closes the share sheet
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleDownloadMock = () => {
    // In a real app, this would trigger a backend download stream
    alert("Download started... (Simulation)\n\nIn the full Android version, this would save the MP4 to your gallery.");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30">
      <Header />

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Smart Video Parser
          </h2>
          <p className="text-slate-400 text-lg">
            Paste a link from TikTok, YouTube, or Instagram to extract metadata, analyze sentiment, and share findings with friends.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl relative mb-12">
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl p-2">
              <Search className="w-6 h-6 text-slate-500 ml-3" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video URL here (e.g., https://tiktok.com/...)"
                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={status === AnalysisStatus.ANALYZING || !url}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === AnalysisStatus.ANALYZING ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="absolute top-full left-0 mt-3 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="w-full max-w-5xl animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Info Card */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {result.platform}
                        </span>
                        {result.uploadDate && (
                          <span className="text-slate-500 text-xs">
                            {result.uploadDate}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight mb-2">
                        {result.title}
                      </h3>
                      <p className="text-indigo-400 font-medium flex items-center gap-1">
                        @{result.author}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-700/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">AI Summary</h4>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {result.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {result.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleDownloadMock}
                      className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Video
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleCopy}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        Copy Info
                      </button>
                      <button 
                        onClick={handleShare}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 font-medium"
                      >
                        <Share2 className="w-4 h-4" />
                        Share to Apps
                      </button>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-1">
                      Share link directly to WhatsApp, Instagram, or others
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h4 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider text-center">
                    Content Sentiment
                  </h4>
                  <AnalysisChart score={result.sentimentScore} />
                  <div className="text-center mt-2">
                    <p className="text-sm text-slate-500">
                      AI analysis suggests this content is mostly <span className={result.sentimentScore > 50 ? 'text-emerald-400' : 'text-rose-400'}>{result.sentimentScore > 50 ? 'Positive' : 'Negative'}</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
                      Engagement Est.
                    </h4>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {result.viewsEstimate || "N/A"}
                  </div>
                  <p className="text-xs text-slate-500">Estimated views based on public data</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* History Section */}
        <HistoryList 
          history={history} 
          onClear={() => setHistory([])} 
          onSelect={(item) => {
            setUrl(item.url);
            setResult(item);
            setStatus(AnalysisStatus.SUCCESS);
          }} 
        />

      </main>
      
      <footer className="w-full py-8 border-t border-slate-800 mt-auto text-center">
        <p className="text-slate-600 text-sm">
          Powered by Gemini 2.5 • React Web Edition
        </p>
      </footer>
    </div>
  );
};

export default App;