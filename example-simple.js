import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import apiRoute, { BrowserLanguage, defineMessage } from './index.js';
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

defineMessage(9, {
    it: 'Ciao',
    en: 'Hello'
})


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(apiRoute(Book, {
    language: BrowserLanguage,
    filter: async ({ req, res }) => {
        const authorizationToken = req.headers.Authorization;
        if(!authorizationToken)
            return res.status(200).sendMessage(9);
    }
}));
app.use(apiRoute(Author));

app.listen(8888);