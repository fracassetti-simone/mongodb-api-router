import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import apiRoute, { BrowserLanguage } from './index.js';
import { config } from 'dotenv';
import 'colors';

config();
await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
console.clear();

// Author
const authorSchema = new mongoose.Schema({
    Nome: {
        type: String,
        minlength: 10
    },
    Cognome: String
});
const Author = mongoose.model('Author', authorSchema);

// Book
const bookSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Author: { type: mongoose.Types.ObjectId, ref: 'Author' }
});
const Book = mongoose.model('Book', bookSchema);


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(apiRoute(Book, {
    language: BrowserLanguage,
    filter: [ (req, res, next) => true ], // or just a function
    methods: [ 'put', 'post', 'get', 'delete' ],
    fields: {
        Title: { it: 'Titolo' },
        __v: { show: false }
    },
    route: '/db/{collectionName}', // default /api/collectionName
    pagesManager: {
        limit: '?limit', // or static number
        page: '?page', // or static number

        maxResults: 100 // default 200
    },
    acceptedQueryFields: {
        get: [ 'Title' ]
    }, // or just an Array
    options: {
        get: {
            middleware: ({ query }) => {
                // query.Title = 'CIAO QUESTO È UN TEST';
            },
            skimming: [
                ({ req, res, next, document }) => {
                    // può essere usato anche per manipolare i dati
                    document.Title = 'Titolo: ' + document.Title;
                    return true;
                },
                ({ req, res, next, document }) => {
                    return document.Title.length > 1;
                }
            ] // or just a function
        },
        post: {
            middleware: [
                async ({ req, res, next, document }) => {
                    console.log('middleware', document);
                    document.Title = document.Title.toUpperCase();
                }
            ], // or just a function
            skimming: ({ document }) => {
                delete document._id;
                return true;
            },

            fields: {
                __v: { show: true }
            }
        },
        put: {
            middleware: ({ res, document }) => {
                res.json({ ok: false })
            }
        }
    },
    throwRefusedQueryFields: true
}));

app.listen(8888);