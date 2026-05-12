import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { plantAPI, diagnosisAPI } from '../services/api';
import { getImageSrc } from '../services/imageHelper';
import Loader from '../components/Loader';
import { Clock, Search, Stethoscope, Leaf, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function History() {
  const [tab, setTab] = useState('identifications');
  const [identifications, setIdentifications] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [idRes, diagRes] = await Promise.all([
        plantAPI.getHistory(),
        diagnosisAPI.getAllDiagnoses()
      ]);
      setIdentifications(idRes.data.history || []);
      setDiagnoses(diagRes.data.diagnoses || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const healthColor = (h) => {
    switch (h) {
      case 'Healthy': return 'text-green-600';
      case 'Mild Issues': return 'text-yellow-600';
      case 'Moderate Issues': return 'text-orange-600';
      case 'Severe Issues': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <Loader text="Loading history..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-gray-500" /> History
        </h1>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button onClick={() => setTab('identifications')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'identifications' ? 'bg-white shadow-sm text-leaf-700' : 'text-gray-500 hover:text-gray-700'}`}>
          <Search className="w-4 h-4" /> Identifications ({identifications.length})
        </button>
        <button onClick={() => setTab('diagnoses')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'diagnoses' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}>
          <Stethoscope className="w-4 h-4" /> Diagnoses ({diagnoses.length})
        </button>
      </div>

      {tab === 'identifications' && (
        <div className="space-y-3">
          {identifications.length === 0 ? (
            <div className="card p-8 text-center">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-600">No identifications yet</h3>
              <p className="text-sm text-gray-400 mt-1">Your plant identification history will appear here</p>
              <Link to="/identify" className="btn-primary inline-flex items-center gap-2 text-sm mt-4">
                <Search className="w-4 h-4" /> Identify a Plant
              </Link>
            </div>
          ) : (
            identifications.map((item) => (
              <div key={item._id} className="card overflow-hidden">
                <div className="flex gap-3 p-3">
                  <div className="w-16 h-16 bg-leaf-50 rounded-xl overflow-hidden flex-shrink-0">
                    {getImageSrc(item.imageUrl) ? (
                      <img src={getImageSrc(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-leaf-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.predictions?.[0]?.commonName || 'Unknown Plant'}
                    </h3>
                    <p className="text-xs text-gray-400 italic truncate">
                      {item.predictions?.[0]?.scientificName || ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
                      {item.addedToLibrary && (
                        <><span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-leaf-600 font-medium">In Library</span></>
                      )}
                    </div>
                  </div>
                  {item.predictions?.[0]?.confidence && (
                    <span className="text-sm font-bold text-leaf-600 self-center flex-shrink-0">
                      {item.predictions[0].confidence}%
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'diagnoses' && (
        <div className="space-y-3">
          {diagnoses.length === 0 ? (
            <div className="card p-8 text-center">
              <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-600">No diagnoses yet</h3>
              <p className="text-sm text-gray-400 mt-1">Your health diagnosis history will appear here</p>
              <Link to="/diagnose" className="btn-primary inline-flex items-center gap-2 text-sm mt-4">
                <Stethoscope className="w-4 h-4" /> Diagnose a Plant
              </Link>
            </div>
          ) : (
            diagnoses.map((item) => (
              <Link key={item._id} to={`/diagnosis/${item._id}`}
                className="card overflow-hidden block hover:shadow-md transition-shadow">
                <div className="flex gap-3 p-3">
                  <div className="w-16 h-16 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0">
                    {getImageSrc(item.imageUrl) ? (
                      <img src={getImageSrc(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-orange-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {item.plant?.nickname || item.plant?.species?.commonName || 'Unknown Plant'}
                    </h3>
                    <p className={`text-sm font-medium ${healthColor(item.overallHealth)}`}>
                      {item.overallHealth === 'Healthy' ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                      ) : (
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {item.overallHealth}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">
                        {item.conditions?.length || 0} condition{item.conditions?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 self-center flex-shrink-0" />
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
