"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const root = '/gti525/';
const apiVersion = 'v1';
const rootUrl = `${root}${apiVersion}`;
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// T5.2: Vous devez implémenter une première version du point d'accès (endpoint) compteurs. Pour ce livrable, vous n’avez pas besoin d'implémenter toutes les fonctionnalités de recherche. Pour un compteur recherché, votre API pourra fournir toutes les données disponibles sans considérer les paramètres de recherche pour la période. L'implémentation correcte des fonctionnalités de recherche sera toutefois un requis du livrable 3.
// Le point d’accès compteurs de l’API devra être composé par :
// Le point d'accès racine
// Le mot-clé compteurs
// L’identifiant du compteur
// Les paramètres pour la période recherché (debut, fin) (votre API n’aura pas à traiter ces paramètres pour ce livrable)
// Exemple : http://localhost:8080/gti525/v1/compteurs/100054585?debut=20200101&fin=20200131
app.get(`${rootUrl}/compteurs/:id`, (req, res) => {
    res.json({ message: `Pour prochain livrable` });
});
// T5.3: Vous devez également implémenter des versions préliminaires des points d'accès pistes et pointsdinteret pour servir le contenu respectivement des ressources pistes cyclables et des points d'intérêt. Pour l'instant, lorsque l'API dorsale reçoit une requête pour récupérer les pistes ou points d'intérêt vous devez:
// Pour une requête à gti525/v1/pistes, votre API devra simplement retourner le contenu du fichier reseau_cyclable.geojson.
// Pour une requête à gti525/v1/pointsdinteret l'API doit retourner le contenu du fichier fontaines.csv (fourni en entré lors du livrable 1) sous le format JSON.
app.get(`${rootUrl}/pistes`, (req, res) => {
    const filePath = path_1.default.join(__dirname, 'data', 'reseau_cyclable.geojson');
    fs_1.default.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading pistes file (reseau_cyclable.geojso)');
            return;
        }
        res.json(JSON.parse(data));
    });
});
// app.get(`${rootUrl}/pointsdinteret`, (req: Request, res: Response) => {
//     const filePath = path.join(__dirname, 'data', 'fontaines.csv');
//     csv().fromFile(filePath)
//         .then(jsonData => {
//             res.json(jsonData);
//         })
//         .catch(err => {
//             res.status(500).send('Error converting pointsdinteret CSV to JSON');
//         });
// });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
function convertCSVtoJSON(csvData) {
    return {};
}
