export interface Message {
  method: | 'init' | 'open' | 'error' | 'wakeup' | 'callProcedureResult' | 'updateResult' | 'ready' | 'initEnd' | 'close' | 'sleep' | 'callProcedure' | 'update';
  apiVersion: number;
  // method: string;
  entity: string;
  user: User;
  resource: Resource;
  team: Team;
  queue: Queue;
  activity: Activity;
  activityList: any[];
  inventoryList: any[];
  buttonId: string;
  securedData: SecuredData;
  openParams: any;
  allowedProcedures: AllowedProcedures;
  sendMessageAsJsObject?: boolean;
  sendInitData?: boolean;
  backScreen?: string;
}

export interface Activity {
  XA_CLIENTSIGN_OVER: string,
  XA_CLIENTSIGN_RATING: string,
  XA_ACCOUNTTYPE: string,
  XA_JOBTYPE: string,
  XA_MAGIC_TOWN_FLAG: string,
  XA_MST_ACT: string,
  XA_QUALITY_JOB: string,
  XA_PROVISIONING_VALIDATION: string,
  appt_number: string,
  aworktype: string,
  aid: number,
  XA_SOLUTIONCODE?: string,
}

export interface Format {
  date: string;
  long_date: string;
  time: string;
  datetime: string;
}

export interface User {
  allow_desktop_notification: number;
  allow_vibration: number;
  design_theme: number;
  providers: number[];
  format: Format;
  sound_theme: number;
  su_zid: number;
  uid: number;
  ulanguage: number;
  ulogin: string;
  uname: string;
  week_start: number;
  languageCode: string;
}

export interface Resource {
  external_id: string;
  pid: number;
  currentTime: string;
  deviceUTCDiffSeconds: number;
  timeZoneDiffSeconds: number;
}

export interface TeamMembers { }

export interface AssistingTo { }

export interface Team {
  teamMembers: TeamMembers;
  assistingTo: AssistingTo;
  assistingMe: any[];
}

export interface Queue {
  date: string;
  status: string;
  isActual: boolean;
}

export interface SecuredData {
  ofscRestClientId: string;
  ofscRestSecretId: string;
  urlOFSC: string;
  parametroComplejidad: number;
}

export interface AllowedProcedures {
  openLink: boolean;
  searchParts: boolean;
  searchPartsContinue: boolean;
  getParts: boolean;
  getPartsCatalogsStructure: boolean;
  print: boolean;
  share: boolean;
  updateIconData: boolean;
  updateButtonsIconData: boolean;
  getAccessToken: boolean;
}
