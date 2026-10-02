/**
 * Runs before React. Exits immediately unless the path is / and page=game.
 * Unknown ids go to search. The title is not in the old URL, so the query is the id.
 */
export const LEGACY_GAME_REDIRECT = `(function(){var path=location.pathname;if(path!=="/"&&path!=="")return;var params=new URLSearchParams(location.search);if(params.get("page")!=="game")return;var id=params.get("game");if(!id)return;var query=params.get("title")||id;fetch("/data/legacy-ids.json").then(function(response){return response.json()}).then(function(map){var slug=map&&map[id];if(typeof slug==="string"&&slug){location.replace("/game/"+slug+"/")}else{location.replace("/search/?q="+encodeURIComponent(query))}}).catch(function(){location.replace("/search/?q="+encodeURIComponent(query))})})();`;
