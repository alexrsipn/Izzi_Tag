import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, concatMap, delay, EMPTY, from, map, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';
import { OfsRestApiService } from './services/ofs-rest-api.service';
import { ImageAnalyzerService } from './services/image-analyzer.service';
import Image from 'image-js';
import { DialogService } from "./services/dialog.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SurveyData, GroupedActivities } from "./types/plugin-types";
import {GetAResourceRoute, GetAResourceRouteItem, UpdateAnActivityBodyParams, ActivitySearchItem} from "./types/ofs-rest-api";

// Constantes de negocio para agrupación
const JOBTYPES_RECOLECCION = ['TC061', 'TC072', 'TC108', 'TC126', 'TC179', 'TC180', 'TC181', 'TC182'];
const JOBTYPES_RECONEXION = ['TC063', 'TC073'];
const JOBTYPES_NO_PAGO = ['TC062'];

interface State {
  currentResourceId?: string;
  activityId?: number | string;
  lastSearchedTag?: string;
  accountType?: string;
  jobType?: string;
  magicTownFlag?: string;
  masterFlag?: string;
  qualityJob?: string;
  apptNumber?: string;
  aworkType?: string;
  solutionCode?: string;
  provisioningValidation?: string;
  clientSignature?: Blob | null;
  clientSignatureHandled?: Image | null;
  technicianSignature?: Blob | null;
  technicianSignatureHandled?: Image | null;
  clientSignatureResult?: { text: string, result: boolean, quality: number };
  technicianSignatureResult?: { text: string, result: boolean, quality: number };
  complexity: number;
  tcSectionVisibilitySettings: boolean;
  clientSignVisibilitySettings: boolean;
  othersVisibilitySettings: boolean;
  onlyFinishButtonVisibility: boolean;
  byPassClientSignature: number;
  searchResults: GroupedActivities;
  visibleItemsLimit: { [key: string]: number };
}

const initialState = {
  complexity: 1,
  clientSignatureResult: undefined,
  tcSectionVisibilitySettings: false,
  clientSignVisibilitySettings: false,
  othersVisibilitySettings: false,
  onlyFinishButtonVisibility: false,
  byPassClientSignature: 0,
  searchResults: {},
  visibleItemsLimit: {}
};

@Injectable({
  providedIn: 'root',
})
export class Store extends ComponentStore<State> {
  constructor(
    private readonly ofs: OfsMessageService,
    private readonly ofsRestApiService: OfsRestApiService,
    private readonly imageAnalyzer: ImageAnalyzerService,
    private readonly dialog: DialogService,
  ) {
    super(initialState);
    this.handleOpenMessage(this.ofs.openMessage$);

    // Enviamos ready con sendInitData: true para que OFSC nos envíe el 'init'
    this.ofs.ready(true);

    // Manejo del handshake inicial para setear el icono
    this.ofs.initMessage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const svgString = '<?xml version="1.0" encoding="UTF-8"?><svg class="prefix__bi prefix__bi-tags-fill" fill="#fff" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2 2a1 1 0 0 1 1-1h4.59a1 1 0 0 1 .7.3l7 7a1 1 0 0 1 0 1.4l-4.58 4.6a1 1 0 0 1-1.42 0l-7-7A1 1 0 0 1 2 6.58zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/><path d="M1.3 7.8a1 1 0 0 1-.3-.71V2a1 1 0 0 0-1 1v4.59a1 1 0 0 0 .3.7l7 7a1 1 0 0 0 1.4 0l.05-.04z"/></svg>';
      const iconBlob = new Blob([svgString], { type: 'image/svg+xml' });

      this.ofs.initEnd({
        iconData: {
          color: 'default',
          image: iconBlob
        }
      });
    });

    // Escuchar resultados de procedimientos nativos (como el scanner)
    this.ofs.callProcedureResultMessage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((message: any) => {
      if (message.procedure === 'scanBarcode' && message.resultData?.text) {
        this.searchByTag(message.resultData.text);
      }
    });
  }

  // Selectors
  readonly vm$ = this.select((state) => state);

  //Updaters
  readonly setFromOfsMessage = this.updater((state, message: Message) => {
    return {
      ...state,
      activityId: message.activity.aid,
      accountType: message.activity.XA_ACCOUNTTYPE,
      jobType: message.activity.XA_JOBTYPE,
      magicTownFlag: message.activity.XA_MAGIC_TOWN_FLAG,
      masterFlag: message.activity.XA_MST_ACT,
      qualityJob: message.activity.XA_QUALITY_JOB,
      apptNumber: message.activity.appt_number,
      aworkType: message.activity.aworktype,
      solutionCode: message.activity.XA_SOLUTIONCODE,
      provisioningValidation: message.activity.XA_PROVISIONING_VALIDATION,
      byPassClientSignature: message.activity.XA_CLIENTSIGN_OVER === '1' ? 1 : 0
    };
  });
  readonly setFromOfsApi = this.updater((state, response: GetAResourceRouteItem[]) => {
    return {
      ...state,
      activityId: response[0].activityId,
      accountType: response[0].XA_ACCOUNTTYPE,
      jobType: response[0].XA_JOBTYPE,
      magicTownFlag: response[0].XA_MAGIC_TOWN_FLAG,
      masterFlag: response[0].XA_MST_ACT,
      qualityJob: response[0].XA_QUALITY_JOB,
      apptNumber: response[0].apptNumber,
      aworkType: response[0].activityType,
      provisioningValidation: response[0].XA_PROVISIONING_VALIDATION,
      byPassClientSignature: response[0].XA_CLIENTSIGN_OVER === 1 ? 1 : 0
    }
  })
  readonly setClientSignature = this.updater<Blob>(
    (state, clientSignature) => ({
      ...state,
      clientSignature,
    }));
