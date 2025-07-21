import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import 'colors';

const messages = {
    __userMessages: {},
    1: {
        it: 'La richiesta non è valida.',
        en: 'The request is invalid.',
        es: 'La solicitud no es válida.',
        fr: 'La requête n\'est pas valide.',
        de: 'Die Anfrage ist ungültig.',
        pt: 'A solicitação não é válida.',
        nl: 'Het verzoek is ongeldig.',
        ru: 'Недопустимый запрос.',
        zh: '请求无效。',
        ja: 'リクエストが無効です。',
        ko: '요청이 잘못되었습니다.',
        ar: 'الطلب غير صالح.'
    },
    2: {
        it: 'Non puoi filtrare i risultati con il parametro «{key}».',
        en: 'You cannot filter results by the “{key}” parameter.',
        es: 'No puedes filtrar los resultados por el parámetro «{key}».',
        fr: 'Vous ne pouvez pas filtrer les résultats avec le paramètre « {key} ».',
        de: 'Sie können die Ergebnisse nicht nach dem Parameter „{key}“ filtern.',
        pt: 'Você não pode filtrar os resultados pelo parâmetro "{key}".',
        nl: 'U kunt de resultaten niet filteren op de parameter ‘{key}’.',
        ru: 'Нельзя отфильтровать результаты по параметру «{key}».',
        zh: '无法按参数“{key}”筛选结果。',
        ja: 'パラメータ「{key}」で結果をフィルタリングすることはできません。',
        ko: '매개변수 "{key}"로 결과를 필터링할 수 없습니다.',
        ar: 'لا يمكنك تصفية النتائج حسب المعامل "{key}".'
    },
    3: {
        it: 'Il campo «{target}» è obbligatorio.',
        en: 'The field “{target}” is required.',
        es: 'El campo «{target}» es obligatorio.',
        fr: 'Le champ « {target} » est requis.',
        de: 'Das Feld „{target}“ ist erforderlich.',
        pt: 'O campo "{target}" é obrigatório.',
        nl: 'Het veld ‘{target}’ is verplicht.',
        ru: 'Поле «{target}» обязательно.',
        zh: '字段“{target}”是必填项。',
        ja: '「{target}」フィールドは必須です。',
        ko: '"{target}" 필드는 필수입니다.',
        ar: 'الحقل "{target}" مطلوب.'
    },
    4: {
        it: 'Il campo «{target}» è troppo corto.',
        en: 'The field “{target}” is too short.',
        es: 'El campo «{target}» es demasiado corto.',
        fr: 'Le champ « {target} » est trop court.',
        de: 'Das Feld „{target}“ ist zu kurz.',
        pt: 'O campo "{target}" é muito curto.',
        nl: 'Het veld ‘{target}’ is te kort.',
        ru: 'Поле «{target}» слишком короткое.',
        zh: '字段“{target}”太短。',
        ja: '「{target}」フィールドが短すぎます。',
        ko: '"{target}" 필드가 너무 짧습니다.',
        ar: 'الحقل "{target}" قصير جدًا.'
    },
    5: {
        it: 'Il campo «{target}» è troppo lungo.',
        en: 'The field “{target}” is too long.',
        es: 'El campo «{target}» es demasiado largo.',
        fr: 'Le champ « {target} » est trop long.',
        de: 'Das Feld „{target}“ ist zu lang.',
        pt: 'O campo "{target}" é muito longo.',
        nl: 'Het veld ‘{target}’ is te lang.',
        ru: 'Поле «{target}» слишком длинное.',
        zh: '字段“{target}”太长。',
        ja: '「{target}」フィールドが長すぎます。',
        ko: '"{target}" 필드가 너무 깁니다.',
        ar: 'الحقل "{target}" طويل جدًا.'
    },
    6: {
        it: 'Il valore di «{target}» è troppo basso.',
        en: 'The value of “{target}” is too low.',
        es: 'El valor de «{target}» es demasiado bajo.',
        fr: 'La valeur de « {target} » est trop basse.',
        de: 'Der Wert von „{target}“ ist zu niedrig.',
        pt: 'O valor de "{target}" é muito baixo.',
        nl: 'De waarde van ‘{target}’ is te laag.',
        ru: 'Значение поля «{target}» слишком мало.',
        zh: '字段“{target}”的值太小。',
        ja: '「{target}」の値が小さすぎます。',
        ko: '"{target}" 값이 너무 낮습니다.',
        ar: 'قيمة "{target}" منخفضة جدًا.'
    },
    7: {
        it: 'Il valore di «{target}» è troppo alto.',
        en: 'The value of “{target}” is too high.',
        es: 'El valor de «{target}» es demasiado alto.',
        fr: 'La valeur de « {target} » est trop élevée.',
        de: 'Der Wert von „{target}“ ist zu hoch.',
        pt: 'O valor de "{target}" é muito alto.',
        nl: 'De waarde van ‘{target}’ is te hoog.',
        ru: 'Значение поля «{target}» слишком велико.',
        zh: '字段“{target}”的值太大。',
        ja: '「{target}」の値が大きすぎます。',
        ko: '"{target}" 값이 너무 큽니다.',
        ar: 'قيمة "{target}" مرتفعة جدًا.'
    },
    8: {
        it: 'Il valore di «{target}» non è valido.',
        en: 'The value of “{target}” is not valid.',
        es: 'El valor de «{target}» no es válido.',
        fr: 'La valeur de « {target} » n’est pas valide.',
        de: 'Der Wert von „{target}“ ist ungültig.',
        pt: 'O valor de "{target}" não é válido.',
        nl: 'De waarde van ‘{target}’ is ongeldig.',
        ru: 'Значение поля «{target}» недопустимо.',
        zh: '字段“{target}”的值无效。',
        ja: '「{target}」の値が無効です。',
        ko: '"{target}" 값이 유효하지 않습니다.',
        ar: 'قيمة "{target}" غير صالحة.'
    },
    9: {
        it: 'Il formato di «{target}» non è corretto.',
        en: 'The format of “{target}” is incorrect.',
        es: 'El formato de «{target}» no es correcto.',
        fr: 'Le format de « {target} » est incorrect.',
        de: 'Das Format von „{target}“ ist nicht korrekt.',
        pt: 'O formato de "{target}" está incorreto.',
        nl: 'Het formaat van ‘{target}’ is onjuist.',
        ru: 'Неверный формат поля «{target}».',
        zh: '字段“{target}”格式不正确。',
        ja: '「{target}」の形式が正しくありません。',
        ko: '"{target}" 형식이 올바르지 않습니다.',
        ar: 'تنسيق "{target}" غير صحيح.'
    },
    10: {
        it: 'Il valore di «{target}» non è del tipo previsto.',
        en: 'The value of “{target}” is not of the expected type.',
        es: 'El valor de «{target}» no es del tipo esperado.',
        fr: 'La valeur de « {target} » n’est pas du type attendu.',
        de: 'Der Wert von „{target}“ ist nicht vom erwarteten Typ.',
        pt: 'O valor de "{target}" não é do tipo esperado.',
        nl: 'De waarde van ‘{target}’ is niet van het verwachte type.',
        ru: 'Значение поля «{target}» не соответствует ожидаемому типу.',
        zh: '字段“{target}”的类型不符合预期。',
        ja: '「{target}」の値の型が正しくありません。',
        ko: '"{target}" 값의 타입이 올바르지 않습니다.',
        ar: 'قيمة "{target}" ليست من النوع المتوقع.'
    },
    11: {
        it: 'Non puoi fare questa richiesta.',
        en: 'You cannot make this request.',
        es: 'No puedes hacer esta solicitud.',
        fr: 'Vous ne pouvez pas faire cette demande.',
        de: 'Sie können diese Anfrage nicht stellen.',
        pt: 'Você não pode fazer esta solicitação.',
        nl: 'U kunt dit verzoek niet doen.',
        ru: 'Вы не можете выполнить этот запрос.',
        zh: '你不能发出这个请求。',
        ja: 'このリクエストはできません。',
        ko: '이 요청을 할 수 없습니다.',
        ar: 'لا يمكنك تقديم هذا الطلب.'
    }
};

