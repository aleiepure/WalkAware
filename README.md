# WalkAware Trento

Progetto per il corso di Ingegneria del software, prof. Sandro Fiore - Università degli studi di Trento.

## Descrizione

Walkaware Trento si propone di aiutare il comune di Trento a migliorare alcuni aspetti della città.

Il progetto si suddivide in due applicazioni rivolte a due categorie di utenti diverse:

1. Un'app mobile dedicata ai cittadini, dove l’utente viene incentivato a camminare e segnalare problemi sul territorio. I punti accumulati con le azioni precedenti possono essere utilizzati in eventi culturali e negozi locali.

2. Un'app web dedicata al supporto tecnico e a dipendenti del comune. Questa raccoglie i dati relativi agli utenti mobile e delle aziende convenzionate.

## Requisiti
- Node.js
- Database MongoDB 
- Account Cloudflare R2 

## Come usare
Il servizio web é disponibile in cloud ai seguenti link:

- [WalkAware Trento Backend](https://walkaware.onrender.com/)
- [WalkAware Trento Frontend](https://walkaware-frontend.onrender.com)
- L'applicazione mobile è scaricabile nell'[ultima release](https://github.com/aleiepure/WalkAware/releases/latest)

Altrmenti seguire  i passi successivi per eseguire l'app in locale.
1. Clona repository:
``` bash
git clone https://github.com/aleiepure/WalkAware.git
cd WalkAware
```
Per i prossimi passi da seguire fare riferimento ai relativi README.md di [backend](./backend/README.md), [frontend](./frontend/webapp/README.md) e [Mobile App](./frontend/mobile/README.md).
 
## Organizzazione Repository
```shell
├── backend
├── frontend
│   ├── mobile
│   └── webapp
└── readme.md
```