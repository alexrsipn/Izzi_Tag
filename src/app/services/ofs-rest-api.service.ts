import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {GetAnActivityTypeResponse, UpdateAnActivityBodyParams} from "../types/ofs-rest-api";

@Injectable({
  providedIn: 'root'
})
export class OfsRestApiService {
  credentials: {user: string; pass: string} = {user: '', pass: ''};
  baseUrl = '';

  constructor(private readonly http: HttpClient) { }

  setUrl(url: string) {
    this.baseUrl = url;
    return this;
  }

  setCredentials(credentials: {user: string; pass: string}) {
    this.credentials = credentials;
    return this;
  }

  setAFileProperty(activityId: string, propertyLabel: string, file: Blob) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}/${propertyLabel}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'image/png',
    });
    return this.http.put<any>(endpoint, file, {headers: headers});
  }

  getAResourceRoute (resourceId: string, date: string) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/resources/${resourceId}/routes/${date}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json',
    });
    return this.http.get<any>(endpoint, {headers: headers});
  }

  updateAnActivity(activityId: number, bodyParams: UpdateAnActivityBodyParams) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
    return this.http.patch<any>(endpoint, bodyParams, {headers: headers});
  }

  updateActivitySignRating(activityId: number, bodyParams: UpdateAnActivityBodyParams) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
/*    const params = new HttpParams({
      fromObject: {
        ...bodyParams
      }
    })*/
    return this.http.patch<any>(endpoint, bodyParams, {headers: headers});
  }

  completeAnActivity(activityId: number) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${activityId}/custom-actions/complete`
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(endpoint, {}, {headers: headers});
  }

  getAnActivityType(activityType: string) {
    const endpoint = `${this.baseUrl}/rest/ofscMetadata/v1/activityTypes/${activityType}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      'Content-Type': 'image/png',
    });
    return this.http.get<GetAnActivityTypeResponse>(endpoint, {headers: headers});
  }

  getAFileProperty(pathParams: {activityId: string; propertyLabel: string}) {
    const endpoint = `${this.baseUrl}/rest/ofscCore/v1/activities/${pathParams.activityId}/${pathParams.propertyLabel}`;
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.credentials.user}:${this.credentials.pass}`),
      Accept: 'image/png'
    });
    // const params = new HttpParams().set('language', 'es');
    return this.http.get<any>(endpoint, {headers, responseType: 'blob' as 'json'});
  }
}
