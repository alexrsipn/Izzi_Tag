import {ActivitySearchItem} from "./ofs-rest-api";

export interface SurveyData {
  serviceConformityCtrl?: string | null;
  satisfactionCtrl?: string | null;
  checkedServicesCtrl?: string[] | null;
  othersCtrl?: string | null;
}

export interface GroupedActivities {
  [key: string]: ActivitySearchItem[];
}
