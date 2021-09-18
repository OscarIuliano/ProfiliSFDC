# Gestione Metadati SFDC

Questo tool permette di aggiungere / modificare metadati Salesforce.

È possibile eseguire l'applicazione direttamente tramite eseguibile, piuttosto che avviando il **server.js** con il comando`node server.js` (**importante**: al primo avvio occorre eseguire il comando `npm install`).

L'applicazione verrà avviata sulla porta 8080: **http://localhost:8080/**

Disponibile versione cloud al link: **https://whispering-escarpment-39582.herokuapp.com/** (Versione beta per il solo deploy di CustomMetaData Type).

## How To

### Download full profile from Salesforce
Scaricare dei profili **completi** da Salesforce non è un'impresa semplice, date le dimensioni dei file xml che vengono generati. Con questo tool, si possono scaricare facilmente dei profili completi in 3 semplici passaggi.
1. Selezionare l'ambiente a cui si vuole accedere (login) ed effettuare il login inserendo semplicemente username e password. 
2. Indicare il path (repo locale dove si trovano i profili) per visualizzare tutti i profili.
3. Selezionare il profilo (o profili) che si vogliono scaricare e cliccare sul bottone "Get Profile Info".

### Modifica Profili

1. Indicare il path (repo locale dove si trovano i profili) per visualizzare tutti i profili.
2. Selezionare il profilo (o profili) da modificare.
3. Selezionare il tipo di permesso tra quelli presenti (ad esempio apexClass)
4. Sostituire opportunamente i *placeholder* nel frammento di xml (i frammenti da sostituire sono racchiusi tra parentesi quadre "[" e "]").
5. Fare click su **aggiungi** o **rimuovi** per effettuare la corrispondente modifica sui profili selezionati.