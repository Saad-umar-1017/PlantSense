import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI, diagnosisAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { Stethoscope, AlertTriangle, CheckCircle, Shield, ChevronDown, Info, BookmarkPlus, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Diagnose() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [result, setResult] = useState(null);
  const [savingReport, setSavingReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const { data } = await plantAPI.getLibrary();
      setPlants(data.plants || []);
    } catch (err) {
      // Silently fail — plants are optional
    }
  };

  const handleDiagnose = async () => {
    if (!image) return toast.error('Please upload an image first');
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', image);
      if (selectedPlant) formData.append('plantId', selectedPlant);
      const { data } = await diagnosisAPI.analyze(formData);
      setResult(data.diagnosis);
      toast.success('Diagnosis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Diagnosis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSavingReport(true);
    try {
      await diagnosisAPI.saveDiagnosis(result.id);
      toast.success('Report saved to plant profile');
      setResult({ ...result, isSaved: true });
    } catch (err) {
      toast.error('Failed to save report');
    } finally {
      setSavingReport(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      const { data } = await diagnosisAPI.shareDiagnosis(result.id);
      await navigator.clipboard.writeText(data.shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setSelectedPlant('');
  };

  const healthIcon = (health) => {
    switch (health) {
      case 'Healthy': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Mild Issues': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'Moderate Issues': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'Severe Issues': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default: return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const healthBg = (health) => {
    switch (health) {
      case 'Healthy': return 'bg-green-50 border-green-200';
      case 'Mild Issues': return 'bg-yellow-50 border-yellow-200';
      case 'Moderate Issues': return 'bg-orange-50 border-orange-200';
      case 'Severe Issues': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const severityBadge = (severity) => {
    switch (severity) {
      case 'Mild': return 'badge-mild';
      case 'Moderate': return 'badge-moderate';
      case 'Severe': return 'badge-severe';
      default: return 'badge-healthy';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-orange-500" />
          Health Diagnosis
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Upload a photo to check your plant's health</p>
      </div>

      {/* Plant Selector */}
      {plants.length > 0 && !result && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Select from your library (optional)
          </label>
          <div className="relative">
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="">— General diagnosis (no plant selected) —</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nickname || p.species?.commonName || 'Unknown Plant'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Upload */}
      {!result && <ImageUpload onImageSelect={setImage} loading={loading} />}

      {/* Diagnose Button */}
      {image && !result && !loading && (
        <button onClick={handleDiagnose} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Run Health Diagnosis
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Overall Health */}
          <div className={`rounded-2xl border p-5 ${healthBg(result.overallHealth)}`}>
            <div className="flex items-center gap-3 mb-2">
              {healthIcon(result.overallHealth)}
              <div>
                <h2 className="text-lg font-bold text-gray-800">{result.overallHealth}</h2>
                <p className="text-sm text-gray-600">Overall Assessment</p>
              </div>
            </div>
            {result.summary && (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{result.summary}</p>
            )}
          </div>

          {/* Conditions */}
          {result.conditions && result.conditions.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                Detected Conditions ({result.conditions.length})
              </h3>
              <div className="space-y-3">
                {result.conditions.map((cond, idx) => (
                  <div key={idx} className="card p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-800">{cond.name}</h4>
                      <span className={severityBadge(cond.severity)}>{cond.severity}</span>
                    </div>
                    {cond.confidence && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-leaf-500 rounded-full"
                            style={{ width: `${cond.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{cond.confidence}%</span>
                      </div>
                    )}
                    {cond.description && (
                      <p className="text-sm text-gray-600 mb-2">{cond.description}</p>
                    )}
                    {cond.remedy && (
                      <div className="bg-leaf-50 rounded-xl p-3 mt-2">
                        <p className="text-xs font-medium text-leaf-700 mb-1">Recommended Treatment</p>
                        <p className="text-sm text-leaf-800">{cond.remedy}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.conditions?.length === 0 && (
            <div className="card p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-800">Looking Good!</h3>
              <p className="text-sm text-gray-500 mt-1">No issues detected. Your plant appears healthy.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {selectedPlant && (
              <button
                onClick={handleSave}
                disabled={savingReport || result.isSaved}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <BookmarkPlus className="w-4 h-4" />
                {result.isSaved ? 'Saved' : 'Save to Plant'}
              </button>
            )}
            <button
              onClick={handleShare}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" /> Share Report
            </button>
          </div>

          <button onClick={resetAll} className="btn-secondary w-full">
            Diagnose Another Plant
          </button>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              This AI diagnosis is for guidance only. For critical plant health issues, consult a professional horticulturist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
