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
