const express = require('express');
var mysql = require('mysql');
const oracledb = require('oracledb');
var cors = require('cors');
const publicIp = require('public-ip');
const http = require('request');
const winTask = require('windows-scheduler');
const fs = require('firebase-admin');
// const db_query = require('./db_query.js');
// const sendGmail = require('./gmail');

var cheerio = require('cheerio');

const serviceAccount = {
    "type": "service_account",
    "project_id": "oc-dasboard-alerts",
    "private_key_id": "bcfde50833f9fd2658c6885c11a95f64c4a4a30d",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp+are+Pi3yyxg\nOdZvFZBu6v5yISvxg3fAsQqgo7QLB2kZMXEMT+yRpMgZOqNyQQkdhSwsGHm2oRwg\nxSMzb+lCRpZmD3HlDtq9FpLC30O8oSr6uVBWI8z+bGvMHvXhInbDpqNKCmPAcuyh\nWeTcbK9cPOBPZu2HIhzZaWFKgcddQqV982cFvYoTFLE8An1CxezRQ8wtZbBdaYs9\nAdcpJS+AppAxGvvSpRafwvAXLGm5w70Rdk0g8bGMtNcPIEIWf+Zbbzw/P8xzIfFw\nd/Pp+di8vFUg1s41YtpIigvfyeQVnxcLFh3vgoRP3U2uqulzl7R7+XqgJCv+wtDH\nneUOTQiJAgMBAAECggEADHJoFvciJnpaM+s0VtLcTmUGsDaZ5FAJYkrMoY4PUoHu\nyi2ezsUhCJrJnOBYhPa6e0cL4KhDrHIgkE1DWkJLEWOAIrXllB2Z+sAHC/5jtFHU\nhwLwPTiWq7hmje5j+MIocoQWv8aiPp7j0V529gW+8ykRj3r08KD4vhp7iYRWpC9t\nSAVcL4FX7FB0HYFdl3UZLr4JV9/qOCzgmeFZSABZ4u/BXg0+3bMskLQWmCMLSd18\nS/qmfzJ0B6KwDICmm/eeBCBVLumdyXawj56kCthaOam222TuVj2KDEjgP+rgzHiN\nYS78em0SRUvitZmZVxTQbjhqLtD0Mk28cLZ++os9gQKBgQDR9BA0Xt2N7F5pHz1t\nLutX4xvDWFxn0+qBh+XNvEGrjQ108H8a84shcK4d9m7Nlr/B2jLzxLF8Vaoe4avw\n3F1pfM/A+z3LXAjWgE33nPI1WpkvYj4jndtGJm5Oic8mWgBvWtvRzqz5eB9EOPrD\n6cWttRFmnrywEntcmVxodLX5gQKBgQDPQQNpp93trGqUDGT8neVBmNDY7Z0XiWQc\nkgu5qKcOm7AUwvChrtEvBV9JARSySSC86AnChV/ST+9PsDiMDuUOtbrxfn7vt1QZ\n8QNuDI6ZXFbnCLHKvfF2as5AE86nqCu6jXY9W15saTGf11spN1EwY67yO9In+wg1\nlCNFX9rDCQKBgQCXo3VIvfO7G6sctcmB4E9uTMOylVE4VGCdaW/a5ktwAhJkEYdc\nCebFIkM/tMtWhbi95EDEu52NNboHT+sFrcNx+wl6UnvRMwnXExg87Qgq7OKSzJwg\n0VScGAm3g+Uvx/Vkd/UoVeOs0suSVK0ZbvCtg4er3J5fdRnQSZvqfdEpAQKBgEJm\nnPZL3xGXzOmz8uLwn5PdpwPpVQxGa3mv3OvVufg3LznnnvreLIz5FqcoHn5kaYW8\nfewBmUqja5PHbMaKux50YPmgQoEA5oQNMMEgast9xyXsJjJDmsoKvBvRfMNAYQo6\n6mgMDvuC1HBWqhFRdMShG1rmiZVfmyi3VnmSlV8pAoGAaz0AqR/ZnL7NZpZU0KPN\nwB235QXROIE4CzbbVm+qLrDOoJRZ1YqP52dtZKOZoP4pMWbCi+4IrAqFERTrgcMG\nRazf4SiMJyvoyMVAat4q38BQpYVn7AyFWaJtiCAci4rlO9ZhBcuM9v2uIAfnkcGV\nSOUvLa9v6QobT2mM5co+r/k=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-oxyhi@oc-dasboard-alerts.iam.gserviceaccount.com",
    "client_id": "106120697029103260240",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-oxyhi%40oc-dasboard-alerts.iam.gserviceaccount.com"
};

