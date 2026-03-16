import { Injectable, isDevMode } from '@angular/core';
import { filter, fromEvent, map, Observable, share, Subject, tap } from 'rxjs';
import { Message } from '../types/models/message';

@Injectable({
  providedIn: 'root',
})
export class OfsMessageService {
  private static API_VERSION = 1;

  message: Message | any;
  messageSubject = new Subject<Message>();

  constructor() {
    fromEvent(window, 'message').subscribe((event: any) => {
      this.getPostMessageData(event);
    });
    this.sendOKMessage();
  }

  // Input Messages
  private message$ = fromEvent(window, 'message').pipe(
    tap((e) => this.logEvent(e as MessageEvent)),
    filter((e) => (e as MessageEvent).data),
    map((e) => (e as MessageEvent<Message>).data),
    share()
  );

  readonly initMessage$ = this.message$.pipe(
    filter((m) => m.method === 'init')
  );
  readonly openMessage$ = this.message$.pipe(
    filter((m) => m.method === 'open')
  );
  readonly wakeupMessage$ = this.message$.pipe(
    filter((m) => m.method === 'wakeup')
  );
  readonly updateResultMessage$ = this.message$.pipe(
    filter((m) => m.method === 'updateResult')
  );
  readonly errorMessage$ = this.message$.pipe(
    filter((m) => m.method === 'error')
  );

  // Output Messages
  ready(sendInitData: boolean = false): void {
    const message: Partial<Message> = {
      apiVersion: OfsMessageService.API_VERSION,
      method: 'ready',
      sendMessageAsJsObject: true,
      sendInitData,
    };
    this.sendPostMessageData(message);
  }

  initEnd(additionalData: Partial<Message> = {}): void {
    const message: Partial<Message> = {
      ...additionalData,
      apiVersion: OfsMessageService.API_VERSION,
      method: 'initEnd'
    };
    this.sendPostMessageData(message);
  }

/*  close(additionalData: Partial<Message> = {}): void {
    const message: Partial<Message> = {
      ...additionalData,
      apiVersion: OfsMessageService.API_VERSION,
      method: 'close'
    };
    this.sendPostMessageData(message);
  }*/

  close(activityId: number): void {
    let today = new Date();
    const message = {
      apiVersion: OfsMessageService.API_VERSION,
      method: 'close',
      backScreen: 'activity_list',
      activity: {
        "aid": activityId,
        "XA_ACTION_CODE_205": today
      }
    };
    this.sendPostMessageData(message);
  }

  update(additionalData: Partial<Message> = {}): void {
    const message: Partial<Message> = {
      ...additionalData,
      apiVersion: OfsMessageService.API_VERSION,
      method: 'update',
      /*activity: { XA_CLIENTSIGN_RATING: additionalData.activity!.XA_CLIENTSIGN_RATING }*/
    };
    this.sendPostMessageData(message);
  }
/*  updateSignRating(clientSignRating: string): void {
    const message: Partial<Message> = {
      apiVersion: OfsMessageService.API_VERSION,
      method: 'update',
      activity: { XA_CLIENTSIGN_RATING: clientSignRating }
    };
    console.log(message);
    this.sendPostMessageData(message);
  }*/

/*  closeAndUpdate(signatureValid: boolean) {
    const message: Partial<Message> = {
      apiVersion: OfsMessageService.API_VERSION,
      method: 'close',
      /!*activity: { XA_SIGN_VALID: signatureValid }*!/
    };
    this.sendPostMessageData(message);
  }*/

  sleep(additionalData: Partial<Message> = {}): void {
    const message: Partial<Message> = {
      ...additionalData,
      apiVersion: OfsMessageService.API_VERSION,
      method: 'sleep'
    };
    this.sendPostMessageData(message);
  }

  // Aux methods
  getMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  getPostMessageData(event: any) {
    if (typeof event.data !== 'undefined') {
      if (this.isJson(event.data)) {
        let data = JSON.parse(event.data);

        if (data.method) {
          this.log(
            window.location.host +
            ' <- ' +
            ' ' +
            this.getDomain(event.origin) +
            '\nMethod: ' +
            data.method,
            JSON.stringify(data, null, 4)
          );

          switch (data.method) {
            case 'open':
              this.pluginOpen(data);
              break;
            case 'updateResult':
              this.log(window.location.host + ' <- FINISHED UPDATING ', data);
              break;
            case 'error':
              data.errors = data.errors || { error: 'Unknown error' };
              this.showError(data.errors);
              break;
            default:
              // alert('Unknown method');
              break;
          }
        } else {
          this.log(
            window.location.host +
            ' <- NO METHOD' +
            this.getDomain(event.origin),
            JSON.stringify(data),
            '#d62d20',
            true
          );
        }
      } else {
        this.log(
          window.location.host + ' <- NOT JSON ' + this.getDomain(event.origin),
          null,
          null,
          true
        );
      }
    } else {
      this.log(
        window.location.host + ' <- NO DATA ' + this.getDomain(event.origin), null, null, true
      );
    }
  }

  sendPostMessageData(data: any) {
    if (document.referrer !== '') {
      this.log(
        window.location.host +
        ' -> ' +
        this.getDomain(document.referrer) +
        '\nMethod: ' +
        data.method +
        ' ',
        JSON.stringify(data, null, 1),
        '#008744',
        true
      );

      parent.postMessage(
        JSON.stringify(data),
        this.getOrigin(document.referrer)
      );
    }
  }

  // OFS actions
  pluginOpen(message: any) {
    this.messageSubject.next(message);
    this.messageSubject.complete();
    /*console.log(message);*/
  }

  // close() {
  //   let messageData = {
  //     apiVersion: OfsMessageService.API_VERSION,
  //     method: 'close',
  //   };

  //   this.sendPostMessageData(messageData);
  // }

  // closeAndUpdate(activityId: number, resourceId: number) {
  //   let messageData = {
  //     apiVersion: 1,
  //     method: 'close',
  //     activity: { external_id: resourceId },
  //   };

  //   this.sendPostMessageData(messageData);
  // }

  // Aux
  debugMode: boolean = isDevMode();

  private logEvent(event: MessageEvent) {
    if (typeof event.data === 'undefined') {
      this.log(window.location.host + ' <- NO DATA' + this.getDomain(event.origin), null, null, true);
      return;
    }
  }

  sendOKMessage() {
    let messageData = {
      apiVersion: 1,
      method: 'ready',
    };
    this.sendPostMessageData(messageData);
  }

  log(title: string, data?: string | null, color?: string | null, warning?: boolean) {
    if (!this.debugMode) {
      return;
    }
    if (!color) {
      color = '#000FF5';
    }
    if (data) {
      console.groupCollapsed(
        '%c[API Plugin] ' + title,
        'color: ' +
        color +
        '; ' +
        (warning ? 'font-weight: bold;' : 'font-weight: normal;')
      );
      console.log('[API Plugin] ' + data);
      console.groupEnd();
    } else {
      console.log(
        '%c[API Plugin] ' + title,
        'color: ' + color + '; ' + (warning ? 'font-weight: bold;' : '')
      );
    }
  }

  isJson(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getOrigin(url: any) {
    if (url != '') {
      if (url.indexOf('://') > -1) {
        return 'https://' + url.split('/')[2];
      } else {
        return url.split('/')[0];
      }
    }
  }

  getDomain(url: any) {
    if (url != '') {
      if (url.indexOf('://') > -1) {
        return url.split('/')[2];
      } else {
        return url.split('/')[0];
      }
    }
  }

  showError(errorData: any) {
    alert(JSON.stringify(errorData, null, 4));
  }
}
