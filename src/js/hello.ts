class Greeter {
    constructor(public greeting: string) { }
    greet() {
        return this.greeting;
    }
};

var greeter = new Greeter("Si ceci s'affiche, le Typescript fonctionne");
  
 window.onload = function() {
 	var div = document.getElementById("item");
 	div.innerHTML = greeter.greet();	
 }