/*  readonly setTechnicianSignature = this.updater<Blob>(
    (state, technicianSignature) => ({
      ...state,
      technicianSignature,
    }));*/
/*  readonly setTechnicianSignatureHandled = this.updater<Image>(
    (state, technicianSignatureHandled) => ({
      ...state,
      technicianSignatureHandled,
    }));*/
  readonly setClientSignatureHandled = this.updater<Image>(
    (state, clientSignatureHandled) => ({
      ...state,
      clientSignatureHandled,
    }));
  readonly setClientSignatureResult = this.updater<{text: string, result: boolean, quality: number} | undefined>(
    (state, clientSignatureResult) => ({
      ...state,
      clientSignatureResult,
    }));
/*  readonly setTechnicianSignatureResult = this.updater<{text: string, result: boolean, quality: number}>(
    (state, technicianSignatureResult) => ({
      ...state,
      technicianSignatureResult,
    }));*/
  readonly setComplexity = this.updater((state, complexity: number) => ({
    ...state,
    complexity
  }));
  readonly setTcSectionVisibilitySettings = this.updater((state, tcSectionVisibilitySettings: boolean) => ({
    ...state,
    tcSectionVisibilitySettings
  }));
  readonly setClientSignVisibilitySettings = this.updater((state, clientSignVisibilitySettings: boolean) => ({
    ...state,
    clientSignVisibilitySettings
  }));
  readonly setOthersVisibilitySettings = this.updater((state, othersVisibilitySettings: boolean) => ({
    ...state,
    othersVisibilitySettings
  }));
  readonly setonlyFinishButtonVisibility = this.updater((state, onlyFinishButtonVisibility: boolean) => ({
    ...state,
    onlyFinishButtonVisibility
  }));
  readonly setLastSearchedTag = this.updater((state, lastSearchedTag: string | undefined) => ({
    ...state,
    lastSearchedTag
  }));
  readonly clearSearch = this.updater((state) => ({
    ...state,
    searchResults: {},
    lastSearchedTag: undefined,
    visibleItemsLimit: {}
  }));
  readonly setSearchResults = this.updater((state, searchResults: GroupedActivities) => ({
    ...state,
    searchResults,
    visibleItemsLimit: Object.keys(searchResults).reduce((acc, key) => ({ ...acc, [key]: 5 }), {})
  }));

  readonly removeActivityFromResults = this.updater((state, activityId: number) => {
    const newSearchResults = { ...state.searchResults };
    Object.keys(newSearchResults).forEach(group => {
      newSearchResults[group] = newSearchResults[group].filter(item => item.activityId !== activityId);
      if (newSearchResults[group].length === 0) {
        delete newSearchResults[group];
      }
    });
    return { ...state, searchResults: newSearchResults };
  });

  readonly showMoreItems = this.updater((state, group: string) => ({
    ...state,
    visibleItemsLimit: {
      ...state.visibleItemsLimit,
      [group]: (state.visibleItemsLimit[group] || 5) + 5
    }
  }));
  readonly setCurrentResourceId = this.updater((state, currentResourceId: string) => ({
    ...state,
    currentResourceId
  }));

  // Effects
  readonly handleOpenMessage = this.effect<Message>(($) =>
    $.pipe(
      tap(({securedData}) => {
        const {ofscRestClientId, ofscRestSecretId, urlOFSC} = securedData;
        this.ofsRestApiService.setUrl(urlOFSC);
        this.ofsRestApiService.setCredentials({user: ofscRestClientId, pass: ofscRestSecretId});
      }),
/*      tap(message => console.log(message)),*/
      tap((message) => {
        if (message.resource) this.setCurrentResourceId(message.resource.external_id);
      }),
/*      concatMap((message) => {
        if (message.activity) {
          this.setFromOfsMessage(message);
          const { parametroComplejidad } = message.securedData;
          const { byPassClientSignature } = this.get();
          const complexityGrade = byPassClientSignature === 1 ? 0 : Number(parametroComplejidad);
          this.setComplexity(complexityGrade);
          this.imageAnalyzer.setComplexityGrade(complexityGrade);
          return from(Promise.resolve());
        } else {
          const resourceId = message.resource.external_id;
          const routeDate = message.queue.date;
          const { parametroComplejidad } = message.securedData;
          return this.ofsRestApiService.getAResourceRoute(resourceId, routeDate).pipe(
            map((response: GetAResourceRoute) => response.items.filter((item: GetAResourceRouteItem) => item.status === 'started')),
            tap((messageData) => this.setFromOfsApi(messageData)),
            tap(() => {
              const { byPassClientSignature } = this.get();
              const complexityGrade = byPassClientSignature === 1 ? 0 : Number(parametroComplejidad);
              this.setComplexity(complexityGrade);
              this.imageAnalyzer.setComplexityGrade(complexityGrade);
            })
          );
        }
      }),*/
      /*switchMap(() => this.ofsRestApiService.getAnActivityType(this.get().aworkType!)),*/
      /*tap(({groupLabel}) => this.visibilitySettings(groupLabel!)),*/
      /*tap(() => this.get().provisioningValidation !== "OK" && this.dialog.error('Se debe completar el aprovisionamiento para finalizar la actividad'))*/
    )
  );
  readonly processDrawnClientSignature = this.effect<Blob>((blob$) => blob$.pipe(
    tap(() => this.setClientSignatureResult(undefined)),
    tap((blob) => this.setClientSignature(blob)),
    switchMap((blob: Blob) => from(this.imageAnalyzer.getBinaryImage(blob))),
    tap((image: Image) => this.setClientSignatureHandled(image)),
    concatMap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      this.setClientSignatureResult(complexity);
      return Promise.resolve(complexity);
    }),
  ));
