export interface GetAnActivityTypeResponse {
  active: boolean,
  colors?: object,
  defaultDuration: number,
  features?: object,
  groupLabel?: string,
  label: string,
  name: string,
  segmentMaxDuration?: number,
  segmentMinDuration?: number,
  timeSlots?: any,
  translations: any
}

export interface UpdateAnActivityBodyParams {
  XA_CLIENTSIGN_RATING?: number,
  XA_STATUS_ORDER_SIEBEL?: string | null,
  XA_QUALITY_JOB?: string,
  XA_SERV_INTERNET?: number,
  XA_SERV_TV?: number,
  XA_SERV_TEL?: number,
  XA_OTHER_COMMENTS?: string
}


export interface GetAResourceRoute {
  routeStartTime: string,
  totalResults: number,
  limit: number,
  offset: number,
  items: GetAResourceRouteItem[]
}

export interface GetAResourceRouteItem {
  activityId?: number,
  XA_ACCOUNTTYPE?: string,
  XA_JOBTYPE?: string,
  XA_MAGIC_TOWN_FLAG?: string,
  XA_MST_ACT?: string,
  apptNumber?: string,
  activityType?: string,
  XA_CLIENTSIGN_OVER?: string | number,
  XA_QUALITY_JOB?: string,
  status?: string,
  XA_PROVISIONING_VALIDATION?: string
}
