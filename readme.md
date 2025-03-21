# Draw with AI

**Draw with AI** consiste en un jeu de dessin où l'utilisateur doit dessiner une forme demandée par l'IA. L'IA utilisée est un modèle entrainé via Teachable Machine sur plusieurs catégories de dessins. Le modèle est ensuite chargé avec ml5.js pour évaluer la correspondance du dessin de l'utilisateur avec les formes attendues.

Pour ce qui est de la fonctionnalité de dessin en elle-même, lorsque l'index et le pouce se touchent, une ligne se trace et suit le mouvement de la main. Lorsque l'index et le pouce ne se touchent pas, la ligne est interrompue. Il est également possible de changer de couleur, grâce à la détection de la position de l'index par rapport à l'écran. Lorsque l'index se trouve dans la zone d'un des carrés de couleur, la couleur de la ligne change (uniquement les prochaines lignes à dessiner).

La reconnaissance de la main est réalisé avec le handPose de ml5.js.

## Technologies

- JavaScript
- ml5.js
- HTML
- CSS

## Utilisation

1. Cloner le repository
2. Ouvrir le fichier `index.html` dasn votre navigateur (vous devrez peut-être lancer un serveur local)
3. Dessiner la forme demandée par l'IA
4. Cliquer sur le bouton "Submit"
5. Obtenir les résultats

## Live demo

Vous pouvez essayer la demo [ici](https://MarquesThomasCoding.github.io/draw_with_ai/)

```