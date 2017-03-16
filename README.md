Déploiement automatique d'un frontend sous Node.JS et Gulp
==================
Coquille de base pour déploiement d'un site web dont les librairies sont gérées sous NPM et le packetage piloté par Gulp

Installation
-----
On commence par installer Gulp en mode global avec -g:
```
npm install -g gulp
```
Pour vérifier si tout est bien installé et que Gulp est actif:
```
gulp -v
```
Se mettre dans le répertoire NodeFromScratch et faire 
```
npm install
```

Usage de cette coquille
-----
Le site est préparé pour être hébergé dans l'arborescence suivante :

 * [dev](./dev)
 * [doc](./doc) 
 * [src](./src)
	* index.html
	* [css](./src/css)
	* [fonts](./src/fonts)
	* [images](./src/images)
	* [js](./src/js)
	* [libs](./src/libs)
 * [dist](./dist)

Les sources de votre projet vont dans /src
Les documentations dans /doc
Les librairies externes JavaScript (exemple JQuery, D3, Leaflet etc... ) dans /src/libs
Les scripts JavaScripts/Typescripts maison dans /src/js
Les CSS et SCSS dans /src/css
Les fonts et images dans les dossiers respectifs /src/fonts et /src/images

Le répertoire /dist est construit lors du build (expliqué ci-après)

Usage de Gulp
-----

```
gulp local
```
Cette commande permet de compiler les fichiers SCSS (/src/css/*.scss) et Typescripts (/src/js/*.ts). A la suite de quoi le navigateur affiche la page /src/index.html sur le port :3000 et reste en écoute de toute modification JS/CSS ou HTML; celui ci se rafraichit à chaque sauvegarde afin de refléter dynomiquement vos changements.

```
gulp dev
```
Cette commande permet de compiler les fichiers SCSS (/src/css/*.scss) et Typescripts (/src/js/*.ts)
Puis l'ensemble des fichiers est copié dans le répertoire /dev pour consultation locale hors d'un contexte de BrowserSync 

```
gulp build
```
Cette opération permet de construire la version du site déployable. Celle-ci est construite et placée dans le dossier /dist
gulp build effectue plusieurs opérations : 
* Phase préparatoire
	* Suppression complète du dossier /dist existant.
	* Compilation des fichiers Typescript en JS.
	* Transpilage des fichiers JS ES6.
	* Compilation des fichiers SCSS en CSS.
	* Copie et optimisation des images contenues dans /src/images
* Phase de déploiement
	* Le builder prend alors tous les fichiers JS (/src/js/*.js et enfants) et :
		* Pour tous les scripts inclus dans les balises <&#33;-- build:replacejs --><&#33;-- endbuild -->
			* Les concatène, uglifie, minifie (obfuscation possible mais désactivée par défaut).
			* Génère le sourcemapping qui sera stocké dans /maps
	* Le builder copie ensuite les librairies JS contenues dans /libs et : 
		* Les copie telles quelles si un fichier minifié est déjà présent.
		* Les minifie si besoin.
	* Le builder prend ensuite tous les fichiers CSS (/src/css/*.css et enfants) et :
		* Pour tous les CSS inclus dans les balises <&#33;-- build:replacecss --><&#33;-- endbuild -->
			* Les concatène, les minifie, ajoute les vendor prefix.
			* Génère le sourcemapping qui sera stocké dans /maps
	* Puis le builder copie tous les fichiers HTML et remplace le chemin de la source des JS/CSS pour pointer vers les fichiers générés précédement.
	* Puis le builder copie les fichiers PHP selon la même arborescence
	* Enfin le builder copie les fonts de la même manière

Vous pouvez alors consulter la version "buildée" depuis le dossier [/dist](./dist/index.html)

```
gulp cleandist 

gulp cleandev
```

Supprime l'ensemble du dossier /dist ou /dev