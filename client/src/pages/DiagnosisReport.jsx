import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diagnosisAPI } from '../services/api';
import Loader from '../components/Loader';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Shield, BookmarkPlus, 
  Share2, Clock, Leaf, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DiagnosisReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data } = await diagnosisAPI.getDiagnosis(id);
      setReport(data.diagnosis);
    } catch (err) {
      toast.error('Failed to load report');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await diagnosisAPI.saveDiagnosis(id);
      setReport({ ...report, isSaved: true });
      toast.success('Report saved to plant profile');
    } catch (err) {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const { data } = await diagnosisAPI.shareDiagnosis(id);
      await navigator.clipboard.writeText(data.shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const healthIcon = (h) => {
    switch (h) {
      case 'Healthy': return <CheckCircle className="w-7 h-7 text-green-500" />;
      case 'Mild Issues': return <AlertTriangle className="w-7 h-7 text-yellow-500" />;
      case 'Moderate Issues': return <AlertTriangle className="w-7 h-7 text-orange-500" />;
      case 'Severe Issues': return <AlertTriangle className="w-7 h-7 text-red-500" />;
      default: return <Shield className="w-7 h-7 text-gray-400" />;
    }
  };

  const healthBg = (h) => {
    switch (h) {
      case 'Healthy': return 'bg-green-50 border-green-200';
      case 'Mild Issues': return 'bg-yellow-50 border-yellow-200';
      case 'Moderate Issues': return 'bg-orange-50 border-orange-200';
      case 'Severe Issues': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const severityBadge = (s) => {
    switch (s) {
      case 'Mild': return 'badge-mild';
      case 'Moderate': return 'badge-moderate';
      case 'Severe': return 'badge-severe';
      default: return 'badge-healthy';
    }
  };

  if (loading) return <Loader text="Loading report..." />;
  if (!report) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Diagnosis Report</h1>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(report.createdAt)}
        </div>
      </div>

      {/* Plant info */}
      {report.plant && (
        <div className="flex items-center gap-3 mb-4 bg-leaf-50 rounded-xl p-3">
          <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
            {report.plant.imageUrl ? (
              <img src={`${API_BASE}${report.plant.imageUrl}`} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-leaf-300" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">
              {report.plant.nickname || report.plant.species?.commonName || 'Unknown Plant'}
            </p>
            {report.plant.species?.scientificName && (
              <p className="text-xs text-gray-400 italic">{report.plant.species.scientificName}</p>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {report.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100">
          <img
            src={`${API_BASE}${report.imageUrl}`}
            alt="Diagnosed plant"
            className="w-full h-52 object-cover"
          />
        </div>
      )}

      {/* Overall Health */}
      <div className={`rounded-2xl border p-5 mb-4 ${healthBg(report.overallHealth)}`}>
        <div className="flex items-center gap-3 mb-2">
          {healthIcon(report.overallHealth)}
          <div>
            <h2 className="text-lg font-bold text-gray-800">{report.overallHealth}</h2>
            <p className="text-sm text-gray-600">Overall Assessment</p>
          </div>
        </div>
        {report.summary && (
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{report.summary}</p>
        )}
      </div>

      {/* Conditions */}
      {report.conditions && report.conditions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Detected Conditions ({report.conditions.length})
          </h3>
          <div className="space-y-3">
            {report.conditions.map((cond, idx) => (
              <div key={idx} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-gray-800">{cond.name}</h4>
                  <span className={severityBadge(cond.severity)}>{cond.severity}</span>
                </div>
                {cond.confidence > 0 && (
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

      {report.conditions?.length === 0 && (
        <div className="card p-6 text-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-800">Looking Good!</h3>
          <p className="text-sm text-gray-500 mt-1">No issues detected.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        {report.plant && (
          <button
            onClick={handleSave}
            disabled={saving || report.isSaved}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <BookmarkPlus className="w-4 h-4" />
            {report.isSaved ? 'Saved' : 'Save to Plant'}
          </button>
        )}
        <button
          onClick={handleShare}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
        >
          <Share2 className="w-4 h-4" /> Share Report
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          This AI diagnosis is for guidance only and is not a substitute for professional horticultural advice.
        </p>
      </div>
    </div>
  );
}
