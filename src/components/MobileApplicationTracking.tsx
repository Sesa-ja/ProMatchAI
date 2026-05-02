import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Mail, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interviewing';
  appliedDate: string;
  lastUpdated: string;
}

interface MobileApplicationTrackingProps {
  userId: string;
  applications?: Application[];
  isLoading?: boolean;
  onViewApplication?: (applicationId: string) => void;
  onRefresh?: () => void;
}

export default function MobileApplicationTracking({ 
  userId,
  applications: externalApplications,
  isLoading: externalLoading,
  onViewApplication,
  onRefresh 
}: MobileApplicationTrackingProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (externalApplications !== undefined) {
      setApplications(externalApplications);
      setLoading(externalLoading || false);
    } else {
      loadApplications();
    }
  }, [externalApplications, externalLoading]);

  const loadApplications = async () => {
    setLoading(true);
    setError(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Load from localStorage
      const stored = localStorage.getItem('promatchai_applications');
      if (stored) {
        const allApps = JSON.parse(stored);
        const userApps = allApps.filter((app: any) => app.userId === userId);
        setApplications(userApps);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      loadApplications();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'interviewing':
        return <Mail className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'interviewing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-gray-900">My Applications</h2>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          </div>

          {/* Loading Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg text-gray-900 mb-2">Failed to load applications</h3>
          <p className="text-gray-600 mb-6 text-sm">
            We couldn't retrieve your applications. Please check your connection and try again.
          </p>
          <Button
            onClick={handleRetry}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty State
  if (applications.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-gray-900">My Applications</h2>
            <button onClick={handleRetry} className="text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 text-sm max-w-sm">
              You haven't applied to any jobs yet. Browse available opportunities and start applying!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Applications List
  return (
    <div className="bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl text-gray-900">My Applications</h2>
            <p className="text-sm text-gray-600">{applications.length} total applications</p>
          </div>
          <button onClick={handleRetry} className="text-blue-600">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600">{app.company}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {getStatusIcon(app.status)}
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border mb-3 ${getStatusColor(app.status)}`}>
                <span className="capitalize">{app.status}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                </div>
                {app.lastUpdated && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Updated {new Date(app.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {onViewApplication && (
                <Button
                  onClick={() => onViewApplication(app.id)}
                  variant="outline"
                  className="w-full h-10 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Refresh Hint */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Pull down to refresh or tap the refresh icon
        </p>
      </div>
    </div>
  );
}
