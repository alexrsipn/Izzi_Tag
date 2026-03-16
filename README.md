# Introducción

El desarrollo consiste en la generación de una webapp, en Angular 18, que se debe ejecutar como un plugin dentro de Oracle Field Service (OFS), para validar la firma del cliente y finalizar la actividad, por requerimiento de usuario.

## Configuración Externa En OFSC Requerida

Se requiere establecer los siguientes parámetros en la configuración del plugin dentro de OFS:

### En la sección ”General Information” o “Información General”

- Name (Spanish/English): Finalización
- Label: plugin_signature_validation
- Entity: Activity
- Visibility Rules similar to: -

### En la sección “Plugin Settings” o “Configuración del Plugin”:

- Type: Archivo de plugin
- Plugin Archivo: Cargar el archivo .zip generado
- Disable plugin in offline: No seleccionado (aunque debe considerarse que en caso de que el plugin consuma servicios de internet, no podrá funcionar)
- Secure parameters: ofscRestClientId, ofscRestSecretId, urlOFSC y parametroComplejidad.

### En la sección “Available Properties” o “Propiedades Disponibles”:

- _Tipo de actividad(aworktype)_
- _Orden de trabajo(appt_number)_
- _Tipo de OS(XA_JOBTYPE)_
- _Pueblo mágico(XA_MAGIC_TOWN_FLAG)_
- _Tipo de cuenta(XA_ACCOUNTTYPE)_
- _¿El trabajo realizado fue tu entera satisfacción?(XA_QUALITY_JOB)_
- _ACTIVITY MASTER(XA_MST_ACT)_
- _ID de actividad(aid)_
- _Evitar validación de firma cliente(XA_CLIENTSIGN_OVER)_

## Mapeo con Propiedades OFS

Dentro del plugin las propiedades de OFS se mapean de la siguiente manera:
| OFS | Plugin |
|-----------|---------------------|
|_aworktype_|_aworkType_|
|_appt_number_|_apptNumber_|
|_XA_JOBTYPE_|_jobType_|
|_XA_MAGIC_TOWN_FLAG_|_magicTownFlag_|
|_XA_ACCOUNTTYPE_|_accountType_|
|_XA_QUALITY_JOB_|_qualityJob_|
|_XA_MST_ACT_|_masterFlag_|
|_aid_|_activityId_|
|_XA_CLIENTSIGN_OVER_|_byPassClientSignature_|

## Comunicación con OFSC

El plugin se comunica con OFSC a través de la API "message" de los navegadores:

- Reaccionando al evento 'message' del objecto Window para recibir información de OFSC.
- Ejecutando el método Window.postMessage() para enviar información a OFSC.

Toda esta interacción está encapsulada en el servicio `ofs-message.service.ts` en el plugin.

Más información en la documentación de Oracle: https://docs.oracle.com/en/cloud/saas/field-service/fapcf/c-flowcharts.html

## Desarrollo Local

Para desarrollar localmente sobre este proyecto se deben seguir los siguientes pasos:

1. Se recomienda instalar Node.js v20.10.0 LTS o superior y NPM 10.3.0 o superior.
2. Clonar este repositorio.
3. Ejecutar `npm install` para descargar e instalar todas las librerías.
4. Ejecutar `npm run start-tunnel` (`ng serve --disable-host-check`) para acceder al plugin desde el entorno de desarrollo local y como plugin externo en OFSC.

## Build y Deploy

1. Ejecutar `npm run build`.
2. En el archivo _index.html_ generado comentar la línea `<base href="/">` para no tener errores 404 en los archivos JS / CSS.
3. Comprimir en `.zip` el contenido de la carpeta `dist` (generada por el comando del paso 1) asegurándose de excluir los archivos con extensiones que no sean `.js`, `.html` o `.css` (específicamente eliminar cualquier `.txt` o `.ico` que el CLI de Angular haya generado).
4. Cargar el archivo comprimido en la pantalla de configuración del plugin en Oracle Field Service.

## Contribuir (Modificaciones)

Se recomienda realizar cualquier modificación siguiendo la técnica de "Smart and Dumb Components" muy utilizada en el ecosistema de Angular, donde la lógica se introduce en stores utilizando la librería Component Store.
Adicionalmente, se recomienda introducir toda la lógica nueva en el archivo `app.store.ts` o en su defecto en los stores locales de cada componente que se comunican con el antes mencionado, con el objetivo de mantener las componentes lo más vacías posibles de lógica.

## Acerca de

[![Desarrollado por Alexis Ruiz para Izzi Telecom](https://img.shields.io/badge/Desarrollado_por-Alexis_Ruiz_para_Izzi_Telecom-blue)](https://github.com/alexrsipn)
