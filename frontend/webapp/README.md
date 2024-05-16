# WalkAware Trento Frontend WebApp
Il frontend offre una Web App sviluppata con Express.js ed ejs. Questa è dedicata al supporto tecnico e ai dipendenti del comune di Trento. 

Il servizio è eseguibile in cloud a questo indirizzo: [WalkAware Trento Frontend](https://walkaware-frontend.onrender.com/), per eseguire l'app in locale seguire le seguenti indicazioni.


## Come usare
1. Clonare il repository se non è già stato fatto:
``` bash
git clone https://github.com/aleiepure/WalkAware.git
cd WalkAware/frontend/webapp
```
2. Installa le dipendenze:
``` bash
npm install
```

### Configurazione
Crea un file .env nella radice della cartella e aggiungi le seguenti variabili d'ambiente:
```bash
SUPER_SECRET="password generazione jwt token"
BACKEND_BASE_URL="URL backend"
```
Assicurarsi di sostituire con i valori corretti. 

### Esecuzione
Per avviare il server in modalità di production:
```bash
node ./index.js
```
Per avviare il server in modalità di sviluppo:
```bash
npm run run-dev
```



