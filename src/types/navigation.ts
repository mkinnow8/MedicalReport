import {Report} from '../context/ReportsContext';

export type RootStackParamList = {
  UserInfo: undefined;
  BMI: undefined;
  Reports: undefined;
  ReportDetail: {
    report: Report;
  };
  PDFPreview: {
    uri: string;
    onConfirm: () => Promise<void>;
  };
};

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
