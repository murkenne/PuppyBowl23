const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

const cohortName = '2302-ACC-PT-WEB-PT-C';
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${APIURL}players/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error('Uh oh, trouble fetching players!', err);
  }
};

const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}players/${playerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const player = await response.json();
    renderSinglePlayer(player);
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${APIURL}players/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });
    const result = await response.json();
    console.log(result);
  } catch (err) {
    console.error('Oops, something went wrong with adding that player!', err);
  }
};

const removePlayer = async (playerId) => {
  try {
    await fetch(`${APIURL}players/${playerId}`, {
      method: "DELETE",
    });
    const result = await fetchAllPlayers();
    renderAllPlayers(result);
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};
/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */

const renderSinglePlayer = (player) => {
  playerContainer.innerHTML = `
    <div>
      <img src="${player.data.player.imageUrl}" alt="${player.data.player.name}" />
      <h2>${player.data.player.name}</h2>
      <p>Breed: ${player.data.player.breed}</p>
      <p>Status: ${player.data.player.status}</p>
      <p>Team ID: ${player.data.player.teamId}</p>
      <p>Cohort ID: ${player.data.player.cohortId}</p>
      <button class="Back-button">Back</button>
      <button class="delete-button" data-id="${player.data.player.id}">Remove</button>
    </div>
  `;

  const backButton = document.querySelector(".Back-button");
  backButton.addEventListener("click", () => {
    init();
  });

  const deleteButton = document.querySelector(".delete-button");
  deleteButton.addEventListener("click", async (event) => {
    const playerId = event.target.dataset.id;
    await removePlayer(playerId);
  });
};

const renderAllPlayers = (players) => {
  playerContainer.innerHTML = "";
  try {
    players.data.players.forEach((player) => {
      const playerElement = document.createElement("div");
      playerElement.classList.add("player-card");
      playerElement.innerHTML = `
      <h4>${player.name}</h4>
      <img src="${player.imageUrl}" alt="${player.name}">
      <p>${player.breed}</p>
      <button class="delete-button" data-id="${player.id}">Remove</button>
      <button class="detail-button" data-id="${player.id}">See Details</button>`;
      
      playerContainer.append(playerElement);

      const deleteButton = playerElement.querySelector(".delete-button");
      deleteButton.addEventListener("click", async (event) => {
        const playerId = event.target.dataset.id;
        await removePlayer(playerId);
      });

      const detailButton = playerElement.querySelector(".detail-button");
      detailButton.addEventListener("click", async (event) => {
        const playerId = event.target.dataset.id;
        await fetchSinglePlayer(playerId);
      });
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering players!", err);
  }
};

const renderNewPlayerForm = () => {
  newPlayerFormContainer.innerHTML = `
    <form id="new-player-form">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" placeholder="Enter Name" required />
      <label for="breed">Breed:</label>
      <input type="text" id="breed" name="breed" placeholder="Enter Breed" required />
      <label for="status">Status:</label>
      <select name="status" id="status">
        <option value="Field">Field</option>
        <option value="Bench">Bench</option>
      </select>
      <label for="image_url">Image URL:</label>
      <input type="text" id="image_url" name="image_url" placeholder="Enter Image URL" required />
      <label for="teamID">Team ID:</label>
      <input type="number" id="teamID" name="teamID" placeholder="Enter teamID" required />
      <label for="details">Details:</label>
      <textarea id="details" name="details" placeholder="Enter Details"></textarea>
      <button type="submit">Create</button>
    </form>
  `;

  document.getElementById('new-player-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const playerObj = Object.fromEntries(formData.entries());
    await addNewPlayer(playerObj);
  });
};

const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
  renderNewPlayerForm();
};

init();
