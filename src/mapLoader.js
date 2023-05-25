const tmx = require("tmx-parser");

async function loadMap() {
    const map = await new Promise((resolve, reject) => {
        tmx.parseFile("./src/Burb_map_prototype.tmx", function(err, loadedMap) {
          if (err) return reject(err);
          resolve(loadedMap);
        });
      })
    

      const waterTiles  = map.layers[0].tiles;
      const groundTiles = map.layers[1].tiles;
      const decalTiles  = map.layers[3].tiles;
      const water2D     = []
      const ground2D    = []
      const decal2D     = []
        for (let row = 0; row < map.height; row++) {

          const waterRow = [];
          const groundRow = [];
          const decalRow  = [];

          for (let col = 0; col < map.width; col++) {
            const waterTile = waterTiles[row * map.width + col]
            waterRow.push({id: waterTile.id, gid: waterTile.gid});

            const groundTile = groundTiles[row * map.width + col]
            if (groundTile) {
              groundRow.push({id: groundTile.id, gid: groundTile.gid})
            } else {
              groundRow.push(undefined);
            };
            const decalTile = decalTiles[row * map.width + col]
            if (decalTile) {
              decalRow.push({id: decalTile.id, gid: decalTile.gid})
            } else {
              decalRow.push(undefined);
            }
          }

          ground2D.push(groundRow);
          water2D.push(waterRow);
          decal2D.push(decalRow)
        }



    return {water2D,
            ground2D,
            decal2D,}
    ; // return id an gid of .tmx file
}

  
module.exports = loadMap;