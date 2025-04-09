import React from 'react';
import { X } from 'lucide-react';

interface RiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    neighbourhood: string;
    description: string;
    risk_level: string;
    observation?: string;
    vulnerability_score?: string;
    risk_score?: string;
    amount_buildings?: number;
    number_of_people?: number;
    suggested_intervention?: string;
    datasource?: string;
  };
}

const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  // Format numbers with thousands separator
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-gray-100 rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-900">
            {data.neighbourhood}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Risk info card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className="font-semibold text-red-600">{data.risk_level}</p>
              </div>
              
              {data.vulnerability_score && (
                <div>
                  <p className="text-sm text-gray-500">Vulnerability Score</p>
                  <p className="font-semibold">{data.vulnerability_score}</p>
                </div>
              )}
              
              {data.risk_score && (
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="font-semibold">{data.risk_score}</p>
                </div>
              )}
            </div>
            
            {/* Demographics section */}
            {(data.amount_buildings !== undefined || data.number_of_people !== undefined) && (
              <div>
                <h4 className="text-lg font-medium mb-2">Population Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {data.amount_buildings !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Buildings at Risk</p>
                      <p className="font-semibold">{formatNumber(data.amount_buildings)}</p>
                    </div>
                  )}
                  
                  {data.number_of_people !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">People at Risk</p>
                      <p className="font-semibold">{formatNumber(data.number_of_people)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Description section */}
            <div>
              <h4 className="text-lg font-medium mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{data.description}</p>
            </div>
            
            {/* Observation section */}
            {data.observation && (
              <div>
                <h4 className="text-lg font-medium mb-2">Observations</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.observation}</p>
              </div>
            )}
            
            {/* Suggested interventions section */}
            {data.suggested_intervention && (
              <div>
                <h4 className="text-lg font-medium mb-2">Suggested Interventions</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.suggested_intervention}</p>
              </div>
            )}
            
            {/* Data source section */}
            {data.datasource && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Data Source: {data.datasource}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-4 py-3 border-t rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskDetailModal;