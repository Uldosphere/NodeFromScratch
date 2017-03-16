const GEEK_NAME = "Bob l'éponge";
const GEEK_NUMBER = 42;
//Commentaire pour la route
function giveMeAGeek() {
  const GEEK = "Ton geek est " + GEEK_NAME;
  return GEEK;
}

console.log( "Qui est le geek "+GEEK_NUMBER+" ? \n" +giveMeAGeek() + ", il sait utiliser ES6");