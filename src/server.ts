import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csvtojson';

const app = express();

const root = '/gti525/'
const apiVersion = 'v1';
const rootUrl = `${root}${apiVersion}`;


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// T5.3: Vous devez également implémenter des versions préliminaires des points d'accès pistes et pointsdinteret pour servir le contenu respectivement des ressources pistes cyclables et des points d'intérêt. Pour l'instant, lorsque l'API dorsale reçoit une requête pour récupérer les pistes ou points d'intérêt vous devez:
// Pour une requête à gti525/v1/pistes, votre API devra simplement retourner le contenu du fichier reseau_cyclable.geojson.


app.get(`${rootUrl}/pistes`, (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..', 'data', 'reseau_cyclable.geojson');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading pistes file (reseau_cyclable.geojso)');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Pour une requête à gti525/v1/pointsdinteret l'API doit retourner le contenu du fichier fontaines.csv (fourni en entré lors du livrable 1) sous le format JSON.
app.get(`${rootUrl}/pointsdinteret`, async (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '..', 'data', 'fontaines.csv');

    try {
        const jsonArray = await csv().fromFile(filePath);
        res.json(jsonArray);
    } catch (err) {
        res.status(500).send('Error converting pointsdinteret CSV to JSON');
    }
});

//Puisque les informations sur les territoires de la Ville de Montréal n'iront pas changer fréquemment, vous n'êtes pas obligés d'intégrer les fichiers territoires.csv et territoires.geojson dans votre API. Votre application dorsale peut les servir comme du contenu statique, ou comme un fichier JavaScript.
app.get(`${rootUrl}/territoires/:fileType`, async (req: Request, res: Response) => {
    const fileType = req.params.fileType;
    let filePath = '';

    try {
        if (fileType === 'csv') {
            filePath = path.join(__dirname, '..', 'data', 'territoires.csv');
        } else if (fileType === 'geojson') {
            filePath = path.join(__dirname, '..', 'data', 'territoires.geojson');
        } else {
            return res.status(400).send('Invalid file type requested');
        }

        res.sendFile(filePath);
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Error serving territoires.${fileType}: `, err.message);
            res.status(500).send(`Error serving territoires.${fileType}`);
        } else {
            console.error("Unknown error: ", err);
            res.status(500).send('An unknown error occurred');
        }
    }
});

// T5.2: Vous devez implémenter une première version du point d'accès (endpoint) compteurs. Pour ce livrable, vous n’avez pas besoin d'implémenter toutes les fonctionnalités de recherche. Pour un compteur recherché, votre API pourra fournir toutes les données disponibles sans considérer les paramètres de recherche pour la période. L'implémentation correcte des fonctionnalités de recherche sera toutefois un requis du livrable 3.

// Le point d’accès compteurs de l’API devra être composé par :
// Le point d'accès racine
// Le mot-clé compteurs
// L’identifiant du compteur
// Les paramètres pour la période recherché (debut, fin) (votre API n’aura pas à traiter ces paramètres pour ce livrable)

// Exemple : http://localhost:8080/gti525/v1/compteurs/100054585?debut=20200101&fin=20200131
app.get(`${rootUrl}/compteurs/:id`, async (req: Request, res: Response) => {
    const counterId = req.params.id;
    const debutParam = req.query.debut as string;
    const finParam = req.query.fin as string;

    // Convertissement des param. De 20190101 a 2019-01-01 00:00:00
    const debut = debutParam ? `${debutParam.substr(0, 4)}-${debutParam.substr(4, 2)}-${debutParam.substr(6, 2)} 00:00:00` : undefined;
    const fin = finParam ? `${finParam.substr(0, 4)}-${finParam.substr(4, 2)}-${finParam.substr(6, 2)} 23:59:59` : undefined;

    const dataFiles = [
        'comptage_velo_2019.csv',
        'comptage_velo_2020.csv',
        'comptage_velo_2021.csv',
        'comptage_velo_2022.csv',
    ];

    let allData: { date: string; count: number }[] = [];

    try {
        for (const file of dataFiles) {
            const filePath = path.join(__dirname, '..', 'data', file);
            const data: any[] = await csv().fromFile(filePath);

            const filteredData = data
                .filter(row => {
                    const rowDate = new Date(row['Date']);
                    return (!debut || rowDate >= new Date(debut)) && (!fin || rowDate <= new Date(fin)) && row.hasOwnProperty(counterId);
                })
                .map(row => ({
                    date: row['Date'],
                    count: Number(row[counterId]) || 0
                }));

            allData = allData.concat(filteredData);
        }

        res.json(allData);
    } catch (err) {
        console.error("Error in processing: ", err);
        res.status(500).send('Error retrieving counter data');
    }
});





const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));