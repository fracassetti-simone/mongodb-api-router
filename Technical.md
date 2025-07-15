## Introduzione

`apiRoute` è un **middleware** Express progettato per trasformare un qualunque *Mongoose Model* in un endpoint REST “tutto‑in‑uno”.  
Oltre a esporre le classiche operazioni **GET / POST / PUT / DELETE**, il wrapper aggiunge:

* **Controllo dei metodi** e del percorso.  
* **Filtro preliminare** a più stadi.  
* **Traduzione multilingua** dei messaggi d’errore e dei nomi di campo.  
* **Paginazione** (con limiti di sicurezza).  
* **Whitelisting dei parametri di query** e blocco dei parametri non ammessi.  
* **Middleware personalizzati** (pre‑, post‑ e “skimming”).  
* **Pulizia e rimappatura dei documenti** in uscita.  
* Gestione delle eccezioni Mongoose con risposta strutturata.  

Di seguito una descrizione, punto per punto, dell’intero flusso che segue una richiesta HTTP fino alla risposta finale.

---

## 1. Impostazione del middleware

```js
app.use(apiRoute(Book, { …opzioni… }));
```

* **model**: qualunque istanza `mongoose.model`.
* **options**: oggetto di configurazione, approfondito nei capitoli seguenti.

---

## 2. Parametri di configurazione

| Chiave                | Tipo / Valori ammessi                                   | Default                 | Descrizione sintetica |
|-----------------------|---------------------------------------------------------|-------------------------|-----------------------|
| `filter`              | funzione o array di funzioni async `(req, res, next)`   | `[]`                    | Esecuzione *prima* di qualunque logica. Se **tutti** i filtri restituiscono `true`, la richiesta prosegue; in caso contrario la risposta viene inviata immediatamente. |
| `methods`             | `['GET','POST','PUT','DELETE',…]` (case‑insensitive)    | tutti i `allowedMethods`| Elenco dei metodi ammessi per questo endpoint. |
| `fields`              | `{ CampoMongo: { it:'…', en:'…', show:false }, … }`      | `{}`                    | Traduzione / mascheramento dei campi in output. |
| `route`               | stringa con placeholder `{modelName}` / `{collectionName}` | `/api/<collection>`   | Percorso da intercettare. |
| `pagesManager`        | { limit, page, maxResults }                             | `undefined`             | Abilita la paginazione. `limit` e `page` possono essere numeri fissi o il nome di un parametro di query preceduto da `?`. |
| `acceptedQueryFields` | array **o** mappa per metodo (`{ get:[…], post:[…] }`)   | tutti i campi del modello | Campi di query permessi. Se `throwRefusedQueryFields` è `true`, i parametri non ammessi producono errore. |
| `throwRefusedQueryFields` | boolean                                            | `false`                 | Se attivo, rifiuta la richiesta con errore n. 2 (messaggio localizzato). |
| `language`            | codice ISO‑639‑1 **o** `BrowserLanguage`                | `BrowserLanguage`       | Lingua predefinita dei messaggi se non derivabile da `req.acceptsLanguages()`. |
| `options`             | `{ get: {}, post:{}, put:{}, delete:{} }`               | `{}`                    | Specifiche aggiuntive per singolo verbo (middleware, skimming, fields…). |

### 2.1  `options.<method>`

| Chiave     | Tipo                                                      | Descrizione |
|------------|-----------------------------------------------------------|-------------|
| `middleware` | funzione o array di funzioni *(pre‑salvataggio / update)* | Riceve `{ document, req, res, next, query, set }` a seconda del verbo. Può modificare i dati o inviare direttamente la risposta. |
| `skimming`   | funzione o array di funzioni *(post‑query)*              | Permette di filtrare o trasformare i documenti prima che tornino al client. Se una funzione restituisce **false** il documento viene scartato. |
| `fields`     | override locale di `fields`                              | Vale solo per quel verbo. |

---

