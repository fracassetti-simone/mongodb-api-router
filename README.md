# Guida all’uso di **apiRoute**

Questa guida spiega **come integrare, configurare e utilizzare** il middleware `apiRoute` nel tuo progetto Express + Mongoose.  
Non serve conoscere l’implementazione interna: ti basta seguire i passi descritti qui sotto.

---

## 1 · Prerequisiti

| Requisito            | Versione consigliata |
|----------------------|----------------------|
| Node.js              | ≥ 16 LTS            |
| Express              | ≥ 4.18              |
| Mongoose             | ≥ 7                 |

Installa le dipendenze di base:

```bash
npm install express mongoose
```

---

## 2 · Installazione

Copia il file `apiRoute.js` all’interno del tuo progetto (o installalo come package se pubblicato su npm).

```js
// apiRoute.js
module.exports = apiRoute;   // esporta la funzione
```

---

## 3 · Primo esempio (5 minuti)

```js
// index.js
const express = require("express");
const mongoose = require("mongoose");
const apiRoute = require("./apiRoute");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost/demo");

// 1. Definisci il modello
const Book = mongoose.model("Book", {
  Title:  { type: String, required: true },
  Author: { type: String },
  Pages:  { type: Number }
});

// 2. Registra il middleware
app.use(apiRoute(Book));   // espone /api/books

// 3. Avvia il server
app.listen(3000, () => console.log("API pronta su http://localhost:3000"));
```

Ora puoi provare:

```bash
curl -X POST http://localhost:3000/api/books      -H "Content-Type: application/json"      -d '{"Title":"1984","Author":"Orwell","Pages":350}'
```

```bash
curl "http://localhost:3000/api/books?Title=1984"
```

---

## 4 · Percorso & Metodi predefiniti

| Verbo | Route di default          | Note                                                                    |
|-------|---------------------------|-------------------------------------------------------------------------|
| GET   | `/api/<collection>`       | Ricerca con query string.                                               |
| POST  | `/api/<collection>`       | Crea un nuovo documento.                                                |
| PUT   | `/api/<collection>`       | Aggiorna uno o più campi su un solo record (`body.query` + `body.set`). |
| DELETE| `/api/<collection>`       | Elimina i documenti che corrispondono alla query string.                |

Puoi cambiare il percorso con l’opzione `route`.

---

## 5 · Configurazione rapida

```js
app.use(apiRoute(Book, {
  methods: ["GET","POST"],          // abilita solo questi
  route: "/db/books",               // percorso personalizzato
  pagesManager: {                   // paginazione
    limit: 20,                      // 20 risultati per pagina
    page: "?p"                      // usa ?p=<num>
  },
  fields: {                         // alias/nascondi campi
    Title: { it: "Titolo" },
    __v:   { show: false }
  },
  acceptedQueryFields: ["Title"],   // whitelisting
  throwRefusedQueryFields: true     // errore se arriva un altro parametro
}));
```

---

## 6 · Opzioni principali

| Chiave                  | Sintesi d’uso                                    | Esempio                                       |
|-------------------------|--------------------------------------------------|-----------------------------------------------|
| `methods`               | Limita i metodi ammessi                          | `["GET","POST"]`                              |
| `route`                 | Override del percorso                            | `"/db/books"`                                 |
| `filter`                | Controlli preliminari (auth, ACL…)               | `(req)=>!!req.user`                           |
| `pagesManager`          | Paginazione automatica                           | `{ limit:"?lim", page:"?p", maxResults:100 }` |
| `fields`                | Alias o nascondi campi in *output*               | `{ __v:{show:false}, Title:{it:"Titolo"} }`   |
| `acceptedQueryFields`   | Whitelist di parametri di ricerca                | `["Title","Author"]`                          |
| `throwRefusedQueryFields`| Errore se arriva un parametro non ammesso       | `true`                                        |
| `options.<verb>.middleware` | Hook prima della persistenza                 | `async ({document})=>{ document.userId=req.user.id }` |
| `options.<verb>.skimming`   | Filtro/trasformazione post‑query             | `({document})=>document.isPublic`             |

---

## 7 · Esempi pratici

### 7.1 · Abilitare la traduzione dei campi

```js
app.use(apiRoute(Book, {
  fields: {
    Title: { it: "Titolo", es: "Título" },
    Pages: { it: "Pagine", es: "Páginas" }
  }
}));
```

*Richiesta da browser con “Accept‑Language: it”*:

```json
{ "Titolo": "Il nome della rosa", "Pagine": 552 }
```

### 7.2 · Paginazione da query string

```js
pagesManager: { limit:"?limit", page:"?page", maxResults:50 }
```

```
GET /api/books?Title=JS&limit=10&page=3
```
Restituisce i risultati 21 → 30.

### 7.3 · Proteggere un endpoint con auth

```js
const isLoggedIn = req => !!req.user;

app.use(apiRoute(Book, { filter: [isLoggedIn] }));
```

Se il filtro restituisce `false`, il client riceve:
```json
{ "ok": false, "status": 400, "error": "The request is invalid." }
```

---

## 8 · Gestione degli errori

| Codice | Quando si verifica                     | Messaggio (EN)                       |
|--------|----------------------------------------|--------------------------------------|
| 1      | Un filtro restituisce `false`          | “The request is invalid.”            |
| 2      | Parametro di query non ammesso         | “You cannot filter results by …”     |
| 3–10   | Errori di validazione Mongoose         | Vedi tabella completa nel README     |

I messaggi sono **localizzati**: basta aggiungere l’header `Accept‑Language: fr`, ecc.

---

## 9 · FAQ

**· Posso usare più modelli?**  
Sì, registra `apiRoute(Model1)` e `apiRoute(Model2)` separatamente.

**· Serve per forza Mongoose?**  
Sì, perché sfrutta la validazione e i metodi di query Mongoose.

**· Posso sovrascrivere la risposta standard?**  
Certo: dentro `options.<verb>.middleware` puoi chiamare `res.json()` e terminare la catena.

---

## 10 · Risorse aggiuntive

* Repository GitHub (esempi completi) – *coming soon*  
* Issue Tracker – per bug e feature request

---

Buon hacking! 🚀