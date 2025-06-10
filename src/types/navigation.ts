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
    onConfirm: (report: any) => Promise<any>;
  };
  ReportComparison: {
    comparison: any; // TODO: Add proper type for comparison result
    reportTitles: string[];
  };
  Trackers: undefined;
  AddTracker: undefined;
  AddRecord: {
    trackerType: string;
    trackerName: string;
    medicalConditionId: string;
    trackingFactors: Array<{
      id: string;
      name: string;
      unit: string;
      normal_range: string;
      is_required: boolean;
      medical_condition_id: string;
      value?: string;
    }>;
    isEditing?: boolean;
    combinedTrackingId?: string;
  };
  TrackerHistory: {
    trackingId: string;
    conditionName: string;
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