## 3. Flusso dettagliato di una richiesta

> La numerazione segue l’ordine di esecuzione nel middleware ritornato da `apiRoute`.

1. **Riconoscimento lingua**  
   *Se `options.language !== BrowserLanguage`* ⇒ usa quella.  
   Altrimenti usa la prima lingua di `req.acceptsLanguages()` (solo parte prima di `-`, in lowercase).

2. **Controllo Method + Path**  
   – Se il metodo HTTP non è incluso in `methods`, `next()` ⇒ la route continua.  
   – Se `req.path !== route`, idem.  

3. **Filtri preliminari** (`filter`)  
   Le funzioni vengono eseguite in serie:  
   * `true` ⇒ continua.  
   * `false` ⇒ `400 { error: "The request is invalid." }`.  
   * Oggetto `res` ⇒ inviato così com’è (`status` di default = 400).  
   * Qualsiasi altra cosa ⇒ corpo `{ ok:false, status:400, error:<valore> }`.  

4. **Costruzione di `queryFields`**  
   Se `acceptedQueryFields` è array → vale per tutti i verbi.  
   Se è mappa → si prende la chiave del verbo corrente (`GET` / `get`).  
   In assenza, si usa **tutta** la schema‑path list di Mongoose.

5. **`parseFilter()`**  
   *Clona* l’oggetto (`req.query` per GET/DELETE, `req.body` per POST, oppure `req.body.query` per PUT).  
   - **Paginazione**: calcola `limit` e `page` (rispettando `maxResults`).  
   - **Mappatura campi localizzati**: se `fields` contiene sinonimi per la lingua corrente, li converte nel nome Mongo.  
   - **Controllo colonne**: se un key non è in `acceptedQueryFields` **e** `throwRefusedQueryFields===true` → errore n. 2 localizzato.  

6. **Error Handler Mongoose** (`catchMongoDBError`)  
   Intercetta `ValidationError`. Per ciascun campo prende `kind` e restituisce il relativo messaggio (da 3 a 10). L’output finale è:  

```json
{ "ok": false, "status": 400, "errors": [ { "target": "<campo>", "errorMessage": "<msg>" }, … ] }
```

   Eventuali lingue/campi localizzati vengono sostituiti.

7. **Preparazione opzioni per verbo corrente**  

```js
const furtherOptions = options.options[req.method] 
                    || options.options[req.method.toLowerCase()] 
                    || {};
```

   Vengono estratti `middleware`, `skimming`, `fields` locali.

8. **Costruzione helper “universali”**  
   * **`skimming(results)`** – Applicato dopo la query.  
   * **`middleware(document, reportAllArguments)`** – Applicato prima di `save()`, `update()` o in GET senza parametri.

---

## 4. Logica per singolo verbo

### 4.1  GET
1. Esegue eventuale `options.get.middleware({ query })`.  
2. Effettua `model.find(query)` con `skip/limit` (se paginato).  
3. Applica `skimming`.  
4. Traduzione / nascondi campi (`customFields`).  
5. Risposta:  

```json
{ "ok": true, "<collection>": [ …doc… ] }
```

### 4.2  POST
1. Pulisce body da `_id` e `__v`.  
2. Crea `new model(body)` → `middleware(document)`.  
3. `document.save()` con `catchMongoDBError`.  
4. `skimming([document])`, traduzioni campi.  
5. Risposta: `{ ok:true, document:<doc> }`.

### 4.3  PUT
1. Estrae `query` e `set` da `req.body`.  
2. `middleware({ query, set }, reportAllArguments=true)`.  
3. `findOneAndUpdate(query, set)` → recupera il record aggiornato.  
4. `skimming`, traduzioni campi.  
5. Risposta: `{ ok:true, <modelNameLower>:<doc> }`.

### 4.4  DELETE
1. `find(query).lean()` → eventuale `skimming`.  
2. Se presente `skimming`, esegue `deleteOne` per ogni documento filtrato; altrimenti `deleteMany`.  
3. Risposta: `{ ok:true }`.

