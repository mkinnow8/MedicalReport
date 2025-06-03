import React, {createContext, useContext, useState, ReactNode} from 'react';

export type Report = {
  report_id: string;
  title: string;
  created_at: string;
  report_url?: string;
  report_description: {
    summary: string;
    symptoms: string;
    precautionary_measures: string;
    medications: string;
    vitals: string;
    comparison_summary: string;
  };
};

interface ReportsData {
  reports: Report[];
}

interface ReportsContextType {
  reportsData: ReportsData | null;
  setReportsData: (data: ReportsData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ReportsContext.Provider
      value={{
        reportsData,
        setReportsData,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