fs.initializeApp({
    credential: fs.credential.cert(serviceAccount)
});

const db = fs.firestore();

const api = express();

const PORT = 7280;
var ORC, SQL;
var auth_session;

// api.use(cors());
api.use(express.json());
// set the view engine to ejs
api.set('view engine', 'ejs');

api.listen(
    PORT,
    async function () {
        var flag = false;
        console.log(`node js server is live on ` + `:${PORT}`);
    }
);

function scrapHttp(url) {
    return new Promise((resolve, reject) => {
        try {
            http(url, function (error, response, body) {
                if(error){

                    console.log({"error":error});
                    resolve({
                        error:`${url} - No Response`
                    });
                }
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
        
                    var styleLinkHrefs = $('link').map(function(i) {
                        return $(this).attr('href');
                    }).get();
        
                    
                    var headScriptSrcs = $('head > script').map(function(i) {
                        return $(this).attr('src');
                    }).get();
        
        
                    var bodyScriptSrcs = $('body > script').map(function(i) {
                        return $(this).attr('src');
                    }).get();

                    var linksObj={
                        url,
                        styleLinkHrefs,
                        headScriptSrcs,
                        bodyScriptSrcs
                    };

                    resolve(linksObj);
                }
                
            });
        } catch (e) {
            console.log(e);
        }
    });
}

api.get('/title', async function(req,res){

    console.log(req.query.address);

    if(req.query.address == undefined){

        res.render('./index.ejs');
    }else{

        var linksObj=[];

        if(Array.isArray(req.query.address)){
            console.log(Array.isArray(req.query.address));
    
    
            for(address of req.query.address){
    
                var ref = db.collection('ITspresso');
    
                ref = ref.where('url', '==', address);
    
                ref = await ref.get();

                console.log(ref.empty);
    
                var payload;
    
                if(ref.empty){
                    
                    console.log("firebase is not found");
    
                    console.log(address);
    
                    payload = await scrapHttp(address);
    
                    if(!payload.error){
    
                        console.log("!payload.error");
    
                        var insert = await db.collection('ITspresso').doc().set(payload);
        
                        
                        linksObj.push(payload);
                        
                    }else{
                        
                        console.log("payload.error");
                        linksObj.push(payload);
                    }
    
                }else{
                    console.log("firebase is found");
    
                    ref.forEach(doc => {
                        linksObj.push(doc.data());
                    });
                }
    
    
            }
        }else{
            
            var ref = db.collection('ITspresso');
    
            ref = ref.where('url', '==', req.query.address);
    
            ref = await ref.get();
            
            console.log(ref.empty);
    
            var payload;
    
            if(ref.empty){
                
                console.log("firebase is not found");
    
                console.log(req.query.address);
    
                payload = await scrapHttp(req.query.address);
    
                if(!payload.error){
                    
                    console.log("!payload.error");
    
                    var insert = await db.collection('ITspresso').doc().set(payload);
    
                    
                    linksObj.push(payload);
                    
                }else{
                    
                    console.log("payload.error");
                    
                    linksObj.push(payload);
                }
                
            }else{
    
                console.log("firebase is found");
    
                ref.forEach(doc => {
                    linksObj.push(doc.data());
                });
            }
            
        }
    
        res.render('./index.ejs', {
            address:linksObj
        });
    }


});


api.get('*', function(req, res){
    res.render('404');
});


process.on('uncaughtException', err => {
    console.error('uncaughtException block There was an uncaught error', err);
    // process.exit(1) //mandatory (as per the Node.js docs)
});