---

## 5. Traduzione campi (`fields` e `customFields`)

```js
fields: {
  Title:  { it:'Titolo' },   // rinomina
  __v:    { show:false }     // nasconde
}
```

* L’oggetto viene unito (shallow‑merge) con eventuali override dentro `options.<verb>.fields`.  
* Durante **output**, per ogni documento:  
  - Se `show:false` ⇒ campo eliminato.  
  - Se esiste la chiave della lingua corrente ⇒ crea l’alias traducendo il nome (es. `Title` → `Titolo`).  

---

## 6. Paginazione (`pagesManager`)

| Chiave      | Uso                                       |
|-------------|-------------------------------------------|
| `limit`     | Numero fisso *o* `'?nomeQueryParam'`.     |
| `page`      | Idem.                                     |
| `maxResults`| Tetto massimo oltre il quale **limit** viene forzato. |

Esempio: con `limit:'?limit'` e `page:'?page'` una chiamata  
`GET /db/books?limit=20&page=3` restituirà i documenti **41 → 60**.

---

## 7. acceptedQueryFields & throwRefusedQueryFields

* Se un parametro di query non è incluso in `acceptedQueryFields[verb]` → viene **rimosso** (silent fail).  
* Se `throwRefusedQueryFields:true` il middleware abortisce con errore n. 2, restituendo il nome del parametro nella lingua corrente.

---

## 8. Esempio completo

```js
app.use(apiRoute(Book, {
  language: BrowserLanguage,
  filter: [ (req) => !!req.user ],              // autenticazione
  methods: [ 'GET','POST','PUT','DELETE' ],
  fields: { Title:{ it:'Titolo' }, __v:{show:false} },
  route: '/db/{collectionName}',
  pagesManager: { limit:'?limit', page:'?page', maxResults:100 },
  acceptedQueryFields: { get:['Title'] },
  throwRefusedQueryFields: true,
  options: {
    get: {
      middleware: ({ query }) => { /* side‑effects */ },
      skimming: [ ({ document }) => (document.Title='Titolo: '+document.Title) ]
    },
    post: {
      middleware: async ({ document }) => { document.Title=document.Title.toUpperCase() },
      skimming: ({ document }) => { delete document._id; return true; },
      fields: { __v:{show:true} }
    },
    put: {
      middleware: ({ res }) => res.json({ ok:false })   // blocca qualunque PUT
    }
  }
}));
```

---

## 9. Diagramma di sintesi del flusso

```text
           ┌───►  Route/Method match? ──no──► next()
Request ───┤
           │
           │yes
           ▼
     Esegui filter[]  ──false/err──► 400/early‑return
           │
           ▼
    parseFilter()  (paginazione, acceptedFields, alias)
           │
           ▼
  furtherOptions.{middleware}() ←──────┐
           │                           │
           ▼                           │
   Operazione DB (find, save, …)       │
           │                           │
           ▼                           │
   catchMongoDBError()                 │
           │                           │
           ▼                           │
      skimming[]  (post‑query)         │
           │                           │
           ▼                           │
   Rinomina / rimuovi campi            │
           │                           │
           ▼                           │
        Response 200 JSON  ◄───────────┘
```

---

## Conclusioni  

`apiRoute` incapsula in un’unica funzione gran parte della **plumbing** necessaria per esporre risorse MongoDB in modo sicuro e internazionale.  
Il suo utilizzo consente di:

* Ridurre la duplicazione di codice sui singoli endpoint.  
* Avere messaggi d’errore coerenti e localizzabili.  
* Applicare filtri, controlli e trasformazioni **senza** dover scrivere ogni volta la stessa logica.  

Grazie alla struttura modulare (callback `filter`, `middleware`, `skimming`) è comunque possibile intervenire in punti precisi della pipeline per introdurre regole di business o ottimizzazioni personalizzate.