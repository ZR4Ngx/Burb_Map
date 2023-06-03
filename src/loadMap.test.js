const loadMap = require('./mapLoader');

describe('loadMap', () => {
  it('should load and parse the map file correctly', async () => {
    const mapData = await loadMap();
    
    // Assert the expected structure and properties of the map data
    expect(mapData).toHaveProperty('water2D');
    expect(mapData).toHaveProperty('ground2D');
    expect(mapData).toHaveProperty('decal2D');
    
    // Add more assertions to validate the content and correctness of the map data
    expect(mapData.water2D.length).toBe(40);
    expect(mapData.ground2D.length).toBe(40);
    expect(mapData.decal2D.length).toBe(40);
    // ...

    // Assert specific values of the map data
    expect(mapData.water2D[0][0]).toEqual({ id: 438, gid: 439 });
    expect(mapData.ground2D[0][0]).toBeUndefined();
    expect(mapData.decal2D[2][1]).toBeUndefined();
    // ...
  });
  
  // Add more test cases for different scenarios and edge cases
});
