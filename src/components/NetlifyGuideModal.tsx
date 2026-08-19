import React, { useState } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Rocket, 
  Users, 
  FolderDown,
  Download
} from 'lucide-react';
import JSZip from 'jszip';

interface NetlifyGuideModalProps {
  onClose: () => void;
}

export const NetlifyGuideModal: React.FC<NetlifyGuideModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Netlify deployment configuration files
      const netlifyToml = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer-when-downgrade"
`;

      const redirects = `/*    /index.html   200\n`;
      
      const readme = `# Match Quick Simulátor 🏆

Instant sports match and knockout championship tournament simulator.

## 🚀 1-Step Deploy to Netlify
1. Go to https://app.netlify.com/drop
2. Drag and drop your project folder or built dist folder.
3. Your site will be live instantly with a free .netlify.app domain and SSL!

## ⚙️ Build Settings (for GitHub):
- Build Command: npm run build
- Publish Directory: dist
`;

      zip.file('netlify.toml', netlifyToml);
      zip.file('_redirects', redirects);
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'match-quick-simulator-netlify-config.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP creation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/60 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Public Access & Netlify Deployment</h3>
                <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  Free & Fast
                </span>
              </div>
              <p className="text-xs text-slate-400">Deploy Match Quick Simulátor to your own custom .netlify.app domain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-300 text-xs sm:text-sm scrollbar-thin">
          
          {/* Public Access Badge */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm mb-1">
                Usable by Everyone (Public & Zero-Friction)
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Match Quick Simulátor runs entirely client-side with full mobile & desktop responsive design. Anyone in the world can simulate matches, create custom teams, and run championship tournaments instantly with zero sign-up or paywalls.
              </p>
            </div>
          </div>

          {/* AI Studio Export Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                How to Export from Google AI Studio:
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In the top header of Google AI Studio, click the <strong>Settings / Export Menu</strong> and select <strong>"Export to ZIP"</strong> or <strong>"Export to GitHub"</strong>.
            </p>
          </div>

          {/* Step-by-Step Netlify Deployment */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>Netlify Configuration & Deploy Settings:</span>
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  Option 1: Netlify Drop (Zero Setup)
                </span>
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline text-xs flex items-center gap-1 font-semibold"
                >
                  <span>app.netlify.com/drop</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Open Netlify Drop and simply drag and drop the exported project folder. Netlify will build and deploy it immediately.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  Option 2: Connect via GitHub
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Build Command</div>
                    <div className="font-mono text-emerald-400 font-bold">npm run build</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'build-cmd')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'build-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Publish Directory</div>
                    <div className="font-mono text-cyan-400 font-bold">dist</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard('dist', 'publish-dir')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'publish-dir' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 text-xs uppercase tracking-wider block">
                Step 3: Choose Your Free Custom Subdomain
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                In your Netlify Dashboard &gt; <strong>Site configuration</strong> &gt; <strong>Change site name</strong>, you can choose any available name:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-xs text-cyan-300 flex items-center justify-between border border-slate-800">
                <span>https://match-quick-simulator.netlify.app</span>
                <span className="text-[10px] text-slate-500 uppercase font-sans">Free SSL</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-bold"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Downloading...' : 'Download Netlify Config ZIP'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