const BrowserLanguage = Symbol('BrowserLanguage');

const defineMessage = (number, value) => messages.__userMessages[number] = value;

const message = (number, lang, replace = {}) => {
    let message = messages.__userMessages[number]?.[lang || 'en'] || messages.__userMessages[number]?.en || messages[number]?.[lang || 'en'] || messages[number]?.en;
    Object.keys(replace).forEach(key => message = message.replaceAll(`{${key}}`, replace[key]));
    return message;
}

const allowedMethods = [ 'PUT', 'POST', 'GET', 'PUT', 'DELETE' ];
function apiRoute(model, options = {}){

    let { filter, methods, fields, route, pagesManager, acceptedQueryFields, throwRefusedQueryFields, language } = options;
    if(throwRefusedQueryFields === undefined)
        throwRefusedQueryFields = true;

    // Filter
    if(typeof filter === 'function')
        filter = [ filter ];
    if(filter && (!Array.isArray(filter) || filter.find(i => typeof i !== 'function')))
        throw new Error("apiRoute(model, { filter }) -> filter must be a function, or an array of functions");
    else if(!filter)
        filter = [];

    // Methods
    methods = (methods || [ ...allowedMethods ]).map(i => i.toUpperCase());
    if(!Array.isArray(methods))
        throw new Error("apiRoute(model, { methods }) -> methods must be an array of methods");
    const invalidMethod = methods.find(i => !allowedMethods.includes(i));
    if(invalidMethod)
        throw new Error(`apiRoute(model, { methods }) -> invalid method "${invalidMethod}"`);

    // Route
    if(route){
        if(typeof route !== 'string')
            throw new Error("apiRoute(model, { route }) -> invalid route, it must be a string");
        route = route.replaceAll('{modelName}', model.modelName).replaceAll('{collectionName}', model.collection.name);
    }
    else route = '/api/' + model.collection.name;

    return async function(req, res, next){
        const parseFilter = (object, fields) => {
            if(!object)
                return {};
            // Pages manager
            if(pagesManager){
                if(typeof pagesManager !== 'object')
                    pagesManager = { limit: '?limit', page: '?page' };

                const maxResults = pagesManager.maxResults || 200;
                const limitQueryParam = limit?.startsWith?.('?') ? limit.substring(1) : 'limit';
                const pageQueryParam = page?.startsWith?.('?') ? page.substring(1) : 'page';
                
                ignoreFields.push(limitQueryParam);
                ignoreFields.push(pageQueryParam);
                limit = Number(req.query[limitQueryParam]) || maxResults;
                page = Number(req.query[pageQueryParam]) || 1;

                if(limit > maxResults)
                    limit = maxResults;

                if(Number.isNaN(Number(limit)))
                    limit = maxResults;
                if(Number.isNaN(Number(page)) || page < 1)
                    page = 1;
            }

            let query = { ...object };
            for(let key in query){
                // Fields translation
                let originalKey = key;
                if(fields){
                    const fieldName = Object.keys(fields).find(fieldName => Object.values(fields[fieldName]).includes(key));
                    
                    if(fieldName){
                        query[fieldName] = query[key];
                        delete query[key];
                        key = fieldName;
                    }
                }

                if(!queryFields.includes(key) && req.method !== 'POST'){
                    const translatedKey = fields[key]?.[lang] || key;
                    if(throwRefusedQueryFields && !ignoreFields.includes(key)){
                        res.status(400).json({
                            ok: false,
                            status: 400,
                            error: message(2, lang, { key: translatedKey.toLowerCase() }),
                            target: originalKey
                        });
                        return null;
                    }
                    delete query[key];
                }
            }
            return query;
        }

        let lang;
        if(language && language !== BrowserLanguage)
            lang = language;
        else
            lang = req.acceptsLanguages()[0]?.split?.('-')?.[0]?.toLowerCase?.() || 'en';

        // Further options
        const furtherOptions = options.options?.[req.method] || options.options?.[req.method.toLowerCase()] || {};

        if(furtherOptions.skimming && typeof furtherOptions.skimming === 'function')
            furtherOptions.skimming = [ furtherOptions.skimming ];

        if(furtherOptions.middleware && typeof furtherOptions.middleware === 'function')
            furtherOptions.middleware = [ furtherOptions.middleware ];

        if(Array.isArray(acceptedQueryFields))
            acceptedQueryFields = {
                GET: acceptedQueryFields,
                POST: acceptedQueryFields,
                PUT: acceptedQueryFields,
                DELETE: acceptedQueryFields
            }

        let queryFields = acceptedQueryFields?.[req.method] || acceptedQueryFields?.[req.method.toLowerCase()] || Object.keys(model.schema.paths);

        const ignoreFields = [];
        let limit, page;
        if(pagesManager){
            limit = pagesManager.limit;
            page = pagesManager.page;
        }


        const skimming = async results => {
            if(!furtherOptions.skimming?.length)
                return results;
            for(const skimming of furtherOptions.skimming){
                try{
                    const output = [];
                    for(const document of results){
                        if(await skimming({ document, req, res, next }))
                            output.push(document);
                    }
                    return output;
                }
                catch(e){
                    console.log(('Skimming error in ' + req.method + ' ' + model.modelName).yellow.bold);
                    console.log('\t' + e.message.brightRed.bold);
                    console.log(e.stack.split('\n').slice(1).map(i => '\t' + i).join('\n').gray);
                    return false;
                }
            }
        }

        const middleware = async (document, reportAllArguments = false) => {
            if(!furtherOptions.middleware?.length)
                return document;
            if(furtherOptions.middleware){
                for(const middleware of furtherOptions.middleware){
                    try{
                        if(reportAllArguments)
                            await middleware({ ...document, req, res, next, query });
                        else
                            await middleware({ document, req, res, next, query });
                        if(res.headersSent)
                            return false;
                    }
                    catch(e){
                        console.log(('Middleware error in ' + req.method + ' ' + model.modelName).yellow.bold);
                        console.log('\t' + e.message.brightRed.bold);
                        console.log(e.stack.split('\n').slice(1).map(i => '\t' + i).join('\n').gray);
                        return false;
                    }
                }
                return document;
            }
            return document;
        }


        let customFields = { ...(fields || {}), ...(furtherOptions?.fields || {}) };
        if(!Object.keys(customFields).length)
            customFields = null;

        let query;
        if(req.method !== 'PUT')
            query = parseFilter([ 'DELETE', 'GET' ].includes(req.method) ? req.query : req.body, customFields);

        res.sendMessage = (number, replace) => {
            const ok = res.statusCode >= 200 && res.statusCode < 300;
            res.json({ ok, status: res.statusCode, [ ok ? 'message': 'error' ]: message(number, lang, replace) });
        }

        // Method check
        if(!methods.includes(req.method))
            return next();

        // URI Check
        if(req.path !== route)
            return next();

        for(const func of filter){
            const result = await func({ req, res, next, query });
            if(res.headersSent)
                return;
            if(result !== true){
                if(result === false)
                    return res.status(403).json({ ok: false, status: 403, error: message(11, lang) });
                if(typeof result === 'object')
                    return res.status(result?.status || 403).json(result);
                return res.status(403).json({ ok: false, status: 403, error: result });
            }
        }


        const catchMongoDBError = error => {
            if(error.name === 'ValidationError'){
                const errors = [];

                for(let field in error.errors){
                    const fieldError = error.errors[field];                    
                    let errorMessage;
                    const translatedField = customFields?.[field]?.[lang] || field;
                    if(fieldError.kind === 'required')
                        errorMessage = message(3, lang, { target: translatedField });
                    else if(fieldError.kind === 'minlength')
                        errorMessage = message(4, lang, { target: translatedField });
                    else if(fieldError.kind === 'maxlength')
                        errorMessage = message(5, lang, { target: translatedField });
                    else if(fieldError.kind === 'min')
                        errorMessage = message(6, lang, { target: translatedField });
                    else if(fieldError.kind === 'max')
                        errorMessage = message(7, lang, { target: translatedField });
                    else if(fieldError.kind === 'enum')
                        errorMessage = message(8, lang, { target: translatedField });
                    else if(fieldError.kind === 'regexp')
                        errorMessage = message(9, lang, { target: translatedField });
                    else if(fieldError.kind === 'cast')
                        errorMessage = message(10, lang, { target: translatedField });
                    

                    errors.push({ target: field, error: errorMessage })
                }

                return res.status(400).json({ ok: false, status: 400, errors });
            }
        }

        if(req.method === 'GET'){
            // GET
            await middleware();
            if(res.headersSent)
                return;
            let results;
            if(pagesManager)
                results = await model.find(query).sort({ _id: 1 }).skip((page - 1) * limit).limit(limit).lean();
            else
                results = await model.find(query).lean();
            results = await skimming(results);
            if(res.headersSent)
                return;

            // Fields
            if(customFields)
                results.forEach(document => Object.keys(customFields).forEach(field => {
                    const options = customFields[field];
                    if(options.show === false)
                        delete document[field];
                    else{
                        if(options[lang]){
                            document[options[lang]] = document[field];
                            delete document[field];
                        }
                    }
                }));

            return res.json({ ok: true, [ model.collection.name ]: results, pagesManager: pagesManager ? { page, offset: limit } : undefined });
        }
        else if(req.method === 'POST'){
            // POST
            delete query._id;
            delete query.__v;
            let document = new model(query);

            await middleware(document);
            if(res.headersSent)
                return;

            try{ await document.save() }
            catch(error){ return catchMongoDBError(error) }

            document = (await skimming([ document ]))[0].toObject();
            if(res.headersSent)
                return;
            if(customFields)
                Object.keys(customFields).forEach(field => {
                    const options = customFields[field];
                    if(options.show === false)
                        delete document[field];
                    else{
                        if(options[lang]){
                            document[options[lang]] = document[field];
                            delete document[field];
                        }
                    }
                });

            return res.json({ ok: true, document });
        }
        else if(req.method === 'PUT'){
            const query = parseFilter(req.body.query, customFields);
            const set = parseFilter(req.body.set, customFields);

            await middleware({ query, set }, true);
            if(res.headersSent)
                return;
            let document = await model.findOneAndUpdate(query, set);
            if(document)
                document = await model.findById(document._id);
            document = (await skimming([ document ]))[0];
            if(res.headersSent)
                return;

            if(document.toObject){
                document = document.toObject();
                if(customFields)
                    for(const field in document){
                        if(customFields[field]?.show === false){
                            delete document[field];
                            continue;
                        }
                            
                        if(customFields[field]?.[lang]){
                            document[customFields[field][lang]] = document[field];
                            delete document[field];
                        }
                    }
            }
            
            if(!res.headersSent)
                return res.json({ ok: true, [ model.modelName.toLowerCase() ]: document });
        }
        else if(req.method === 'DELETE'){
            const results = await model.find(query).lean();

            if(furtherOptions.skimming){
                results = await skimming(results);
                if(res.headersSent)
                    return;
                for(const result of results)
                    await model.deleteOne({ _id: result._id });
            }
            else await model.deleteMany(query);
            if(res.headersSent)
                return;

            return res.json({ ok: true });
        }
    }
}

export { BrowserLanguage, defineMessage };
export default apiRoute;