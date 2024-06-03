# WalkAware Trento - Frontend WebApp

Il frontend offre una Web App sviluppata con Express.js ed ejs. Questa è dedicata al supporto tecnico e ai dipendenti del comune di Trento.

Il servizio è eseguibile in cloud a questo indirizzo: [WalkAware Trento Frontend](https://walkaware-frontend.onrender.com/), per eseguire l'app in locale seguire le seguenti indicazioni.

## Come usare

1. Dopo ever [clonato la repo](../../README.md#istruzioni) entrare nella cartella della webapp

``` shell
cd frontend/webapp
```

2. Installa le dipendenze:

``` shell
npm install
```

### Configurazione

Crea un file `.env` nella radice della cartella e aggiungi le seguenti variabili d'ambiente:

```shell
SUPER_SECRET="password generazione jwt token"
BACKEND_BASE_URL="URL backend"
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
