export function AddBricks() {
    // Définition de la disposition initiale de la carte
    var layout = [
        [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]], 
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]], 
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1], [0], [1]],
        [[1], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [1]],
        [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1], [1]],
    ];

    // Parcours de chaque ligne de la carte
    for (let row = 0; row < layout.length; row++) {
        // Parcours de chaque colonne de la ligne actuelle
        for (let column = 0; column < layout[row].length; column++) {
            const tile = layout[row][column][0]; // Obtient la valeur actuelle de la case
            if (tile === 0) { // Si la case est une herbe (0)
                let isBrick = Math.round(Math.random() * 1); // Génère aléatoirement 0 ou 1
                if ((2 < row && row < 12 || 2 < column && column < 12) && isBrick === 0) {
                    // Met à jour la case de l'herbe (0) à la brique (2)
                    layout[row][column][0] = 2;

                    // Génère aléatoirement un nombre entre 0 et 6 pour décider d'un power-up
                    let isPower = Math.round(Math.random() * 6);
                    if (isPower === 1) {
                        // Ajoute un power-up de type 8 (par exemple une bombe)
                        layout[row][column].push(8);
                    } else if (isPower === 2) {
                        // Ajoute un power-up de type 9 (par exemple une flamme)
                        layout[row][column].push(9);
                    } else if (isPower === 3) {
                        // Ajoute un power-up de type 10 (par exemple de la vitesse)
                        layout[row][column].push(10);
                    }
                }
            }
        }
    }
    return layout; // Retourne la disposition mise à jour
}
