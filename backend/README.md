# WalkAware Trento - Backend

Il backend è sviluppato utilizzando Express.js e offre una serie di API RESTful per gestire diverse funzionalità dell'applicazione.

Il servizio è eseguibile in cloud a questo indirizzo: [WalkAware Trento Backend](https://walkaware.onrender.com/), per eseguire l'app in locale seguire le seguenti indicazioni.

## Come usare

1. Dopo ever [clonato la repo](../../README.md#istruzioni) entrare nella cartella del backend

``` shell
cd backend
```

2. Installa le dipendenze

``` shell
npm install
```

### Configurazione

Crea un file `.env` nella radice della cartella e aggiungi le seguenti variabili d'ambiente

```shell
SUPER_SECRET="password generazione jwt token"
MONGODB_URI="uri database mongodb production"
MONGODB_URI_TEST="uri database mongodb test"
R2_ACCOUNT_ID="R2 account id"
R2_ACCESS_KEY_ID="R2 chiave di accesso"
R2_SECRET_ACCESS_KEY="R2 chiave segreta di accesso"
```

Assicurarsi di sostituire con i valori corretti.

### Esecuzione

Per avviare il server in modalità di production:

```shell
node ./index.js
```

Per avviare il server in modalità di sviluppo:

```shell
npm run run-dev
```

## Test
Tutte le API REST sono state accuratamente testate tramite unit test. Per eseguire tutti i test usare il comando

```shell
npm test
```

## API

La documentazione delle API è accessibile ai seguenti link:

- <https://walkaware.docs.apiary.io>

- <https://walkaware.onrender.com/api-docs>