/*  readonly processDrawnTechSignature = this.effect<Blob>((blob$) => blob$.pipe(
    tap((blob) => this.setTechnicianSignature(blob)),
    switchMap((blob: Blob) => from(this.imageAnalyzer.getBinaryImage(blob))),
    tap((image: Image) => this.setTechnicianSignatureHandled(image)),
    concatMap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      this.setTechnicianSignatureResult(complexity);
      return Promise.resolve(complexity);
    }),
  ));*/
  readonly submitDrawnSignatures = this.effect((blob$) => blob$.pipe(
    concatMap(() => {
      const {clientSignatureHandled, clientSignatureResult, activityId} = this.get();
      if (!clientSignatureResult!.result) {
        this.dialog.error('Firma del cliente no válida');
        return EMPTY;
      }
      return from(clientSignatureHandled!.toBlob('image/png')).pipe(
        concatMap(processedClientSignatureBlob => this.ofsRestApiService.setAFileProperty(activityId!.toString(), 'XA_CUSTOMER_SIGNATURE', processedClientSignatureBlob).pipe(
          catchError((error: HttpErrorResponse) => {
            this.dialog.error(`Error al enviar firma del cliente: ${error.message}`);
            return throwError(() => error);
          }))),
        concatMap(() => {
          const {activityId, clientSignatureResult} = this.get();
          return this.ofsRestApiService.updateAnActivity(Number(activityId), {XA_CLIENTSIGN_RATING: Number(clientSignatureResult!.quality)});
        })
      )
    }),
    tap({
      complete: () => {
        this.dialog.success('Firmas enviadas correctamente');
      }
    }),
    catchError(error => {
      console.log('Error en el proceso de envío de firmas', error);
      return EMPTY;
    }),
  ));

  readonly triggerNativeScan = this.effect<void>($ => $.pipe(
    tap(() => {
      const callId = this.ofs.generateCallId();
      this.ofs.scanBarcode(callId);
    })
  ));

  readonly searchByTag = this.effect<string>((tag$) => tag$.pipe(
    tap((tag) => {
      this.setSearchResults({});
      this.setLastSearchedTag(tag);
    }),
    switchMap((tag) => this.ofsRestApiService.searchActivities(tag).pipe(
      tap((response) => {
        const today = new Date().toLocaleDateString('sv-SE');
        const currentResourceId = this.get().currentResourceId;

        const filteredItems = response.items.filter(item => {
          return !(item.resourceId === currentResourceId && item.date === today);
        });

        const grouped = filteredItems.reduce((acc: GroupedActivities, item: ActivitySearchItem) => {
          const jobType = item.XA_JOBTYPE || '';
          const actType = item.activityType || '';

          let group = '';

          if (JOBTYPES_NO_PAGO.includes(jobType)) {
            group = 'No pago - Filtro de video';
          } else if (JOBTYPES_RECOLECCION.includes(jobType) || actType.startsWith('RA')) {
            group = 'Recolección de acometida';
          } else if (JOBTYPES_RECONEXION.includes(jobType) || actType.startsWith('RX')) {
            group = 'Reconexión';
          } else {
            return acc;
          }

          if (!acc[group]) acc[group] = [];
          acc[group].push(item);
          return acc;
        }, {});
        this.setSearchResults(grouped);
      }),
      catchError((error) => {
        this.dialog.error('Error al buscar actividades por TAG');
        return EMPTY;
      })
    ))
  ));

  readonly selfAssign = this.effect<number>((activityId$) => activityId$.pipe(
    concatMap((activityId) => this.ofsRestApiService.moveActivity(activityId, this.get().currentResourceId!).pipe(
      tap(response => console.log(response)),
      // Usamos concatMap para esperar a que el usuario cierre el diálogo de éxito antes de salir
      concatMap(() => this.dialog.success('Actividad autoasignada correctamente')),
      tap(() => {
        this.removeActivityFromResults(activityId);
        this.ofs.close(activityId); // Invocamos el cierre para volver a OFSC
      }),
      catchError((err) => {
        this.dialog.error('No se pudo autoasignar la actividad: ' + err.message);
        return EMPTY;
      })
    ))
  ));

  readonly completeActivity = this.effect<SurveyData>($ => $.pipe(
    map((survey: SurveyData) => this.handleSurvey(survey)),
    /*tap(survey => console.log(Object.keys(survey).length)),*/
    concatMap((params) => Object.keys(params).length > 0 ? from(this.ofsRestApiService.updateAnActivity(Number(this.get().activityId), params)) : Promise.resolve()),
    delay(300),
    switchMap(() => this.ofsRestApiService.completeAnActivity(Number(this.get().activityId))),
    tap(() => this.ofs.close(Number(this.get().activityId)))
  ));


  private handleSurvey(rawSurvey: SurveyData): UpdateAnActivityBodyParams {
    const params: Partial<UpdateAnActivityBodyParams> = {}
    if (rawSurvey.serviceConformityCtrl) {
      params.XA_STATUS_ORDER_SIEBEL = rawSurvey.serviceConformityCtrl
    }
    if (rawSurvey.satisfactionCtrl && rawSurvey.checkedServicesCtrl) {
      params.XA_QUALITY_JOB = rawSurvey.satisfactionCtrl;
      if (rawSurvey.checkedServicesCtrl.includes('Internet')) params.XA_SERV_INTERNET = 1;
      if (rawSurvey.checkedServicesCtrl.includes('Television')) params.XA_SERV_TV = 1;
      if (rawSurvey.checkedServicesCtrl.includes('Telefono')) params.XA_SERV_TEL = 1;
    }
    if (rawSurvey.othersCtrl) {
      params.XA_OTHER_COMMENTS = rawSurvey.othersCtrl;
    }
    return params;
  }

  private visibilitySettings(aworkTypeGroup: string) {
    const {magicTownFlag, accountType, jobType, provisioningValidation, solutionCode} = this.get();
    /*let jobTypeCatalog = ['TC061','TC062','TC063','TC072','TC108','TC126','TC179','TC180','TC181','TC182','TC032','TC034','TC052','TC071','TC098','TC116','TC151','TC132','TC157','TC163','TC169', 'TC213','TC214','TC215','TC216'];*/
    /*let jobTypeOthersCatalog = ['TC061','TC062','TC063','TC072','TC108','TC126','TC179','TC180','TC181','TC182','TC032','TC034','TC052','TC071','TC098','TC116','TC151','TC132','TC157','TC163','TC169', 'TC213','TC214','TC215','TC216','TC224'];*/
    /*let jobTypeInternalCatalog = ['TC061','TC072','TC062','TC063','TC108','TC126','TC131','TC032','TC034','TC052','TC071','TC098','TC116','TC151','TC132','TC157','TC163','TC169', 'TC213','TC214','TC215','TC216'];*/
    const jobTypeExceptionsCatalog = ['TC032','TC034','TC052','TC061','TC062','TC063','TC071','TC072','TC098','TC108','TC116','TC126','TC132','TC151','TC157','TC163','TC169','TC179','TC180','TC181','TC182','TC213','TC214','TC215','TC216','TC217','TC218','TC219','TC220'];

    let aworkTypeGroupTCValidation = aworkTypeGroup.includes('GTC'); // activity.`aworktype_group` IN ('GTC')
    let magicTownTCValidation = magicTownFlag?.toString() !== '1'; // NOT activity.`XA_MAGIC_TOWN_FLAG` IN ('1')
    let accountTypeValidation = accountType ? accountType === 'Residencial' : true; // activity.`XA_ACCOUNTTYPE` IN ('Residencial')
    let tcSectionValidation = aworkTypeGroupTCValidation && magicTownTCValidation && accountTypeValidation;
    this.setTcSectionVisibilitySettings(tcSectionValidation);
    let jobTypeSignValidation = jobTypeExceptionsCatalog.includes(jobType!);
    let aworkTypeSignValidation = aworkTypeGroup.includes('customer') || aworkTypeGroup.includes('GTC');
    let clientSignatureVisibilitySettings = !jobTypeSignValidation && aworkTypeSignValidation;
    this.setClientSignVisibilitySettings(clientSignatureVisibilitySettings);
    let aworkTypeOthersValidation = aworkTypeGroup.includes('customer');
    let jobTypeOthersValidation = jobTypeExceptionsCatalog.includes(jobType!);
    let magicTownOthersValidation = magicTownFlag?.toString() !== '1';
    let accountTypeOthersValidation = accountType === 'Residencial' || !accountType;
    let othersVisibilitySettings = aworkTypeOthersValidation && !jobTypeOthersValidation && magicTownOthersValidation && accountTypeOthersValidation;
    this.setOthersVisibilitySettings(othersVisibilitySettings);
    let jobTypeStepperValidation = jobTypeExceptionsCatalog.includes(jobType!);
    let provisioningVal = provisioningValidation === 'OK';
    let onlyFinishVisibilitySetting = jobTypeStepperValidation && provisioningVal;
    this.setonlyFinishButtonVisibility(onlyFinishVisibilitySetting);
  }
}
