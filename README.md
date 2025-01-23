<div align="center">
  <h1><img src="./icon.png" height="128"/><br>WalkAware Trento</h1>
</div>
<div align="center">
  <a href="https://github.com/aleiepure/WalkAware/actions/workflows/test.yaml" title="Tests status">
    <img src="https://github.com/aleiepure/WalkAware/actions/workflows/test.yaml/badge.svg"/>
  </a>
  <a href="https://github.com/aleiepure/WalkAware/actions/workflows/deploy.yaml" title="Deploy to Render status">
    <img src="https://github.com/aleiepure/WalkAware/actions/workflows/deploy.yaml/badge.svg"></img>
  </a>
  <br />
  <a href="https://github.com/carlottacazzolli">Carlotta Cazzolli</a> | 
  <a href="https://github.com/aleiepure">Alessandro Iepure</a> | 
  <a href="https://github.com/rikirandon">Riccardo Randon</a>
  <br />
  <br />
  Progetto per il corso di Ingegneria del software, prof. Sandro Fiore - Università degli studi di Trento.
</div>

## Riconoscimenti

Sviluppato all'interno del progetto "100 progetti software per la Città di Trento" promosso dal Comune di Trento in collaborazione con l'Università di Trento.

WalkAware si è classificato al [primo posto](https://www.comune.trento.it/Aree-tematiche/Smart-city/News/Quattro-App-per-la-citta-premiati-gli-studenti-dell-Universita-di-Trento) nell'edizione per l'anno accademico 2023/2024 per il corso di Ingegneria Informatica.

#### Video di presentazione

[![YouTube](http://i.ytimg.com/vi/15pz0sOdiNw/hqdefault.jpg)](https://www.youtube.com/watch?v=15pz0sOdiNw)

## Descrizione

Il progetto si suddivide in due applicazioni rivolte a due categorie di utenti diverse.

La prima è un'app mobile rivolta ai cittadini. L’interfaccia si presenta come una mappa e una barra di ricerca tramite la quale l’utente può cercare luoghi e ottenere indicazioni stradali come pedone. I passi dell'utente vengono registrati sotto forma di punti, che potranno poi essere utilizzati per ottenere buoni sconto per esercizi e attrazioni locali. Inoltre l’utente può inviare segnalazioni se incontra dei problemi nelle infrastrutture dislocate sul territorio.

La seconda parte è una web app che aggrega i dati prodotti dai cittadini, permette l'amministrazione delle informazioni sulle aziende convenzionate e i premi messi a disposizione, suggerisce luoghi d’interesse che appariranno sulla mappa e consente la gestione delle segnalazioni.

## Come usare

### In cloud

Il servizio è fruibile in cloud ai seguenti indirizzi

- [WalkAware Trento Backend](https://walkaware.onrender.com/)

- [WalkAware Trento Frontend](https://walkaware-frontend.onrender.com)

- L'applicazione mobile è scaricabile nell'[ultima release](https://github.com/aleiepure/WalkAware/releases/latest)

### In locale

#### Dipendenze

- Node.js
- Database MongoDB
- Account Cloudflare R2

#### Istruzioni

Seguire  i seguenti passaggi

1. Clona repository:

``` shell
git clone https://github.com/aleiepure/WalkAware.git && cd WalkAware
```

2. Segui le istruzioni nei file README nelle sottocartelle [backend/](./backend/README.md), [frontend/webapp/](./frontend/webapp/README.md) e [frontend/mobile/](./frontend/mobile/README.md).

## Organizzazione Repository

```shell
├── backend
├── frontend
│   ├── mobile
│   └── webapp
└── README.md
```
