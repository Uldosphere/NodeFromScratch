var Greeter = (function () {
    function Greeter(greeting) {
        this.greeting = greeting;
    }
    Greeter.prototype.greet = function () {
        return this.greeting;
    };
    return Greeter;
}());
;
var greeter = new Greeter("Si ceci s'affiche, le Typescript fonctionne");
window.onload = function () {
    var div = document.getElementById("item");
    div.innerHTML = greeter.greet();
};
