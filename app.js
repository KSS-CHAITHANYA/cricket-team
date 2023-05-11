const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
const path = require("path");
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;
    `;
  const playersList = await db.all(getAllPlayers);
  response.send(playersList);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addAPlayer = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES
        (
            ${playerName}, ${jerseyNumber}, ${role});
    `;
  const dbResponse = await db.run(addAPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
  //response.send({ playerId: playerId });
  //console.log("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
`;

  const playerDetails = await db.get(getPlayerDetails);
  response.send(playerDetails);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateDetails = `
    UPDATE cricket_team
    SET
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId};

    `;
  await db.run(updateDetails);
  response.send("Player Details Updated Successfully");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  await db.get(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
